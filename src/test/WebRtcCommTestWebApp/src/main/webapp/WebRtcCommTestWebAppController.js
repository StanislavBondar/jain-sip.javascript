/**
 * Class WebRtcCommTestWebAppController
 * @public 
 */ 

navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;
/**
 * Constructor 
 */ 
function WebRtcCommTestWebAppController(view) {
    console.debug("WebRtcCommTestWebAppController:WebRtcCommTestWebAppController()")
    //  WebRtcComm client 
    this.view=view;
    this.webRtcCommClient=new WebRtcCommClient(this); 
    this.webRtcCommClientConfiguration=undefined;
    this.localAudioVideoMediaStream=undefined;
    this.webRtcCommCall=undefined;
    this.sipContact=WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_CONTACT;
}

WebRtcCommTestWebAppController.prototype.constructor=WebRtcCommTestWebAppController;

// Default SIP profile to use
/*WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_OUTBOUND_PROXY="ws://10.194.124.24:80";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_USER_AGENT="WebRtcCommTestWebApp/0.0.1" 
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_USER_AGENT_CAPABILITIES=undefined // +g.oma.sip-im
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_DOMAIN="webrtc.orange.com";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_DISPLAY_NAME="alice";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_USER_NAME="alice";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_LOGIN=undefined;
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_PASSWORD=undefined;
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_CONTACT="bob";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_REGISTER_MODE=true;
WebRtcCommTestWebAppController.prototype.DEFAULT_STUN_SERVER="10.194.124.24:3478"; // stun.l.google.com:19302
WebRtcCommTestWebAppController.prototype.DEFAULT_AUDIO_CODECS_FILTER=undefined; // RTCPeerConnection default codec filter
WebRtcCommTestWebAppController.prototype.DEFAULT_VIDEO_CODECS_FILTER=undefined; // RTCPeerConnection default codec filter
WebRtcCommTestWebAppController.prototype.DEFAULT_LOCAL_VIDEO_FORMAT="{\"mandatory\": {\"maxWidth\": 500}}"*/

WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_OUTBOUND_PROXY="ws://10.194.70.190:9080/sip";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_USER_AGENT="WebRtcCommTestWebApp/0.0.1" 
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_USER_AGENT_CAPABILITIES=undefined // +g.oma.sip-im
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_DOMAIN="sip.test.com";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_DISPLAY_NAME="alice";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_USER_NAME="alice";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_LOGIN=undefined;
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_PASSWORD=undefined;
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_CONTACT="bob";
WebRtcCommTestWebAppController.prototype.DEFAULT_SIP_REGISTER_MODE=true;
WebRtcCommTestWebAppController.prototype.DEFAULT_STUN_SERVER=undefined; // stun.l.google.com:19302
WebRtcCommTestWebAppController.prototype.DEFAULT_AUDIO_CODECS_FILTER=undefined; // RTCPeerConnection default codec filter
WebRtcCommTestWebAppController.prototype.DEFAULT_VIDEO_CODECS_FILTER=undefined; // RTCPeerConnection default codec filter
WebRtcCommTestWebAppController.prototype.DEFAULT_LOCAL_VIDEO_FORMAT="{\"mandatory\": {\"maxWidth\": 500}}"
/**
 * on load event handler
 */ 
