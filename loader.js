function importJS(src, callback)
{
  var s, r, t;
  r = false;
  s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = src;
  s.class="sgplus"
  s.onload = s.onreadystatechange = function() {
    if ( !r && (!this.readyState || this.readyState == 'complete') )
    {
      r = true;
      callback();
    }
  };
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

function importCSS(href) {
  var s = document.createElement('link');
  s.setAttribute('rel', 'stylesheet');
  s.setAttribute('type', 'text/css');
  s.setAttribute('media', 'screen');
  s.setAttribute('href', href);
  s.setAttribute('class', "sgplus");
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

var baseUrl = window.selectorGadgetPlusOptions.baseUrl;

//~ var load = function(){
  //~ importCSS(baseUrl + 'selectorgadget/selectorgadget.css');
  //~ importCSS(baseUrl + 'sgplus.css');
  //~ importJS(baseUrl + 'jquery.js', function() {
    //~ window.jQuerySG = jQuery.noConflict();
    //~ importJS(baseUrl + 'diff_match_patch.js', function() {
      //~ importJS(baseUrl + 'selectorgadget/dom.js', function() {
        //~ importJS(baseUrl + 'selectorgadget/core.js', function() {
          //~ importJS(baseUrl + 'sgplus.js', function() {
            //~ window.jQuerySG('.selector_gadget_loading').remove();
            //~ SelectorGadgetPlus.enable(baseUrl + 'sgplus-iframe.html');
          //~ }) 
        //~ });
      //~ });
    //~ });
  //~ });
//~ };
var load = function(){
  importCSS('http://localhost:8080/scraper/selectorgadget/selectorgadget.css');
  importCSS('http://localhost:8080/scraper/sgplus.css');
  importJS('http://localhost:8080/scraper/js/jquery.js', function() {
    window.jQuerySG = jQuery.noConflict();
    importJS('http://localhost:8080/scraper/js/diff_match_patch.js', function() {
      importJS('http://localhost:8080/scraper/selectorgadget/dom.js', function() {
        importJS('http://localhost:8080/scraper/selectorgadget/core.js', function() {
          importJS('http://localhost:8080/scraper/sgplus.js', function() {
            window.jQuerySG('.selector_gadget_loading').remove();
            SelectorGadgetPlus.enable('http://localhost:8080/scraper/sgplus-iframe.html');
          }) 
        });
      });
    });
  });
};
console.log("sgselcetor loading")
load();
