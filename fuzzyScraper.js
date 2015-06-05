var scraper = {
	compareTwoLinks: function(url1, url2) {
		scraper.getMultipleDocuments([url1, url2], function(docs) {
			console.log(docs)
			scraper.cleanHTML(docs[0])
			scraper.cleanHTML(docs[1])
			scraper.removeEmptyChildren(docs[0])
			scraper.removeEmptyChildren(docs[1])
			dom = {}
			search = function(d) {
				$(d).children().each(function() {
					if ($.trim(this.textContent).length !== 0) {
						// console.log(this.textContent)
						if (this.text in dom) {
							dom[this.text].push(this)
						} else {
							dom[this.textContent] = [this]
						}

					}
					if (this.firstChild) {
						search(this)
						// parent=this.parentElement
						// if(parent.firstChild===null){
						// 	scraper.removeEmptyChildren(parent)
						// }

					}
					console.log(dom)
				})
			}
			search(docs[0])
			console.log(docs[0])
			removeDuplicateElements=function(d){
				$(d).children().each(function() {
					if ($.trim(this.text).length !== 0) {
						// console.log(this.textContent)
						if (this.text in dom) {
							$(dom[this.text]).remove()
							delete dom[this.textContent]
						}

					}
					if (this.firstChild) {
						removeDuplicateElements(this)
						// parent=this.parentElement
						// if(parent.firstChild===null){
						// 	scraper.removeEmptyChildren(parent)
						// }
					}
				})	
			}

			removeDuplicateElements(docs[1])
			checkEqualNodes=function(d1,d2){
				$(d1.all).each(function(){
					f=this
					$(d2.all).each(function(){
						if(this.isEqualNode(f)){
							$(this).remove()
							$(f).remove()
						}

					})
				})
			}
			console.log(docs[0])
		})
	},
	init: function(url) {
		scraper.location = url.split("//")[1].split("/")[0]
		scraper.startURL = url

		scraper.getDocument(url, function(mainDoc) {
			scraper.mainDoc = mainDoc
			// mainDoc = scraper.linksToBlobs(mainDoc)
			// html = $(mainDoc).find("html").html()
			// var blob = new Blob([html], {
			// 	type: "text/html"
			// });
			// var blob_url = URL.createObjectURL(blob);
			head = $(mainDoc).find("head").html()
			body = $(mainDoc).find("body").html()
			// $("#scraper").contents().find("head").html(head)
			// $("#scraper").contents().find("body").html(body)
			$("#scraper").attr("src", blob_url)
			$("#scraper").load(function() {
				console.log("loaded")
				readyMainDoc = $("#scraper").contents().find("body").html()
				parser = new DOMParser()
				readyMainDoc = parser.parseFromString(readyMainDoc, "text/html")
				console.log(readyMainDoc)
				$("body").append("<iframe id='scraper' style='width:100%;height:1000px'></iframe>")
				scraper.findSimilarUrls(url, readyMainDoc, function(urls) {
					scraper.getMultipleDocuments(urls, function(parsedDocuments) {
						scraper.similarDocs = parsedDocuments
						scraper.startCheck()
					})
				})
			})
		})
	},
	linksToBlobs: function(rawDoc) {
		$(rawDoc).find('link').each(function() {
			if (this.href) {
				href = scraper.fixHref(this.href)
				elem = this
				if (this.type) {
					type = this.type
					scraper.getRawDocument(href, function(data) {
						html = $(data).find("html").html()
						var blob = new Blob([html], {
							type: type
						});
						var blob_url = URL.createObjectURL(blob);
						elem.href = blob_url
					})
				}
			}
		})
		$(rawDoc).find('script').each(function() {
			if (this.src) {
				src = scraper.fixHref(this.src)
				elem = this
				type = "text/javascript"
				scraper.getRawDocument(href, function(data) {
					html = $(data).find("html").html()
					var blob = new Blob([html], {
						type: type
					});
					var blob_url = URL.createObjectURL(blob);
					elem.href = blob_url
				})
			}
		})
		return rawDoc
	},
	startCheck: function() {
		scraper.mainDoc = scraper.cleanHTML(scraper.mainDoc)
		scraper.removeEmptyChildren(scraper.mainDoc)
		for (i in scraper.similarDocs) {
			scraper.similarDocs[i] = scraper.cleanHTML(scraper.similarDocs[i])
			console.log(scraper.similarDocs[i])
			scraper.removeEmptyChildren(scraper.similarDocs[i])
		}
		$(scraper.mainDoc).find("body").children().each(function() {
			elem = this
			$(scraper.similarDocs[0]).find("body").children().each(function() {
				if (elem.isEqualNode(this)) {
					$(elem).remove()
				}
			})
		})
		console.log(scraper.mainDoc)
	},
	unwanted: {},
	cleanHTML: function(doc, unwanted) {
		if (!unwanted) {
			unwanted = ["head", "link", "style", "script", "noscript", "iframe", "meta"] // findMetaData before meta elements remove
		}
		for (elem in unwanted) {
			$(doc).find(unwanted[elem]).each(function() {
				if (!(this.innerHTML in scraper.unwanted)) {
					scraper.unwanted[this.innerHTML] = this
				}
				$(this).remove()
			})
		}
		return doc
	},
	findUniqueElements: function() {},
	removeEmptyChildren: function(topElement) {
		remove = function(element) {
			$(element).children().each(function() {

				if ($.trim(this.textContent).length == 0) {
					// console.log(this.textContent)
					$(this).remove()
				} else if (this.firstChild) {
					remove(this)
					// parent=this.parentElement
					// if(parent.firstChild===null){
					// 	scraper.removeEmptyChildren(parent)
					// }
				}
			})
		}
		remove(topElement)
		// console.log(topElement.body.outerHTML.length)
	},
	findSimilarElements: function() {},
	uniqueContentSelectors: function() {},
	isMultiplePage: function() {},
	fixHref: function(href) {
		// console.log(href)
		if (href.startsWith("//")) {
			href = "http://" + href.split("/").filter(function(n) {
				return n != ""
			}).join("/");
			console.log(href)
		} else if (href.startsWith("/")) {
			console.log(href)
			href = "http://" + scraper.location + href
			console.log(href)
		} else if (href.startsWith("http") || href.startsWith("https")) {
			return href
		} else if (href.startsWith("mailto")) {
			return ""
		} else {
			console.log(href)
			href = "http://" + scraper.location + "/" + scraper.startURL.split("/").slice(0, -1).join("/") + "/" + this.href
			console.log(href)
			// relative
		}
		// console.log(href)
		return href
	},
	similarMax: 3,
	findSimilarUrls: function(url, doc, callback) {
		links = []
		$(doc).find("[href]").each(function() {
			if (this.href) {
				links.push(scraper.fixHref(this.href))
			}
		})
		similarlinks = []
		console.log(url)
		for (link in links) {
			var distArray = levenshteinenator(url, links[link]);
			var dist = distArray[distArray.length - 1][distArray[distArray.length - 1].length - 1];
			if ((dist > 0) && !links[link].startsWith(url)) {
				// console.log(links[link])
				if (typeof similarlinks[dist] === "undefined") {
					similarlinks[dist] = []
				}
				if (!(links[link] in similarlinks[dist])) {
					similarlinks[dist].push(links[link])
				}
			}
		}
		console.log(similarlinks)
		links = []
		for (i in similarlinks) {
			links = links.concat(similarlinks[i])
			links = $.unique(links.sort()).sort();
			for (i in links) {
				for (j in links) {
					if (links[j] && links[j] !== links[i] && links[j].startsWith(links[i])) {
						console.log(links[j], links[i])
						links = links.splice(j, 1)
					}
				}
			}
			if (links.length > scraper.similarMax) {
				links = links.slice(0, scraper.similarMax)
				break
			}
		}
		console.log(links)
		callback(links)
	},
	getMultipleDocuments: function(urls, callback) {
		parsedDocs = []
		var stop = function() {
			console.log(parsedDocs)
			if (parsedDocs.length == urls.length) {
				callback(parsedDocs)
			}
			return
		}
		http = []
		for (i in urls) {
			http[i] = new XMLHttpRequest();
			http[i].open('GET', urls[i]);
			http[i].onreadystatechange = function() {
				if (this.readyState === 4) {
					parser = new DOMParser()
					parsed = parser.parseFromString(this.responseText.replace(/(\r\n|\n|\r)/gm, "").replace(/<!--[\s\S]*?-->/g, ""), "text/html")
					parsedDocs.push(parsed)
					stop();
				}
			};
			http[i].send(null);
		}
	},
	getDocument: function(url, callback) {
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
	},
	getRawDocument: function(url, callback) {
		console.log("url:", url)
		http = new XMLHttpRequest();
		http.open('GET', url);
		http.onreadystatechange = function() {
			if (http.readyState === 4) {
				callback(http.responseText);
			}
		};
		http.send(null);
	}
}