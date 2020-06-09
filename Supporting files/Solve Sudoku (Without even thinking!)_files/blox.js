
String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };

var Blox = {
   version: "0.1",
   absoluteBaseURL: "",
   absoluteImageURL: "",
   useAbsoluteLinks: false
}
                       
function OnUP( upform )
{	
   upform.target = 'UploadTarget';
   $('UploadTarget').innerHTML = 'Upload starting...';
   if($('mover')) {
      $('mover').style.width = '0%'
   };
   
   if (!$('upfileinput').value) {
      return false;
   }
   //$('UploadStatusImage').src = '/static/img/spinner.gif';
   $('UploadStatusText').innerHTML = $('upfileinput').value;
   Effect.Appear( 'status-win', { duration: 1.0 } );
   setTimeout( "keepchecking()", 100 );
   return true		
}

var cnt = 0;
function keepchecking()
{
  cnt++;
  var opt = {
     // Use POST
     method: 'post',
     
     // Handle successful response
     onSuccess: function(t) {
     	var res = eval('(' + t.responseText + ')');
     	var per = Math.floor( (res.bytesRead / res.totalSize) * 100);
     	
        $('UploadStatusText').innerHTML = "(" + res.status + ") " + res.message + " (" + cnt +")";
        
        if( res.status == "done" ) {
        	per = 100;
        	//Effect.Fade( 'status-win', { duration: 1.0 } );
   			$('UploadStatusImage').src = '/static/img/notice.gif';
        }
    	else if( res.status == "error" ) {
        	per = 100;
        	//Effect.Fade( 'status-win', { duration: 1.0 } );
   			$('UploadStatusImage').src = '/static/img/error.gif';
        }
        else {
	        setTimeout( "keepchecking()", 1000 ); // every second... seems often, but hey...
	    }
	    
	    if($('mover')) {
	       $('mover').style.width = per+'%'
	    };
     },
     // Handle other errors
     onFailure: function(t) {
         $('UploadStatus').innerHTML = 'Error ' + t.status + ' -- ' + t.statusText;
     }
   }
   new Ajax.Request( '/ajax/uploadstatus', opt );
}



function findPosX(obj)
{
	var curleft = 0;
	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curleft += obj.offsetLeft
			obj = obj.offsetParent;
		}
	}
	else if (obj.x)
		curleft += obj.x;
	return curleft;
}

function findPosY(obj)
{
	var curtop = 0;
	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curtop += obj.offsetTop
			obj = obj.offsetParent;
		}
	}
	else if (obj.y)
		curtop += obj.y;
	return curtop;
}




var ThumbsUpDown = Class.create();
ThumbsUpDown.prototype = {   
      
  initialize: function(element) {
    var options = Object.extend( {
      entryID: null,
      thumb: null,
      loginJS: null
    }, arguments[1] || {} );

    this.element = $(element);
    this.options = options;    
    
    this.eventClickAction = this.clickedThumb.bindAsEventListener(this);
    this.eventOverAction  = this.mouseOver.bindAsEventListener(this);
    this.eventOffAction   = this.mouseOut.bindAsEventListener(this);
    
  	this.spinner = Builder.node( 'img', {src:Blox.absoluteImageURL+'/static/img/spinner.gif'     } );
    this.up      = Builder.node( 'img', {src:Blox.absoluteImageURL+'/static/img/scoreGood.gif', style:'margin-left:3px;' } );
    this.dn      = Builder.node( 'img', {src:Blox.absoluteImageURL+'/static/img/scoreBad.gif',  style:'margin-left:3px;' } );
    this.off     = Builder.node( 'img', {src:Blox.absoluteImageURL+'/static/img/scoreOff.gif',  style:'margin-left:3px;' } );
    this.up.thumb  = "Good";
    this.dn.thumb  = "Bad";
    this.off.thumb = "Off";
	
	Event.observe( this.up,  "mouseover",  this.eventOverAction );
	Event.observe( this.dn,  "mouseover",  this.eventOverAction );
	Event.observe( this.off, "mouseover",  this.eventOverAction );
	
	Event.observe( this.up,  "mouseout",  this.eventOffAction );
	Event.observe( this.dn,  "mouseout",  this.eventOffAction );
	Event.observe( this.off, "mouseout",  this.eventOffAction );
	
	Event.observe( this.up,  "mouseup",  this.eventClickAction );
	Event.observe( this.dn,  "mouseup",  this.eventClickAction );
	Event.observe( this.off, "mouseup",  this.eventClickAction );
	
	this.setThumb( options.thumb );
  },
  
  setThumb: function( t )
  {
  	while (this.element.firstChild) {
	    this.element.removeChild(this.element.firstChild);
	}
     
  	 this.thumb = null;
     if( t == 'GOOD' || t == 'Good' ) {
  	 	this.thumb = 'GOOD';
		this.element.appendChild( this.up );
     }
     else if( t == 'BAD' || t == 'Bad' ) {
  	 	this.thumb = 'BAD';
		this.element.appendChild( this.dn );
     }
     else {
		this.element.appendChild( this.up );
		this.element.appendChild( this.dn );
     }
     Element.hide( this.off );
	 this.element.appendChild( this.off );
  	 document.body.style.cursor = "auto";
  },

  mouseOver: function(event) {
  	var thumb = Event.element( event );
  	if( thumb.thumb ) {
  	    thumb.src = Blox.absoluteImageURL+'/static/img/score'+thumb.thumb+'-over.gif'    
	  	document.body.style.cursor = "pointer";
  	}
  },

  mouseOut: function(event) {
  	var thumb = Event.element( event );
  	if( thumb.thumb ) {
  	    thumb.src = Blox.absoluteImageURL+'/static/img/score'+thumb.thumb+'.gif'
  	}
  	document.body.style.cursor = "auto";
  },

  clickedThumb: function(event) {  	
  	var  memberID = $('MemberID').innerHTML;
  	if( !memberID ) {
  		if( this.options.loginJS ) {
  			eval( this.options.loginJS );
  		}
	  	else {
	  		document.location.href = Blox.absoluteBaseURL+'/account/login';   	
	  	}
  		return;
  	}
  	   
  	var thumb = Event.element( event );
  	if( thumb.thumb ) {
  		var params = 'entryID='+this.options.entryID+'&action=SET&score='+thumb.thumb;
  		if( this.thumb ) {
  		    if( thumb != this.off ) {
  		    	Effect.toggle( this.off, 'appear' );
  		    	return;	
  		    }
	  		else {
	  			params = 'entryID='+this.options.entryID+'&action=DELETE';
	  		}
  		}
  		while (this.element.firstChild) {
		  this.element.removeChild(this.element.firstChild);
		}
  		this.element.appendChild( this.spinner );
  		
  	   document.body.style.cursor = "wait";
  	   
  	   var spot = this;
  	   new Ajax.Request( '/ajax/score', {
	     	parameters: params, 
	     	onSuccess: function(t) {
	  			spot.setThumb( thumb.thumb );
		    },
		    
	     	onFailure: function(t) {
		        alert('error ' + t.status + ' -- ' + t.statusText);
	  			spot.setThumb( spot.thumb );
		    }
	    } );
  	}
  }
}


