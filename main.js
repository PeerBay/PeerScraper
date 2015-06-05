    // Create IE + others compatible event handler
	// var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	// var eventer = window[eventMethod];
	// var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
	
	// // Listen to message from child window
	// eventer(messageEvent,function(e) {
	//   console.log('parent received message!:  ',e.data);
	// },false);
	
function getDocument (url, callback) {
	console.log("url:", url)
	http = new XMLHttpRequest();
	http.open('GET', url);
	http.onreadystatechange = function() {
		if (http.readyState === 4) {
			parser = new DOMParser()
			// parsed = parser.parseFromString(http.responseText.replace(/(\r\n|\n|\r)/gm, "").replace(/<!--[\s\S]*?-->/g, ""), "application/xhtml+xml")
			parsed = parser.parseFromString(http.responseText.replace(/(\r\n|\n|\r)/gm, ""), "text/html")
			callback(parsed);
		}
	};
	http.send(null);
}

	
window.addEventListener("storage", function (e) {
    console.log("d",e)
    url=JSON.parse(e.newValue).loadUrl
    buildIframe(url)

    
}, false);	

$("#loadsearchlink").click(function() {
	var searchlink = $("#searchlinkinput").val()
	buildIframe(searchlink)
})
window.selectorGadgetPlusOptions = {
	baseUrl: document.location.origin + "/scraper"
};
function buildIframe(url){
	getDocument(url, function(data) {
		$("#searchpage").contents().find("head").empty()
		$("#searchpage").contents().find("body").empty()
		head = $(data).find("head");
		body = $(data).find("body");
		selectorgadgetloader = "javascript:(function(){window.selectorGadgetPlusOptions={baseUrl: 'https://selectorgadget-plus.appspot.com/'}; var s=document.createElement('div');s.innerHTML='Loading...';s.style.color='black';s.style.padding='20px';s.style.position='fixed';s.style.zIndex='9999';s.style.fontSize='3.0em';s.style.border='2px solid black';s.style.right='40px';s.style.top='40px';s.setAttribute('class','selector_gadget_loading');s.style.background='white';document.body.appendChild(s);s=document.createElement('script');s.setAttribute('type','text/javascript');s.setAttribute('src', 'http://localhost:8080/scraper/loader.js');document.body.appendChild(s);})();"
		// selectorgadgetloader = "javascript:(function(){window.selectorGadgetPlusOptions={baseUrl: 'http://localhost:8080/scraper/'}; var s=document.createElement('div');s.innerHTML='Loading...';s.style.color='black';s.style.padding='20px';s.style.position='fixed';s.style.zIndex='9999';s.style.fontSize='3.0em';s.style.border='2px solid black';s.style.right='40px';s.style.top='40px';s.setAttribute('class','selector_gadget_loading');s.style.background='white';document.body.appendChild(s);s=document.createElement('script');s.setAttribute('type','text/javascript');s.setAttribute('src', window.selectorGadgetPlusOptions.baseUrl + 'loader.js');document.body.appendChild(s);})();"

		// $(body).find("a").each(function(){
		//     $(this).data("href", $(this).attr("href")).removeAttr("href");
		// });	

		var s = document.createElement('a');
		s.setAttribute('href', selectorgadgetloader);
		// console.log("load")
		s.setAttribute('id', 'loadselector');
		s.setAttribute('style', 'position:absolute;top:0px;left:0px');
		s.text="load selector"
		// console.log("loaded")
		// $(body).append(s)
		$(body).append(s)

		var linkparser = document.createElement('a');
		linkparser.href = url
		
		// $( "#searchpage" ).contents()[0].location.origin=linkparser.origin
		$(head).find("link").each(function() {
			defaulthref = this.getAttribute("href")
			console.log(defaulthref)
			if (defaulthref.startsWith("http") || defaulthref.startsWith("//")) {
				href = defaulthref
			} else {
				href = linkparser.origin + defaulthref
			}

			this.href = href
			// $(this).replaceWith("<style> @import '"+href+"'</style>")

		})
		$(body).find("[src]").each(function() {
			defaultsrc = this.getAttribute("src")
			console.log(defaultsrc)
			if (defaultsrc.startsWith("http") || defaultsrc.startsWith("//")) {
				src = defaultsrc
			} else {
				src = linkparser.origin + defaultsrc
			}

			this.src = src
			// $(this).replaceWith("<style> @import '"+href+"'</style>")

		})

		$("#searchpage").contents()[0].origin="http://localhost:8080"
		$("#searchpage").contents().find("head").replaceWith(head)
		$("#searchpage").contents().find("body").replaceWith(body)
		$("#searchpage").contents().find("body").css("width","80%")
		$( "#searchpage" ).contents().find("#loadselector")[0].click()
		
		// $("#searchpage").contents().find("body").append(selectorgadgetloader)
	})
}	
