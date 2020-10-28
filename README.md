# joomla-request-batcher

Send and process requests in batches.

Use this tool as an standard way to comunicate your JS code with your server code. 

Send multiple requests in batches to reduce the overhead of sending multiple requests individually.

The batcher collects the requests into a batch (array) and after a period of time the batch is send to the server. The whole process repeats with each interval.

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

## Basic Usage (Server Side)

Declaration:

```
use Jnilla\Joomla\RequestBatcher as RequestBatcher;
```

Use the batcher callback to iterate over the batch requests. The batcher only process requests from the batcher client.

```
RequestBatcher::callback(function($requestData){ // Callback for each request
	switch ($requestData->task){ // This serves as controller
		case 'getSomeData':
			$response = 'lorem ipsum'; // Some operation here
			return $response; // Add response to the response batch
			
		case 'getSomeMoreData':
			$response = 'lorem ipsum dolor sit amed';
			return $response;
			
		default:
			return null;
	}
});
```

## Basic Usage (Client Side)

The batcher can be access through the global variable ```Jnilla``` this is a namespace.

```
Jnilla.Joomla.RequestBatcher
```

Configure:

Use the debug mode to visualize events to console.

```
Jnilla.Joomla.RequestBatcher.setDebug(true);
```

Set how often the batches will be send. 6 Seconds by default.

```
Jnilla.Joomla.RequestBatcher.setBatchInterval(3);
```

Set server URL. Current URL by default.

```
Jnilla.Joomla.RequestBatcher.setServerUrl('?some_api');
```

Add a request to the batch.

```
Jnilla.Joomla.RequestBatcher.addRequest(
	// Request
	{'task': 'getSomeData'}, 
	// Response
	function(responseData){console.log(responseData);}
);
```

Console output:

```
Lorem ipsum 
```

## License

This project is under the MIT License.



