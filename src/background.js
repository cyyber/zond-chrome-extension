import pump from 'pump';
import PortStream from 'extension-port-stream';
import createEngineStream from 'json-rpc-middleware-stream/dist/createEngineStream';
import ObjectMultiplex from 'obj-multiplex';
import browser from 'webextension-polyfill';
import { JsonRpcEngine } from 'json-rpc-engine';
import { once, EventEmitter } from "events";
var eventEmitter = new EventEmitter();

let store = browser.storage.local

function setupProviderConnection(outStream, sender, subjectType) {
    const engine = new JsonRpcEngine()
    let senderUrl = new URL(sender.url)
    let origin = senderUrl.origin
    engine.push(async (req, res, next, end) => {
        switch(req.method) {
            case("eth_requestAccounts"):
                {
                    store.get([origin]).then(async (value) => {
                        if (value[origin]) {
                            Object.assign(res, {
                                result: value[origin]
                            })
                            end()
                        } else {
                            let extensionURL = browser.runtime.getURL('popup.html');
                            await browser.tabs.create({ url: extensionURL+'?task=connect' })
                            let controllerPort = await once(eventEmitter, "controllerPort_assigned")
                            controllerPort[0].postMessage({ method: "req_account" })
                            controllerPort[0].onMessage.addListener((msg) => {
                                if (msg.accounts) {
                                    store.set({[origin]: msg.accounts}).then(() => {
                                        Object.assign(res, {
                                            result: msg.accounts
                                        })
                                        end()
                                    })
                                }
                            })
                        }
                    })
                } 
                break; 
            case("eth_accounts"):
                {
                    store.get([origin]).then(async (value) => {
                        if (value[origin]) {
                            Object.assign(res, {
                                result: value[origin]
                            })
                            end()
                        }
                    })
                }
                break;
            default:
                break;
        }
    })
    const providerStream = createEngineStream({ engine });

    pump(outStream, providerStream, outStream, (err) => {
        outStream.destroy(err)
        // console.log("Provider connection error", err)
    });

}

function controllerHandler(port, method, value) {
    switch(method) {
        case("get_connectedSites"): 
            {
                store.get(null, function(items) {
                    var allKeys = Object.keys(items);
                    allKeys.filter((key) => {
                        items[key].includes(value["account"])
                    })
                    port.postMessage({get_connectedSites: allKeys})
                });
            }
            break;
        case("remove_connectedSite"):
            {
                store.get([value["site"]]).then((result) => {
                    if(result[value["site"]]) {
                        let acc_array = result[value["site"]]
                        acc_array.filter(item => item != value["account"])
                        if (acc_array.length > 0) {
                            store.set({[value["site"]]: acc_array}).then(() => {
                                port.postMessage({remove_connectedSites: value})
                            })
                        } else {
                            store.remove([value["site"]]).then(() => {
                                port.postMessage({remove_connectedSites: value})
                            })
                        }
                    } else {
                        port.postMessage({remove_connectedSites: value})
                    }
                })
            }
            break;
        default:
            break;
    }
}

function connectRemote(remotePort) {
    const processName = remotePort.name;
    let isQRLInternalProcess = false;

    isQRLInternalProcess = remotePort.sender.origin === `chrome-extension://${browser.runtime.id}`;

    const senderUrl = remotePort.sender?.url
        ? new URL(remotePort.sender.url)
        : null;

    if (processName == 'controller') {
        eventEmitter.emit('controllerPort_assigned', remotePort)
        remotePort.onMessage.addListener((msg) => {
            controllerHandler(remotePort, msg.method, msg.value)
        })
        remotePort.onDisconnect.addListener((msg) => { console.log("port disconnected", msg) })
    } else {
        const portStream = new PortStream(remotePort);

        const mux = new ObjectMultiplex();
        pump(portStream, mux, portStream, (err) => {
            portStream.destroy(err)
        })

        setupProviderConnection(
            mux.createStream('qrl-provider'),
            remotePort.sender,
            "website",
        );
        remotePort.onDisconnect.addListener((msg) => { 
            mux.destroy()
        })
    }
}

browser.runtime.onConnect.addListener(connectRemote);