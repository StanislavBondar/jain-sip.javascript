/**
 * @class WebRtcCommCall
 * @classdesc Main class of the WebRtcComm Framework providing high level communication management: 
 *            ringing, ringing back, accept, reject, cancel, bye 
 * @constructor
 * @public
 * @param  {WebRtcCommClient} webRtcCommClient client owner 
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */ 
WebRtcCommCall = function(webRtcCommClient)
{
    if(webRtcCommClient instanceof WebRtcCommClient)
    {
        console.debug("WebRtcCommCall:WebRtcCommCall()");
        this.id=undefined;
        this.webRtcCommClient=webRtcCommClient;
        this.calleePhoneNumber = undefined;
        this.callerPhoneNumber = undefined;
        this.configuration=undefined;
        this.connector=undefined;
        this.peerConnection = undefined;
        this.peerConnectionState = undefined;
        this.remoteMediaStream=undefined; 
        this.remoteSdpOffer=undefined;
    }
    else 
    {
        throw "WebRtcCommCall:WebRtcCommCall(): bad arguments"      
    }
};

/**
 * Get opened/closed status 
 * @public
 * @returns {boolean} true if opened, false if closed
 */
WebRtcCommCall.prototype.isOpened=function(){
    if(this.connector) return this.connector.isOpened();
    else return false;   
}


/**
 * Get call ID
 * @public
 * @returns id  string 
 */ 
WebRtcCommCall.prototype.getId= function() {
    return this.id;  
}

/**
 * Get caller phone number
 * @public
 * @returns callerPhoneNumber string
 */ 
WebRtcCommCall.prototype.getCallerPhoneNumber= function() {
    return this.callerPhoneNumber;
}

/**
 * Get client configuration
 * @public
 * @returns {object} configuration property  or undefined
 */
WebRtcCommCall.prototype.getConfiguration=function(){
    return this.configuration;  
}


/**
 * Get callee phone number
 * @public
 * @return calleePhoneNumber string or undefined
 */ 
WebRtcCommCall.prototype.getCalleePhoneNumber= function() {
    return this.calleePhoneNumber;
}

/**
 * get remote media stream
 * @public
 * @return remoteMediaStream RemoteMediaStream or undefined
 */ 
WebRtcCommCall.prototype.getRemoteMediaStream= function() {
    return this.remoteMediaStream;
}

/**
 * Open WebRTC communication,  asynchronous action, opened or error event are notified to the WebRtcCommClient eventListener
 * @public 
 * @param calleePhoneNumber callee phone number (bob@sip.net)
 * @param configuration communication configuration JSON object
 * <p> Communication configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">displayName:alice,<br></span>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audioMediaFlag:true,<br></span>
 * <span style="margin-left: 30px">videoMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">dataMediaFlag:false,<br></span>
 * }<br>
 * </p>
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception internal error
 */ 
WebRtcCommCall.prototype.open=function(calleePhoneNumber, configuration){
    console.debug("WebRtcCommCall:open():calleePhoneNumber="+calleePhoneNumber);
    if(typeof(configuration) == 'object')
    {
        if(this.webRtcCommClient.isOpened())
        {
            if(this.checkConfiguration(configuration))
            {
                if(this.isOpened()==false)
                {
                    try
                    {
                        this.calleePhoneNumber=calleePhoneNumber;
                        this.configuration=configuration; 
                        this.connector.open(configuration);
                    
                        // @todo Activate/desactivate audio/video tracks based on the requested communication configuration
                        // @todo Create a data channel if requested in the communication configuration
                        // Setup RTCPeerConnection first
                        this.createRTCPeerConnection();
                        this.peerConnection.addStream(this.configuration.localMediaStream);
                        var that=this;
                        if(window.webkitRTCPeerConnection)
                        {
                            this.peerConnection.createOffer(function(offer) {
                                that.processRtcPeerConnectionCreateOfferSuccess(offer);
                            }, function(error) {
                                that.processRtcPeerConnectionCreateOfferError(error);
                            }); 
                        }
                        else if(window.mozRTCPeerConnection)
                        {
                            this.peerConnection.createOffer(function(offer) {
                                that.processRtcPeerConnectionCreateOfferSuccess(offer);
                            }, function(error) {
                                that.processRtcPeerConnectionCreateOfferError(error);
                            },{
                                "mandatory": {
                                    "MozDontOfferDataChannel": true
                                }
                            }); 
                        }  
                    }
                    catch(exception){
                        console.error("WebRtcCommCall:open(): catched exception:"+exception);
                        // Close properly the communication
                        try {
                            this.close();
                        } catch(e) {} 
                        throw exception;  
                    } 
                }
                else
                {   
                    console.error("WebRtcCommCall:open(): bad state, unauthorized action");
                    throw "WebRtcCommCall:open(): bad state, unauthorized action";    
                }
            } 
            else
            {
                console.error("WebRtcCommCall:open(): bad configuration");
                throw "WebRtcCommCall:open(): bad configuration";   
            }
        }
        else
        {   
            console.error("WebRtcCommCall:open(): bad state, unauthorized action");
            throw "WebRtcCommCall:open(): bad state, unauthorized action";    
        }
    }
    else
    {   
        console.error("WebRtcCommCall:open(): bad argument, check API documentation");
        throw "WebRtcCommCall:open(): bad argument, check API documentation"    
    }
}  


