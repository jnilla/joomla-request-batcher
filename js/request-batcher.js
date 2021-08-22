// Define namespace
var Jnilla = Jnilla || {};
Jnilla.Joomla = Jnilla.Joomla || {};

Jnilla.Joomla.RequestBatcher = (function($){
	var isSending = false;
	var batch = [];
	var callbacks = [];
	var callbacks2 = [];
	var serverUrl = '';
	var interval = 6;
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
		// Exit if interval is 0
		if(interval <= 0) return;

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

		// Store the callbacks of this batch to a copy
		callbacks2 = callbacks;

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
		}).always(function(data){
			if(debug){
				responseMark = new Date().getTime() - requestMark;
				responseMark = numberWithCommas(responseMark);
				console.log('<--- Response ('+responseMark+'ms)');
			}

			// Reset
			isSending = false;
			intervalCount = 0;
		}).done(function(data){
			// data: The server JSON repsonse structure
			// data.data: A list of responses from the batcher
			// data.data[i]: One response JSON response structure
			// data.data[i].data.id: One response id
			// data.data[i].data.data: One response data

			if(debug) console.log(data);

			// Execute callbacks
			for(let i in data.data){
				requestId = data.data[i].data.id;
				requestData = data.data[i].data.data;
				try{
					if(typeof callbacks2[requestId] == 'function'){
						callbacks2[requestId](requestData);
					}
				}finally{}
			}
		});

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
		 * Adds a request to the actual batch
		 *
		 * @param     string      data        Data to send (Must be string type)
		 * @param     callable    callback    Callable reference
		 * @param     boolean     sendNow     If true sends the current batch inmediately
		 *
		 * @return    void
		 */
		addRequest : function(data, callback = null, sendNow = false){
			// Check if data is string type
			if(typeof data !== 'string') throw "Argument 'data' must be string type";

			var request = {};
			request.id = hashCode(data); // Prevents to add duplicates
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

			if(debug) console.log('Request added to the batch: ', request);

			if(sendNow) sendBatch();
		},

		/**
		 * Sets the server URl to sent the batches to
		 *
		 * @param     string    url    Server URL
		 *
		 * @return    void
		 */
		setServerUrl: function(url = ''){
			serverUrl = url;
		},

		/**
		 * Sets the interval in where the batches will be send to the server automatically
		 *
		 * @param     integer    sseconds    Set to 0 to disable interval
		 *
		 * @return    void
		 */
		setBatchInterval: function(seconds){
			intervalCount = seconds;
			interval = seconds;
		},

		/**
		 * Sets the debug mode
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


