/* eslint-disable */
import browser from 'webextension-polyfill';
import fs from 'fs'
const path = require('path')
import pump from 'pump';
import PortStream from 'extension-port-stream';
import ObjectMultiplex from 'obj-multiplex';
const WindowPostMessageStream = require('@metamask/post-message-stream').WindowPostMessageStream;



// const inpageSuffix = `//# sourceURL=${browser.runtime.getURL('inpage.js')}\n`;
// const inpageBundle = inpageContent + inpageSuffix;
// let inpageContent
// try{
//     inpageContent = fs.readFileSync('__dirname/inpage.js', 'utf8');
// } catch(err) {
//     console.log(err)
// }
const CONTENT_SCRIPT = 'qrl-contentscript';
const INPAGE = 'qrl-inpage';
const PROVIDER = 'qrl-provider';

function injectScript() {
    try {
        const container = document.head || document.documentElement;
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute('async', 'false');
        // scriptTag.textContent = inpage2.toString().slice(10,-2);
        // scriptTag.setAttribute('src', 'chrome-extension://plgbbiohldekakchldmmjdjaedchbnkg/js/inpage.js')
        // scriptTag.setAttribute('src', "https://res.cloudinary.com/dz24nbed8/raw/upload/v1673429279/inpage_browserify-2_vlesi4.js")
        scriptTag.setAttribute('src', "https://res.cloudinary.com/dz24nbed8/raw/upload/v1675271420/inpage_browserify_ruxgmm.js")
      
        container.insertBefore(scriptTag, container.children[0]);
        container.removeChild(scriptTag);
    } catch (error) {
        console.error('MetaMask: Provider injection failed.', error);
    }
}

async function setupStreams() {
  // the transport-specific streams for communication between inpage and background
  const pageStream = new WindowPostMessageStream({
    name: CONTENT_SCRIPT,
    target: INPAGE,
  });
  const extensionPort = browser.runtime.connect({ name: CONTENT_SCRIPT });
  const extensionStream = new PortStream(extensionPort);

  // create and connect channel muxers
  // so we can handle the channels individually
  const pageMux = new ObjectMultiplex();
  pageMux.setMaxListeners(25);
  const extensionMux = new ObjectMultiplex();
  extensionMux.setMaxListeners(25);

  pump(pageMux, pageStream, pageMux, (err) =>
    console.log('QRL Inpage Multiplex', err),
  );
  pump(extensionMux, extensionStream, extensionMux, (err) => {
    console.log('QRL Background Multiplex', err);
  });

  // forward communication across inpage-background for these channels only
  forwardTrafficBetweenMuxes(PROVIDER, pageMux, extensionMux);
}

function forwardTrafficBetweenMuxes(channelName, muxA, muxB) {
  const channelA = muxA.createStream(channelName);
  const channelB = muxB.createStream(channelName);
  pump(channelA, channelB, channelA, (error) =>
    console.debug(
      `QRL: Muxed traffic for channel "${channelName}" failed.`,
      error,
    ),
  );
}

injectScript()
setupStreams()