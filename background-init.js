var configContainer = [];
// for every tab's created
// define its default value for 
// each tab
chrome.tabs.onCreated.addListener( function ( tab ) {
	console.log('New Tab Created');
	var newlyCreatedTab = tab;

	// for active tab only
	chrome.tabs.query( {active: true, currentWindow: true}, function( tabs ) {		
		// check for existing tab
		// either already registered or not
		// inside configContainer
		console.log(tabs)
		var flagExist = null;

		flagExist = checkForExistingData( tabs[0].id );

		// if already exist then check for state
		if ( flagExist ) {
			console.log('Active tab is exist')
			// if state is TRUE, then closed the tab
			if ( flagExist.state ) {

				closedTab( newlyCreatedTab, flagExist );
				return;
			}
		}
		// if not exist then push to configContainer
		else {			
			console.log('Active tab is not Exist')
			insertToContainer( tabs[0] );
			return;

		}	

		
	});
	
	insertToContainer( newlyCreatedTab );
	

});

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

function closedTab ( newlyCreatedTab, activeTab ) {

	var newlyCreatedTabUrlObj = new URL( newlyCreatedTab.url );
	var activeTabUrlObj = new URL( activeTab.url );

	if ( activeTabUrlObj.hostname.indexOf( newlyCreatedTabUrlObj.hostname ) === -1 ) 
		chrome.tabs.remove( newlyCreatedTab.id );
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
