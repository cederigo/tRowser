Function.prototype.bind = function( obj ) {
    var method = this;
    return function() {
        return method.apply( obj, arguments );
    }
}

//default implementation isohunt
function isoHuntEngine(tRowser){
  this.t = tRowser;
  /*configure your reverse proxy to forward /isohunt/ to isohunt.com*/  
  this.baseURL = "/isohunt/js/json.php?";
  this.search = function (query, what ) {    
    this.t.log("search from iso engine");
    
    var url = this.baseURL+"ihq="+escape(query)+"&start=0&rows=25&sort=seeds";
    this.t.submitReq(url);
    
    
  }
  this.handleResponse = function ( resp ){   
    
    if(resp){
      /*parse response from isohunt*/
      var sr = new t.searchResult();      
      var data = eval('('+resp+')');
      
      sr.totalResults = data.total_results;
      sr.title = data.title;
      
      if (sr.totalResults > 0){      
        var entries = data.items.list;
        
        for (key in entries){
          var entry = entries[key];
          var se = new t.searchEntry();
          se.title       = entry.title;
          se.torrentLink = entry.enclosure_url;
          se.seeds       = entry.Seeds;
          se.leechers    = entry.leechers;
          se.size        = entry.size;
          
          sr.entries.push(se);
          
        }         
      }
      /*call registered callback*/       
      this.t.searchCallback(sr);      
      
    }else{
      this.t.searchCallback(new searchResult());
    }
    
  }  

}



function tRowser(){
  this.se = new isoHuntEngine(this);    
  this.searchCallback = function ( r ) { alert("r: "+r); };
  this.xhr;
  
  this.setCallback = function ( cb ){
    this.searchCallback = cb;
  }
  
  this.search = function(engine, query , what){
    if(engine){
      this.se = engine;
    }
    
    this.log("search with engine");
    this.se.search(query,what);
    
  }
  
  this.submitReq = function (_url){
  
    this.xhr = new XMLHttpRequest();
    this.xhr.onreadystatechange = this.handler.bind(this);
    
    var url = _url;    
          
    this.xhr.open("GET", url);
    this.xhr.send();
    
  }
  
  this.handler = function ( ) {
    
    if(this.xhr.readyState == 4 && this.xhr.status == 200) {
      // so far so good
      if(this.xhr.responseXML != null){
        // success!        
        //this.searchCallback(this.xhr.responseXML);
        this.se.handleResponse(this.xhr.responseXML);
      }else if (this.xhr.responseText != null){
        this.se.handleResponse(this.xhr.responseText);
        //this.searchCallback(this.xhr.responseText);
      }
    }else if (this.xhr.readyState == 4 && this.xhr.status != 200) {
      // fetched the wrong page or network error...
      this.searchCallback(null);
    }
    
  }
  
  this.log = function ( text ) {
    if(window.console != null){
      console.log(text);
    }
  }
  
  /*interfaces to return search results*/
  
  this.searchResult = function searchResult(){
   this.totalResults = 0;
   this.title = "";
   this.entries = new Array();
  }
  
  this.searchEntry = function searchEntry(){
    this.title = "";
    this.torrentLink = ""
    this.detailLink ="";
    this.seeds = 0;
    this.leechers = 0;
    this.size = "";
  }
  

}



