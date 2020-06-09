
// FROM http://wiki.script.aculo.us/scriptaculous/show/Effect.KeepFixed
Position.Window = {
    //extended prototypes position to return
    //the scrolled window deltas
    getDeltas: function() {
        var deltaX =  window.pageXOffset
            || document.documentElement.scrollLeft
            || document.body.scrollLeft
            || 0;
        var deltaY =  window.pageYOffset
            || document.documentElement.scrollTop
            || document.body.scrollTop
            || 0;
        return [deltaX, deltaY];
    },
    //extended prototypes position to
    //return working window's size, 
    //copied this code from the 
    size: function() {
        var winWidth, winHeight, d=document;
        if (typeof window.innerWidth!='undefined') {
            winWidth = window.innerWidth;
            winHeight = window.innerHeight;
        } 
        else {
            if (d.documentElement && typeof d.documentElement.clientWidth!='undefined' 
             && d.documentElement.clientWidth!=0) 
             {
                winWidth = d.documentElement.clientWidth
                winHeight = d.documentElement.clientHeight
            } 
            else {
                if (d.body && typeof d.body.clientWidth!='undefined') {
                    winWidth = d.body.clientWidth
                    winHeight = d.body.clientHeight
                }
            }
        }
        return [winWidth, winHeight];
    }
}

var Tooltip = {
  reg: [],
  
  registerTT: function( id )
  {
  	 var options = Object.extend( {
      innerHTML: null,
      width: 0,
      elem: null
    }, arguments[1] || {} );
    
    var elem = $(options.elem);
    if( !elem && options.innerHTML ) {
    	var sss = "";
    	if( options.width > 10 ) {
    		sss += "width: "+options.width+"px;";	
    	}    	
    	elem = Builder.node( 'div', { style:sss } );
    	elem.innerHTML = options.innerHTML;
    }
    if( elem ) {
	    this.reg[id] = elem;
	}
  },
  
  get: function( id )
  {
  	return this.reg[id];
  },
  
  setup: function ()
  {		
  	 var spots = document.getElementsByClassName( 'tooltipByID' );
  	 for( var i=0; i<spots.length; i++ ) {
  	 	var idx = spots[i].className.indexOf( "ttid_" );
  	 	if( idx >= 0 ) {
  	 		var ttid = spots[i].className.substring( idx+5 );
  	 		idx = ttid.indexOf( " " );
  	 		if( idx > 0 ) {
  	 			ttid = ttid.substring( 0, idx );	
  	 		}
  	 	    
  	 	    var tt = $(ttid);
  	 	    if( !tt ) {
  	 	    	// is it registered?
  	 	    	tt = Tooltip.get( ttid );	
  	 	    	if( !tt ) {
  	 	    		 tt = Builder.node( 'div', [ 'TOOLTIP: '+ttid ] );
  	 	    	}
  	 	    }
  	 	    Tooltip.register( spots[i], {elem:tt} );
  	 	}
  	 }
  },
	

  register: function( element ) 
  {
  	var options = Object.extend( {
      innerHTML: null,
      width: 0,
      elem: null
    }, arguments[1] || {} );
    
    // if it is an ID, find the element....
    element = $(element);
    element.tooltip = $(options.elem);
    
    if( element.tooltip ) {   
    	// remove it from its parent...
    	if( element.tooltip.parentNode ) {
    		element.tooltip.parentNode.removeChild( element.tooltip );
    	}
    }
	else if( options.innerHTML ) {
		var sss = "";
    	if( options.width > 10 ) {
    		sss += "width: "+options.width+"px;";	
    	}    	
    	var elem = Builder.node( 'div', { style:sss } );
    	elem.innerHTML = options.innerHTML;
    	element.tooltip = elem;
	}
    
    if( element.tooltip ) {
	    if(!this.eventMouseOver ) {
		    this.eventMouseOver = this.mouseOver.bindAsEventListener(this);
		    this.eventMouseOut  = this.mouseOut.bindAsEventListener(this);
			this.eventMouseMove = this.mouseMove.bindAsEventListener(this);
		}
		
        Event.observe( element, "mouseover", this.eventMouseOver );
        Event.observe( element, "mouseout",  this.eventMouseOut  );   
		Event.observe( element, "mousemove", this.eventMouseMove);     
	}
	else {
		alert( "did not register: " + element );		
	}
  },

  mouseOver: function(event) {
     this.active = Event.element( event );
     
     if(!this.debugTXT ) {        
         this.debugTXT = Builder.node( 'div',  { style:"position:absolute; border:1px solid black; background:#FFFFFF; padding: 5px; top:10px; left:10px;" }, "debugger" );
         //document.body.appendChild( this.debugTXT );      
     }
     this.debugTXT.innerHTML = "over:"+this.active;
     
     // walk up the tree?
     while( this.active ) {
     	if( this.active.tooltip ) {
	        if(!this.overlay ) {        
	            this.overlay = Builder.node( 'div',  { 
	            	style:"position:absolute; border:1px solid black; background:#FFFFFF; padding: 4px; visibility: hidden; z-Index:4000;" } );
	            document.body.appendChild( this.overlay );      
	        }
	        
	        // we have to call removeChild to keep the child div around for IE
	        while( this.overlay.firstChild ) {
	        	this.overlay.removeChild( this.overlay.firstChild );	
	        }
	        this.overlay.appendChild( this.active.tooltip );
	        
			        
		    //this.debugTXT.innerHTML = "over:"+this.active+"<br/>" + this.overlay.innerHTML;
	        
	        this.mouseMove( event );
	        this.overlay.style.visibility ='visible';
	        return;
	     }
	     this.active = this.active.parentNode;
     }
  },
  
  mouseOut: function(event) {
     this.active = null;
     if( this.overlay ) {
	     this.overlay.style.visibility ='hidden';
	 }
  },
  
  mouseMove: function(event) {
    if( this.overlay ) {
        this.overlay.style.top  = (Event.pointerY(event)+10)+"px";
        
        var dims = Element.getDimensions( this.overlay );
        var pointerY = Event.pointerY(event);
        var pointerX = Event.pointerX(event);
        
        var _scroll = Position.Window.getDeltas();
        var _window = Position.Window.size();
        var _bottom = _window[1]+_scroll[1];
        var _right  = _window[0]+_scroll[0];
        
        
        // check if left/right is OK?                 
        if( (pointerX+dims.width) < _right || pointerX-dims.width < 0 ) {
       	    this.overlay.style.left = (pointerX+10)+"px";
        }                       
	    else {
       	    this.overlay.style.left = (pointerX-dims.width-5)+"px";
	    }
	    
        // check if top/bottom is OK?       
        if( (pointerY+dims.height) < _bottom || pointerY-dims.height < 0 ) {
	    	this.overlay.style.top  = (pointerY+10)+"px";
	    }
		else {
	    	this.overlay.style.top  = (pointerY-dims.height)+"px";
		}
    }
  }
}