WebRtcCommTestWebAppController.prototype.onLoadViewEventHandler=function() 
{
    console.debug ("WebRtcCommTestWebAppController:onLoadViewEventHandler()");
        
    // Setup SIP default Profile
    this.webRtcCommClientConfiguration =  { 
        communicationMode:WebRtcCommClient.prototype.SIP,
        sip:{
            sipUserAgent:this.DEFAULT_SIP_USER_AGENT,
            sipOutboundProxy:this.DEFAULT_SIP_OUTBOUND_PROXY,
            sipDomain:this.DEFAULT_SIP_DOMAIN,
            sipDisplayName:this.DEFAULT_SIP_DISPLAY_NAME,
            sipUserName:this.DEFAULT_SIP_USER_NAME,
            sipLogin:this.DEFAULT_SIP_LOGIN,
            sipPassword:this.DEFAULT_SIP_PASSWORD,
            sipUserAgentCapabilities:this.DEFAULT_SIP_USER_AGENT_CAPABILITIES,
            sipRegisterMode:this.DEFAULT_SIP_REGISTER_MODE
        },
        RTCPeerConnection:
        {
            stunServer:this.DEFAULT_STUN_SERVER         
        }
    } 
    
    // Setup SIP overloaded profile configuration in request URL       
    if(this.view.location.search.length>0)
    {
        var argumentsString = this.view.location.search.substring(1);
        var arguments = argumentsString.split('&');
        if(arguments.length==0) arguments = [argumentsString];
        for(var i=0;i<arguments.length;i++)
        {   
            var argument = arguments[i].split("=");
            if("sipUserName"==argument[0])
            {
                this.webRtcCommClientConfiguration.sip.sipUserName =argument[1];
                if(this.webRtcCommClientConfiguration.sip.sipUserName=="") this.webRtcCommClientConfiguration.sip.sipUserName=undefined;
            } 
            else if("sipDomain"==argument[0])
            {
                this.webRtcCommClientConfiguration.sip.sipDomain =argument[1];
                if(this.webRtcCommClientConfiguration.sip.sipDomain=="") this.webRtcCommClientConfiguration.sip.sipDomain=undefined;
            } 
            else if("sipDisplayName"==argument[0])
            {
                this.webRtcCommClientConfiguration.sip.sipDisplayName =argument[1];
                if(this.webRtcCommClientConfiguration.sip.sipDisplayName=="") this.webRtcCommClientConfiguration.sip.sipDisplayName=undefined;
            } 
            else if("sipPassword"==argument[0])
            {
                this.webRtcCommClientConfiguration.sip.sipPassword =argument[1];
                if(this.webRtcCommClientConfiguration.sip.sipPassword=="") this.webRtcCommClientConfiguration.sip.sipPassword=undefined;
            } 
            else if("sipLogin"==argument[0])
            {
                this.webRtcCommClientConfiguration.sip.sipLogin =argument[1];
                if(this.webRtcCommClientConfiguration.sip.sipLogin=="") this.webRtcCommClientConfiguration.sip.sipLogin=undefined;
            }
            else if("sipContact"==argument[0])
            {
                this.sipContact =argument[1];
                if(this.webRtcCommClientConfiguration.sip.sipContact=="") this.webRtcCommClientConfiguration.sip.sipContact=undefined;
            }
        }
    }  
    this.initView();   
}


/**
 * on unload event handler
 */ 
WebRtcCommTestWebAppController.prototype.onUnloadViewEventHandler=function()
{
    console.debug ("WebRtcCommTestWebAppController:onUnloadViewEventHandler()"); 
    if(this.webRtcCommClient != undefined)
    {
        try
        {
            this.webRtcCommClient.close();  
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onUnloadViewEventHandler(): catched exception:"+exception);  
        }
    }    
}


