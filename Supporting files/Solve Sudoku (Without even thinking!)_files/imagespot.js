
var _incrementer = 100;
var _layerINCR = 200;


var ImageSpots = {
  spot: [],
  byDIV: [],

  register: function(s) {
  	this.byDIV[s.element] = s;
    this.spot[s.element.id] = s;
  },

  get: function(v) {
  	var xx = this.spot[v];
  	if( !xx ) {
  		xx = this.byDIV[v];
  	}
  	return xx;
  },
  
  show: function( spotID, imageID, imageURL )
  {
    this.get(spotID).setImage( imageID, imageURL );	
  }
}


var ImageSpot = Class.create();
ImageSpot.prototype = {	
  images: null,
  imageURL: null,
  element: null,
  currentImage: null,
  activeNote: null,
  editingNote: null,
  
  initialize: function(element) {
    var options = Object.extend( {
      width: null,
      height: null,
      background: null,
      editable: false,
      editor: null,
      showInfo: true,
      debug: false,
      loadID: null,
      loadIMG: '/static/img/pixel.gif',
      size: 'MEDIUM'
    }, arguments[1] || {} );

    this.element = $(element);
    this.options = options; 
        
    if( !this.element.id ) {
    	alert( "imagespot element must have an id!!!" );
    	return;
    }
    
    // build our children
    this.infoHREF   = Builder.node( 'a',   { href:'#', 'class':'withBG', style:"position:absolute; top:5px; left:5px; visibility: hidden; font-style:italic; padding-left:6px; padding-right:5px; padding-top:0px; padding-bottom:0px; z-Index:2500" }, 'i' );
	  this.debugTXT   = Builder.node( 'div', { style:"position:absolute; bottom:5px; left:5px; background:#FFFFFF; border:1px solid black; padding:2px; visibility: hidden;" }, 'debug...' );
    this.loadingIMG = Builder.node( 'div', { style: "position:absolute; width:100%; top:40%; left:0px; visibility: hidden;" } );
    this.img        = Builder.node( 'img', { src: this.options.loadIMG, GALLERYIMG: 'NO' } ); // for IE
    this.notes      = Builder.node( 'div', { style:"position:absolute; top:0px; left:0px;" } ); // the notes get put under this...
    this.overlay    = Builder.node( 'div', { className:"imgnote_overlay" } );
    this.loadingIMG.innerHTML = "<center><img src='/static/img/loading2.gif' alt='loading...'/></center>";
    
    this.sizer = Builder.node( 'div', { style: "border: 0px solid blue;" } );
	if( options.background ) {
	    this.sizer.style.backgroundColor = options.background;
	}
    
    if( options.debug ) {
    	this.debugTXT.style.visibility = "visible";
    }
    
    // finally register the spot with the global list...
    this.images = new Array(); 
    this.imageURL = new Array(); 
    ImageSpots.register( this );
    
    // Build the spot
    this.element.innerHTML = "";
    this.element.appendChild( this.sizer );
    this.sizer.appendChild( this.img );
    //this.element.appendChild( this.img );

    this.element.appendChild( this.overlay    );
    this.element.appendChild( this.loadingIMG );
    this.element.appendChild( this.debugTXT   );
    this.element.appendChild( this.notes      );
    
    // setup the info tooltip?
    if( this.options.showInfo ) {
	    this.element.appendChild( this.infoHREF   );
	    Tooltip.register( this.infoHREF, { innerHTML:'show image info...' } );
        this.infoHREF.tooltip.innerHTML = "image info";
	}
    Element.hide( this.overlay );
    
	this.eventWindowLoaded = this.windowLoaded.bindAsEventListener(this);
    Event.observe( window,  "load", this.eventWindowLoaded );
  },
  
  windowLoaded: function() 
  {
  	 this.debugTXT.innerHTML = "LOADED!!";
     if( this.options.height || this.options.width ) {
    	 this.setSize( this.options.width, this.options.height );
     }
     this.setEditable( this.options.editable );	
     if( this.options.loadID ) {
     	 this.setImage( this.options.loadID );
     }
  },
  
  register: function(s) {
     this.images[s.imageID] = s;
     this.imageURL[s.imageURL] = s;
  },
  
  setSize: function( w,h ) {
  	 if( w ) {
  	    this.sizer.style.width = parseInt( w ) + "px";
  	 }
  	 else {
  	    this.sizer.style.width = '';
  	 }
  	 
  	 if( h ) {
  	    this.sizer.style.height = parseInt( h ) + "px";
  	 }
  	 else {
  	    this.sizer.style.height = '';
  	 }
  	 this.updateDisplay();
  },
  
  setImage: function( imageID, imageURL ) {
  	 this.deactivate();
  	 
  	 // first try to get it by spot...
  	 this.currentImage = null;
  	 
  	 if( imageID ) {
  	     this.currentImage = this.images[imageID];
  	     if( !this.currentImage ) {
  	     	 // set it cup to call again...
  	     	 var spot = this;
  	     	 var params = "imageID="+imageID+"&size="+this.options.size;
  	     	 new Ajax.Request( '/ajax/imageinfo', {
		     	parameters: params, 
		     	onSuccess: function(t) {
			        //alert('got ' + t.responseText);
					var imginfo = eval('(' + t.responseText + ')');
					new ImageInfo(  spot, imginfo );
					spot.setImage( imageID, imageURL );
			    },
			    
		     	onFailure: function(t) {
			        alert('error ' + t.status + ' -- ' + t.statusText);
			    }
		    } );
  	     }
  	 }
  	 
     if( !this.currentImage && imageURL ) {
          this.currentImage = this.imageURL[imageURL];
     }
     
     if( this.currentImage ) {
	  	 // Show the link [i]
	  	 if( this.currentImage.options.showURL ) {
	  	 	 this.infoHREF.href = this.currentImage.options.showURL;
	  	 	 this.infoHREF.style.visibility = "visible";
	  	 }
	  	 else {
	  	 	 this.infoHREF.style.visibility = "hidden";
	  	 }
	  	 imageURL = this.currentImage.imageURL;
	  	 
	  	 // the INfo tooltip...
	  	 if( this.infoHREF.tooltip ) {
	  	 	 var n = this.currentImage.options.name;
	  	 	 var b = this.currentImage.options.body;
	  	 	 var d = this.currentImage.options.dims;
		  	 if( n ) {
	 	        this.infoHREF.tooltip.innerHTML = "<b>"+n+"</b>";
	 	        if( b ) {
		 	        this.infoHREF.tooltip.innerHTML += "<br/>"+b;
			  	}
			  	if( d ) {
		 	        this.infoHREF.tooltip.innerHTML += "<br/>"+d;
			  	}
		  	 }
		  	 else {
	 	        this.infoHREF.tooltip.innerHTML = "image info";
		  	 }
		 }
     }
     else { // no current imgage
    	 if( !imageURL ) {
    	     alert( "you have to send an id or an imageURL!" );	
    	     return;
    	 }
	  	 this.infoHREF.style.visibility = "hidden";
     }
  	
  	 
  	 // Set up the image loading callbacks...
  	 var spot = this;
  	 
  	 clearTimeout( spot.loadingtimer );
  	 spot.loadingtimer = setTimeout( function() {
  	 	spot.loadingIMG.style.visibility = "visible";
  	 }, 300 );
  	 
  	 var imageLoader = new Image();
     imageLoader.onload  = function() {    	
  	 	spot.img.src = imageURL;
  	 	clearTimeout( spot.loadingtimer );
  	    spot.loadingIMG.style.visibility = "hidden";
  	    
        var sizerW = spot.sizer.style.width  ? parseInt( spot.sizer.style.width  ) : -1;
        var sizerH = spot.sizer.style.height ? parseInt( spot.sizer.style.height ) : -1;
        if( sizerW > 0 && sizerH > 0 ) {
        	// make it a max size and make sure it fits within the space....
        	if( imageLoader.width > sizerW ) {
        		if( imageLoader.height > sizerH ) {
        			// Width & height are bigger -- should use aspect to set propper size...
        			var aspectS = sizerW / sizerH;
        			var aspectI = imageLoader.width / imageLoader.height;
        			
        			if( aspectS > aspectI ) {
						spot.img.style.width  = "";
						spot.img.style.height = sizerH+"px";
        			}
	        		else {
						spot.img.style.width  = sizerW+"px";
						spot.img.style.height = "";
	        		}
        			
	        	}
		        else {
					spot.img.style.width  = sizerW+"px";
					spot.img.style.height = "";
		        }
        	}
       		else if( imageLoader.height > sizerH ) {
				spot.img.style.width  = "";
				spot.img.style.height = sizerH+"px";
        	}
	        else {
				spot.img.style.width  = "";
				spot.img.style.height = "";
	        }
        }
	    else if( sizerW > 0 ) {
			spot.img.style.width  = sizerW+"px";
			spot.img.style.height = "";
	    }
	    else if( sizerH > 0 ) {
			spot.img.style.width  = "";
			spot.img.style.height = sizerH+"px";
	    }
		else {
			spot.img.style.width  = "";
			spot.img.style.height = "";
		}
  	 	spot.updateDisplay();
     };
     imageLoader.onerror  = function() {
    	alert( "error: "+imageLoader.src );
    	clearTimeout( spot.loadingtimer );
  	    spot.loadingIMG.style.visibility = "hidden";
     };
     imageLoader.onabort  = function() {
    	alert( "abort: "+imageLoader.src );
    	clearTimeout( spot.loadingtimer );
  	    spot.loadingIMG.style.visibility = "hidden";
     };
  	 imageLoader.src = imageURL;
  },
  
  getDimensions: function() {
  	return Element.getDimensions( this.element );
  },
    
  deactivate: function() {
	this.activeNote = null;
	this.drawing = false;
	if( this.editingNote ) {
    	this.editingNote.outline.style.background = "";
    	this.editingNote = null;
	}
    if( this.drawNote ) {
    	Element.hide( this.drawNote );
    	Element.hide( this.editBody );
    	Element.hide( this.editFeedback );
	}
    Element.hide( this.overlay );
  },
  
  setEditable: function( v ) {
  	 if( v ) {
  	 	if( !this.options.editor ) {
  	 		alert( 'no editor set!' );
  	 		return;
  	 	}
  	 	
  	 	if(!this.drawNote ) { 		
	  		this.editN  = Builder.node( 'div', { className:"noteEdit_handle noteEdit_handleN"  } );
	    	this.editS  = Builder.node( 'div', { className:"noteEdit_handle noteEdit_handleS"  } );
	    	this.editE  = Builder.node( 'div', { className:"noteEdit_handle noteEdit_handleE"  } );
	    	this.editW  = Builder.node( 'div', { className:"noteEdit_handle noteEdit_handleW"  } );
	    	this.editNE = Builder.node( 'div', { className:"noteEdit_handle noteEdit_handleNE" } );
	    	this.editNW = Builder.node( 'div', { className:"noteEdit_handle noteEdit_handleNW" } );
	    	this.editSE = Builder.node( 'div', { className:"noteEdit_handle noteEdit_handleSE" } );
	    	this.editSW = Builder.node( 'div', { className:"noteEdit_handle noteEdit_handleSW" } );
	    	
	    	this.drawNote = Builder.node( 'div', 
	    	   { style:"position:absolute; top:0px; left:0px; width:0px; height:0px; border:2px solid #FFFF00; cursor:move;"  },
	    	   [ this.editN, 
	    	     this.editS, 
	    	     this.editE, 
	    	     this.editW, 
	    	     this.editNE,
	    	     this.editNW,
	    	     this.editSE,
	    	     this.editSW ] 
	    	);
	    	this.element.appendChild( this.drawNote );
	    	
	    	this.editN.drag  = "N" ;
	    	this.editS.drag  = "S" ;
	    	this.editE.drag  = "E" ;
	    	this.editW.drag  = "W" ;
	    	this.editNE.drag = "NE"; 
	    	this.editNW.drag = "NW"; 
	    	this.editSE.drag = "SE"; 
	    	this.editSW.drag = "SW"; 
	    	this.drawNote.drag = "DRAG"; 
	    	
			this.eventDragMouseDown = this.initDrag.bindAsEventListener(this);
		    Event.observe( this.editN,  "mousedown", this.eventDragMouseDown );
		    Event.observe( this.editS,  "mousedown", this.eventDragMouseDown );
		    Event.observe( this.editE,  "mousedown", this.eventDragMouseDown );
		    Event.observe( this.editW,  "mousedown", this.eventDragMouseDown );
		    Event.observe( this.editNE, "mousedown", this.eventDragMouseDown );
		    Event.observe( this.editNW, "mousedown", this.eventDragMouseDown );
		    Event.observe( this.editSE, "mousedown", this.eventDragMouseDown );
		    Event.observe( this.editSW, "mousedown", this.eventDragMouseDown );
		    Event.observe( this.drawNote, "mousedown", this.eventDragMouseDown );
		    
		    
		    this.editBody = Builder.node( 'div', { className:'imagenote_body', style:"left:0px; top:0px; z-Index:4000;" } );
	    	this.element.appendChild( this.editBody );
	    	Element.hide( this.editBody );
	    	
	    	this.editFeedback = Builder.node( 'div', { className:'imagenote_body', style:"left:0px; top:0px;" }, "feedback here..." );
	    	this.element.appendChild( this.editFeedback );
	    	Element.hide( this.editFeedback );
		     
		  	this.editTextArea = Builder.node('textarea', {style:'width:97%; height:100px;'}, this.options.text );
			this.editBody.appendChild( this.editTextArea );
			
			this.clickSaveNote   = Builder.node('a', {href:'#', onclick:'return false;' }, '[save]' );
			this.clickCancelNote = Builder.node('a', {href:'#', onclick:'return false;' }, '[cancel]'   );
			var ddd = Builder.node('div', {style:'float:right;' }, [ this.clickCancelNote ] );
			this.editBody.appendChild( Builder.node('div', [ddd,this.clickSaveNote] ) );
			
			// register the save and 'cancel' actions...
		    this.eventClickSave   = this.clickedSaveNote.bindAsEventListener(this);
		    this.eventClickCancel = this.clickedCancelNote.bindAsEventListener(this);
		    Event.observe( this.clickSaveNote,   "mousedown", this.eventClickSave   );
		    Event.observe( this.clickCancelNote, "mousedown", this.eventClickCancel );
	  			  		
		    this.eventMouseDown  = this.mouseDown.bindAsEventListener(this);
		    this.eventMouseUp    = this.mouseUp.bindAsEventListener(this);
		    this.eventMouseMove  = this.mouseMove.bindAsEventListener(this);
  	 	}
	    Event.observe(document,     "mouseup",   this.eventMouseUp);
	    Event.observe(this.element, "mousedown", this.eventMouseDown);	
  	 }
  	 else if( this.drawNote ) {
	    Event.stopObserving(document,     "mouseup",   this.eventMouseUp);
	    Event.stopObserving(this.element, "mousedown", this.eventMouseDown);	
  	 }
  	 
  	 this.isEditable = v;
  	 this.updateDisplay();
     this.deactivate();
  },
  
  updateDisplay: function() {
  	 var dim = this.getDimensions();
  	 this.debugTXT.innerHTML = dim.width + "x" + dim.height;
  	 
  	 // IE does not like 100% height?
  	 this.overlay.style.width  = dim.width  + "px";
  	 this.overlay.style.height = dim.height + "px";
  	 
  	 // now add all the notes
  	 var spot = this;
  	 spot.notes.innerHTML = "";
  	 if( this.currentImage ) {
  	     this.debugTXT.innerHTML += " : " + this.currentImage.imageID + " ("+this.currentImage.notes.length+")";
  	 
  	 	 this.currentImage.notes.each( function(n) {
  	 		// set the image stuff...
		  	var style    = n.outline.style;
		  	style.top    = Math.floor(n.options.top    * dim.height) + "px";
		  	style.left   = Math.floor(n.options.left   * dim.width ) + "px";
		  	style.width  = Math.floor(n.options.width  * dim.width ) + "px";
		  	style.height = Math.floor(n.options.height * dim.height) + "px";
  	 		n.setEditable( spot.isEditable );
  	 		
		    spot.notes.appendChild( n.outline );
		    spot.notes.appendChild( n.body    );
		    
		    Element.show( n.outline );
		    Element.hide( n.body );
	    });
  	 }
  	 else {
  	     this.debugTXT.innerHTML += " : " + spot.img.src;
  	 }
  },
  
  
  mouseDown: function(event) 
  {
    this._lastPointer = null;
	this.drawing = false;    
	    
    if( Event.isLeftClick(event) && this.drawNote && !this.activeNote ) {     
    	if(!Element.visible(this.drawNote) ) {
		    Event.observe(document, "mousemove", this.eventMouseMove);
		  	
		    this.downXY = [Event.pointerX(event), Event.pointerY(event)];
		    this.debugTXT.innerHTML = "DOWN: " + this.downXY.inspect();
		    
		    // show the draw note
			this.drawing = true;    
		    //Element.show( this.overlay  );
		    Element.hide( this.editBody );
		    this.editTextArea.value = "";
		    
		    //Element.show( this.drawNote ); // this will get shown when you drag...
		    this.drawNote.style.zIndex = (_layerINCR++);
    		Event.stop(event);
		}
		else {
		    this.debugTXT.innerHTML = "already drawing!";
		}
	}    
  },
  
  mouseUp: function(event) 
  {
    Event.stopObserving(document, "mousemove", this.eventMouseMove);
  	this.mouseMove( event );
  	this.drag = null;
  	
    if( this.drawing && this.drawNote ) 
    {
		var dims = Element.getDimensions( this.drawNote );
		if( (dims.width > 10 || dims.height > 10 ) ) {	// 6 is just from the border!
		    Element.show( this.drawNote );
		    Element.show( this.editBody );
		    Element.show( this.overlay  );
			this.editTextArea.focus();
		}
		else {
		    Element.hide( this.drawNote );
		    Element.hide( this.editBody );
		    Element.hide( this.overlay  );
		}
	}
    this._lastPointer = null;
	this.drawing = false;    
	
    // already stopped?
    Event.stop(event);
  },
  
  mouseMove: function(event) 
  {
	//$('d3').innerHTML = "MOVER: " +  this.activeNote + " :: " + this.drawing + " :: " + (_incrementer++);
			    
  	if( this.drawing || this.drag  ) {
	    var pointer = [Event.pointerX(event), Event.pointerY(event)];
	    // Mozilla-based browsers fire successive mousemove events with
	    // the same coordinates, prevent needless redrawing (moz bug?)
	    if(this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) {
			this.debugTXT.innerHTML = "SAMEPOINT: " + pointer.inspect() + " :: " + this.drag;
	    	return;
	    }
	    this._lastPointer = pointer;
	    Event.stop(event);
	    
	    
    	var dims  = this.getDimensions();
		var style = this.drawNote.style; 
		  	
	    var minX = 10;
	    var maxX = 10;
	    var minY = 10;
	    var maxY = 10;
	    
	    if( this.drag ) {
			var deltaX = pointer[0] - this.down.x;
			var deltaY = pointer[1] - this.down.y;
			this.debugTXT.innerHTML = "MOVE: " + deltaX + ","+deltaY + " :: " + this.drag;
			
		    var eL = parseInt( style.left   );
		    var eT = parseInt( style.top    );
		    var eW = parseInt( style.width  );
		    var eH = parseInt( style.height );
		    
		    minX = eL;
		    minY = eT;
		    maxX = eL+eW;
		    maxY = eT+eH;
		    
		    
		    if( "DRAG" == this.drag ) {
		    	eL = this.down.left + deltaX;
		    	eT = this.down.top  + deltaY;
		    	
	    		if( (eL+this.down.width ) > dims.width-4  ) eL = dims.width  - this.down.width  -4;
	    		if( (eT+this.down.height) > dims.height-4 ) eT = dims.height - this.down.height -4;
	    		if( eL < 0 ) eL = 0;
	    		if( eT < 0 ) eT = 0;
	    		
	    		minX = eL;
	    		minY = eT;
	    		maxX = eL + this.down.width;
	    		maxY = eT + this.down.height;
		    }
			else {
				// W,NW,SW
				if( this.drag.indexOf( 'W' ) >= 0 ) {
					var x0 = this.down.left + this.down.width;
					var x1 = this.down.left + deltaX;
					
					minX = Math.min( x0, x1 );
		    		maxX = Math.max( x0, x1 );
				}
				if( this.drag.indexOf( 'E' ) >= 0 ) {
					var x0 =  this.down.left;
					var x1 =  this.down.left + this.down.width + deltaX;
					
					minX = Math.min( x0, x1 );
		    		maxX = Math.max( x0, x1 );
				}
				if( this.drag.indexOf( 'N' ) >= 0 ) {
					var y0 =  this.down.top + this.down.height;
					var y1 =  this.down.top + deltaY;
					
					minY = Math.min( y0, y1 );
		    		maxY = Math.max( y0, y1 );
				}
				if( this.drag.indexOf( 'S' ) >= 0 ) {
					var y0 =  this.down.top;
					var y1 =  this.down.top + this.down.height + deltaY;
					
					minY = Math.min( y0, y1 );
		    		maxY = Math.max( y0, y1 );
				}
				
			    if( minX < 0 ) minX = 0;
			    if( minY < 0 ) minY = 0;
			    
	    		if( maxX > dims.width-4  ) maxX = dims.width-4;
	    		if( maxY > dims.height-4 ) maxY = dims.height-4;
			}
	  	}
	  	else {
		    var pos = Position.cumulativeOffset(this.element);
		      
		    minX = Math.min( this.downXY[0], pointer[0] ) - pos[0];
		    maxX = Math.max( this.downXY[0], pointer[0] ) - pos[0];
		    minY = Math.min( this.downXY[1], pointer[1] ) - pos[1];
		    maxY = Math.max( this.downXY[1], pointer[1] ) - pos[1];
		    
		    if( minX < 0 ) minX = 0;
		    if( minY < 0 ) minY = 0;
		    
    		if( maxX > dims.width-4  ) maxX = dims.width-4;
    		if( maxY > dims.height-4 ) maxY = dims.height-4;
		}
		
		this.updateDrawNote( minX, maxX, minY, maxY );
	 }
  },
  
  
  updateDrawNote: function( minX, maxX, minY, maxY )
  {
  	    var boxW = maxX-minX;
	    var boxH = maxY-minY;
	  
		var style = this.drawNote.style; 
	    style.left   = minX+"px";
	    style.top    = minY+"px";
	    style.width  = boxW+"px";
	    style.height = boxH+"px";
	    style.background = "transparent url( "+this.img.src+" ) no-repeat  -"+minX+"px -"+minY+"px";
		//style.border ="2px solid red";
	    
	    this.editE.style.marginTop = ((boxH/2)-4)+"px";
	    this.editW.style.marginTop = ((boxH/2)-4)+"px"; 
	    
	  	
	  	// move the editor...
	  	this.editBody.style.left = style.left;
	  	this.editBody.style.top = (maxY+4)+"px";
	  	Element.show( this.overlay );	
	  	Element.show( this.drawNote );
	  	//Element.show( this.editBody );
  },
  
  
  initDrag: function(event) {
    	
    if( Event.isLeftClick(event) ) {
    	var elem = Event.element( event );
    	
    	if( elem.drag ) {
    		this.debugTXT.innerHTML = "DOWN: "+elem+" ("+elem.drag+")";
    		
    		var style = this.drawNote.style;
	    	this.down = {
	    		x: Event.pointerX(event), 
	    		y: Event.pointerY(event),
	    		left:   parseInt( style.left   ),
	    		top:    parseInt( style.top    ),
	    		width:  parseInt( style.width  ),
	    		height: parseInt( style.height )
	    	};
	    	
	    	this.drag = elem.drag;
	   		Event.observe(document, "mousemove", this.eventMouseMove);
	        Event.stop(event);
	    }
    }
  },
  
  editNote: function(note) {
     note.outline.style.display = "none";
     Element.hide( note.outline );
     Element.hide( note.body    );
     this.editingNote = note;
     
  	 var ns = note.outline.style;
  	 var minX = parseInt( ns.left   ) + 0;
  	 var maxX = parseInt( ns.width  ) + minX;
  	 var minY = parseInt( ns.top    ) + 0;
  	 var maxY = parseInt( ns.height ) + minY;
  	 
  	 this.editTextArea.value = note.options.text;
	 this.updateDrawNote( minX, maxX, minY, maxY );
     Element.show( this.editBody );
  },
    
  clickedCancelNote: function( event ) {
     Event.stop(event);
     this.debugTXT.innerHTML = "CANCEL!";
  	 
  	 this.deactivate()
  	 this.updateDisplay();
  },
  
  clickedSaveNote: function( event ) 
  {	
     Event.stop(event);
     this.debugTXT.innerHTML = "SAVE!";
  	
 	 if( this.editTextArea.value.length < 1 ) {
 	    alert( "please enter some text..." );	
 	    return;
 	 }
 	 
     var dim = this.getDimensions();
     var loc = {
       top:    ( parseInt( Element.getStyle(this.drawNote,'top'   ) )/dim.height ),
       left:   ( parseInt( Element.getStyle(this.drawNote,'left'  ) )/dim.width  ),
       width:  ( parseInt( Element.getStyle(this.drawNote,'width' ) )/dim.width  ),
       height: ( parseInt( Element.getStyle(this.drawNote,'height') )/dim.height )	
     };
 	 
 	this.editFeedback.innerHTML = "";
 	this.editFeedback.appendChild( 
        Builder.node( 'div', [ 
           Builder.node('img', { src:'/static/img/loading.gif', height:100, style:"float:left;" } ), 
           "saving your note..." ] )
    );
    this.editFeedback.style.zIndex = this.editBody.style.zIndex;
    this.editFeedback.style.left   = this.editBody.style.left;
    this.editFeedback.style.top    = this.editBody.style.top;
	Element.hide( this.editBody );
	Element.show( this.editFeedback );
	
 	 if( this.editingNote ) {
 	 	 var note = this.editingNote;
 	 	 note.options.text   = this.editTextArea.value;
 	 	 note.options.top    = loc.top;
 	 	 note.options.left   = loc.left;
 	 	 note.options.width  = loc.width;
 	 	 note.options.height = loc.height;
 	 	 
 	     new Ajax.Request( '/ajax/imageNote', {
	     	parameters:'action=MODIFY&imageID='+this.currentImage.imageID+'&noteID='+note.noteID+'&json='+note, 
	     	onSuccess: function(t) {
				note.mouseOut( event );
			    note.setEditable( true ); // goes back to the normal thingy...
			    note.spot.deactivate();
  		        note.spot.updateDisplay();
		    },
		    
	     	onFailure: function(t) {
		        alert('error ' + t.status + ' -- ' + t.statusText);
				note.spot.editingNote = null;
				note.mouseOut( event );
			    note.setEditable( true ); // goes back to the normal thingy...
		    }
	     } );
 	 }
	 else {
	    
	    // make this one so that newnote.toString() works...
	    var newnote = new ImageNote( {
  		    text:this.editTextArea.value, 
  		    top:loc.top, 
  		 	left:loc.left, 
  		 	width:loc.width, 
  		 	height:loc.height, 
  		 	author:this.options.editor 
  		} );
	     
	     var spot = this;
	     new Ajax.Request( '/ajax/imageNote', {
	     	parameters:'action=ADD&imageID='+this.currentImage.imageID+'&json='+newnote, 
	     	onSuccess: function(t) {
		        var addme = new ImageNote( {
		        	noteID: t.responseText,
		  		    text:spot.editTextArea.value, 
		  		    top:loc.top, 
		  		 	left:loc.left, 
		  		 	width:loc.width, 
		  		 	height:loc.height, 
		  		 	author:spot.options.editor 
		  		} );
		  		addme.spot = spot;
		  		spot.currentImage.register( addme );
		  		spot.editTextArea.value = "";
  		        spot.deactivate();
  		        spot.updateDisplay();
		    },
		    
	     	onFailure: function(t) {
		        alert('error ' + t.status + ' -- ' + t.statusText);
  		        spot.deactivate(); // hide the editor...
		    }
	     } );
	 }
  }
}


