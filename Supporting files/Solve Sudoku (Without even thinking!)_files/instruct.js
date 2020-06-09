


/**
 *  Takes a element, toggles its display style
 *  between "none" and "block".
 *  <br/>
 *  This gives (more or less) the same effect as
 *  changing its visibility back and forth from
 *  "hidden" to "visible". except that visible takes up space
 */
function ToggleDisplayStyle( divID )
{
  var e = document.getElementById( divID );
  if( e != null ) {
    if( "none" == e.style.display || e.style.display == null ) {
      e.style.display = "block";
    }
    else {
      e.style.display = "none";
    }
  }
}


/**
 *  Takes two elements element, show the first one, hide the second.
 */
function ToggleDisplayStyles( showID, hideID )
{
  var show = document.getElementById( showID );
  var hide = document.getElementById( hideID );
  if( show && hide ) {
    show.style.display = "block";
    hide.style.display = "none";
  }
}


/**
function OpenPrintablePopup()
{ 
  try {
    var doc = document.URL;
    if( doc.indexOf('?') > 0 ) { 
        doc += "&PRINT";
    } else {
      doc += "?PRINT";
    }
    window.open( doc,'print','height=480,width=640,toolbar=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes'); return false;
  }
  catch( ex ) {
    alert( "ERROR: "+ex.description );
    return;
  }
}    
**/

function getRandomBulletPoint()
{
    var num = (Math.floor((Math.random()*6)));
    return "http://static.instructables.com/IMGS/bullet-"+num+".gif";
}


/**
 * this changes the bullet point images...
 */
function rotateBulletPoints() 
{
    // rotate the bullet points....
    var lis = $A( document.getElementsByTagName( 'li' ) );
    lis.each( function( li ) {
        if(!li.style.backgroundImage ) {
            li.style.backgroundImage = "url( "+getRandomBulletPoint()+" )";
        }
    } );
}             


//-----------------------------------------
// Scrollers used for home page....
//-----------------------------------------