WebRtcCommTestWebAppController.prototype.initView=function(){
    console.debug ("WebRtcCommTestWebAppController:initView()");  
    this.view.disableRejectCallButton();
    this.view.disableAcceptCallButton();
    this.view.disableCallButton();
    this.view.disableEndCallButton();
    this.view.disableCancelCallButton();
    this.view.disableDisconnectButton();
    this.view.disableConnectButton();
    this.view.checkSipRegisterMode();
    this.view.checkAudioMediaFlag();
    this.view.checkVideoMediaFlag();
    this.view.stopLocalVideo();
    this.view.hideLocalVideo();
    this.view.stopRemoteVideo();
    this.view.hideRemoteVideo();
    this.view.setStunServerTextInputValue(this.webRtcCommClientConfiguration.RTCPeerConnection.stunServer);
    this.view.setSipOutboundProxyTextInputValue(this.webRtcCommClientConfiguration.sip.sipOutboundProxy);
    this.view.setSipUserAgentCapabilitiesTextInputValue(this.webRtcCommClientConfiguration.sip.sipUserAgentCapabilities);
    this.view.setSipDomainTextInputValue(this.webRtcCommClientConfiguration.sip.sipDomain);
    this.view.setSipDisplayNameTextInputValue(this.webRtcCommClientConfiguration.sip.sipDisplayName);
    this.view.setSipUserNameTextInputValue(this.webRtcCommClientConfiguration.sip.sipUserName);
    this.view.setSipLoginTextInputValue(this.webRtcCommClientConfiguration.sip.sipLogin);
    this.view.setSipPasswordTextInputValue(this.webRtcCommClientConfiguration.sip.sipPassword);
    this.view.setSipContactTextInputValue(this.sipContact);
    this.view.setAudioCodecsFilterTextInputValue(WebRtcCommTestWebAppController.prototype.DEFAULT_AUDIO_CODECS_FILTER);
    this.view.setVideoCodecsFilterTextInputValue(WebRtcCommTestWebAppController.prototype.DEFAULT_VIDEO_CODECS_FILTER);
    this.view.setLocalVideoFormatTextInputValue(WebRtcCommTestWebAppController.prototype.DEFAULT_LOCAL_VIDEO_FORMAT)
    
    // Get local user media
    try
    {
        this.getLocalUserMedia(WebRtcCommTestWebAppController.prototype.DEFAULT_LOCAL_VIDEO_FORMAT)
    }
    catch(exception)
    {
        console.error("WebRtcCommTestWebAppController:onLoadEventHandler(): catched exception: "+exception);
        alert("WebRtcCommTestWebAppController:onLoadEventHandler(): catched exception: "+exception);
    }   
}
  
WebRtcCommTestWebAppController.prototype.getLocalUserMedia=function(videoContraints){
    console.debug ("WebRtcCommTestWebAppController:getLocalUserMedia():videoContraints="+JSON.stringify(videoContraints));  
    var that = this;
    this.view.stopLocalVideo();
    if(this.localAudioVideoMediaStream) this.localAudioVideoMediaStream.stop();
    if(navigator.getUserMedia)
    {
        // Google Chrome user agent
        navigator.getUserMedia({
            audio:true, 
            video: JSON.parse(videoContraints)
        }, function(localMediaStream) {
            that.onGetUserMediaSuccessEventHandler(localMediaStream);
        }, function(error) {
            that.onGetUserMediaErrorEventHandler(error);
        });
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onLoadEventHandler(): navigator doesn't implemement getUserMedia API")
        alert("WebRtcCommTestWebAppController:onLoadEventHandler(): navigator doesn't implemement getUserMedia API")     
    }
}  
    
/**
 * get user media success event handler (Google Chrome User agent)
 * @param localAudioVideoMediaStream object
 */ 