// Returns true if character c is an English letter 
// (A .. Z, a..z).
//
// NOTE: Need i18n version to support European characters.
// This could be tricky due to different character
// sets and orderings for various languages and platforms.

function isLetter (c)
{   return ( ((c >= "a") && (c <= "z")) || ((c >= "A") && (c <= "Z")) )
}



// Returns true if character c is a digit 
// (0 .. 9).

function isDigit (c)
{   return ((c >= "0") && (c <= "9"))
}



// Returns true if character c is a letter or digit.

function isLetterOrDigit (c)
{   return (isLetter(c) || isDigit(c))
}




var LiveTagger = Class.create();
LiveTagger.prototype = {   
  initialize: function(element) {
    var options = Object.extend( {
      tags: [],
      entryID: null,
      name: null,
      display: null,
      editor: false
    }, arguments[1] || {} );

    this.element = $(element);
    this.options = options;    
    
    if( options.display == null ) {
    	  options.display = options.name;	
    }
    
  	if( options.editor || this.options.tags.length > 0  ) {
  		// <h3><a href="/tag/keyword:/">Keywords:</a></h3>
  		this.element.innerHTML = "";
    	this.eventClickedDelete = this.clickedDelete.bindAsEventListener(this);
    
  		var h3 = Builder.node( 'h3', [ Builder.node( 'a', { href:'/tag/'+options.name+':/' }, options.display+":" ) ] );
  		this.ul = Builder.node( 'ul' );
  		
    	this.editBTNS = [];
  		this.loadTags( this.options.tags );
	  	
  		this.display = Builder.node( 'div', [h3,this.ul] ); 
  		this.element.appendChild( this.display );
  		
	  	if( this.options.editor ) {
    		this.eventClickedEdit = this.clickedEdit.bindAsEventListener(this);
	  		var lnk = Builder.node( 'a', { href:'#', className:'dull', onclick:'return false;' }, "+ Edit "+options.display );	
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
  		var lnk = Builder.node( 'a', { href:'/tag/'+this.options.name+':'+escape(tag.value)+'/' }, tag.value.escapeHTML() );				
  		
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
  
  addTagWithQuotes: function( txt )
  {
  	 this.addTag( '"'+txt.trim()+'"' );
  },
  	
  addTag: function( txt )
  {
  	  txt = txt.trim();
    	if( txt.length > 0 ) {
    		
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
  },
  
  onKeyPress: function(event) {
    if (event.keyCode == Event.KEY_RETURN ) {
    	var txt = this.kwInput.value;
    	Event.stop( event );
    	this.addTag( txt );
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