/**
 * Close WebRTC communication, asynchronous action, closed event are notified to the WebRtcCommClient eventListener
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 */ 
WebRtcCommCall.prototype.close =function(){
    console.debug("WebRtcCommCall:close()");
    if(this.webRtcCommClient.isOpened())
    {
        try
        {
            // Close private Call Connector
            if(this.connector) 
            {
                this.connector.close();
            }
            
            // Close RTCPeerConnection
            if(this.peerConnection && this.peerConnection.readyState!='closed') 
            {
                this.peerConnection.close();
                this.peerConnection=undefined;
                // Notify asynchronously the closed event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommClient.eventListener.onWebRtcCommCallClosedEvent(that);
                },1);
            }

        }
        catch(exception){
            console.error("WebRtcCommCall:open(): catched exception:"+exception);
        }     
    }
    else
    {   
        console.error("WebRtcCommCall:close(): bad state, unauthorized action");
        throw "WebRtcCommCall:close(): bad state, unauthorized action";    
    }
}

/**
 * Accept incoming WebRTC communication
 * @public 
 * @param configuration communication configuration JSON object
 * <p> Call configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">displayName:alice,<br></span>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audio: true,<br></span>
 * <span style="margin-left: 30px">video: true,<br></span>
 * <span style="margin-left: 30px">data:false<br></span>
 * }<br>
 * </p> 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */ 
WebRtcCommCall.prototype.accept =function(configuration){
    console.debug("WebRtcCommCall:accept()");
    if(typeof(configuration) == 'object')
    {
        if(this.webRtcCommClient.isOpened())
        {
            if(this.checkConfiguration(configuration))
            {
                this.configuration = configuration;
                if(this.isOpened()==false)
                {
                    try
                    {
                        this.createRTCPeerConnection();
                        this.peerConnection.addStream(this.configuration.localMediaStream);
                        var sdpOffer=undefined;
                        if(window.webkitRTCPeerConnection)
                        {
                            sdpOffer = new RTCSessionDescription({
                                type: 'offer',
                                sdp: this.remoteSdpOffer
                            });
                        }
                        else if(window.mozRTCPeerConnection)
                        {
                            sdpOffer = {
                                type: 'offer',
                                sdp: this.remoteSdpOffer
                            };
                        }
           
                        var that=this;
                        this.peerConnectionState = 'offer-received';
                        this.peerConnection.setRemoteDescription(sdpOffer, function() {
                            that.processRtcPeerConnectionSetRemoteDescriptionSuccess();
                        }, function(error) {
                            that.processRtcPeerConnectionSetRemoteDescriptionError(error);
                        });
                    }
                    catch(exception){
                        console.error("WebRtcCommCall:accept(): catched exception:"+exception);
                        // Close properly the communication
                        try {
                            this.close();
                        } catch(e) {} 
                        throw exception;  
                    }
                }
                else
                {
                    console.error("WebRtcCommCall:accept(): bad state, unauthorized action");
                    throw "WebRtcCommCall:accept(): bad state, unauthorized action";        
                }
            }
            else
            {
                console.error("WebRtcCommCall:accept(): bad configuration");
                throw "WebRtcCommCall:accept(): bad configuration";   
            }
        }
        else
        {
            console.error("WebRtcCommCall:accept(): bad state, unauthorized action");
            throw "WebRtcCommCall:accept(): bad state, unauthorized action";        
        }
    }
    else
    {   
        // Client closed
        console.error("WebRtcCommCall:accept(): bad argument, check API documentation");
        throw "WebRtcCommCall:accept(): bad argument, check API documentation"    
    }
}

