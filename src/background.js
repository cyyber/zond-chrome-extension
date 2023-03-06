import pump from 'pump';
import PortStream from 'extension-port-stream';
import createEngineStream from 'json-rpc-middleware-stream/dist/createEngineStream';
import ObjectMultiplex from 'obj-multiplex';
import browser from 'webextension-polyfill';
import { JsonRpcEngine } from 'json-rpc-engine';
import { once, EventEmitter } from "events";
import {providerWeb3Instance} from './service/controller'

var eventEmitter = new EventEmitter();

let store = browser.storage.local

function setupProviderConnection(outStream, sender, subjectType) {
    const engine = new JsonRpcEngine()
    let web3 = providerWeb3Instance()  
    let senderUrl = new URL(sender.url)
    let origin = senderUrl.origin
    engine.push(async (req, res, next, end) => {
        console.log("req method", req)
        switch(req.method) {
            case("zond_requestAccounts"):
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
            case("zond_accounts"):
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
            case("zond_sign"):
                {
                    let extensionURL = browser.runtime.getURL('popup.html');
                    await browser.tabs.create({ url: extensionURL+'?task=sign&account='+req.params[0]+'&source='+origin+'&message='+req.params[1] })
                    let controllerPort = await once(eventEmitter, "controllerPort_assigned")
                    // controllerPort[0].postMessage({ method: "zond_sign", params: msg.params })
                    controllerPort[0].onMessage.addListener((msg) => {
                        if(msg.method == "zond_sign") {
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
            case("zond_chainId"):
                {
                    web3.zond.getChainId().then((id)=>{Object.assign(res, {
                        result: id
                    })
                    end()})
                }
                break;
            case("net_version"): 
                {
                    Object.assign(res, {
                        result: "0"
                    })
                    end()
                }
                break;
            case("zond_estimateGas"):
                {
                    web3.zond.estimateGas(req.params[0]).then((gas) => {
                        Object.assign(res, {
                            result: gas
                        })
                        end()
                    })
                }
                break;
            case("zond_sendTransaction"):
                {
                    let extensionURL = browser.runtime.getURL('popup.html');
                    await browser.tabs.create({ url: extensionURL+'?task=transaction&account=' + req.params[0].from + '&source=' + origin+ '&gas=' + req.params[0].gas + '&value=' + req.params[0].value + '&data='+req.params[0].data })
                    let controllerPort = await once(eventEmitter, "controllerPort_assigned")
                    controllerPort[0].onMessage.addListener(async (msg) => {
                        if(msg.method == "zond_sendTransaction_1") {
                            if(msg.error == null && msg.approve) {
                                req.params.from = msg.account
                                controllerPort[0].postMessage({method: "zond_sendTransaction_2", params: req.params})
                            } else {
                                end(new Error(`QRL Transaction Signature: ${msg.error}`))
                            }
                        } else if(msg.method == "zond_sendTransaction_2") {
                            if(msg.error == null && msg.signedTx != null) {
                                msg.signedTx.rawTransaction.type = "0x2"
                                web3.zond.handleRevert = true
                                web3.zond.sendSignedTransaction(
                                            msg.signedTx.rawTransaction                                          
                                ).on('confirmation', (n, confirmation) =>{
                                    engine.emit('confirmation', n, confirmation)
                                }).then(
                                    function(value) {
                                        controllerPort[0].postMessage({method: "zond_sendTransaction_3", params: {success: true}})
                                        Object.assign(res, {result: value})
                                        end()
                                    },
                                    function(error){
                                        end(new Error(error))
                                    }
                                )
                            }
                        }
                    })
                }
                break;
            case("zond_getTransactionCount"):
                {
                    let txCount = await web3.zond.getTransactionCount(req.params[0])
                    Object.assign(res, {
                        result: txCount
                    })
                    end()
                }
                break;
            case("zond_getBlockByNumber"):
                {
                    web3.zond.getBlock((typeof req.params[0] == Number || req.params[0] == 'latest')?req.params[0]:parseInt(req.params[0])).then((block) => {
                        Object.assign(res, {
                            result: block
                        })
                        end()
                    })
                }
                break;
            case('zond_getTransactionReceipt'):
                {
                    web3.zond.getTransactionReceipt((typeof req.params === String)?req.params:req.params[0].transactionHash).then((receipt)=>{
                        Object.assign(res, {
                            result: receipt
                        })
                        end()
                    })
                }
                break;
            case('zond_getTransactionByBlockHashAndIndex'):
                {
                    web3.zond.getTransactionFromBlock(req.params[0], req.params[1]).then((tx) => {
                        Object.assign(res, {
                            result: tx
                        })
                        end()
                    })
                }
                break;
            case("metamask_getProviderState"):
                {
                    Object.assign(res, {
                        result: {
                            chainId: "0x1",
                            isUnlocked: true,
                            networkVersion: "0x0"
                        }
                    })
                    end()
                }
                break;
            case("zond_getCode"):
                {
                    web3.zond.getCode(req.params[0]).then((code)=>{
                        Object.assign(res, {
                            result: code
                        })
                        end()
                    })
                }
                break;
            case("zond_call"):
                {
                    web3.zond.call(req.params[0]).then((result) => {
                        Object.assign(res, {
                            result: result
                        })
                        end()
                    })
                }
                break;
            case("zond_subscribe"):
                {
                    web3.zond.subscribe(req.params[0]).on('data', (value) => {
                        engine.emit('data', value)
                    }).on('changed', (value) => {
                        engine.emit('changed', value)
                    }).on('error', (value) => {
                        engine.emit('error', value)
                    }).on('connected', (value) => {
                        engine.emit('connected', value)
                    })
                }   
                break;
            case('wallet_watchAsset'):
                {
                    let extensionURL = browser.runtime.getURL('popup.html');
                    await browser.tabs.create({ url: extensionURL+'?task=token&address=' + req.params.options.address + '&symbol=' + req.params.options.symbol + '&decimals=' + req.params.options.decimals + '&image=' + req.params.options.image })
                    let controllerPort = await once(eventEmitter, "controllerPort_assigned")
                    controllerPort[0].onMessage.addListener((msg) => {
                        if(msg.method == 'wallet_watchAsset') {
                            Object.assign(res, {
                                result: msg.success
                            })  
                            end()  
                        }
                    })
                }
                break;
            default:
                next()
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