WebRtcCommTestWebAppController.prototype.onGetUserMediaSuccessEventHandler=function(localAudioVideoMediaStream) 
{
    try
    {
        console.debug("WebRtcCommTestWebAppController:onWebkitGetUserMediaSuccessEventHandler(): localAudioVideoMediaStream="+JSON.stringify(localAudioVideoMediaStream));
        this.localAudioVideoMediaStream=localAudioVideoMediaStream;
        this.localAudioVideoMediaStream.onended = function() {
            alert("this.localAudioVideoMediaStream.onended")
        }
        var audioTracks = undefined;
        if(this.localAudioVideoMediaStream.audioTracks) audioTracks=this.localAudioVideoMediaStream.audioTracks;
        else if(this.localAudioVideoMediaStream.getAudioTracks) audioTracks=this.localAudioVideoMediaStream.getAudioTracks();
        if(audioTracks)
        {
            console.debug("WebRtcCommTestWebAppController:onWebkitGetUserMediaSuccessEventHandler(): audioTracks="+JSON.stringify(audioTracks));
            for(var i=0; i<audioTracks.length;i++)
            {
                audioTracks[i].onmute = function() {
                    alert("videoTracks[i].onmute")
                };
                audioTracks[i].onunmute = function() {
                    alert("audioTracks[i].onunmute")
                }
                audioTracks[i].onended = function() {
                    alert("audioTracks[i].onended")
                }
            }             
            audioTracks.onmute = function() {
                alert("audioTracks.onmute")
            };
            audioTracks.onunmute = function() {
                alert("audioTracks.onunmute")
            }
            audioTracks.onended = function() {
                alert("audioTracks.onended")
            } 
        }
        else
        {
            alert("MediaStream Track  API not supported");
        }
        
        var videoTracks = undefined;
        if(this.localAudioVideoMediaStream.videoTracks) videoTracks=this.localAudioVideoMediaStream.videoTracks;
        else if(this.localAudioVideoMediaStream.getVideoTracks) videoTracks=this.localAudioVideoMediaStream.getVideoTracks();
        if(videoTracks)
        {
            console.debug("WebRtcCommTestWebAppController:onWebkitGetUserMediaSuccessEventHandler(): videoTracks="+JSON.stringify(videoTracks));
            for(var i=0; i<videoTracks.length;i++)
            {
                videoTracks[i].onmute = function() {
                    alert("videoTracks[i].onmute")
                };
                videoTracks[i].onunmute = function() {
                    alert("videoTracks[i].onunmute")
                }
                videoTracks[i].onended = function() {
                    alert("videoTracks[i].onended")
                }
            }
            videoTracks.onmute = function() {
                alert("videoTracks.onmute")
            };
            videoTracks.onunmute = function() {
                alert("videoTracks.onunmute")
            }
            videoTracks.onended = function() {
                alert("videoTracks.onended")
            }
        }
        
        this.view.playLocalVideo(this.localAudioVideoMediaStream);
        this.view.showLocalVideo();
        this.view.enableConnectButton();          
    }
    catch(exception)
    {
        console.debug("WebRtcCommTestWebAppController:onWebkitGetUserMediaSuccessEventHandler(): catched exception: "+exception);
    }
}           
 
WebRtcCommTestWebAppController.prototype.onGetUserMediaErrorEventHandler=function(error) 
{
    console.debug("WebRtcCommTestWebAppController:onGetUserMediaErrorEventHandler(): error="+error);
    alert("Failed to get local user media: error="+error);
}	
  
/**
 * on connect event handler
 */ 
