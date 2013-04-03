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
        this.dataChannel=undefined;
    }
    else 
    {
        throw "WebRtcCommCall:WebRtcCommCall(): bad arguments"      
    }
};

/**
 * Audio Codec Name 
 * @private
 * @constant
 */ 
WebRtcCommCall.prototype.codecNames={
    0:"PCMU", 
    8:"PCMA"
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
 * <span style="margin-left: 30px">audioCodecsFilter:PCMA,PCMU,OPUS,<br></span>
 * <span style="margin-left: 30px">videoCodecsFilter:VP8,H264,<br></span>
 * }<br>
 * </p>
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception internal error
 */ 
WebRtcCommCall.prototype.open=function(calleePhoneNumber, configuration){
    console.debug("WebRtcCommCall:open():calleePhoneNumber="+calleePhoneNumber);
    console.debug("WebRtcCommCall:open():configuration="+ JSON.stringify(configuration));
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
                        var mediaContraints = {
                            'mandatory':
                            {
                                'OfferToReceiveAudio':this.configuration.audioMediaFlag, 
                                'OfferToReceiveVideo':this.configuration.videoMediaFlag
                            }
                        };
                        
                        if(this.configuration.dataMediaFlag)
                        {
                            if(this.peerConnection.createDataChannel) 
                            {
                                try
                                {
                                this.dataChannel = this.peerConnection.createDataChannel("dataChannel",{}); 
                                }
                                catch(exception)
                                {
                                   alert("Data Channel not supported") 
                                }
                            }
                        }
                        
                        if(window.webkitRTCPeerConnection)
                        {
                            
                            this.peerConnection.createOffer(function(offer) {
                                that.processRtcPeerConnectionCreateOfferSuccess(offer);
                            }, function(error) {
                                that.processRtcPeerConnectionCreateOfferError(error);
                            },mediaContraints); 
                        }
                        else if(window.mozRTCPeerConnection)
                        {
                            this.peerConnection.createOffer(function(offer) {
                                that.processRtcPeerConnectionCreateOfferSuccess(offer);
                            }, function(error) {
                                that.processRtcPeerConnectionCreateOfferError(error);
                            },mediaContraints); 
                        } 
                        console.debug("WebRtcCommCall:open():mediaContraints="+ JSON.stringify(mediaContraints));
                    }
                    catch(exception){
                        console.error("WebRtcCommCall:open(): catched exception:"+exception);
                        setTimeout(function(){
                            try {
                                that.webRtcCommClient.eventListener.onWebRtcCommCallOpenErrorEvent(that,exception);
                            }
                            catch(exception)
                            {
                                console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenErrorEvent(): catched exception in listener:"+exception);    
                            }
                        },1);
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
            if(this.peerConnection && this.peerConnection.signalingState!='closed') 
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
 * <p> Communication configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">displayName:alice,<br></span>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audioMediaFlag:true,<br></span>
 * <span style="margin-left: 30px">videoMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">dataMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">audioCodecsFilter:PCMA,PCMU,OPUS,<br></span>
 * <span style="margin-left: 30px">videoCodecsFilter:VP8,H264,<br></span>
 * }<br>
 * </p>
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */ 
WebRtcCommCall.prototype.accept =function(configuration){
    console.debug("WebRtcCommCall:accept():configuration="+ JSON.stringify(configuration));
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
                            sdpOffer = new mozRTCSessionDescription({
                                type: 'offer',
                                sdp: this.remoteSdpOffer
                            });
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
 * Mute local audio media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */ 
WebRtcCommCall.prototype.muteLocalAudioMediaStream =function(){
    console.debug("WebRtcCommCall:muteLocalAudioMediaStream()");
    if(this.configuration.localMediaStream && this.configuration.localMediaStream.signalingState==this.configuration.localMediaStream.LIVE)
    {
        var audioTracks = undefined;
        if(this.configuration.localMediaStream.audioTracks) audioTracks=this.configuration.localMediaStream.audioTracks;
        else if(this.configuration.localMediaStream.getAudioTracks) audioTracks=this.configuration.localMediaStream.getAudioTracks();
        if(audioTracks)
        {
            for(var i=0; i<audioTracks.length;i++)
            {
                audioTracks[i].enabled=false;
            }                  
        } 
        else
        {
            console.error("WebRtcCommCall:muteLocalAudioMediaStream(): not implemented by navigator");
            throw "WebRtcCommCall:muteLocalAudioMediaStream(): not implemented by navigator";  
        }
    }
    else
    {   
        console.error("WebRtcCommCall:muteLocalAudioMediaStream(): bad state, unauthorized action");
        throw "WebRtcCommCall:muteLocalAudioMediaStream(): bad state, unauthorized action";    
    }
}

/**
 * Unmute local audio media stream
 * @public 
 */ 
WebRtcCommCall.prototype.unmuteLocalAudioMediaStream =function(){
    console.debug("WebRtcCommCall:unmuteLocalAudioMediaStream()");
    if(this.configuration.localMediaStream && this.configuration.localMediaStream.signalingState==this.configuration.localMediaStream.LIVE)
    {
        var audioTracks = undefined;
        if(this.configuration.localMediaStream.audioTracks) audioTracks=this.configuration.localMediaStream.audioTracks;
        else if(this.configuration.localMediaStream.getAudioTracks) audioTracks=this.configuration.localMediaStream.getAudioTracks();
        if(audioTracks)
        {
            for(var i=0; i<audioTracks.length;i++)
            {
                audioTracks[i].enabled=true;
            }                  
        }   
        else
        {
            console.error("WebRtcCommCall:unmuteLocalAudioMediaStream(): not implemented by navigator");
            throw "WebRtcCommCall:unmuteLocalAudioMediaStream(): not implemented by navigator";  
        }
    } 
    else
    {   
        console.error("WebRtcCommCall:unmuteLocalAudioMediaStream(): bad state, unauthorized action");
        throw "WebRtcCommCall:unmuteLocalAudioMediaStream(): bad state, unauthorized action";    
    }
}

/**
 * Mute remote audio media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */ 
WebRtcCommCall.prototype.muteRemoteAudioMediaStream =function(){
    console.debug("WebRtcCommCall:muteRemoteAudioMediaStream()");
    if(this.remoteMediaStream && this.remoteMediaStream.signalingState==this.remoteMediaStream.LIVE)
    {
        var audioTracks = undefined;
        if(this.remoteMediaStream.audioTracks) audioTracks=this.remoteMediaStream.audioTracks;
        else if(this.remoteMediaStream.getAudioTracks) audioTracks=this.remoteMediaStream.getAudioTracks();
        if(audioTracks)
        {
            for(var i=0; i<audioTracks.length;i++)
            {
                audioTracks[i].enabled=false;
            }                  
        } 
        else
        {
            console.error("WebRtcCommCall:muteRemoteAudioMediaStream(): not implemented by navigator");
            throw "WebRtcCommCall:muteRemoteAudioMediaStream(): not implemented by navigator";  
        }
    }
    else
    {   
        console.error("WebRtcCommCall:muteRemoteAudioMediaStream(): bad state, unauthorized action");
        throw "WebRtcCommCall:muteRemoteAudioMediaStream(): bad state, unauthorized action";    
    }
}

/**
 * Unmute remote audio media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */ 
WebRtcCommCall.prototype.unmuteRemoteAudioMediaStream =function(){
    console.debug("WebRtcCommCall:unmuteRemoteAudioMediaStream()");
    if(this.remoteMediaStream && this.remoteMediaStream.signalingState==this.remoteMediaStream.LIVE)
    {
        var audioTracks = undefined;
        if(this.remoteMediaStream.audioTracks) audioTracks=this.remoteMediaStream.audioTracks;
        else if(this.remoteMediaStream.getAudioTracks) audioTracks=this.remoteMediaStream.getAudioTracks();
        if(audioTracks)
        {
            for(var i=0; i<audioTracks.length;i++)
            {
                audioTracks[i].enabled=true;
            }                  
        }   
        else
        {
            console.error("WebRtcCommCall:unmuteRemoteAudioMediaStream(): not implemented by navigator");
            throw "WebRtcCommCall:unmuteRemoteAudioMediaStream(): not implemented by navigator";  
        }
    } 
    else
    {   
        console.error("WebRtcCommCall:unmuteRemoteAudioMediaStream(): bad state, unauthorized action");
        throw "WebRtcCommCall:unmuteRemoteAudioMediaStream(): bad state, unauthorized action";    
    }
}

/**
 * Hide local video media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */ 
WebRtcCommCall.prototype.hideLocalVideoMediaStream =function(){
    console.debug("WebRtcCommCall:hideLocalVideoMediaStream()");
    if(this.configuration.localMediaStream && this.configuration.localMediaStream.signalingState==this.configuration.localMediaStream.LIVE)
    {
        var videoTracks = undefined;
        if(this.configuration.localMediaStream.videoTracks) videoTracks=this.configuration.localMediaStream.videoTracks;
        else if(this.configuration.localMediaStream.getVideoTracks) videoTracks=this.configuration.localMediaStream.getVideoTracks();
        if(videoTracks)
        {
            videoTracks.enabled= !videoTracks.enabled;
            for(var i=0; i<videoTracks.length;i++)
            {
                videoTracks[i].enabled=false;
            }                  
        }  
        else
        {
            console.error("WebRtcCommCall:hideLocalVideoMediaStream(): not implemented by navigator");
            throw "WebRtcCommCall:hideLocalVideoMediaStream(): not implemented by navigator";  
        }
    } 
    else
    {   
        console.error("WebRtcCommCall:hideLocalVideoMediaStream(): bad state, unauthorized action");
        throw "WebRtcCommCall:hideLocalVideoMediaStream(): bad state, unauthorized action";    
    }
}

/**
 * Show local video media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */ 
WebRtcCommCall.prototype.showLocalVideoMediaStream =function(){
    console.debug("WebRtcCommCall:showLocalVideoMediaStream()");
    if(this.configuration.localMediaStream && this.configuration.localMediaStream.signalingState==this.configuration.localMediaStream.LIVE)
    {
        var videoTracks = undefined;
        if(this.configuration.localMediaStream.videoTracks) videoTracks=this.configuration.localMediaStream.videoTracks;
        else if(this.configuration.localMediaStream.getVideoTracks) videoTracks=this.configuration.localMediaStream.getVideoTracks();
        if(videoTracks)
        {
            videoTracks.enabled= !videoTracks.enabled;
            for(var i=0; i<videoTracks.length;i++)
            {
                videoTracks[i].enabled=true;
            }                  
        }  
        else
        {
            console.error("WebRtcCommCall:showLocalVideoMediaStream(): not implemented by navigator");
            throw "WebRtcCommCall:showLocalVideoMediaStream(): not implemented by navigator";  
        }
    }
    else
    {   
        console.error("WebRtcCommCall:showLocalVideoMediaStream(): bad state, unauthorized action");
        throw "WebRtcCommCall:showLocalVideoMediaStream(): bad state, unauthorized action";    
    }
}


/**
 * Hide remote video media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */ 
WebRtcCommCall.prototype.hideRemoteVideoMediaStream =function(){
    console.debug("WebRtcCommCall:hideRemoteVideoMediaStream()");
    if(this.remoteMediaStream && this.remoteMediaStream.signalingState==this.remoteMediaStream.LIVE)
    {
        var videoTracks = undefined;
        if(this.remoteMediaStream.videoTracks) videoTracks=this.remoteMediaStream.videoTracks;
        else if(this.remoteMediaStream.getVideoTracks) videoTracks=this.remoteMediaStream.getVideoTracks();      
        if(videoTracks)
        {
            videoTracks.enabled= !videoTracks.enabled;
            for(var i=0; i<videoTracks.length;i++)
            {
                videoTracks[i].enabled=false;
            }                  
        }  
        else
        {
            console.error("WebRtcCommCall:hideRemoteVideoMediaStream(): not implemented by navigator");
            throw "WebRtcCommCall:hideRemoteVideoMediaStream(): not implemented by navigator";  
        }
    } 
    else
    {   
        console.error("WebRtcCommCall:hideRemoteVideoMediaStream(): bad state, unauthorized action");
        throw "WebRtcCommCall:hideRemoteVideoMediaStream(): bad state, unauthorized action";    
    }
}

/**
 * Show remote video media stream
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "not implemented by navigator"
 */ 
WebRtcCommCall.prototype.showRemoteVideoMediaStream =function(){
    console.debug("WebRtcCommCall:showRemoteVideoMediaStream()");
    if(this.remoteMediaStream && this.remoteMediaStream.signalingState==this.remoteMediaStream.LIVE)
    {
        var videoTracks = undefined;
        if(this.remoteMediaStream.videoTracks) videoTracks=this.remoteMediaStream.videoTracks;
        else if(this.remoteMediaStream.getVideoTracks) videoTracks=this.remoteMediaStream.getVideoTracks();
        if(videoTracks)
        {
            videoTracks.enabled= !videoTracks.enabled;
            for(var i=0; i<videoTracks.length;i++)
            {
                videoTracks[i].enabled=true;
            }                  
        }  
        else
        {
            console.error("WebRtcCommCall:showRemoteVideoMediaStream(): not implemented by navigator");
            throw "WebRtcCommCall:showRemoteVideoMediaStream(): not implemented by navigator";  
        }
    }
    else
    {   
        console.error("WebRtcCommCall:showRemoteVideoMediaStream(): bad state, unauthorized action");
        throw "WebRtcCommCall:showRemoteVideoMediaStream(): bad state, unauthorized action";    
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
    // displayName, audioCodecsFilter, videoCodecsFilter NOT mandatoty in configuration
            
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
    
    var rtcPeerConnectionMediaConstraints = {
        'mandatory':
        {
            'OfferToReceiveAudio':this.configuration.audioMediaFlag, 
            'OfferToReceiveVideo':this.configuration.videoMediaFlag
        }
    };
                        
    if(window.webkitRTCPeerConnection)
    {
        this.peerConnection = new window.webkitRTCPeerConnection(rtcPeerConnectionConfiguration,rtcPeerConnectionMediaConstraints);
    }
    else if(window.mozRTCPeerConnection)
    {
        this.peerConnection = new window.mozRTCPeerConnection(rtcPeerConnectionConfiguration ,rtcPeerConnectionMediaConstraints);
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
    
    this.peerConnection.onopen= function(event) {
        that.onRtcPeerConnectionOnOpenEvent(event);
    }
     
    this.peerConnection.onidentityresult= function(event) {
        that.onRtcPeerConnectionIdentityResultEvent(event);
    }
    
    this.peerConnection.onnegotiationneeded= function(event) {
        that.onRtcPeerConnectionIceNegotiationNeededEvent(event);
    }
    
    this.peerConnection.ondatachannel= function(event) {
        that.onRtcPeerConnectionOnDataChannelEvent(event);
    }
    
    console.debug("WebRtcCommCall:createPeerConnection(): this.peerConnection="+JSON.stringify( this.peerConnection)); 
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
            sdpAnswer = new mozRTCSessionDescription({
                type: 'answer',
                sdp: remoteSdpAnswer
            });
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
                that.webRtcCommClient.eventListener.onWebRtcCommCallRingingEvent(that);
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
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): event="+event); 
        if(this.peerConnection)
        {           
            console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): this.peerConnection.signalingState="+ this.peerConnection.signalingState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): this.peerConnection.iceGatheringState="+ this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): this.peerConnection.iceConnectionState="+ this.peerConnection.iceConnectionState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): this.peerConnectionState="+this.peerConnectionState);
            this.remoteMediaStream = event.stream;
        }
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): event ignored");        
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
        console.debug("WebRtcCommCall:onRtcPeerConnectionOnRemoveStreamEvent(): event="+event); 
        if(this.peerConnection)
        {           
            console.debug("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): this.peerConnection.signalingState="+this.peerConnection.signalingState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): this.peerConnectionState="+this.peerConnectionState);
            this.remoteMediaStream = undefined;
        }
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionOnRemoveStream(): event ignored");        
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
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): rtcIceCandidateEvent="+JSON.stringify(rtcIceCandidateEvent.candidate));
        if(this.peerConnection)
        {           
            console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): this.peerConnectionState="+this.peerConnectionState);
            if(this.peerConnection.signalingState != 'closed')
            {
                if(this.peerConnection.iceGatheringState=="complete")
                {
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
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): event ignored");        
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
 * @param {RTCSessionDescription} sdpOffer  RTCPeerConnection SDP offer event
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionCreateOfferSuccess=function(sdpOffer){ 
    try
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): sdpOffer="+JSON.stringify(sdpOffer)); 
        if(this.peerConnection)
        {
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): this.peerConnectionState="+this.peerConnectionState);

            if (this.peerConnectionState == 'new') 
            {
                // Preparing offer.
                var that=this;
                this.peerConnectionState = 'preparing-offer';
                var sdpOfferString=sdpOffer.sdp;
                if(this.configuration.audioCodecsFilter || this.configuration.videoCodecsFilter)
                {
                    try
                    {
                        // Apply audio/video codecs filter to RTCPeerConnection SDP offer to
                        var sdpParser = new SDPParser();
                        var parsedSdpOffer = sdpParser.parse(sdpOfferString);
                        this.applyConfiguredCodecFilterOnSessionDescription(parsedSdpOffer, this.configuration.audioCodecsFilter);
                        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): parsedSdpOffer="+parsedSdpOffer);
                        sdpOffer.sdp=parsedSdpOffer;
                    }
                    catch(exception)
                    {
                        console.error("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): configured codec filtering has failded, use inital RTCPeerConnection SDP offer");
                    }
                }
            
                this.peerConnectionLocalDescription=sdpOffer;
                this.peerConnection.setLocalDescription(sdpOffer, function() {
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
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): event ignored");        
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionCreateOfferSuccess(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError(); 
    }
}

/**
 * Implementation of the RTCPeerConnection listener interface: handle RTCPeerConnection state machine
 * @private
 */ 
WebRtcCommCall.prototype.processRtcPeerConnectionCreateOfferError=function(error){
    try
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionCreateOfferError():error="+JSON.stringify(error)); 
        if(this.peerConnection)
        {
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): this.peerConnectionState="+this.peerConnectionState);
            throw "WebRtcCommCall:processRtcPeerConnectionCreateOfferError():error="+error; 
        }
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionCreateOfferError(): event ignored");        
        }
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
        if(this.peerConnection)
        {
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): this.peerConnectionState="+this.peerConnectionState);

            if(window.mozRTCPeerConnection)
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
                                console.error("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): catched exception in listener:"+exception);    
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
                    console.error("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): RTCPeerConnection bad state!");
                }      
            }
        }
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionSuccess(): event ignored");        
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
        console.error("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError():error="+JSON.stringify(error)); 
        if(this.peerConnection)
        {
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): this.peerConnectionState="+this.peerConnectionState);
            throw "WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError():error="+error;
        }
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionSetLocalDescriptionError(): event ignored");        
        }
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
        console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess():answer="+JSON.stringify(answer)); 
        if(this.peerConnection)
        {
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
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
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionCreateAnswerSuccess(): event ignored");        
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
    console.error("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError():error="+JSON.stringify(error));
    try
    {
        if(this.peerConnection)
        {
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): this.peerConnectionState="+this.peerConnectionState);
        }
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionCreateAnswerError(): event ignored");        
        }
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
        console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess()");
        if(this.peerConnection)
        {
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
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
                            console.error("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): catched exception in listener:"+exception);    
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
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionSuccess(): event ignored");        
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
        console.error("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError():error="+JSON.stringify(error));
        if(this.peerConnection)
        {
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
            console.debug("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): this.peerConnectionState="+this.peerConnectionState);
            throw "WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError():error="+error;
        }
        else
        {
            console.warn("WebRtcCommCall:processRtcPeerConnectionSetRemoteDescriptionError(): event ignored");        
        }
    }
    catch(exception)
    {
        this.processRtcPeerConnectionError(error);      
    }
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection open event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionOnOpenEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): event="+event); 
    if(this.peerConnection)
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): this.peerConnection.signalingState="+this.peerConnection.signalingState);   
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): this.peerConnection.signalingState="+this.peerConnection.signalingState);   
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionOnOpen(): this.peerConnectionState="+this.peerConnectionState);
    }
    else
    {
        console.warn("WebRtcCommCall:processRtcPeerConnectionOnOpen(): event ignored");        
    }
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection open event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionStateChangeEvent=function(event){
    console.debug("WebRtcCommCall:onRtcPeerConnectionStateChangeEvent(): event="+event); 
    if(this.peerConnection)
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionStateChange(): this.peerConnection.signalingState="+this.peerConnection.signalingState);   
        console.debug("WebRtcCommCall:processRtcPeerConnectionStateChange(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionStateChange(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionStateChange(): this.peerConnectionState="+this.peerConnectionState);
        if(this.peerConnection && this.peerConnection.signalingState=='closed') this.peerConnection=null;
    }
    else
    {
        console.warn("WebRtcCommCall:processRtcPeerConnectionStateChange(): event ignored");        
    }
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection ICE negociation Needed event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionIceNegotiationNeededEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded():event="+event);
    if(this.peerConnection)
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded(): this.peerConnectionState="+this.peerConnectionState);
    }
    else
    {
        console.warn("WebRtcCommCall:processRtcPeerConnectionIceNegotationNeeded(): event ignored");        
    }
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection ICE change event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionGatheringChangeEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange():event="+event);
    if(this.peerConnection)
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): this.peerConnectionState="+this.peerConnectionState);
    
        if(this.peerConnection.signalingState != 'closed')
        {
            if(this.peerConnection.iceGatheringState=="complete")
            {
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
                                    console.error("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): catched exception in listener:"+exception);    
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
                        console.error("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): RTCPeerConnection bad state!");
                    }
                }
            }
        }
        else
        {
            console.error("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): RTCPeerConnection closed!");
        }
    }
    else
    {
        console.warn("WebRtcCommCall:processRtcPeerConnectionGatheringChange(): event ignored");        
    }
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection open event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionIceChangeEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange():event="+event); 
    if(this.peerConnection)
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionIceChange(): this.peerConnectionState="+this.peerConnectionState);
    }
    else
    {
        console.warn("WebRtcCommCall:processRtcPeerConnectionIceChange(): event ignored");        
    }
}

