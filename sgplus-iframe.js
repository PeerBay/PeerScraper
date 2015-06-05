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


var SelectorGadgetPlusController = function($scope) {

    $scope.fields = [];

    $scope.listFields=["title::text","about::text","image::attr::src","datetime::text","link::attr::href","next::attr::href"]
    $scope.articleFields=["title::text","content::text","image::attr::src","datetime::text","nextPage::attr::href","author::text","tags::text","category::text"]
    $scope.fieldSeq = 1;

    $scope.selectingFieldIndex = null;
   
    $scope.addField = function(values) {
        values = values || {};
        this.fields.push({
            name: values.name || 'Field' + this.fieldSeq++,
            css: values.css || '',
            oldCss: values.oldCss || '',
            leaf: values.leaf || 'html',
            results: values.results || [],
            resultsShown: false,
            xpaths: []
        });
    }
    if("openSession" in localStorage){
        $scope.session=JSON.parse(localStorage.openSession)
        if($scope.session.loadUrl){
            if($scope.session.type=="search"){
                if($scope.session.step){
                    $scope.session.step='findSearchButton'
                }else{
                   $scope.session.step= 'findSearchInput'
                }
            }
        }
    }else{
        $scope.session={}
        localStorage.openSession
    }
    $scope.loadPage=function(url){

        if (!(url.startsWith("http") || url.startsWith("//"))) {
            var linkparser = document.createElement('a');
            linkparser.href = $scope.session.loadUrl
            url = linkparser.origin + url
        }
        
        $scope.session["loadUrl"]=url 
        localStorage.openSession=JSON.stringify($scope.session)

    }
    $scope.removeField = function(field) {
        $scope._selectDone(field);
        this.$parent.fields.splice(this.$index, 1);
    }

    $scope.select = function(field) {
        if($scope.selectingFieldIndex !== null) {
            $scope.selectCancel($scope.fields[$scope.selectingFieldIndex]);
        }
        $scope.selectingFieldIndex = this.$index;
        field.selecting = true;
        field.selectingCustom = false;
        field.oldCss = field.css;
        field.oldResults = field.results;
        this.enableSelectorGadget();
    }

    $scope.selectOk = function(field) {
        field.resultsShown = false;
        this._selectDone(field);
    }

    $scope.selectCancel = function(field) {
        field.css = field.oldCss;
        field.results = field.oldResults; 
        this._selectDone(field);
    }

    $scope._selectDone = function(field) {
        $scope.selectingFieldIndex = null;
        field.selecting = false;
        field.selectingCustom = false;
        this.disableSelectorGadget();
        $scope.session[$scope.session.step]=$scope.export()
    }

    $scope.import = function() {
        var imported = JSON.parse(prompt('Paste your JSON').replace(/\n/g, ''));

        $scope.fields = [];

        angular.forEach(imported.selectors, function(values, name) {
            $scope.addField({
                name: name,
                css: values.css,
                leaf: values.leaf,
                attr: values.attr
            });
        })
    }
    $scope.createFields = function(fields) {

        $scope.fields = [];

        angular.forEach(fields, function(nameleaf) {
            nameleaf=nameleaf.split("::")
            name=nameleaf[0]
            leaf=nameleaf[1]
            if(nameleaf[2]){
                attr=nameleaf[2]
            }else{
                attr=""
            }
            $scope.addField({
                name: name,
                css: "",
                leaf: leaf,
                attr: attr
            });
        })
    }
    $scope.export = function() {
        var json = {
            selectors: {}
        };

        angular.forEach($scope.fields, function(value) {
            json.selectors[value.name] = {
                css: value.css,
                leaf: value.leaf,
                attr: value.attr
            }
        });

        return JSON.stringify(json, undefined, 2);
    }
    $scope.clickLink=function(){
        parent.postMessage(['sgplus_clickLink'], '*');

    }
    // wrappers for communicating with parent window

    $scope.togglePosition = function() {
        parent.postMessage(['sgplus_togglePosition'], '*');
    }

    $scope.disable = function() {
        parent.postMessage(['sgplus_disable'], '*');
    }

    $scope.enableSelectorGadget = function() {
        parent.postMessage(['sgplus_enableSelectorGadget'], '*');
    }

    $scope.disableSelectorGadget = function() {
        parent.postMessage(['sgplus_disableSelectorGadget'], '*');
    }

    $scope.updateLeafAndAttr = function(field) {
        parent.postMessage(['sgplus_updateLeafAndAttr', field.leaf, field.attr], '*');
    }

    $scope.selectCustom = function(field) {
        $scope.selectingFieldIndex = this.$index;
        field.selectingCustom = true;
        parent.postMessage(['sgplus_selectCustom', field.css], '*');
    }

    $scope.highlightResult = function(field, index) {
        parent.postMessage(['sgplus_highlight', field.xpaths[index]], '*');
    }
    $scope.removeResult = function(field, index) {
        parent.postMessage(['sgplus_removeResult', field.xpaths[index]], '*');
    }

    $scope.unhighlightResult = function() {
        parent.postMessage(['sgplus_unhighlight'], '*');
    }
    function saveSession(){
        localStorage["openSession"]={}

    }
    // listen for events from parent window

    window.addEventListener('message', function(e) {
		// console.log(e)
        if((e.data[0] == 'sgplus_updateCssAndResults')
                && ($scope.selectingFieldIndex !== null)) {
            var field = $scope.fields[$scope.selectingFieldIndex];
            // prevent to modify field when typing
            if(!field.selectingCustom) {
                field.css = e.data[1];
            }
            field.results = e.data[2];
            field.xpaths = e.data[3];
            $scope.$digest();
        }else if(e.data[0] == 'sgplus_loadUrl'){
            $scope.loadUrl(e.data[1])
        }
    });
    
// setInterval(function() {
// 	// Send the message "Hello" to the parent window
// 	// ...if the domain is still "davidwalsh.name"
// 	parent.postMessage("Hello","http://localhost:8080/");
// },100000);


}