WebRtcCommTestWebAppController.prototype.onChangeLocalVideoFormatViewEventHandler=function()
{
    console.debug ("WebRtcCommTestWebAppController:onChangeLocalVideoFormatViewEventHandler()");  
    // Get local user media
    try
    {
        this.getLocalUserMedia(this.view.getLocalVideoFormatTextInputValue());
    }
    catch(exception)
    {
        console.error("WebRtcCommTestWebAppController:onChangeLocalVideoFormatViewEventHandler(): catched exception: "+exception);
        alert("WebRtcCommTestWebAppController:onChangeLocalVideoFormatViewEventHandler(): catched exception: "+exception);
    }   
} 
/**
 * on connect event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickConnectButtonViewEventHandler=function()
{
    console.debug ("WebRtcCommTestWebAppController:onClickConnectButtonViewEventHandler()"); 
    if(this.webRtcCommClient != undefined)
    {
        try
        {
            this.webRtcCommClientConfiguration.RTCPeerConnection.stunServer= this.view.getStunServerTextInputValue();
            this.webRtcCommClientConfiguration.sip.sipOutboundProxy = this.view.getSipOutboundProxyTextInputValue();
            this.webRtcCommClientConfiguration.sip.sipUserAgentCapabilities = this.view.getSipUserAgentCapabilitiesTextInputValue();
            this.webRtcCommClientConfiguration.sip.sipDomain = this.view.getSipDomainTextInputValue();
            this.webRtcCommClientConfiguration.sip.sipDisplayName= this.view.getSipDisplayNameTextInputValue();
            this.webRtcCommClientConfiguration.sip.sipUserName = this.view.getSipUserNameTextInputValue();
            this.webRtcCommClientConfiguration.sip.sipLogin = this.view.getSipLoginTextInputValue();
            this.webRtcCommClientConfiguration.sip.sipPassword = this.view.getSipPasswordTextInputValue();
            this.webRtcCommClientConfiguration.sip.sipRegisterMode = this.view.getSipRegisterModeValue();
            this.webRtcCommClient.open(this.webRtcCommClientConfiguration); 
            this.view.disableConnectButton();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickConnectButtonViewEventHandler(): catched exception:"+exception)  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickConnectButtonViewEventHandler(): internal error");      
    }
}


/**
 * on disconnect event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickDisconnectButtonViewEventHandler=function()
{
    console.debug ("WebRtcCommTestWebAppController:onClickDisconnectButtonViewEventHandler()"); 
    if(this.webRtcCommClient != undefined)
    {
        try
        {
            this.webRtcCommClient.close();  
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickDisconnectButtonViewEventHandler(): catched exception:"+exception)  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickDisconnectButtonViewEventHandler(): internal error");      
    }
}

/**
 * on call event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickCallButtonViewEventHandler=function(calleePhoneNumber)
{
    console.debug ("WebRtcCommTestWebAppController:onClickCallButtonViewEventHandler()"); 
    if(this.webRtcCommCall == undefined)
    {
        try
        {
            var callConfiguration = {
                displayName:this.DEFAULT_SIP_DISPLAY_NAME,
                localMediaStream: this.localAudioVideoMediaStream,
                audioMediaFlag:this.view.getAudioMediaValue(),
                videoMediaFlag:this.view.getVideoMediaValue(),
                dataMediaFlag:this.view.getDataMediaValue(),
                audioCodecsFilter:this.view.getAudioCodecsFilterTextInputValue(),
                videoCodecsFilter:this.view.getVideoCodecsFilterTextInputValue()
            }
            this.webRtcCommCall = this.webRtcCommClient.call(calleePhoneNumber, callConfiguration);
            this.view.disableCallButton();
            this.view.disableDisconnectButton();
            this.view.enableCancelCallButton();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickCallButtonViewEventHandler(): catched exception:"+exception)  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickCallButtonViewEventHandler(): internal error");      
    }
}

/**
 * on call event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickCancelCallButtonViewEventHandler=function()
{
    console.debug ("WebRtcCommTestWebAppController:onClickCancelCallButtonViewEventHandler()"); 
    if(this.webRtcCommCall != undefined)
    {
        try
        {
            this.webRtcCommCall.close();
            this.view.disableCancelCallButton();
            this.view.stopRinging();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickCancelCallButtonViewEventHandler(): catched exception:"+exception)  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickCancelCallButtonViewEventHandler(): internal error");      
    }
}

/**
 * on call event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickEndCallButtonViewEventHandler=function()
{
    console.debug ("WebRtcCommTestWebAppController:onClickEndCallButtonViewEventHandler()"); 
    if(this.webRtcCommCall)
    {
        try
        {
            this.webRtcCommCall.close();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickEndCallButtonViewEventHandler(): catched exception:"+exception);
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickEndCallButtonViewEventHandler(): internal error");      
    }
}

/**
 * on accept event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickAcceptCallButtonViewEventHandler=function()
{
    console.debug ("WebRtcCommTestWebAppController:onClickAcceptCallButtonViewEventHandler()"); 
    if(this.webRtcCommCall)
    {
        try
        {
            var callConfiguration = {
                displayName:this.DEFAULT_SIP_DISPLAY_NAME,
                localMediaStream: this.localAudioVideoMediaStream,
                audioMediaFlag:this.view.getAudioMediaValue(),
                videoMediaFlag:this.view.getVideoMediaValue(),
                dataMediaFlag:false
            }
            this.webRtcCommCall.accept(callConfiguration);
            this.view.disableAcceptCallButton();
            this.view.disableRejectCallButton();
            this.view.enableEndCallButton();
            this.view.stopRinging();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickAcceptCallButtonViewEventHandler(): catched exception:"+exception);
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickAcceptCallButtonViewEventHandler(): internal error");      
    }
}

/**
 * on accept event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickRejectCallButtonViewEventHandler=function()
{
    console.debug ("WebRtcCommTestWebAppController:onClickRejectCallButtonViewEventHandler()"); 
    if(this.webRtcCommCall)
    {
        try
        {
            this.webRtcCommCall.reject();
            this.view.disableAcceptCallButton();
            this.view.disableRejectCallButton();
            this.view.enableCallButton();
            this.view.enableDisconnectButton();
            this.view.stopRinging();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickRejectCallButtonViewEventHandler(): catched exception:"+exception);  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickRejectCallButtonViewEventHandler(): internal error");      
    }
}

/**
 * on local audio mute event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickMuteLocalAudioButtonViewEventHandler=function(checked)
{
    console.debug ("WebRtcCommTestWebAppController:onClickMuteLocalAudioButtonViewEventHandler():checked="+checked);
    if(this.webRtcCommCall)
    {
        try
        {
            if(checked) this.webRtcCommCall.muteLocalAudioMediaStream();
            else this.webRtcCommCall.unmuteLocalAudioMediaStream();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickMuteLocalAudioButtonViewEventHandler(): catched exception:"+exception)  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickMuteLocalAudioButtonViewEventHandler(): internal error");      
    } 
}

/**
 * on local video hide event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickHideLocalVideoButtonViewEventHandler=function(checked)
{
    console.debug ("WebRtcCommTestWebAppController:onClickHideLocalVideoButtonViewEventHandler():checked="+checked);
    if(this.webRtcCommCall)
    {
        try
        {
            if(checked) this.webRtcCommCall.hideLocalVideoMediaStream();
            else this.webRtcCommCall.showLocalVideoMediaStream();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickHideLocalVideoButtonViewEventHandler(): catched exception:"+exception)  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickHideLocalVideoButtonViewEventHandler(): internal error");      
    }   
}

/**
 * on remote audio mute event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickMuteRemoteAudioButtonViewEventHandler=function(checked)
{
    console.debug ("WebRtcCommTestWebAppController:onClickMuteRemoteAudioButtonViewEventHandler():checked="+checked);
    if(this.webRtcCommCall)
    {
        try
        {
            if(checked) this.webRtcCommCall.muteRemoteAudioMediaStream();
            else this.webRtcCommCall.unmuteRemoteAudioMediaStream();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickMuteRemoteAudioButtonViewEventHandler(): catched exception:"+exception)  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickMuteRemoteAudioButtonViewEventHandler(): internal error");      
    } 
}

/**
 * on remote video mute event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickHideRemoteVideoButtonViewEventHandler=function(checked)
{
    console.debug ("WebRtcCommTestWebAppController:onClickHideRemoteVideoButtonViewEventHandler():checked="+checked);
    if(this.webRtcCommCall)
    {
        try
        {
            if(checked) this.webRtcCommCall.hideRemoteVideoMediaStream();
            else this.webRtcCommCall.showRemoteVideoMediaStream();
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickHideRemoteVideoButtonViewEventHandler(): catched exception:"+exception)  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickHideRemoteVideoButtonViewEventHandler(): internal error");      
    }   
}

/**
 * on remote video mute event handler
 */ 