/**
 * Reject/refuse incoming WebRTC communication
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */ 
WebRtcCommCall.prototype.reject =function(){
    console.debug("WebRtcCommCall:reject()");
    if(this.webRtcCommClient.isOpened())
    {
        try
        {
            this.connector.reject();
        }
        catch(exception)
        {
            console.error("WebRtcCommCall:reject(): catched exception:"+exception);
            // Close properly the communication
            try {
                this.close();
            } catch(e) {}    
            throw exception;  
        }
    }
    else
    {   
        console.error("WebRtcCommCall:reject(): bad state, unauthorized action");
        throw "WebRtcCommCall:reject(): bad state, unauthorized action";    
    }
}

/**
 * Check configuration 
 * @private
 * @return true configuration ok false otherwise
 */ 
WebRtcCommCall.prototype.checkConfiguration=function(configuration){
    console.debug("WebRtcCommCall:checkConfiguration()");
            
    var check=true;
    // stunServer, sipLogin, sipPassword, sipApplicationProfile not mandatory other mandatory
            
    if(configuration.localMediaStream==undefined)
    {
        check=false;
        console.error("WebRtcCommCall:checkConfiguration(): missing localMediaStream");       
    }
                
    if(configuration.audioMediaFlag==undefined || (typeof(configuration.audioMediaFlag) != 'boolean'))
    {
        check=false;
        console.error("WebRtcCommCall:checkConfiguration(): missing audio media flag");       
    }
       
    if(configuration.videoMediaFlag==undefined || (typeof(configuration.videoMediaFlag) != 'boolean'))
    {
        check=false;
        console.error("WebRtcCommCall:checkConfiguration(): missing video media flag");       
    }
    
    if(configuration.dataMediaFlag==undefined || (typeof(configuration.dataMediaFlag) != 'boolean'))
    {
        check=false;
        console.error("WebRtcCommCall:checkConfiguration(): missing data media flag");       
    }
                
    console.debug("WebRtcCommCall:checkConfiguration(): configuration.displayName="+configuration.displayName);
    console.debug("WebRtcCommCall:checkConfiguration(): configuration.localMediaStream="+configuration.localMediaStream);
    console.debug("WebRtcCommCall:checkConfiguration(): configuration.audioMediaFlag="+configuration.audioMediaFlag);
    console.debug("WebRtcCommCall:checkConfiguration(): configuration.audioMediaFlag="+configuration.audioMediaFlag);
    console.debug("WebRtcCommCall:checkConfiguration(): configuration.dataMediaFlag="+configuration.dataMediaFlag);
    return check;
}

/**
 * Create RTCPeerConnection 
 * @private
 * @return true configuration ok false otherwise
 */ 
WebRtcCommCall.prototype.createRTCPeerConnection =function(){
    console.debug("WebRtcCommCall:createPeerConnection()");
    var rtcPeerConnectionConfiguration = {
        "iceServers": []
    };
    this.peerConnectionState='new';
    var that = this;
    if(this.webRtcCommClient.configuration.RTCPeerConnection.stunServer)
    {
        rtcPeerConnectionConfiguration = {
            "iceServers": [{
                "url":"stun:"+this.webRtcCommClient.configuration.RTCPeerConnection.stunServer
            }]
        };
    }
    if(window.webkitRTCPeerConnection)
    {
        this.peerConnection = new window.webkitRTCPeerConnection(rtcPeerConnectionConfiguration);
    }
    else if(window.mozRTCPeerConnection)
    {
        this.peerConnection = new window.mozRTCPeerConnection();
    }
   
    this.peerConnection.onaddstream = function(event) {
        that.processRtcPeerConnectionOnAddStream(event);
    }  
	
    this.peerConnection.onremovestream = function(event) {
        that.onRtcPeerConnectionOnRemoveStreamEvent(event);
    }   
    
    this.peerConnection.onstatechange= function(event) {
        that.onRtcPeerConnectionStateChangeEvent(event);
    }
          
    this.peerConnection.onicecandidate= function(rtcIceCandidateEvent) {
        that.onRtcPeerConnectionIceCandidateEvent(rtcIceCandidateEvent);
    }
     
    this.peerConnection.ongatheringchange= function(event) {
        that.onRtcPeerConnectionGatheringChangeEvent(event);
    }

    this.peerConnection.onicechange= function(event) {
        that.onRtcPeerConnectionIceChangeEvent(event);
    } 
    
    if((window.webkitRTCPeerConnection))
    {
        this.peerConnection.onopen= function(event) {
            that.onRtcPeerConnectionOnOpenEvent(event);
        }
     
        this.peerConnection.onidentityresult= function(event) {
            that.onRtcPeerConnectionIdentityResultEvent(event);
        }
    
        this.peerConnection.onnegotationneeded= function(event) {
            that.onRtcPeerConnectionIceNegotationNeededEvent(event);
        }
    }
}
   
