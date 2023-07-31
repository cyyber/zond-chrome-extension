import browser from 'webextension-polyfill';
const Web3 = require('@theqrl/web3')

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.VUE_APP_ZOND_NODE_URL))

function connectPopuptoBackground() {
    const controllerPort = browser.runtime.connect({ name: 'controller' });
    return controllerPort
}

function providerWeb3Instance() {
    return web3;
}

export {
    connectPopuptoBackground,
    providerWeb3Instance
}