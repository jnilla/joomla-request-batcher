<?php
namespace Jnilla\Joomla;

defined('_JEXEC') or die();

use Joomla\CMS\Response\JsonResponse as JsonResponse;
use Joomla\CMS\Factory as JFactory;

class RequestBatcher{

	/**
	 * Process the batch executing a callback for each request in the actual batch
	 *
	 * @param     callable    $callback    Callback reference (Callback must return string type)
	 *
	 * @return    void
	 */
	static function process($callback){
		$app = JFactory::getApplication();
		$input = $app->input;

		// Send empty reponse if request is not a RequestBatcher request
		if(!$input->get('RequestBatcher', false)) RequestBatcher::sendResponse(null);

		$requests = json_decode($input->get('data', '', 'json'));
		$responses = array();

		// Iterate over each request
		foreach($requests as $request){
			try{
				$data = $callback($request->data); // Execute callback

				// Check data type
				if(!is_string($data)) throw new \InvalidArgumentException('The callback ($callback) must return string type');

				$responses[] = (object)array(
					'success' => true,
					'message' => null,
					'data' => (object)array(
						'id' => $request->id,
						'data' => $data
					)
				);
			}catch(\Exception $error){
				$responses[] = (object)array(
					'success' => false,
					'message' => $error->getMessage(),
					'data' => (object)array(
						'id' => $request->id,
						'data' => null
					)
				);
			}
		}

		RequestBatcher::sendResponse($responses);
	}

	/**
	 * Send a JSON response
	 *
	 * @param   mixed    $data            The Response data
	 * @param   string   $message         The main response message
	 * @param   boolean  $error           True, if the success flag shall be set to false, defaults to false
	 * @param   boolean  $ignoreMessages  True, if the message queue shouldn't be included, defaults to false
	 *
	 * @return   void
	 */
	static function sendResponse($data = null, $message = null, $error = false){
		header('Content-Type: application/json');
		echo new JsonResponse($data, $message, $error, false);
		die;
	}

}


