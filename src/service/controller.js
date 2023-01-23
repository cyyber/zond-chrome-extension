import browser from 'webextension-polyfill';

export default async function connectPopuptoBackground() {
    const controllerPort = browser.runtime.connect({ name: 'controller' });
    return controllerPort
}