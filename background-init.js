var configContainer = [];
// for every tab's created
// define its default value for 
// each tab
chrome.tabs.onCreated.addListener( function ( tab ) {	
	
	var newlyCreatedTab = tab;
	// for active tab only
	chrome.tabs.query( {active: true, currentWindow: true}, function( tabs ) {		
		// check for existing tab
		// either already registered or not
		// inside configContainer		
		var flagExist = null;

		flagExist = checkForExistingData( tabs[0].id );

		// if already exist then check for state
		if ( flagExist ) {			
			// if state is TRUE, then closed the tab
			if ( flagExist.state ) {

				closedTab( newlyCreatedTab, flagExist );
				return;
			}
		}
		// if not exist then push to configContainer
		else {	
			
			insertToContainer( tabs[0] );

		}	

		
	});
	// insert new tab
	insertToContainer( newlyCreatedTab );
	// checking the opener tab if exist or not
	var parentWhoOpen = checkForExistingData( newlyCreatedTab.openerTabId );
	// if exist, then check for current state
	if ( parentWhoOpen.state ) {
		closedTab( newlyCreatedTab, parentWhoOpen );
	}
	

});


/*chrome.tabs.onUpdated.addListener( function ( tabId, changeInfo, tab ) {
	
	var matchConfig;

	if ( tab.status === 'complete' ) {

		for( var i = 0, length = configContainer.length; i < length; i++ ) {

			if ( configContainer[i].id === tab.id ) {
				matchConfig = configContainer[i];
				break;
			}
		}

		closedTab( tab, matchConfig );

	}
});*/
// willtrigger when tab's closed
chrome.tabs.onRemoved.addListener( function ( tabId ) {
	// remove closed's tab from array container
	configContainer = configContainer.filter( function( el ) {
	    return el.id !== tabId;
	});

});

// checking for existing data function
function checkForExistingData ( id ) {

	var existFlag = false;

	for( var i = 0, length = configContainer.length; i < length; i++ ) {

		if ( configContainer[i].id === id ) {
			existFlag = configContainer[i];
			break;
		}
	}

	return existFlag;
}

// insert to container function
function insertToContainer ( tab ) {

	var id            = tab.id;	
	var defaultConfig = {
			id : null,
			state : false,
			url : null
		};
	defaultConfig.id = id;
	defaultConfig.url = tab.url;
	configContainer.push( defaultConfig );

	return defaultConfig;

}

// close tab's function
function closedTab ( newlyCreatedTab, activeTab ) {
	// if the open tab is new tab(fresh tab), then ignore it
	if ( newlyCreatedTab.url === 'chrome://newtab/' ) return;

	var activeTabUrlObj = new URL( activeTab.url );
	// if oepened tab is not the same
	// origin with opener, then closed it immedietely
	if ( activeTabUrlObj.hostname.indexOf( getDomain( newlyCreatedTab.url ) ) === -1 ) 
		chrome.tabs.remove( newlyCreatedTab.id );

	return;	

}

// get hostname
function getHostName( url ) {

    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);

    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    	return match[2];
    }
    else {
        return null;
    }

}

// get domain name
function getDomain( url ) {

    var hostName = getHostName(url);
    var domain = hostName;
    
    if (hostName != null) {
        var parts = hostName.split('.').reverse();
        
        if (parts != null && parts.length > 1) {
            domain = parts[1] + '.' + parts[0];
                
            if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
              domain = parts[2] + '.' + domain;
            }
        }
    }
    
    return domain;
}

// receive message from content script
chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) {
    
    switch ( request.type ) {

    	case 'getConfig' :

    		var currentConfigTab;
    		var flagExist = false;

    		flagExist = checkForExistingData( request.tab.id );

    		if ( flagExist ) {
    			currentConfigTab =  flagExist;
    		}
    		else {
    			currentConfigTab = insertToContainer( request.tab );
    		}    		

    		// send response to sender
    		// the matched obj/data
    		sendResponse( currentConfigTab );
    		break;

    	case 'updateConfig' :

    		for( var i = 0, length = configContainer.length; i < length; i++ ) {

    			if ( configContainer[i].id === request.id ) {
    				configContainer[i].state = request.state;
    				break;
    			}
    		}
    		// send back response to sender
    		// the updated obj/data
    		sendResponse( configContainer );
    		break;

    	default :
    		sendResponse( 'Message type didn\'t exist' );
    }
    
});


