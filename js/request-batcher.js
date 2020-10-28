var Jnilla = Jnilla || {};

Jnilla.RequestBatcher = (function($){
	var isSending = false;
	var batch = [];
	var callbacks = [];
	var callbacksState = [];
	var serverUrl = '';
	var interval = 2;
	var intervalCount = interval;
	var debug = false;
	var requestMark;
	var responseMark;
	
	/**
	 * Set interval to send each batch automatically
	 *
	 * @return    void
	 */
	setInterval(function(){
		// Exit if batch is empty
		if(!batch.length) return;
		
		// Exit if request is being send
		if(isSending) return;
		
		intervalCount++
		if(intervalCount >= interval){
			intervalCount = 0;
			sendBatch();
		}
	}, 1000);
	
	/**
	 * Send the request with the batch data
	 *
	 * @return    void
	 */
	function sendBatch(){
		// Exit if request is being send
		if(isSending) return;
		isSending = true;
		
		if(debug){
			console.log('Requesting --->', );
			console.log(batch);
			requestMark = new Date().getTime();
		}
		
		// Send request
		$.ajax({
			'url': serverUrl, 
			'cache': false, 
			'method': 'post',
			'data': {
				'RequestBatcher': true,
				'data': JSON.stringify(batch), 
			},
		}).then(function(data) {
			if(debug){
				responseMark = new Date().getTime() - requestMark;
				responseMark = numberWithCommas(responseMark);
				console.log('<--- Response ('+responseMark+'ms)');
			}

			// Prepare data
			for(let i in data.data){
				data.data[i].data.data = JSON.parse(data.data[i].data.data);
			}
			
			if(debug) console.log(data);
			
			// Perform callbacks
			for(let i in data.data){
				try{
					requestId = data.data[i].data.id;
					requestData = data.data[i].data.data;
					if(typeof callbacksState[requestId] == 'function') callbacksState[requestId](requestData);
				}finally{}
			}
			
			// Resets
			callbacksState = [];
			isSending = false;
			intervalCount = 0;
		});
		
		// Store callbacks state
		callbacksState = callbacks;
		
		// Reset
		batch = [];
		callbacks = [];
	}
	
	/**
	 * Generates a hash code
	 *
	 * @param     mixed    s     Data to be hashed
	 *
	 * @return    string    Hash code
	 */
	function hashCode(s){
	  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
	}
	
	/**
	 * Generates a hash code
	 *
	 * @param     number    x     Number to apply thousand separator
	 *
	 * @return    string    Hash code
	 */
	function numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
	// Public members
	return{
		/**
		 * Adds request data to the batch
		 *
		 * @param     mixed       data        Data to send
		 * @param     callable    callback    Callable reference
		 * @param     boolean     sendNow     Set to true to send request ASAP
		 *
		 * @return    string    Hash code
		 */
		addRequest : function(data, callback = null, sendNow = false){
			var request = {};
			request.id = hashCode((typeof data)+JSON.stringify(data));
			request.data = data;
			
			// Check if request already exist
			for(let i = 0; i < batch.length; i++){
				if(batch[i].id == request.id){
					if(debug) console.log('Request already exist in actual batch', request);
					return;
				}
			}
			
			// Add request to batch
			batch.push(request);
			
			// Register callback
			if(typeof callback == 'function'){
				callbacks[request.id] = callback;
			}
			
			if(debug) console.log('Request added to batch: ', request);
			
			if(sendNow) sendBatch();
		},
		
		/**
		 * Sets the server URl that will receive our requests
		 *
		 * @param     string    url    Server URL
		 *
		 * @return    void
		 */
		setServerUrl: function(url = ''){
			serverUrl = url;
		},
		
		/**
		 * Sets the interval in where the batches will be send automatically
		 *
		 * @param     string       url        Server URL
		 *
		 * @return    void
		 */
		setBatchInterval: function(seconds){
			intervalCount = seconds;
			interval = seconds;
		},
		
		/**
		 * Sets the debug mode to display events to console
		 *
		 * @param     boolean    flag    Set to true to enable
		 *
		 * @return    void
		 */
		setDebug: function(flag){
			debug = flag;
		},
		
	}
})(jQuery);

