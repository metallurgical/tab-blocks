// wait for dom content is load
var toggleAds, autoStartTxt;
document.addEventListener('DOMContentLoaded', function() {

	// get popup's element's DOM
	toggleAds = document.getElementById( 'toggleAds' );
	autoStartTxt = document.getElementById( 'autoStartTxt' );

	showInitialState();
	
	// register click event on Button
	toggleAds.addEventListener( 'click', function () {	

		var context = this;

		chrome.tabs.query({active: true, currentWindow: true}, function( tabs ) {
			// current/Active Tab's ID
			var currentActiveTab = tabs[0];
			// data to send to background script
			var sendObjData = { type : 'getConfig', tab : currentActiveTab };
			// send message to background script
			chrome.runtime.sendMessage( sendObjData, function ( response ) {
				
				var flagState, sendObjData = {};
				// change state
				response.state = ( response.state ) ? false : true;
				// change state text on popup
				autoStartTxt.innerText = response.state;
				// change button's text
				context.innerText = ( response.state ) ? 'Turn Off' : 'Turn On';
				// sending back data to background script
				// after done
				sendObjData = {
					id : response.id,
					state : response.state,
					type : 'updateConfig'
				};

				console.log(sendObjData)
				// update tab's config again
				updateConfig ( sendObjData );

			});			

		});
		

	});

});

// update configContainer's data
function updateConfig ( sendObjData ) {

	chrome.runtime.sendMessage( sendObjData, function ( response ) {

	});

}

// show current state
function showInitialState () {

	chrome.tabs.query({active: true, currentWindow: true}, function( tabs ) {
		
		// current/Active Tab's ID
		var currentActiveTab = tabs[0];
		// data to send to background script
		var sendObjData = { type : 'getConfig', tab : currentActiveTab };
		// send message to background script
		chrome.runtime.sendMessage( sendObjData, function ( response ) {
			autoStartTxt.innerText = response.state;
			toggleAds.innerText = ( response.state ) ? 'Turn Off' : 'Turn On';
		});

	});

}