var ImageInfo = Class.create();
ImageInfo.prototype = {	
  imageID: null,
  imageURL: null,
  notes: null,
  spot: null,
  
  initialize: function( spot ) {
    var options = Object.extend( {
      imageID: null,
      name: null,
      body: null,
      imageURL: null,
      showURL: null,
      dims: null,
      notes: []
    }, arguments[1] || {} );

	if( spot.element ) {
		this.spot = spot;
	}
	else {
    	this.spot = ImageSpots.get( spotID );
	}
    if( !this.spot ) {
    	alert( "invalid spot: "+spot );	
    }

    this.options  = options;  
    this.imageURL = options.imageURL;
    this.imageID  = options.imageID;
    if( !this.imageID ) {
    	alert( "missing imageID!!!" );	
    }
    if( !this.imageURL ) {
    	alert( "missing imageURL!!!" );	
    }
        
    this.notes = new Array();
    this.spot.register( this );
    
    // you can pass along notes in the constructor....
    if( this.options.notes ) {
    	for( i=0; i<this.options.notes.length; i++ ) {
    		this.register( new ImageNote( this.options.notes[i] ) );
    	}
    }
  },
  
  register: function( n ) {
     this.notes.push( n );
     n.imageID = this.imageID;
     n.spot    = this.spot;
  }
}


