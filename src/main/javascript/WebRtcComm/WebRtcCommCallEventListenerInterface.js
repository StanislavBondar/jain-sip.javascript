/**
 * @class WebRtcCommCallEventListenerInterface
 * @classdesc Abstract class describing  WebRtcCommClient event listener interface 
 *            required to be implented by the webapp 
 * @constructor
 * @public
 */ 
WebRtcCommCallEventListenerInterface = function(){
    };
 
/**
 * Open event
 * @public
 * @param {WebRtcCommCall} webRtcCommCall source WebRtcCommCall object
 */ 
WebRtcCommCallEventListenerInterface.prototype.onWebRtcCommCallOpenedEvent= function(webRtcCommCall) {
    throw "WebRtcCommCallEventListenerInterface:onWebRtcCommCallOpenedEvent(): not implemented;"; 
}


/**
 * In progress event 
 * @public
 * @param {WebRtcCommCall} webRtcCommCall source WebRtcCommCall object
 */
WebRtcCommCallEventListenerInterface.prototype.onWebRtcCommCallInProgressEvent= function(webRtcCommCall) {
    throw "WebRtcCommCallEventListenerInterface:onWebRtcCommCallInProgressEvent(): not implemented;"; 
}
 
/**
 * Open error  event
 * @public
 * @param {WebRtcCommCall} webRtcCommCall source WebRtcCommCall object
 * @param {String} error error message
 */
WebRtcCommCallEventListenerInterface.prototype.onWebRtcCommCallOpenErrorEvent= function(webRtcCommCall,error) {
    throw "WebRtcCommCallEventListenerInterface:onWebRtcCommCallOpenErrorEvent(): not implemented;"; 
}
 
/**
 * Open error  event
 * @public
 * @param {WebRtcCommCall} webRtcCommCall source WebRtcCommCall object
 */
WebRtcCommCallEventListenerInterface.prototype.onWebRtcCommCallRingingEvent= function(webRtcCommCall) {
    throw "WebRtcCommCallEventListenerInterface:onWebRtcCommCallRingingEvent(): not implemented;"; 
} 

/**
 * Open error  event
 * @public
 * @param {WebRtcCommCall} webRtcCommCall source WebRtcCommCall object
 */
WebRtcCommCallEventListenerInterface.prototype.onWebRtcCommCallRingingBackEvent= function(webRtcCommCall) {
    throw "WebRtcCommCallEventListenerInterface:onWebRtcCommCallRingingBackEvent(): not implemented;"; 
} 

/**
 * Open error  event
 * @public
 * @param {WebRtcCommCall} webRtcCommCall source WebRtcCommCall object
 */
WebRtcCommCallEventListenerInterface.prototype.onWebRtcCommCallHangupEvent= function(webRtcCommCall) {
    throw "WebRtcCommCallEventListenerInterface:onWebRtcCommCallHangupEvent(): not implemented;";   
}

/**
 * Message event
 * @public
 * @param {WebRtcCommCall} webRtcCommCall source WebRtcCommCall object
 * @param {String} message received message
 */
WebRtcCommCallEventListenerInterface.prototype.onWebRtcCommCallMessageEvent= function(webRtcCommCall, message) {
    throw "WebRtcCommCallEventListenerInterface:onWebRtcCommCallMessageEvent(): not implemented;";   
}