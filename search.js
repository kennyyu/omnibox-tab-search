// search.js
// Searches for tabs with the given text and highlights the window
// and tab on entering.
//
// author: Kenny Yu

// This will remove any "&" and """ characters from a string.
function escapeString(s) {
  return s.replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function highlight(desc, text) {
  var index = desc.toLowerCase().search(text.toLowerCase());
  return escapeString(
    "<dim>" + desc.slice(0, index) + "</dim>"
    + "<match>" + desc.slice(index, index + text.length) + "</match>"
    + "<dim>" + desc.slice(index + text.length) + "</dim>");
}

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    chrome.tabs.query({'title': '*' + text + '*'}, function(tabs) {
      console.log(tabs);
      var suggestions = []
      for (var i in tabs) {
        var tab = tabs[i];
        var desc = tab.title;
        var index = desc.toLowerCase().search(text.toLowerCase());
        suggestions.push({
          'content': tab.windowId + ',' + tab.id,
          'description': highlight(tab.title, text)
             + " | <url>" + escapeString(tab.url) + "</url>",
        }); 
      }
      suggest(suggestions);
    });
  });

chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    var components = text.split(',');
    if (components.length != 2) {
      return;
    }
    // highlight the given window and tab
    var windowId = parseInt(components[0]);
    var tabId = parseInt(components[1]);
    chrome.windows.update(windowId, {'focused': true});
    chrome.tabs.update(tabId, {'active': true});
  });