var ItemScroller = Class.create();
ItemScroller.prototype = {  
      
  initialize: function(element) {
    var options = Object.extend( {
      speed: 1000,
      skipclass: null
    }, arguments[1] || {} );

    this.element = $(element);
    this.options = options;
    
    this.eventMouseOver = this.mouseOver.bindAsEventListener(this);
    this.eventMouseOut  = this.mouseOut.bindAsEventListener(this);
    this.eventMouseMove = this.mouseMove.bindAsEventListener(this);
    
    Event.observe( this.element, "mousemove",  this.eventMouseMove);          
  },

  scroll: function( arr ) {
    this.collection = $A(arr);
    
    var byID = $H()
    for( var i=0; i<this.collection.length; i++) { 
        if( this.collection[i].entryID != null ) {
            byID[this.collection[i].entryID] = this.collection[i];
        }
        // preload the images...
        if( this.collection[i].imageURL ) {
        	new Image().src = this.collection[i].imageURL;
        }
    }
    
    images = new Array();
    var allimgs = this.element.getElementsByTagName("img"); 
    for( var i=0; i<allimgs.length; i++) { 
        if( this.options.skipclass && Element.hasClassName( allimgs[i], this.options.skipclass ) ) {
            continue;   
        }
        images.push( allimgs[i] );
        
        var xx = byID[allimgs[i].name];
        if( xx ) {
            allimgs[i].item = xx;
            byID[allimgs[i].name] = null; // remove it?
        }
        else {
            alert("can not find: "+allimgs[i].name );   
        }
        
        // observe the mouseover/out...
        Event.observe(allimgs[i], "mouseover", this.eventMouseOver);
        Event.observe(allimgs[i], "mouseout",  this.eventMouseOut);                                                     
    }
    
    var hidden = $A();
    var vvv = byID.values();
    for( var i=0; i<vvv.length; i++) { 
        if( vvv[i] != null ) {
            hidden.push( vvv[i] );
        }
    }
    
    //alert( "IMAGES:"+images + "\nALL:" +byID.inspect()+"\nIN:"+arr+"\nCOL:"+this.collection+"\nHIDDEN:"+hidden   );
    
    
    if( this.looper ) {
        clearInterfal( this.looper );
    }
    var loopID = 0;
    var scroller = this;
    
    var rand = null;
    var lastrand = null;
    
    this.looper = setInterval( function() {
        for( var i=0; i<5; i++ ) {  // only try 5 times
            rand = images[ Math.floor( Math.random()*images.length ) ]; 
            if( rand && (rand != lastrand) && rand != scroller.overElement ) 
            {
                //alert( "RAND: "+rand + " : " + rand.name + " : " + rand.type );
                    
                lastrand = rand;
                
                if( rand.item ) {
                    var temp = rand.item;
                    rand.item = hidden[loopID];
                    rand.parentNode.href = rand.item.showURL;
                    hidden[loopID] = temp;
                    
                    if( rand.item.imageURL ) {
                        new Effect.Fade( rand, { to:0.05, afterFinish: function() { 
                          rand.src = rand.item.imageURL;
                          new Effect.Appear( rand );
                        } } );
                    }  
                    loopID = (loopID+1)%hidden.length;
                }
                else {
                    alert( "no item: "+rand + " : " + rand.name + " : " + rand.type );
                }
                return;
            }
        }
    }, this.options.speed );
  },
  
  
  mouseOver: function(event) {
     this.overElement = Event.element( event );
     if( this.overElement.item ) {
        if(!this.overlay ) {        
            this.overlay = Builder.node( 'div',  { style:"position:absolute; border:1px solid black; background:#FFFFFF; padding: 5px; visibility: hidden;" }, "hello!" );
            document.body.appendChild( this.overlay );      
        }
        var item = this.overElement.item;
        this.overlay.innerHTML = '<b>'+item.name+'</b><br/>by '+item.author;
        
        this.mouseMove( event );
        this.overlay.style.visibility ='visible';
     }
  },
  
  mouseOut: function(event) {
     this.overElement = null;
     
     this.overlay.style.visibility ='hidden';
  },
  
  mouseMove: function(event) {
    if( this.overlay ) {
        this.overlay.style.top  = (Event.pointerY(event)+10)+"px";
        this.overlay.style.left = (Event.pointerX(event)+10)+"px";
    }
  }
}




var TagScroller = Class.create();
TagScroller.prototype = {   
      
  initialize: function(element) {
    var options = Object.extend( {
      speed: 1000,
      name: null,
      skipclass: null
    }, arguments[1] || {} );

    this.element = $(element);
    this.options = options;    
  },

  scroll: function( word ) {
    
    var tags = this.element.getElementsByTagName("a"); 
    
    if( this.looper ) {
        clearInterfal( this.looper );
    }
    var loopID = 0;
    var scroller = this;
    this.looper = setInterval( function() {
       var rand = tags[ Math.floor( Math.random()*tags.length ) ]; 
       var w = word[loopID];
       loopID = (loopID+1)%word.length;
       
       var baseURL = "/tag/"
       if( scroller.options.name ) {
           baseURL += scroller.options.name + ":";
       }
       new Effect.Fade( rand, { to:0.05, afterFinish: function() { 
         rand.href = baseURL+encodeURI(w)+"/";
         rand.innerHTML = w.escapeHTML();
         new Effect.Appear( rand );
       } } );
       
    }, this.options.speed );
  }
}


