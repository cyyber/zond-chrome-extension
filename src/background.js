import pump from 'pump';
import PortStream from 'extension-port-stream';
import createEngineStream from 'json-rpc-middleware-stream/dist/createEngineStream';
import ObjectMultiplex from 'obj-multiplex';
import browser from 'webextension-polyfill';
import {JsonRpcEngine} from 'json-rpc-engine'


function setupProviderConnection(outStream, sender, subjectType) {
    const engine = new JsonRpcEngine()
    console.log("reached provider")
    engine.push(async (req, res, next, end)=>{
        console.log("pushing in engine", req)
        if(req.method == "eth_requestAccounts"){
            let extensionURL = browser.runtime.getURL('popup.html');
            await browser.tabs.create({url: extensionURL})
            Object.assign(res, {result: {
                accounts: ["acc1", "acc2"],
                chainId: "8000",
                isUnlocked: true,
                networkVersion: "2.0"
            }})
        } else {
            Object.assign(res, {result: {
                accounts: ["acc1", "acc2"],
                chainId: "8000",
                isUnlocked: true,
                networkVersion: "2.0"
            }})
        }
        
        end()
    })
    const providerStream = createEngineStream({ engine });
    pump(outStream, providerStream, outStream, (err) => {
        console.log(err)
      });

}


function connectRemote(remotePort) {
    const processName = remotePort.name;

    let isMetaMaskInternalProcess = false;

   
    isMetaMaskInternalProcess = remotePort.sender.origin === `chrome-extension://${browser.runtime.id}`;
    

    const senderUrl = remotePort.sender?.url
      ? new URL(remotePort.sender.url)
      : null;

    
    const portStream = new PortStream(remotePort);
    
    const mux = new ObjectMultiplex();
    pump(portStream, mux, portStream, (err)=>{
        console.log(err)
    })
    
    setupProviderConnection(
        mux.createStream('metamask-provider'),
        remotePort.sender,
        "website",
    );
}


browser.runtime.onConnect.addListener(connectRemote);