WebRtcCommTestWebAppController.prototype.onClickStopVideoStreamButtonViewEventHandler=function(checked)
{
    console.debug ("WebRtcCommTestWebAppController:onClickStopVideoStreamButtonViewEventHandler():checked="+checked);
    var videoTracks = undefined;
            if(this.localAudioVideoMediaStream.videoTracks) videoTracks=this.localAudioVideoMediaStream.videoTracks;
            else if(this.localAudioVideoMediaStream.getVideoTracks) videoTracks=this.localAudioVideoMediaStream.getVideoTracks();
            if(videoTracks)
            {
                for(var i=0; i<videoTracks.length;i++)
                {
                    this.localAudioVideoMediaStream.removeTrack(videoTracks[i]);
                }                  
            }  
    if(this.webRtcCommCall)
    {
        try
        {
            //this.webRtcCommCall.stopVideoMediaStream();
            var videoTracks = undefined;
            if(this.localAudioVideoMediaStream.videoTracks) videoTracks=this.localAudioVideoMediaStream.videoTracks;
            else if(this.localAudioVideoMediaStream.getVideoTracks) videoTracks=this.localAudioVideoMediaStream.getVideoTracks();
            if(videoTracks)
            {
                for(var i=0; i<videoTracks.length;i++)
                {
                    this.localAudioVideoMediaStream.removeTrack(videoTracks[i]);
                }                  
            }  
        }
        catch(exception)
        {
            console.error("WebRtcCommTestWebAppController:onClickStopVideoStreamButtonViewEventHandler(): catched exception:"+exception)  
        }
    }
    else
    {
        console.error("WebRtcCommTestWebAppController:onClickStopVideoStreamButtonViewEventHandler(): internal error");      
    }   
}