var KeywordTagger = Class.create();
KeywordTagger.prototype = {   
  initialize: function(element) {
    var options = Object.extend( {
      tags: [],
      entryID: null,
      name: null,
      editor: false
    }, arguments[1] || {} );

    this.element = $(element);
    this.options = options;    
    
  	if( options.editor || this.options.tags.length > 0  ) {
  		// <h3><a href="/tag/keyword:/">Keywords:</a></h3>
  		this.element.innerHTML = "";
    	this.eventClickedDelete = this.clickedDelete.bindAsEventListener(this);
    
  		var h3 = Builder.node( 'h3', [ Builder.node( 'a', { href:'/tag/keyword:/' }, "Keywords:" ) ] );
  		this.ul = Builder.node( 'ul' );
  		
    	this.editBTNS = [];
  		this.loadTags( this.options.tags );
	  	
  		this.display = Builder.node( 'div', [h3,this.ul] ); 
  		this.element.appendChild( this.display );
  		
	  	if( this.options.editor ) {
    		this.eventClickedEdit = this.clickedEdit.bindAsEventListener(this);
	  		var lnk = Builder.node( 'a', { href:'#', className:'dull', onclick:'return false;' }, "+ Add keywords" );	
		  	Event.observe(lnk, "mouseup", this.eventClickedEdit );
		  	this.editLI = Builder.node( 'p', [ lnk ] );
		  	this.ul.appendChild( this.editLI );
	  		
	  		var help = Builder.node( 'span', { style:'margin-left:10px;', className:'help' }, "[?]" );
	  		Tooltip.register( help, { innerHTML:'seperate multiple tags with commas' } );
	  		
	  		this.kwInput = Builder.node( 'input', { style:'width:100px' } );
	  		Event.observe(this.kwInput, "keypress", this.onKeyPress.bindAsEventListener(this));
	  		this.taggingFORM = Builder.node( 'div', { style:'display:none;' },[this.kwInput,help] );
	  		
	  		this.display.appendChild( this.taggingFORM );
	  	}
  	}
  },
  
  loadTags: function(tags) {
  	
	for( var i=0; i<tags.length; i++ ) {
		var tag = tags[i];
  		var lnk = Builder.node( 'a', { href:'/tag/keyword:'+escape(tag.value)+'/' }, tag.value.escapeHTML() );				
  		
  		var addLI = null;
  		if( this.options.editor ) {
	  		var del = Builder.node( 'span', { className:'action', style:'margin-left:5px; display:none;' }, '[x]' ); 		
	  		del.bloxTAG = tag;
	  		this.editBTNS.push( del );
	  		Event.observe(del, "mousedown", this.eventClickedDelete );
	  		del.li = Builder.node( 'li', [ lnk, del ] );
  			addLI = del.li;
  			
  			// keep the same state...
  			if( this.editLI && Element.visible( this.editLI ) ) {
	  			Element.show( del );
			}
	  	}
		else {
  			addLI = Builder.node( 'li', [ lnk ] );
		}
		
		if( this.editLI ) {
  			this.ul.insertBefore( addLI, this.editLI );
		}
		else {
  			this.ul.appendChild( addLI );
  		}
  	}
  	
  },
  
  onKeyPress: function(event) {
    if (event.keyCode == Event.KEY_RETURN ) {
    	var txt = this.kwInput.value.trim();
    	if( txt.length > 0 ) {
    		Event.stop( event );
    		
    		var kwt = this;
		    var params = "action=ADD"
		                + "&entryID="+this.options.entryID
		                + "&name="+this.options.name
		                + "&text="+txt
		    
		    var kw = this;
		    new Ajax.Request( '/ajax/tag', {
		     	parameters: params, 
		     	onSuccess: function(t) {
			        //alert('got ' + t.responseText);
			        var json = eval('(' + t.responseText + ')');
			        kwt.loadTags( json );
			        kw.kwInput.focus();
			    },
			    
		     	onFailure: function(t) {
			        alert('error ' + t.status + ' -- ' + t.statusText);
			    }
		    } );
		        		
    		this.kwInput.value = '';
    	}
    }
  },
  
  clickedEdit: function(event) 
  {
  	 Element.toggle( this.taggingFORM );
  	 for( var i=0; i<this.editBTNS.length; i++ ) {
  	 	Element.toggle( this.editBTNS[i] );
  	 }
  },
  
  clickedDelete: function(event) 
  {
     var elem = Event.element(event);
     var kwt = this;
     var params = "action=DELETE"
                + "&entryID="+elem.bloxTAG.entryID
                + "&tagID="+elem.bloxTAG.uuid
     
     elem.li.innerHTML = "<img src='/static/img/loading2.gif'/>"
     
     new Ajax.Request( '/ajax/tag', {
     	parameters: params, 
     	onSuccess: function(t) {
	        //alert('got ' + t.responseText);
	        kwt.ul.removeChild( elem.li );
	    },
	    
     	onFailure: function(t) {
	        alert('error ' + t.status + ' -- ' + t.statusText);
	    }
    } );
  }
}


