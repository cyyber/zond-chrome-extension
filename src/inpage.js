// need to make sure we aren't affected by overlapping namespaces
// and that we dont affect the app with our namespace
// mostly a fix for web3's BigNumber if AMD's "define" is defined...
let __define;

/**
 * Caches reference to global define object and deletes it to
 * avoid conflicts with other global define objects, such as
 * AMD's define function
 */
const cleanContextForImports = () => {
  __define = global.define;
  try {
    global.define = undefined;
  } catch (_) {
    console.warn('QRL - global.define could not be deleted.');
  }
};

/**
 * Restores global define object from cached reference
 */
const restoreContextAfterImports = () => {
  try {
    global.define = __define;
  } catch (_) {
    console.warn('QRL - global.define could not be overwritten.');
  }
};

cleanContextForImports();

const WindowPostMessageStream = require('@metamask/post-message-stream').WindowPostMessageStream;
const initializeProvider = require('@theqrl/qrl_providers/dist/initializeInpageProvider').initializeProvider;

restoreContextAfterImports();

const metamaskStream = new WindowPostMessageStream({
    name: 'qrl-inpage',
    target: 'qrl-contentscript',
});
  
initializeProvider({
    connectionStream: metamaskStream,
    logger: console,
    shouldShimWeb3: true,
});