/**
 * Implementation of the PrivateCallConnector listener interface: process remote SDP offer event
 * @private 
 * @param {string} remoteSdpOffer Remote peer SDP offer
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorRemoteSdpOfferEvent=function(remoteSdpOffer){
    console.debug("WebRtcCommCall:onPrivateCallConnectorSdpOfferEvent()");   
    this.remoteSdpOffer = remoteSdpOffer;
}  

/**
 * Implementation of the PrivateCallConnector listener interface: process remote SDP answer event
 * @private 
 * @param {string} remoteSdpAnswer
 * @throw exception internal error
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorRemoteSdpAnswerEvent=function(remoteSdpAnswer){
    console.debug("WebRtcCommCall:onPrivateCallConnectorRemoteSdpAnswerEvent()");
    try
    {
        var sdpAnswer=undefined;
        if(window.webkitRTCPeerConnection)
        {
            sdpAnswer = new RTCSessionDescription({
                type: 'answer',
                sdp: remoteSdpAnswer
            });
        }
        else if(window.mozRTCPeerConnection)
        {
            sdpAnswer = {
                type: 'answer',
                sdp: remoteSdpAnswer
            };
        }
           
        var that=this;
        this.peerConnectionState = 'answer-received';
        this.peerConnection.setRemoteDescription(sdpAnswer, function() {
            that.processRtcPeerConnectionSetRemoteDescriptionSuccess();
        }, function(error) {
            that.processRtcPeerConnectionSetRemoteDescriptionError(error);
        }); 
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:onPrivateCallConnectorRemoteSdpAnswerEvent(): catched exception:"+exception); 
        throw exception;  
    } 
} 

/**
 * Implementation of the PrivateCallConnector listener interface: process call opened event
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallOpenedEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent()"); 
    // Notify event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallOpenEvent)
    {
        var that=this;
        setTimeout(function(){
            try {
                that.webRtcCommClient.eventListener.onWebRtcCommCallOpenEvent(that);
            }
            catch(exception)
            {
                console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:"+exception);    
            }
        },1);
    }
}

/**
 * Implementation of the PrivateCallConnector listener interface: process call in progress event
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallInProgressEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent()"); 
    // Notify event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallInProgressEvent)
    {
        var that=this;
        setTimeout(function(){
            try {
                that.webRtcCommClient.eventListener.onWebRtcCommCallInProgressEvent(that);
            }
            catch(exception)
            {
                console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:"+exception);    
            }
        },1);
    }
}

/**
 * Implementation of the PrivateCallConnector listener interface: process call error event
 * @private 
 * @param {string} error call control error
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallOpenErrorEvent=function(error)
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallOpenErrorEvent():error="+error);
    // Notify event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallOpenErrorEvent)
    {
        var that=this;
        setTimeout(function(){
            try {
                that.webRtcCommClient.eventListener.onWebRtcCommCallOpenErrorEvent(that,error);
            }
            catch(exception)
            {
                console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenErrorEvent(): catched exception in listener:"+exception);    
            }
        },1);
    }
}

/**
 * Implementation of the PrivateCallConnector listener interface: process call ringing event
 * @private 
 * @param {string} callerPhoneNumber  caller contact identifier (e.g. bob@sip.net)
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallRingingEvent=function(callerPhoneNumber)
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallRingingEvent():callerPhoneNumber="+callerPhoneNumber);
    // Notify the closed event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallRingingEvent)
    {
        this.callerPhoneNumber=callerPhoneNumber;
        var that=this;
        setTimeout(function(){
            try {
                that.webRtcCommClient.eventListener.onWebRtcCommCallRingingEvent(that,that.callerPhoneNumber);
            }
            catch(exception)
            {
                console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenErrorEvent(): catched exception in listener:"+exception);    
            }
        },1);
    }
}

/**
 * Implementation of the PrivateCallConnector listener interface: process call ringing back event
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallRingingBackEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallRingingBackEvent()");
    // Notify the closed event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallRingingBackEvent)
    {
        var that=this;
        setTimeout(function(){
            try {
                that.webRtcCommClient.eventListener.onWebRtcCommCallRingingBackEvent(that);
            }
            catch(exception)
            {
                console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenErrorEvent(): catched exception in listener:"+exception);    
            }
        },1);
    }
}


/**
 * Implementation of the PrivateCallConnector listener interface: process call closed event 
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallClosedEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallClosedEvent()");
    this.connector=undefined;
    // Force communication close 
    try {
        this.close();
    } catch(exception) {}   
}
 

/**
 * Implementation of the PrivateCallConnector listener interface: process call hangup event  
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallHangupEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallHangupEvent()");
    // Notify the closed event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallHangupEvent)
    {
        var that=this;
        setTimeout(function(){
            try {
                that.webRtcCommClient.eventListener.onWebRtcCommCallHangupEvent(that);
            }
            catch(exception)
            {
                console.error("WebRtcCommCall:onPrivateCallConnectorCallHangupEvent(): catched exception in listener:"+exception);    
            }
        },1);
    }  
}

/**
 * Implementation of the RTCPeerConnection listener interface: process RTCPeerConnection error event
 * @private 
 * @param {string} error internal error
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionError=function(error){  
    console.debug("WebRtcCommCall:processRtcPeerConnectionError(): error="+error);
    // Critical issue, notify the error and close properly the call
    // Notify the error event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallOpenErrorEvent)
    {
        var that=this;
        setTimeout(function(){
            try {
                that.webRtcCommClient.eventListener.onWebRtcCommCallOpenErrorEvent(that,error);
            }
            catch(exception)
            {
                console.error("WebRtcCommCall:processRtcPeerConnectionError(): catched exception in listener:"+exception);    
            }
        },1); 
    }
    
    try {
        this.close();
    } catch(exception) {}
}


/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {MediaStreamEvent} event  RTCPeerConnection Event
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionOnAddStream=function(event){
    try
    {
        var peerConnection = event.currentTarget;
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): event="+event);   
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): peerConnection.readyState="+ peerConnection.readyState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): peerConnection.iceGatheringState="+ peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): peerConnection.iceState="+ peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): this.peerConnectionState="+this.peerConnectionState);
        if(this.peerConnection!=undefined)
        {
            this.remoteMediaStream = event.stream;
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();
    }
}

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {MediaStreamEvent} event  RTCPeerConnection Event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionOnRemoveStreamEvent=function(event){
    try
    {
        var peerConnection = event.currentTarget;
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): event="+event); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): peerConnection.readyState="+peerConnection.readyState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): peerConnection.iceState="+peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): this.peerConnectionState="+this.peerConnectionState);
        if(this.peerConnection!=undefined)
        {
            this.remoteMediaStream = undefined;
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();
    }
}

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {RTCPeerConnectionIceEvent} rtcIceCandidateEvent  RTCPeerConnection Event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionIceCandidateEvent=function(rtcIceCandidateEvent){
    try
    {
        var peerConnection = rtcIceCandidateEvent.currentTarget;
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): rtcIceCandidateEvent="+rtcIceCandidateEvent);
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): peerConnection.readyState="+peerConnection.readyState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): peerConnection.iceState="+peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate():  this.peerConnectionState="+this.peerConnectionState);
    
        if(peerConnection.readyState != 'closed')
        {
            if(rtcIceCandidateEvent.candidate!=null)
            {
                console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate: RTCIceCandidateEvent.candidate.candidate="+rtcIceCandidateEvent.candidate.candidate);
            }
            else
            {
                console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate: no anymore ICE candidate");
                if(window.webkitRTCPeerConnection)
                {
                    if(this.peerConnectionState == 'preparing-offer') 
                    {
                        this.connector.invite(this.peerConnection.localDescription.sdp)
                        this.peerConnectionState = 'offer-sent';
                    } 
                    else if (this.peerConnectionState == 'preparing-answer') 
                    {
                        this.connector.accept(this.peerConnection.localDescription.sdp)
                        this.peerConnectionState = 'established';
                        // Notify opened event to listener
                        if(this.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent) 
                        {
                            var that=this;
                            setTimeout(function(){
                                try {
                                    that.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent(that);
                                }
                                catch(exception)
                                {
                                    console.error("WebRtcCommCall:processInvitingSipRequest(): catched exception in listener:"+exception);    
                                }
                            },1); 
                        }
                    }
                    else if (this.peerConnectionState == 'established') 
                    {
                    // Why this last ice candidate event?
                    } 
                    else
                    {
                        console.error("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): RTCPeerConnection bad state!");
                    }
                }
            }
        }
        else
        {
            console.error("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): RTCPeerConnection closed!");
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError(exception);
    }
}

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {RTCSessionDescription} offer  RTCPeerConnection SDP offer event
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionCreateOfferSuccess=function(offer){ 
    try
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): offer="+offer.sdp); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): this.peerConnectionState="+this.peerConnectionState);

        if (this.peerConnectionState == 'new') 
        {
            // Preparing offer.
            var that=this;
            this.peerConnectionState = 'preparing-offer';
            this.peerConnectionLocalDescription=offer;
            this.peerConnection.setLocalDescription(offer, function() {
                that.processRtcPeerConnectionSetLocalDescriptionSuccess();
            }, function(error) {
                that.processRtcPeerConnectionSetLocalDescriptionError(error);
            });
        } 
        else
        {
            console.error("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): RTCPeerConnection bad state!");
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError(); 
    }
}

/**
 *Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionCreateOfferError=function(error){
    try
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionCreateOfferError():error="+error); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): this.peerConnectionState="+this.peerConnectionState);
        throw "WebRtcCommCall:processRtcPeerConnectionCreateOfferError():error="+error; 
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();  
    }
}

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionSetLocalDescriptionSuccess=function(){
    try
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess()"); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): this.peerConnectionState="+this.peerConnectionState);

        if(window.mozRTCPeerConnection)
        {
            if(this.peerConnectionState == 'preparing-offer') 
            {       
                this.connector.onPrivateCallConnectorSdpOffer(this.peerConnection.localDescription.sdp);
                this.peerConnectionState = 'offer-sent';
            } 
            else if (this.peerConnectionState == 'preparing-answer') 
            {
                var sdpAnswer=undefined;
                if(this.peerConnection.localDescription)  sdpAnswer = this.peerConnection.localDescription.sdp;
                else  sdpAnswer = this.peerConnectionLocalDescription.sdp;
                this.connector.onPrivateCallConnectorRemoteSdpAnswerEvent(sdpAnswer);
                this.peerConnectionState = 'established';
                
                // Notify opened event to listener
                if(this.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent) 
                {
                    var that=this;
                    setTimeout(function(){
                        try {
                            that.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent(that);
                        }
                        catch(exception)
                        {
                            console.error("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): catched exception in listener:"+exception);    
                        }
                    },1); 
                } 
            }
            else if (this.peerConnectionState == 'established') 
            {
            // Why this last ice candidate event ?
            } 
            else
            {
                console.error("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): RTCPeerConnection bad state!");
            }
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();     
    }
}

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionSetLocalDescriptionError=function(error){
    try
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError():error="+error); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): this.peerConnectionState="+this.peerConnectionState);
        throw "WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError():error="+error;
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();     
    }
}

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {RTCSessionDescription} answer  RTCPeerConnection SDP answer event
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionCreateAnswerSuccess=function(answer){
    try
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess():answer.sdp="+answer.sdp); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): this.peerConnectionState="+this.peerConnectionState);
           
        if(this.peerConnectionState == 'offer-received') 
        {
            // Prepare answer.
            var that=this;
            this.peerConnectionState = 'preparing-answer';
            this.peerConnectionLocalDescription=answer;
            this.peerConnection.setLocalDescription(answer, function() {
                that.processRtcPeerConnectionSetLocalDescriptionSuccess();
            }, function(error) {
                that.processRtcPeerConnectionSetLocalDescriptionError(error);
            });
        } 
        else
        {
            console.error("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): RTCPeerConnection bad state!");
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();     
    }  
}

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 * @param {String} error  SDP error
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionCreateAnswerError=function(error){
    console.error("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError():error="+error);
    try
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): this.peerConnectionState="+this.peerConnectionState);
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();       
    }  
}

/**
 * RTCPeerConnection listener implementation
 * @private
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionSetRemoteDescriptionSuccess=function(){
    try
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): this.peerConnectionState="+this.peerConnectionState);

        if (this.peerConnectionState == 'answer-received') 
        {            
            this.peerConnectionState = 'established';
            // Notify closed event to listener
            if(this.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent) 
            {
                var that=this;
                setTimeout(function(){
                    try {
                        that.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent(that);
                    }
                    catch(exception)
                    {
                        console.error("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): catched exception in listener:"+exception);    
                    }
                },1); 
            } 
        }
        else if (this.peerConnectionState == 'offer-received') 
        {            
            var that=this;
            if(window.webkitRTCPeerConnection)
            {
                this.peerConnection.createAnswer(function(answer) {
                    that.processRtcPeerConnectionCreateAnswerSuccess(answer);
                }, function(error) {
                    that.processRtcPeerConnectionCreateAnswerError(error);
                });  
            }
            else if(window.mozRTCPeerConnection)
            {
                this.peerConnection.createAnswer(function(answer) {
                    that.processRtcPeerConnectionCreateAnswerSuccess(answer);
                }, function(error) {
                    that.processRtcPeerConnectionCreateAnswerError(error);
                },{
                    "mandatory": {
                        "MozDontOfferDataChannel": true
                    }
                }); 
            } 
        }
        else {
            console.error("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): RTCPeerConnection bad state!");
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();      
    }
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {String} error  SDP error
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionSetRemoteDescriptionError=function(error){
    try
    { 
        console.error("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError():error="+error);
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): this.peerConnectionState="+this.peerConnectionState);
        throw "WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError():error="+error;
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();      
    }
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection open event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionOnOpenEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): event="+event); 
    var peerConnection = event.currentTarget;
    console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen():this.peerConnection.readyState="+peerConnection.readyState);   
    console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): this.peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): this.peerConnection.iceState="+peerConnection.iceState); 
    console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): this.peerConnectionState="+this.peerConnectionState);
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection open event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionStateChangeEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionStateChange(): event="+event);
    var peerConnection = event.currentTarget;
    console.debug("WebRtcCommCall:processRtcPeerConnectionStateChange(): peerConnection.readyState="+peerConnection.readyState);   
    console.debug("WebRtcCommCall:processRtcPeerConnectionStateChange(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionStateChange(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("WebRtcCommCall:processRtcPeerConnectionStateChange(): this.peerConnectionState="+this.peerConnectionState);
    if(peerConnection && peerConnection.readyState=='closed') this.peerConnection=null;
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection ICE negociation Needed event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionIceNegotationNeededEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded():event="+event);
    var peerConnection = event.currentTarget;
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded(): this.peerConnection.readyState="+peerConnection.readyState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded(): this.peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded(): this.peerConnection.iceState="+peerConnection.iceState); 
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded(): this.peerConnectionState="+this.peerConnectionState);
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection ICE change event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionGatheringChangeEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange():event="+event);
    var peerConnection = event.currentTarget;
    console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): peerConnection.readyState="+peerConnection.readyState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): this.peerConnectionState="+this.peerConnectionState);
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection open event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionIceChangeEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange():event="+event); 
    var peerConnection = event.currentTarget;
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange(): peerConnection.readyState="+peerConnection.readyState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange(): this.peerConnectionState="+this.peerConnectionState);
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection identity event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionIdentityResultEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult():event="+event);
    var peerConnection = event.currentTarget; 
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): peerConnection.readyState="+peerConnection.readyState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): this.peerConnectionState="+this.peerConnectionState);
}