/**
  * Implementation of the WebRtcCommClient listener interface
  */
WebRtcCommTestWebAppController.prototype.onWebRtcCommClientOpenedEvent=function()
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommClientOpenedEvent()");
    //Enabled button DISCONNECT, CALL diable CONNECT and BYE
    this.view.enableDisconnectButton();
    this.view.enableCallButton();
    this.view.disableConnectButton();
    this.view.disableRejectCallButton();
    this.view.disableAcceptCallButton();
    this.view.disableEndCallButton();
    this.view.disableCancelCallButton();
    alert("Online"); 
}
    
WebRtcCommTestWebAppController.prototype.onWebRtcCommClientOpenErrorEvent=function(error)
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommClientOpenErrorEvent():error:"+error); 
    this.view.enableConnectButton();
    this.view.disableDisconnectButton();
    this.view.disableCallButton();
    this.view.disableRejectCallButton();
    this.view.disableAcceptCallButton();
    this.view.disableEndCallButton();
    this.view.disableCancelCallButton();
    this.webRtcCommCall=undefined;
    alert("Connection has failed, offline"); 
} 
    
/**
 * Implementation of the WebRtcCommClient listener interface
 */
WebRtcCommTestWebAppController.prototype.onWebRtcCommClientClosedEvent=function()
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommClientClosedEvent()"); 
    //Enabled button CONNECT, disable DISCONECT, CALL, BYE
    this.view.enableConnectButton();
    this.view.disableDisconnectButton();
    this.view.disableCallButton();
    this.view.disableRejectCallButton();
    this.view.disableAcceptCallButton();
    this.view.disableEndCallButton();
    this.view.disableCancelCallButton();
    this.webRtcCommCall=undefined;
    alert("Offline"); 
}
    
/**
 * Implementation of the WebRtcCommCall listener interface
 */
WebRtcCommTestWebAppController.prototype.onWebRtcCommCallClosedEvent=function(webRtcCommCall)
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommCallClosedEvent(): webRtcCommCall.getId()="+webRtcCommCall.getId()); 

    //Enabled button DISCONECT, CALL
    this.view.stopRinging();
    this.view.enableCallButton();
    this.view.enableDisconnectButton();
    this.view.disableRejectCallButton();
    this.view.disableAcceptCallButton();
    this.view.disableEndCallButton();
    this.view.disableCancelCallButton();
    this.view.disableConnectButton();
    this.view.stopRemoteVideo();
    this.view.hideRemoteVideo();
    this.webRtcCommCall=undefined;  
    alert("Communication closed"); 
    
}
   
   
/**
 * Implementation of the WebRtcCommCall listener interface
 */
