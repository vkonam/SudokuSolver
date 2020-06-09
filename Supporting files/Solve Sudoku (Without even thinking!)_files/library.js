
var EntryInfo = {
  info: $H(),
  bucket: $H(),
  library: $H(),
  incrementer: 1000,
  
  register: function( json ) {
    var einfo = Object.extend({
      entryID:    null,
      name:       null,
      body:       null,
      tinyURL:    null,
      squareURL:  null,
      thumbURL:   null,
      mediumURL:  null,
      author:     null
    }, json || {} );

	this.info[einfo.entryID] = einfo;
  },
  
  get: function( entryID )
  {
    return this.info[entryID];
  },
  
  getBucket: function( bucketID )
  {
    return this.bucket[bucketID];
  },
  
  getLibrary: function( libraryID )
  {
    return this.library[libraryID];
  },
  
  uploadToLibrary: function( bucketID, json )
  {
	var options = eval('(' + json + ')');
	EntryInfo.register( options );
	
	var bucket = EntryInfo.getBucket( bucketID );
	// TODO -- check if we can handle this file type?
	bucket.add( options, true, null );
  	
    //alert( "UPLOAD: "+libID+" :: "+json );	
  }
}


var EntryBucket = Class.create();
EntryBucket.prototype = {	
  
  initialize: function(element) {
    var options = Object.extend( {
      style: null,
      field: null,
      spotID: null,
      emptyText: 'attach items from your library',
      emptyClass: null
    }, arguments[1] || {} );
    
    this.options = options;
    this.field   = $(options.field);
    this.element = $(element);
    this.spotID  = options.spotID;
    this.element.innerHTML = ""; // clean it up...
    EntryInfo.bucket[this.element.id] = this;
    this.update();
    this.makeSortable();
  },
    
  add: function( entryinfo, flashIT, startImageURL ) {
  	 // check if we just sent the id...
     if( typeof entryinfo == 'string' ) {
         entryinfo = EntryInfo.get( entryinfo );
     }
     
     var addelem = null;
     var action = null;
     var img = null;
     var loadIMG = null;
     
     if( this.options.style == 'vertical' ) {  
         // <div class="bucketfile clearfix">
         //   <span class="action" style="float:right">remove</span>
         //   <img alt="" style="float:left;" src="http://web3.instructables.com:8080/pub/FQM/QA79/FQMQA79E97ENVTLHQ5.square.png" />
         //   <div>
         //     <h1>NAME<span class="filesize">(18KB)</span></h1>
         //     body text...
         //   </div>
         // </div>
         
	 	var initIMG = entryinfo.squareURL;
	 	if( startImageURL && startImageURL != initIMG ) {
	 		loadIMG = initIMG;
	 		initIMG = startImageURL;
	 	}
		img = Builder.node( 'img',  { src:initIMG, style:"float:left" } );
	 	action  = Builder.node( 'span', { className:'action', style:'float:right;' }, "remove" );
	 	
	 	var txt = "";
	 	if( entryinfo.body ) {
	 		txt = entryinfo.body;	
	 	}
	 	var szz = "";
	 	if( entryinfo.size ) {
	 	    szz = entryinfo.size;	
	 	}
	 	
	 	var more = Builder.node( 'div', [
	 	  Builder.node( 'h1', [ entryinfo.name, 
	 	    Builder.node( 'span', { className:'filesize' }, szz )
	 	  ] ), txt ] );
	 	
	 	addelem = Builder.node( 'div',  { className:'bucketfile clearfix' }, [action,img,more] );
     }
	 else {
	 	// <div class="bucketimg" id="image_F5CX9IAYOCEMMVDUWP">
	 	//   <div class="imageBoxIMG" style="background-image:url('imgs/F5CX9IAYOCEMMVDUWP.thumb.jpg')" ></div>
	 	//   <span class="action">x</span>
	 	// </div>
	 	
	 	var initIMG = entryinfo.thumbURL;
	 	if( startImageURL && startImageURL != initIMG ) {
	 		loadIMG = initIMG;
	 		initIMG = startImageURL;
	 	}
	 	
		img = Builder.node( 'div',  { style:"background-image:url( '"+initIMG+"' )" } );
	 	action  = Builder.node( 'span', { className:'action' }, "remove" );
	 	addelem = Builder.node( 'div',  { className:'bucketimg' }, [img,action] );
	 }
	 
	 if( addelem ) {
	 	if( action ) {
		    this.eventClickAction = this.clickedAction.bindAsEventListener(this);
		    Event.observe( action, "mousedown",  this.eventClickAction );
	 	}
	 	this.eventClickEntry = this.clickedEntry.bindAsEventListener(this);
	    Event.observe( addelem, "mouseup",  this.eventClickEntry );
	    
	    addelem.id = "entry_"+EntryInfo.incrementer++;  // it needs an id to use sortable!
	 	addelem._entryinfo = entryinfo;
	 	this.element.appendChild( addelem );
	 	if( flashIT ) {
	 	    // highlight it?	
	 	    addelem.style.display = 'none';
	 	    new Effect.Appear( addelem );
	 	    new Effect.Highlight( addelem, {startcolor:'#FFFF00', endcolor:'#FFFFFF', duration:2 })
	 	    
            this.makeSortable();
            
            // make it visable.... 
			if( this.spotID && entryinfo.mediumURL ) {
		        ImageSpots.show( this.spotID, entryinfo.entryID, entryinfo.mediumURL );	
		    }
	 	}
	 	
	 	if( loadIMG ) {
	 		var imageLoader = new Image();
		    imageLoader.onload  = function() {    	
		  	 	img.style.backgroundImage = "url( "+loadIMG + ")";	
		  	}
		  	imageLoader.src = loadIMG;
	 	}
	 	
	 	// select the current thing...
	 	var xxx = this.element.firstChild;
	  	while( xxx ) {
	  		Element.removeClassName( xxx, "sel" );
		    xxx = xxx.nextSibling;
		}
	  	Element.addClassName( addelem, "sel" );
	 }
  },
  
  selectImg: function( elem ) {
  	if( elem._entryinfo ) {
        //$('sss').innerHTML = "select:"+elem._entryinfo.entryID;
        
        if( this.spotID && elem._entryinfo.mediumURL ) {
        	ImageSpots.show( this.spotID, elem._entryinfo.entryID, elem._entryinfo.mediumURL );	
        }
        
	 	// select the current thing...
	 	var xxx = this.element.firstChild;
	  	while( xxx ) {
	  		Element.removeClassName( xxx, "sel" );
		    xxx = xxx.nextSibling;
		}
	  	Element.addClassName( elem, "sel" );
     }
  },
  
  clickedEntry: function( event ) {
  	 var elem = Event.element( event ).parentNode;
     this.selectImg( elem );
     // don't stop it, we want to drag...
     // Event.stop( event );
  },
  
  clickedAction: function( event ) {
     var elem = Event.element( event ).parentNode;
     if( elem._entryinfo ) {
     	
     	 // select the previous thing...
     	 var showME = elem.previousSibling;
     	 if(!showME ) {
     	 	 showME = this.element.firstChild;	
     	 }
     	
     	 var bucket = this;
     	 Effect.Fade( elem, { afterFinish: function( obj ) {
     	 	elem.parentNode.removeChild( elem );
     	    elem = null;
     	    bucket.update();
     	    
     	    if( showME ) {
	  		   bucket.selectImg( showME );
     	    }
	     	else {
	     	   // TODO -- could show the default?		
	     	}
     	 } } );
     	 
         //$('sss').innerHTML = "remove:"+elem._entryinfo.entryID;
         Event.stop( event );
     }
  },
  
  loadItems: function( entries ) {
  	 if( entries ) {
  	 	// check if we are passing in a json array...
  	 	if( entries.found ) {
  	 		entries = entries.found;	
  	 	}
  	 	
  	    for( i=0; i<entries.length; i++ ) {
     	   this.add( entries[i], false );
        }
        this.makeSortable();
     }
  },
  
  makeSortable: function() {
  	var bucket = this;
     if( this.options.style == 'inline' ) {  
		Sortable.create( this.element, {tag:'div',overlap:'vertical',constraint: 'vertical',dropOnEmpty: true, only:'lineitem', onUpdate:function(){ bucket.update() } });
	}
	else {
		var acceptCLASS = null;
     	if( this.options.style == 'vertical' ) {  
			Sortable.create( this.element, { 
				tag:'div', 
				overlap:'vertical',
				constraint: 'vertical', 
				dropOnEmpty: true, 
				only:'bucketfile', 
				onUpdate: function() { bucket.update(); }
			} );
			acceptCLASS = 'libraryfile';
		}
		else {
			Sortable.create( this.element, { 
				tag:'div', 
				overlap:'horizontal',
				constraint: false, 
				dropOnEmpty: true, 
				only:'bucketimg', 
				onUpdate: function() { bucket.update(); }
			} );
			acceptCLASS = 'libraryimg';
		}
		
		var bucket = this;
		Droppables.add( this.element, {accept: acceptCLASS, 
	       onDrop:function(element) {
	       	 if( element._entryinfo ) {
	           bucket.add( element._entryinfo, true );
	         }
	      }, hoverclass:'overbucket'} );
	}
	this.update();
  },
  
  update: function() {
  	 var serialized = "";
     var child = this.element.childNodes;
     
     var realcount = 0;
     var hasNotice = false;
     
	 if( child.length > 0 ) {
	 	 for( i=0; i<child.length; i++ ) {
	 	 	 if( child[i] == this.emptyNotice ) {
	 	 	 	 hasNotice = true;
	 	 	 }
	 	 	 else {
	 	         serialized += "[entry:"+child[i]._entryinfo.entryID+"]";
	 	         realcount++;
	 	     } 
	 	 }
	 }
	 
	 if( realcount > 0 ) {
	 	 if( this.options.emptyClass ) {
	         Element.removeClassName( this.element, this.options.emptyClass );
	     }
	     if( hasNotice ) {
     	     this.element.removeChild( this.emptyNotice );	
	     }
	 }
	 else {
	 	if( !hasNotice ) {
		 	if( !this.emptyNotice ) {
		 		 this.emptyNotice = Builder.node( 'div', 
		 		    {className:"stepInstructions", 
		 		     style:"margin-left:15px" }, 
		 		     [ this.options.emptyText ] );
		 	}
		 	this.element.appendChild( this.emptyNotice );	
		}
	 	if( this.options.emptyClass ) {
            Element.addClassName( this.element, this.options.emptyClass );
        }
     }
	 
	 if( this.field ) {
	 	 this.field.value = serialized;
     }
  }
}


