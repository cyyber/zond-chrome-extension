import pump from 'pump';
import PortStream from 'extension-port-stream';
import createEngineStream from 'json-rpc-middleware-stream/dist/createEngineStream';
import ObjectMultiplex from 'obj-multiplex';
import browser from 'webextension-polyfill';
import { JsonRpcEngine } from 'json-rpc-engine';
import { once, EventEmitter } from "events";
var eventEmitter = new EventEmitter();

function setupProviderConnection(outStream, sender, subjectType) {
    const engine = new JsonRpcEngine()
    engine.push(async (req, res, next, end) => {
        if (req.method == "eth_requestAccounts") {
            let extensionURL = browser.runtime.getURL('popup.html');
            await browser.tabs.create({ url: extensionURL })
            let controllerPort = await once(eventEmitter, "controllerPort_assigned")
            controllerPort[0].postMessage({ method: "req_account" })
            controllerPort[0].onMessage.addListener((msg) => {
                if (msg.accounts) {
                    Object.assign(res, {
                        result: msg.accounts
                    })
                    end()
                }
            })
        }
    })
    const providerStream = createEngineStream({ engine });

    pump(outStream, providerStream, outStream, (err) => {
        console.log(err)
    });

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
        remotePort.onDisconnect.addListener((msg) => { console.log("port disconnected", msg) })
    } else {
        const portStream = new PortStream(remotePort);

        const mux = new ObjectMultiplex();
        pump(portStream, mux, portStream, (err) => {
            console.log(err)
        })

        setupProviderConnection(
            mux.createStream('qrl-provider'),
            remotePort.sender,
            "website",
        );
    }
}

browser.runtime.onConnect.addListener(connectRemote);