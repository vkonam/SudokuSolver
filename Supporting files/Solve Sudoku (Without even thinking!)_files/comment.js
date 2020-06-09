
function ShowCommentPoster( underID, topicID, flagger )
{
	if( flagger ) {
		Element.show( 'CommentFlaggerXX' );
		Element.hide( 'CommentPosterXX'  );
	}
	else {
		Element.hide( 'CommentFlaggerXX' );
		Element.show( 'CommentPosterXX'  );
	}
	Element.show( 'CommentFlagOptions'  );
	Element.hide( 'CommentFlagResponse' );
	
	if( underID != 'NewCommentPOST' ) {
		ToggleDisplayStyles( 'NewCommentLINK', 'NewCommentPOST' );
		Element.show('CancelREPLY');
		$('commentType').innerHTML = 'Reply';
	}
	else {
		Element.hide('CancelREPLY');
		$('commentType').innerHTML = 'Comment';
	}
	
	Element.hide('PostCommentFormError');
	Element.show( 'CommentPoster' );
	$(underID).appendChild( $('CommentPoster'), null );
	$('PostTopicID').value = topicID;
}

function FlagCurrentCommentAs( flag )
{
	$('CommentFlagResponse').innerHTML = 
	   '<img style="float:left; height:75px" src="/static/img/loading.gif" alt=""/>'+
	   '<span id="CommentFlagResponseTXT">sending flag: '+flag+'</span>';

    var params = "entryID="+$('PostTopicID').value
               + "&action=SET"
               + "&flag=" + flag;
               
	new Ajax.Request( '/ajax/flag', {
     	parameters: params, 
     	onSuccess: function(t) {
	        $('CommentFlagResponse').innerHTML = t.responseText;
	    },
	    
     	onFailure: function(t) {
	        $('CommentFlagResponse').innerHTML = t.status + ' -- ' + t.statusText;
	    }
    } );

	Element.hide( 'CommentFlagOptions'  );
	Element.show( 'CommentFlagResponse' );
}

function DeleteCurrentComment()
{
	DeleteComment( $('PostTopicID').value );
}

function DeleteComment( entryID )
{
	if( entryID ) {
		var x=window.confirm("Are you sure you want to delete this post?")
	    if (x) {
			document.location = "/edit/delete?"
			                  + "entryID="+entryID
			                  + "&areyousure=yes"
			                  + "&linkTO="+document.location;
		}
	}
}

function EditCurrentComment()
{
	document.location = "/edit/"+$('PostTopicID').value+"/";
}

function PostComment()
{
	var txt = $F('PostCommentFormBODY').trim();
	if( txt.length > 0 ) {
		$('PostCommentForm').submit();
	}
	else {
		$('PostCommentFormError').innerHTML = "missing body text";
		Element.show('PostCommentFormError');
		Effect.Shake('PostCommentButton');
	}
}

function ToggleLibrary()
{
	var acc = $('accordion');
		
	if( acc ) {
		Effect.toggle('commentFiles','slide' );
	}
	else {
		Effect.toggle('commentFiles','appear' );
		
		new Ajax.Updater('commentFiles', '/pages/explore/comments/library.jsp',
		   {asynchronous:true, 
		    evalScripts:true, 
		    
		    // Handle other errors
		    onFailure: function(t) {
		        alert('Error ' + t.status + ' -- ' + t.statusText);
		    }
		} );
	}
}


function DoCommentLogin()
{
	$('loginFeedback').innerHTML = "logging in....";
	var u = $('loginNAME').value;
	var p = $('loginPASS').value;
	
	if( u == null || u.length < 2 ) {
	    $('loginFeedback').innerHTML = "enter your login name";
	    Effect.Shake('loginNAME');
	    return;
	}
	if( p == null || p.length < 2 ) {
	    $('loginFeedback').innerHTML = "enter your password";
	    Effect.Shake('loginPASS');
	    return;
	}
	ToggleDisplayStyles( 'LoggingIN', 'FormLoginDIV' );
	
    new Ajax.Request('/ajax/login', {
       parameters: 'u='+u+'&p='+p, 
       onSuccess: function(t) {
          var pdiv = $('CommentPoster');
          if( pdiv != null ) {
	          ToggleDisplayStyles( 'CommentLoggedIn', 'CommentLogin' );
          }
          else {
             ToggleDisplayStyles( 'FormLoginDIV', 'LoggingIN' );
             $('loginFeedback').innerHTML = "hymmm, cant find: CommentPoster!!!";
          }
          
          if( $('MemberID') ) {
              $('MemberID').innerHTML = t.responseText;
          }
	   }, 
       onFailure: function(t) {
          ToggleDisplayStyles( 'FormLoginDIV', 'LoggingIN' );
          $('loginFeedback').innerHTML = "invalid user/pass, try again?" + t.statusText;
	      Effect.Shake('loginPASS');
	      Effect.Shake('loginNAME');
       } }
    );
}