var EntryLibrary = Class.create();
EntryLibrary.prototype = {	
  
  initialize: function(element) {
    var options = Object.extend( {
      style: null,
      bucketID: null,
      spinner: null,
      emptyClass: null,
      pager: null,
      rowSelect: null,
      extraID: null,
      itemsPerRow: 4,
      rowCount: 1
    }, arguments[1] || {} );
    
    this.options = options;
    this.element = $(element);
    this.rowSelector = $(options.rowSelect);
    this.spinner = $(options.spinner);
    this.extraLoc = $(options.extraID);
    this.element.innerHTML = ""; // clean it up...
    this.bucketID = options.bucketID;
    this.maxItems = options.itemsPerRow * options.rowCount;
    
    
    // set up the pager...
    this.pager = $(options.pager);
    if( this.pager ) {
        this.pager.innerHTML = "";	
        this.pageTXT = Builder.node( 'span', {}, 'text' );
        this.pageNXT = Builder.node( 'span', { className:'action' }, 'next' );
        this.pagePRV = Builder.node( 'span', { className:'action' }, 'prev' );
        
        this.pager.appendChild( this.pageTXT );
        this.pager.appendChild( this.pagePRV );
        this.pager.appendChild( this.pageNXT );
        
	    this.eventClickPRV = this.clickedPRV.bindAsEventListener(this);
	    this.eventClickNXT = this.clickedNXT.bindAsEventListener(this);
	    Event.observe( this.pagePRV, "mousedown", this.eventClickPRV );
	    Event.observe( this.pageNXT, "mousedown", this.eventClickNXT );
    }
    
    if( this.rowSelector ) {
	    this.eventChangeRowCount = this.changeRowCount.bindAsEventListener(this);
	    Event.observe( this.rowSelector, "change", this.eventChangeRowCount );
    }
    
    this.isIE = (navigator.appVersion.indexOf("MSIE")!=-1);
    EntryInfo.library[this.element.id] = this;
  },
  
  add: function( entryinfo ) {
  	 // check if we just sent the id...
     if( typeof entryinfo == 'string' ) {
         entryinfo = EntryInfo.get( entryinfo );
     }
     
     var addelem = null;
     var action = null;
     
     if( this.options.style == 'vertical' ) {  
         // <div class="libraryfile clearfix">
         //   <span style="float:right;" class="action">x</span>
         //   <img style="float:left; margin-right:5px;" alt="" src="http://web3.instructables.com:8080/pub/FGR/P32M/FGRP32M7UXENVTLHLJ.square.png" />
         //   name here... (10KB)
         // </div>
         var txt = entryinfo.name;
         if( entryinfo.size ) {
           txt += "  " + entryinfo.size;
         }
         
	 	var img = Builder.node( 'img',  { style:"float:left; margin-right:5px;", src: entryinfo.tinyURL } );
	 	action  = Builder.node( 'span', { className:'action', style:'float:right;' }, "add" );
	 	addelem = Builder.node( 'div',  { className:'libraryfile clearfix' }, [action,img,txt] );
     }
	 else {
	 	// <div class="bucketimg" id="image_F5CX9IAYOCEMMVDUWP">
	 	//   <div class="imageBoxIMG" style="background-image:url('imgs/F5CX9IAYOCEMMVDUWP.thumb.jpg')" ></div>
	 	//   <span class="action">x</span>
	 	// </div>
	 	
	 	var img = Builder.node( 'img',  { src: entryinfo.squareURL } );
	 	action  = Builder.node( 'span', { className:'action' }, "add" );
	 	addelem = Builder.node( 'div',  { className:'libraryimg' }, [img,action] );
	 }
	 
	 if( addelem ) {
	 	if( action ) {
		    this.eventClickAction = this.clickedAction.bindAsEventListener(this);
		    Event.observe( action, "mousedown",  this.eventClickAction );
	 	}
	 	this.eventClickEntry = this.clickedEntry.bindAsEventListener(this);
	    Event.observe( addelem, "mouseup",  this.eventClickEntry );
	    
	 	addelem.id = "entry_"+EntryInfo.incrementer++;  // it needs an id to use sortable!
	 	addelem._entryinfo = entryinfo;
	 	this.element.appendChild( addelem );
	 	
	 	if( this.isIE ) {
	 		addelem.style.cursor = "hand";
		}
		else {
			var constraint = null;
     		if( this.options.style == 'vertical' ) {  
				constraint = 'vertical';	
			}
			
		 	new Draggable( addelem, { 
		 	   revert:true, 
		 	   ghosting:false, 
		 	   constraint:constraint,
		 	   reverteffect: function(element, top_offset, left_offset) {
		         element.style.top = "0px";
		         element.style.left = "0px";
		         Element.setOpacity( element, 1 );
		       } 
		    } );
		}
	 }
  },
  
  clickedEntry: function( event ) {
  	 var elem = Event.element( event ).parentNode;
     if( elem._entryinfo ) {
        //$('sss').innerHTML = "select:"+elem._entryinfo.entryID;
        
        // eric does not think this should show up in the preiew window...
        //
        //if( this.spotID && elem._entryinfo.mediumURL ) {
        //	ImageSpots.show( this.spotID, elem._entryinfo.entryID, elem._entryinfo.mediumURL );	
        //}
     }
  },
  
  clickedAction: function( event ) {
     var elem = Event.element( event ).parentNode;
     if( elem._entryinfo && this.bucketID ) {
     	 EntryInfo.getBucket( this.bucketID ).add( elem._entryinfo, true, elem._entryinfo.squareURL );
     	 
         //$('sss').innerHTML = "add:"+elem._entryinfo.entryID;
         Event.stop( event );
     }
  },
  
  loadItems: function( entries ) {
  	 if( entries ) {
  	    for( i=0; i<entries.length && i<this.maxItems; i++ ) {
     	   this.add( entries[i] );
        }
     }
  },
  
  loadLibrary: function( json ) {
  	
  	 this.query = json.query;
  	 
  	 var res = json.results;
     this.offset = res.offset;
     this.total  = res.count;
     
     if( res.found ) {
         this.element.innerHTML = ""; // remove existing items....
         this.loadItems( res.found );
     }
     
     if( this.pager ) {
     	 var cnt = this.element.childNodes.length;
     	 var off = this.offset;
     	 var total = this.total; //cnt;
     	 if( cnt > this.maxItems ) cnt = this.maxItems;
     	 
     	 // this.total?
     	 
     	 this.pageNXT.style.display = ( (off+cnt)<total ) ? 'inline' : 'none';
     	 this.pagePRV.style.display = ( off > 0         ) ? 'inline' : 'none';
         this.pageTXT.innerHTML = (off+1)+" - " + (off+cnt) + " of " + total;	
     }
  },
  
  changeRowCount: function( event )
  {
  	// save the row count as a cookie?
      this.maxItems = this.options.itemsPerRow * this.rowSelector.value;
      this.loadOffset( this.offset );
  },
    
  loadOffset: function( off ) {
  	if( off < 0 ) {
  		off = 0;	
  	}
  	
  	var params = 'query={'
  	    + '"type":"'   + this.query.type  +'", '
  	    + '"scope":"'  + this.query.scope +'", '
  	    + '"offset":"' + off              +'", '
  	    + '"limit":'   + (this.maxItems+8)+' } ';
  	  
  	//alert( "next: "+params );
  	
  	var library = this;
  	Element.show( library.spinner );
    new Ajax.Request( '/ajax/library', {
     	parameters: params, 
     	onSuccess: function(t) {
  			Element.hide( library.spinner );
	        //alert('got ' + t.responseText);
			var lib = eval('(' + t.responseText + ')');
	        library.loadLibrary( lib );
	        library.makeSortable();
	    },
	    
     	onFailure: function(t) {
	        alert('error ' + t.status + ' -- ' + t.statusText);
  			Element.hide( library.spinner );
	    }
    } );
  },
  
  clickedPRV: function( event ) {
  	 this.loadOffset( this.offset - this.maxItems );
     Event.stop( event );
  },
  
  clickedNXT: function( event ) {
  	var off = this.offset + this.maxItems;
  	if( off > this.total ) {
  		off = this.total - this.maxItems;	
  	}
  	this.loadOffset( off );
    Event.stop( event );
  },
  
  show: function( what ) {
  	 if( !this.showDIV ) {
  	     this.showDIV = $H();	
  	 }
  	 
  	 var div = this.showDIV[what];
  	 if(!div ) {
  	 	 if( 'upload' == what ) {
  	 	 	div = Builder.node( 'iframe',  {
			   id:"ImageUploadIFrame",
			   src:"/pages/edit/upper.jspx?js=top.EntryInfo.uploadToLibrary( \'"+this.bucketID+"\', \'$LIBRARYINFO$\' );",
			   style:"width:100%;height:100px;border:0"
			   }, "image uploader...." );
  	 	 }
  	 	 else {
  	        div = Builder.node( 'div', {}, ["TODO: "+what] );
  	     }
  	     this.showDIV[what] = div;
  	 }
  	 
  	 var node = this.extraLoc;
  	 while (node.childNodes[0]) {
	    node.removeChild(node.childNodes[0]);
	 }
     Effect.Appear( this.extraLoc );
  	 this.extraLoc.appendChild( div );
  }
}

