/**
 * @class WebRtcCommClientEventListenerInterface
 * @classdesc Abstract class describing  WebRtcCommClient event listener interface 
 *            required to be implented by the webapp 
 * @constructor
 * @public
 */ 
 WebRtcCommClientEventListenerInterface = function(){
};
 
/**
 * Open event
 * @public
 */ 
WebRtcCommClientEventListenerInterface.prototype.onWebRtcCommClientOpenedEvent= function() {
    throw "WebRtcCommClientEventListenerInterface:onWebRtcCommClientOpenedEvent(): not implemented;"; 
}

/**
 * Open error event 
 * @public
 * @param {String} error open error message
 */
WebRtcCommClientEventListenerInterface.prototype.onWebRtcCommClientOpenErrorEvent= function(error) {
    throw "WebRtcCommClientEventListenerInterface:onWebRtcCommClientOpenErrorEvent(): not implemented;"; 
}


/**
 * Open error event 
 * @public
 */
WebRtcCommClientEventListenerInterface.prototype.onWebRtcCommClientClosedEvent= function(error) {
    throw "WebRtcCommClientEventListenerInterface:onWebRtcCommClientClosedEvent(): not implemented;"; 
}


