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
            case("eth_sign"):
                {
                    let extensionURL = browser.runtime.getURL('popup.html');
                    await browser.tabs.create({ url: extensionURL+'?task=sign&account='+req.params[0]+'&source='+origin+'&message='+req.params[1] })
                    let controllerPort = await once(eventEmitter, "controllerPort_assigned")
                    // controllerPort[0].postMessage({ method: "eth_sign", params: msg.params })
                    controllerPort[0].onMessage.addListener((msg) => {
                        if(msg.method == "eth_sign") {
                            console.log(msg)
                            if(msg.error == null) {
                                Object.assign(res, {
                                    result: msg.signature
                                })
                                end()
                            } else {
                                end(new Error(`QRL Message Signature: ${msg.error}`))
                            }
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
                store.get(null).then(function(items) {
                    var allKeys = Object.keys(items);
                    var allKeysFiltered = allKeys.filter((key) => {
                        let accs = items[key]
                        console.log(accs)
                        if(Array.isArray(accs)) {
                            return accs.includes(value["account"])
                        } else {
                            return false
                        }
                    })
                    port.postMessage({method: "get_connectedSites", value: allKeysFiltered})
                });
            }
            break;
        case("remove_connectedSites"):
            {
                store.get([value["site"]]).then((result) => {
                    if(result[value["site"]] && Array.isArray(result[value["site"]])) {
                        let res_array = result[value["site"]]
                        let acc_array = res_array
                        let acc_array_filtered = acc_array.filter(item => item !== value["account"])
                        if (acc_array_filtered.length > 0) {
                            store.set({[value.site]: acc_array_filtered}).then(() => {
                                port.postMessage({method: "remove_connectedSites", value: value})
                            })
                        } else {
                            store.remove([value["site"]]).then(() => {
                                port.postMessage({method: "remove_connectedSites", value: value})
                            })
                        }
                    } else {
                        port.postMessage({method: "remove_connectedSites", value: value})
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