var ImageNote = Class.create();
ImageNote.prototype = {
  noteID: null,
  
  initialize: function() {
    var options = Object.extend( {
      highlight: true,
      noteID: null,
      top: 0.0,
      left: 0.0,
      width: 0.1,
      height: 0.1,
      text: null,
      author: 'aaa'
    }, arguments[0] || {} );
    
    this.options = options;
    this.noteID  = options.noteID;
    
    // add the outline
    this.outline = Builder.node( 'img', { 
       className:"imagenote", 
       src:"/static/img/pixel.gif", 
       style: "position:absolute; top: 100px; left: 50px; width: 100px; height:100px;" 
    } );
    this.body = Builder.node( 'div', { className:'imagenote_body' }, options.text ); 
	
	
	// should we cancel any in case it is called twice?
    if( this.options.highlight ) {	
	    this.eventMouseOver = this.mouseOver.bindAsEventListener(this);
	    this.eventMouseOut  = this.mouseOut.bindAsEventListener(this);
	    
	    Event.observe(this.outline, "mouseover", this.eventMouseOver);
	    Event.observe(this.outline, "mouseout",  this.eventMouseOut);
	    Event.observe(this.body,    "mouseover", this.eventMouseOver);
	    Event.observe(this.body,    "mouseout",  this.eventMouseOut);
	}
	else {
		// otherwise put it to the top!
        this.outline.style.zIndex = (_layerINCR++) + 1000;
  	    this.body.style.zIndex    = (_layerINCR++) + 1000;
	}
	
  	// bind all event listeners...
    this.eventClickDelete = this.clickedDeleteNote.bindAsEventListener(this);
    this.eventClickEdit   = this.clickedEditNote.bindAsEventListener(this);
  },
  
  // FROM: http://www.json.org/json.js
  jsonString: function (x) {
  	var m = {
	    '\b': '\\b',
	    '\t': '\\t',
	    '\n': '\\n',
	    '\f': '\\f',
	    '\r': '\\r',
	    '"' : '\\"',
	    '\\': '\\\\'
	};
  	
    if (/["\\\x00-\x1f]/.test(x)) {
        x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
            var c = m[b];
            if (c) {
                return c;
            }
            c = b.charCodeAt();
            return '\\u00' +
                Math.floor(c / 16).toString(16) +
                (c % 16).toString(16);
        });
    }
    return '"' + x + '"';
  },
  
  toString: function() {
  	return '{ top: '    + this.options.top 
  	     + ', left: '   + this.options.left
  	     + ', width: '  + this.options.width
  	     + ', height: ' + this.options.height
  	     + ', text:'+ this.jsonString(this.options.text) + ' }';
  },
  
  setEditable: function( v ) {
  	this.editable = v;
  	
  	// remove any existing clickers...
  	if( this.clickDeleteNote ) Event.stopObserving(this.clickDeleteNote, "mousedown", this.eventClickDelete );  
  	if( this.cliceEditNote   ) Event.stopObserving(this.clickEditNote,   "mousedown", this.eventClickEdit   );  
  		
  	this.body.innerHTML = ""; // clear the inner part...
  	var ulink = Builder.node('a', {href:'/member/'+this.options.author+'/'}, this.options.author );
	this.body.appendChild( Builder.node('div', this.options.text ) );
	if( v ) {
		this.clickDeleteNote = Builder.node('a', {href:'#', onclick:'return false;' }, '[delete]' );
		this.clickEditNote   = Builder.node('a', {href:'#', onclick:'return false;' }, '[edit]'   );
		var ddd = Builder.node('div', {style:'float:right;' }, [
		  this.clickDeleteNote, this.clickEditNote
		] );
		
		this.body.appendChild( Builder.node('div', [ddd,ulink] ) );
		
	    Event.observe( this.clickDeleteNote, "mousedown", this.eventClickDelete );
	    Event.observe( this.clickEditNote,   "mousedown", this.eventClickEdit );
	}
	else {
		this.body.appendChild( Builder.node('div', [ulink] ) );	
	}
  },
  
  clickedEditNote: function( event ) {
     Event.stop( event );
  	 this.spot.editNote( this );
  },
  
  clickedDeleteNote: function( event ) {
     Event.stop( event );
	 this.spot.editingNote = this;
  	
	 this.clickConfirmDelete = Builder.node('a', {href:'#', onclick:'return false;' }, '[yes]' );
	 this.clickCancelDelete  = Builder.node('a', {href:'#', onclick:'return false;' }, '[cancel]'   );
  	
  	 this.body.innerHTML = ""; // clear the inner part...
     this.body.appendChild( 
        Builder.node( 'div', [ 
           "are you sure?",
           this.clickConfirmDelete,
           this.clickCancelDelete ] )
     );
  	
  	 if( !this.eventClickConfirmDelete ) {
          this.eventClickConfirmDelete = this.clickedConfirmedDelete.bindAsEventListener(this);
  	 }
  	
     Event.observe( this.clickConfirmDelete, "mousedown", this.eventClickConfirmDelete );
     Event.observe( this.clickCancelDelete,  "mousedown", this.spot.eventClickCancel );
  },
  
  clickedConfirmedDelete: function( event ) {
  	
     var note = this;
	 var img = note.spot.currentImage;
     if( !img || !img.imageID ) {
     	alert( 'hymmm, no active image!' );
     	return;
     }
     
  	 this.body.innerHTML = ""; // clear the inner part...
     this.body.appendChild( 
        Builder.node( 'div', [ 
           Builder.node('img', { src:'/static/img/loading.gif', height:100, style:"float:left;" } ), 
           "delete..." ] )
     );
          
          
     new Ajax.Request( '/ajax/imageNote', {
     	method: 'get',
     	parameters:'action=DELETE&imageID='+img.imageID+'&noteID='+note.noteID, 
     	onSuccess: function(t) {
     		var keep = new Array();
     		for( i=0;i<img.notes.length; i++ ) {
     			if( note != img.notes[i] ) {
     				keep.push( img.notes[i] );	
     			}
     		}
     		img.notes = keep; // the smaller list...
     		
			note.spot.editingNote = null;
	        note.spot.deactivate(); // hide the editor...
	        note.spot.updateDisplay(); // refresh everything!
	    },
	    
     	onFailure: function(t) {
	        alert('error ' + t.status + ' -- ' + t.statusText);
	        note.spot.deactivate(); // hide the editor...
	    }
     } );
     
     Event.stop( event );
  },
    
  destroy: function() {
    Event.stopObserving(this.outline, "mouseover", this.eventMouseOver);
    Event.stopObserving(this.outline, "mouseout",  this.eventMouseOut);
    this.spot.unregister(this);
  },
  
  mouseOver: function(event) {
    clearTimeout( this.hider );
    this.hider = null;
  	
  	if( this.spot.drawNote && Element.visible(this.spot.drawNote) ) {
  		return;	
  	}
  	if( this.spot.editingNote ) {
  		return;	
  	}
  	
  	this.outline.style.zIndex = (_layerINCR++);
  	this.spot.activeNote = this;
  	
  	var delta = this.currentDelta();
    var dims  = Element.getDimensions( this.outline );
    
  	Element.addClassName( this.outline, "imagenote_highlight" );
  	var s = this.body.style;
  	s.left = this.outline.style.left;
  	s.top  = (delta[1] + dims.height) + "px";
  	s.zIndex = (_layerINCR++);
  	this.updateOverlayImage();
  	Element.show( this.body );
   },
  
  updateOverlayImage: function() {
  	Element.show( this.spot.overlay );
  	var s = this.outline.style;
  	var top  = parseInt( s.top  ) + 2;
  	var left = parseInt( s.left ) + 2;
  	s.background = 
  	  "transparent url( "+this.spot.img.src+" ) no-repeat  -"+left+"px -"+top+"px";
  },
  
  mouseOut: function(event) {
  	if( this.spot.drawNote && Element.visible(this.spot.drawNote) ) {
  		return;	
  	}
  	if( this.spot.editingNote ) {
  		return;	
  	}
  	this.spot.debugTXT.innerHTML = "out:"+this;
  	this.spot.activeNote = null;
  
  	var note = this;	
  	this.hider = setTimeout( function() {
  	  Element.removeClassName( note.outline, 'imagenote_highlight' );
  	  Element.hide( note.body );
  	  note.outline.style.background = ""; // no image...
  	  if( !note.spot.overNote ) {
	  	  Element.hide( note.spot.overlay );
	  }
    }, 100 );
  },
  
  currentDelta: function() {
    return([
      parseInt( Element.getStyle(this.outline,'left') || '0'),
      parseInt( Element.getStyle(this.outline,'top' ) || '0')]);
  },
  
  currentWidthHeight: function() {
    return([
      parseInt( Element.getStyle(this.outline,'width' ) || '0'),
      parseInt( Element.getStyle(this.outline,'height') || '0')]);
  }
}