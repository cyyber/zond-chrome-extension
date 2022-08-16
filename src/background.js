chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
    //   if (sender.url == blacklistedWebsite)
    //     return;  // don't allow this web page access
        console.log(request)
    }
);
  