WebRtcCommTestWebAppController.prototype.onWebRtcCommCallOpenedEvent=function(webRtcCommCall)
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommCallOpenedEvent(): webRtcCommCall.getId()="+webRtcCommCall.getId()); 
   
    this.view.stopRinging();
    this.view.disableCallButton();
    this.view.disableDisconnectButton();
    this.view.disableRejectCallButton();
    this.view.disableAcceptCallButton();
    this.view.enableEndCallButton();
    this.view.disableCancelCallButton();
    this.view.disableDisconnectButton();
    this.view.disableConnectButton();
    this.view.showRemoteVideo();
    this.view.playRemoteVideo(webRtcCommCall.getRemoteMediaStream());
    
    alert("Communication opened"); 
}

/**
 * Implementation of the WebRtcCommCall listener interface
 */
WebRtcCommTestWebAppController.prototype.onWebRtcCommCallInProgressEvent=function(webRtcCommCall)
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommCallInProgressEvent(): webRtcCommCall.getId()="+webRtcCommCall.getId()); 

    alert("Communication in progress"); 
}


/**
 * Implementation of the WebRtcCommCall listener interface
 */
WebRtcCommTestWebAppController.prototype.onWebRtcCommCallOpenErrorEvent=function(webRtcCommCall, error)
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommCallOpenErrorEvent(): webRtcCommCall.getId()="+webRtcCommCall.getId()); 

    //Enabled button DISCONECT, CALL
    this.view.enableCallButton();
    this.view.enableDisconnectButton();
    this.view.disableRejectCallButton();
    this.view.disableAcceptCallButton();
    this.view.disableEndCallButton();
    this.view.disableCancelCallButton();
    this.view.disableConnectButton();
    this.view.hideRemoteVideo();
    this.view.stopRemoteVideo();
    this.view.stopRinging();
    this.webRtcCommCall=undefined;
    alert("Communication failed: error:"+error); 
}

/**
 * Implementation of the WebRtcCommCall listener interface
 */
WebRtcCommTestWebAppController.prototype.onWebRtcCommCallRingingEvent=function(webRtcCommCall)
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommCallRingingEvent(): webRtcCommCall.getId()="+webRtcCommCall.getId()); 
    this.webRtcCommCall=webRtcCommCall;
    this.view.playRinging();
    this.view.disableCallButton();
    this.view.disableDisconnectButton();
    this.view.enableRejectCallButton();
    this.view.enableAcceptCallButton();
    this.view.disableEndCallButton();
    this.view.disableCancelCallButton();
    this.view.disableConnectButton();
    alert("Communication from "+webRtcCommCall.getCallerPhoneNumber() + ", accept or reject"); 

}

/**
 * Implementation of the WebRtcCommCall listener interface
 */
WebRtcCommTestWebAppController.prototype.onWebRtcCommCallRingingBackEvent=function(webRtcCommCall)
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommCallRingingBackEvent(): webRtcCommCall.getId()="+webRtcCommCall.getId()); 
    this.view.playRinging();
    this.view.disableCallButton();
    this.view.disableDisconnectButton();
    this.view.disableRejectCallButton();
    this.view.disableAcceptCallButton();
    this.view.disableEndCallButton();
    this.view.enableCancelCallButton();
    this.view.disableConnectButton();
}

/**
 * Implementation of the WebRtcCommCall listener interface
 */
WebRtcCommTestWebAppController.prototype.onWebRtcCommCallHangupEvent=function(webRtcCommCall)
{
    console.debug ("WebRtcCommTestWebAppController:onWebRtcCommCallHangupEvent(): webRtcCommCall.getId()="+webRtcCommCall.getId()); 
    //Enabled button DISCONECT, CALL
    this.view.enableCallButton();
    this.view.enableDisconnectButton();
    this.view.disableRejectCallButton();
    this.view.disableAcceptCallButton();
    this.view.disableEndCallButton();
    this.view.disableCancelCallButton();
    this.view.disableConnectButton();
    this.view.hideRemoteVideo();
    this.view.stopRemoteVideo();
    this.view.stopRinging();
    this.webRtcCommCall=undefined;
    if(webRtcCommCall.getCallerPhoneNumber())
        alert("Communication closed by "+webRtcCommCall.getCallerPhoneNumber());
    else 
        alert("Communication close by "+webRtcCommCall.getCalleePhoneNumber());
}