var DropBoxes = 
{
	setup: function ()
	{		
		var eventMouseUp = DropBoxes.mouseUP.bindAsEventListener(this);
		
		var boxes = document.getElementsByClassName( 'DropBox' );
		for( var i=0; i<boxes.length; i++ ) {
			if( boxes[i].body ) {
			    continue; // we have alreay run before!	
			}
			
			boxes[i].body = boxes[i].nextSibling;
			while( boxes[i].body && boxes[i].body.tagName != 'DIV' ) {
				boxes[i].body = boxes[i].body.nextSibling;
			}	
			
			if( boxes[i].body ) {
				var src = "/static/IMGS/dropArrow-up.gif";
				if( Element.visible( boxes[i].body ) ) {
					src = "/static/IMGS/dropArrow-down.gif";
				}
					
				boxes[i].img = Builder.node( 'img', { src:src, style:"float:right; margin:3px 3px 0 0;" } );
				boxes[i].insertBefore( boxes[i].img, boxes[i].firstChild );
				
			    Event.observe( boxes[i], "mouseup", eventMouseUp );
			}
		}
	},
	
    mouseUP: function(event) {
       var elem = Event.element( event );
       while( elem && !elem.body ) {
           elem = elem.parentNode;	
       }
       Event.stop( event );
       
       if( !elem ) {
           alert("clicked, but no body!" + Event.element( event ) );	
           return;
       }
       
       if( Element.visible( elem.body ) ) {
		   elem.img.src = "/static/IMGS/dropArrow-up.gif";
		   Effect.BlindUp( elem.body );
	   }
	   else {
		   elem.img.src = "/static/IMGS/dropArrow-down.gif";
		   Effect.BlindDown( elem.body );
	   }
    }
}


var FormInstructions = 
{
	setup: function ()
	{		
		FormInstructions.eventFocus = FormInstructions.focused.bindAsEventListener(this);
		
		var field = document.getElementsByClassName( 'stepInstructions' );
		for( var i=0; i<field.length; i++ ) {
			Event.observe( field[i], "focus", FormInstructions.eventFocus );
			Event.observe( field[i], "keydown", FormInstructions.eventFocus );
		}
	},
	
    focused: function(event) {
       var elem = Event.element( event );
       if( Element.hasClassName( elem, 'stepInstructions' ) && elem.value ) {
           elem.value = "";
       }
       Element.removeClassName( elem, 'stepInstructions' );
       Event.stopObserving( elem, "focus",   FormInstructions.eventFocus );
       Event.stopObserving( elem, "keydown", FormInstructions.eventFocus );
    }
}



function FlagEntryAs( entryID, flag )
{
	if( entryID && flag ) {
		var x=window.confirm("Are you sure you to flag this entry?")
	    if (x) {
			var params = "entryID="+entryID
               + "&action=SET"
               + "&flag=" + flag;
               
			new Ajax.Request( '/ajax/flag', {
		     	parameters: params, 
		     	onSuccess: function(t) {
			        alert( "thank you" );
			    },
			    
		     	onFailure: function(t) {
			        alert( t.status + ' -- ' + t.statusText );
			    }
		    } );
		}
	}
}


// Initalize on startup...
//Event.observe(window, 'load', DropBoxes.setup, false );
//Event.observe(document, 'load', FormInstructions.setup, false );
// but we want them to happen sooner,m so all call them directlry!