# joomla-request-batcher

Send and process requests in batches.

Send multiple requests in batches to reduce the overhead of sending multiple requests individually.

## Installation (Server Side)

Install using Composer:

```
$ composer require jnilla/joomla-request-batcher
```

Load the library using the Composer autoloader:

```
require('vendor/autoload.php');
```

## Installation (Client Side)

This library depends on jQuery. Include the file ```request-batcher.js``` after jQuery and before your code. Example:

```
<script src='jquery.js'></script>
<script src='request-batcher.js'></script>
<script src='your-code.js'></script>
```

## Basic Usage (Client Side)

The request batcher uses the namespace:

```
Jnilla.Joomla.RequestBatcher
```

Basic configuration:


```
// If true prints debug data to the console
Jnilla.Joomla.RequestBatcher.setDebug(true);

// Sends a batch every 5 seconds
Jnilla.Joomla.RequestBatcher.setBatchInterval(5);

// Set the server URL where you want to sent the data to. If not set the default value is the current page URL.
Jnilla.Joomla.RequestBatcher.setServerUrl('?index.php?option=com_example&task=ajax.processRequest');
```

Add one request to the actual batch

```
Jnilla.Joomla.RequestBatcher.addRequest(
    // Request data (Must be string type)
	'some data',
	// Response callback
	function(responseData){console.log(responseData);}
);

```

The `addRequest` method has a mechanism to prevent duplicated requests.

The batcher does nothing if the actual batch has no requests.

## Basic Usage (Server Side)

Declaration:

```
use Jnilla\Joomla\RequestBatcher as RequestBatcher;
```

The `process` method process the batch executing a callback for each request in the actual batch.

```
// Process the batch
RequestBatcher::process(function($requestData){ // Callback for each request
    // Some code here
});
```

## Example

On the client side we got an script that displays the value of one product (A) every 2 seconds, and the value of another product (B) every 10 seconds.

```
Jnilla.Joomla.RequestBatcher.setBatchInterval(1);  Send batches every 1 seconds
Jnilla.Joomla.RequestBatcher.setServerUrl('?index.php?option=com_example&task=ajax.processRequest'); // Server URL

// Add the 'Product A' request every 2 seconds.
setInterval(function(){
    Jnilla.Joomla.RequestBatcher.addRequest(
        // Request data. Only send string. That is why we used stringify
    	JSON.stringify({'task': 'getProductA'}),
    	// Response callback
    	function(responseData){
        	console.log('Product Name:'+responseData.name+', Value:'+responseData.value');
        	// Output: Product Name: Product A, Value: $100
    	}
    );
}, 2000);

// Add the 'Product B' request every 10 seconds.
setInterval(function(){
    Jnilla.Joomla.RequestBatcher.addRequest(
        // Request data.
    	JSON.stringify({'task': 'getProductB'}),
    	// Response callback
    	function(responseData){
        	console.log('Product Name:'+responseData.name+', Value:'+responseData.value');
        	// Output: Product Name: Product B, Value: $350
    	}
    );
}, 10000);
```

The abtches are send every 1 seconds, but the requests are added at different interval. You can play with the batch interval and how ofthen they are added to meet your needs. For this example some times nothing is send because the batch is empty, some times the batch has 1 request and some times the batch has 2 requests.

On the server side we can implement a structure like this that resembles a task based controller.

```
// Process the batch
RequestBatcher::process(function($requestData){ // Callback for each request
    $requestData = json_decode($requestData); Parse the JSON string
    switch ($requestData->task){
			case 'getProductA':
			    // Some code here
			    $data = ['name'=> 'Product A' , 'value' => '$100'];
			    // The response must be string type. That is why we used json_encode()
			    $data = json_encode($data);
				return $data;
			case 'getProductB':
			    // Some code here
			    $data = ['name'=> 'Product B' , 'value' => '$350'];
			    $data = json_encode($data);
				return $data;
	}
});
```

The server response is send automatically after the batch is processed.

As simple as it is.

## License

This project is under the MIT License.



