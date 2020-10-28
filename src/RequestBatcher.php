<?php
namespace Jnilla\Joomla;

defined('_JEXEC') or die();

use Joomla\CMS\Response\JsonResponse as JsonResponse;
use Joomla\CMS\Factory as JFactory;

class RequestBatcher{
	
	/**
	 * Iterates over each request from the batch performing a callback
	 *
	 * @param     callable    $callback    Callable reference
	 *
	 * @return    void
	 */
	static function callback($callback){
		$app = JFactory::getApplication();
		$input = $app->input;
		
		// Send empty reponse if request is not a RequestBatcher request
		if(!$input->get('RequestBatcher', false)) RequestBatcher::sendResponse(null);
		
		$batch = json_decode($input->get('data', '', 'json'));
		$responses = array();
		
		// Iterate over each request
		foreach($batch as $request){
			try{
				$responses[] = (object)array(
					'success' => true,
					'message' => null,
					'data' => (object)array(
						'id' => $request->id,
						'data' => $callback($request->data)
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