/**
 * RTCPeerConnection listener implementation
 * @private
 * @param {Event} event  RTCPeerConnection identity event
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionIdentityResultEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult():event="+event);
    if(this.peerConnection)
    {
        console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
        console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): this.peerConnectionState="+this.peerConnectionState);
    }
    else
    {
        console.warn("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): event ignored");        
    }
}

/**
  * RTCPeerConnection listener implementation
  * @private
  * @param {Event} event  RTCPeerConnection data channel event
  */ 
WebRtcCommCall.prototype.onRtcPeerConnectionOnDataChannelEvent=function(event){
    console.debug("WebRtcCommCall:onRtcPeerConnectionOnDataChannelEvent():event="+event);
    if(this.peerConnection)
    {
        console.debug("WebRtcCommCall:onRtcPeerConnectionOnDataChannelEvent(): this.peerConnection.signalingState="+this.peerConnection.signalingState);
        console.debug("WebRtcCommCall:onRtcPeerConnectionOnDataChannelEvent(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("WebRtcCommCall:onRtcPeerConnectionOnDataChannelEvent(): this.peerConnection.iceConnectionState="+this.peerConnection.iceConnectionState); 
        console.debug("WebRtcCommCall:onRtcPeerConnectionOnDataChannelEvent(): this.peerConnectionState="+this.peerConnectionState);
    }
    else
    {
        console.warn("WebRtcCommCall:onRtcPeerConnectionOnDataChannelEvent(): event ignored");        
    }
}

/**
  * Modifiy SDP based on configured codec filter
  * @private
  * @param {SessionDescription} sessionDescription  JAIN (gov.nist.sdp) SDP offer object 
  */ 
WebRtcCommCall.prototype.applyConfiguredCodecFilterOnSessionDescription=function(sessionDescription){ 
    if(sessionDescription instanceof SessionDescription)
    {
        try
        {
            console.debug("WebRtcCommCall:applyConfiguredCodecFilterOnSessionDescription(): sessionDescription="+sessionDescription); 
            // Deep copy the media descriptions
            var mediaDescriptions = sessionDescription.getMediaDescriptions(false);
            for (var i = 0; i <  mediaDescriptions.length; i++) 
            {
                var mediaDescription = mediaDescriptions[i];
                var mediaField = mediaDescription.getMedia();
                var mediaType = mediaField.getType();
                if(mediaType=="audio" &&  this.configuration.audioCodecsFilter)
                {
                    var offeredAudioCodecs = this.getOfferedCodecsInMediaDescription(mediaDescription);
                    // Filter offered codec
                    var splitAudioCodecsFilters = (this.configuration.audioCodecsFilter).split(",");
                    this.applyCodecFiltersOnOfferedCodecs(offeredAudioCodecs, splitAudioCodecsFilters);
                    // Apply modification on audio media description
                    this.updateMediaDescription(mediaDescription, offeredAudioCodecs, splitAudioCodecsFilters);
                }
                else if(mediaType=="video" && this.configuration.videoCodecsFilter)
                {
                    var offeredVideoCodecs = this.getOfferedCodecsInMediaDescription(mediaDescription); 
                    // Filter offered codec
                    var splitVideoCodecFilter = (this.configuration.videoCodecsFilter).split(",");
                    this.applyCodecFiltersOnOfferedCodecs(offeredVideoCodecs, splitVideoCodecFilter);
                    // Apply modification on video media description
                    this.updateMediaDescription(mediaDescription, offeredVideoCodecs, splitVideoCodecFilter);
                }
            }
        }
        catch(exception)
        {
            console.error("WebRtcCommCall:applyConfiguredCodecFilterOnSessionDescription(): catched exception, exception:"+exception);
            throw exception;
        }
    }
    else 
    {
        throw "WebRtcCommCall:applyConfiguredCodecFilterOnSessionDescription(): bad arguments"      
    }
}

/**
 * Get offered codecs in media description
 * @private
 * @param {MediaDescription} mediaDescription  JAIN (gov.nist.sdp) MediaDescription object 
 * @return offeredCodec JSON object { "0":"PCMU", "111":"OPUS", .....} 
 */ 
WebRtcCommCall.prototype.getOfferedCodecsInMediaDescription=function(mediaDescription){ 
    if(mediaDescription instanceof MediaDescription)
    {
        var mediaFormats = mediaDescription.getMedia().getFormats(false);
        var foundCodecs = {};
                    
        // Set static payload type and codec name
        for(var j = 0; j <  mediaFormats.length; j++) 
        {
            var payloadType = mediaFormats[j];
            console.debug("WebRtcCommCall:getOfferedCodecsInMediaDescription(): payloadType="+payloadType); 
            console.debug("WebRtcCommCall:getOfferedCodecsInMediaDescription(): this.codecNames[payloadType]="+this.codecNames[payloadType]); 
            foundCodecs[payloadType]=this.codecNames[payloadType];
        }
                    
        // Set dynamic payload type and codec name 
        var attributFields = mediaDescription.getAttributes();
        for(var k = 0; k <  attributFields.length; k++) 
        {
            var attributField = attributFields[k];
            console.debug("WebRtcCommCall:getOfferedCodecsInMediaDescription(): attributField.getName()="+attributField.getName()); 
            if(attributField.getName()=="rtpmap")
            {
                try
                {
                    var rtpmapValue = attributField.getValue(); 
                    var splitRtpmapValue = rtpmapValue.split(" ");
                    var payloadType = splitRtpmapValue[0];
                    var codecInfo = splitRtpmapValue[1];
                    var splittedCodecInfo = codecInfo.split("/");
                    var codecName = splittedCodecInfo[0];
                    foundCodecs[payloadType]=codecName.toUpperCase();
                    console.debug("WebRtcCommCall:getOfferedCodecsInMediaDescription(): payloadType="+payloadType); 
                    console.debug("WebRtcCommCall:getOfferedCodecsInMediaDescription(): codecName="+codecName); 
                }
                catch(exception)
                {
                    console.error("WebRtcCommCall:getOfferedCodecsInMediaDescription(): rtpmap/fmtp format not supported");  
                }
            }
        }
        return foundCodecs;
    }
    else 
    {
        throw "WebRtcCommCall:getOfferedCodecsInMediaDescription(): bad arguments"      
    }
}

/**
 * Get offered codec list
 * @private
 * @param {JSON object} foundCodecs  
 * @param {Array} codecFilters  
 */ 
WebRtcCommCall.prototype.applyCodecFiltersOnOfferedCodecs=function(foundCodecs, codecFilters){ 
    if(typeof(foundCodecs)=='object' && codecFilters instanceof Array)
    {
        for(var offeredMediaCodecPayloadType in foundCodecs){
            var filteredFlag=false;
            for(var i=0; i<codecFilters.length;i++ )
            {
                if ( foundCodecs[offeredMediaCodecPayloadType] == codecFilters[i] ) { 
                    filteredFlag=true;
                    break;
                } 
            }
            if(filteredFlag==false)
            {
                delete(foundCodecs[offeredMediaCodecPayloadType]);     
            }
        }
    }
    else 
    {
        throw "WebRtcCommCall:applyCodecFiltersOnOfferedCodecs(): bad arguments"      
    }
}

/**
 * Update offered media description avec configured filters
 * @private
 * @param {MediaDescription} mediaDescription  JAIN (gov.nist.sdp) MediaDescription object 
 * @param {JSON object} filteredCodecs 
 * @param {Array} codecFilters  
 */ 
WebRtcCommCall.prototype.updateMediaDescription=function(mediaDescription, filteredCodecs, codecFilters){ 
    if(mediaDescription instanceof MediaDescription  && typeof(filteredCodecs)=='object' && codecFilters instanceof Array)
    {
        // Build new media field format lis
        var newFormatListArray=new Array();
        for(var i=0;i<codecFilters.length;i++)
        {
            for(var offeredCodecPayloadType in filteredCodecs)
            {
                if (filteredCodecs[offeredCodecPayloadType] == codecFilters[i] ) { 
                    newFormatListArray.push(offeredCodecPayloadType);
                    break;
                } 
            }
        }
        mediaDescription.getMedia().setFormats(newFormatListArray);
        // Remove obsolte rtpmap attributs 
        var newAttributeFieldArray=new Array();
        var attributFields = mediaDescription.getAttributes();
        for(var k = 0; k <  attributFields.length; k++) 
        {
            var attributField = attributFields[k];
            console.debug("WebRtcCommCall:updateMediaDescription(): attributField.getName()="+attributField.getName()); 
            if(attributField.getName()=="rtpmap" || attributField.getName()=="fmtp")
            {
                try
                {
                    var rtpmapValue = attributField.getValue(); 
                    var splitedRtpmapValue = rtpmapValue.split(" ");
                    var payloadType = splitedRtpmapValue[0];
                    if(filteredCodecs[payloadType]!=undefined) 
                        newAttributeFieldArray.push(attributField);
                }
                catch(exception)
                {
                    console.error("WebRtcCommCall:updateMediaDescription(): rtpmap/fmtp format not supported");  
                }
            }
            else newAttributeFieldArray.push(attributField);
        }
        mediaDescription.setAttributes(newAttributeFieldArray);
    }
    else 
    {
        throw "WebRtcCommCall:updateMediaDescription(): bad arguments"      
    }
}