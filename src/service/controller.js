import browser from 'webextension-polyfill';
import createEngineStream from 'json-rpc-middleware-stream/dist/createEngineStream';
import {JsonRpcEngine} from 'json-rpc-engine'
import pump from 'pump';
import PortStream from 'extension-port-stream';
import ObjectMultiplex from 'obj-multiplex';
import {setStore} from '../store/ionic-storage'

export default async function connectPopuptoBackground() {
    const controllerPort = browser.runtime.connect({ name: 'controller' });
    controllerPort.onMessage.addListener(async (msg)=> {
        if(msg.method == "req_account") {
            var store = await setStore()
            var id = await store.get('qqq')
            var user_details = await store.get(id)
            let accounts = []
            user_details.wallet.map((i)=>{accounts.push(i.address)})
            controllerPort.postMessage({accounts: accounts})
        }
    })
}