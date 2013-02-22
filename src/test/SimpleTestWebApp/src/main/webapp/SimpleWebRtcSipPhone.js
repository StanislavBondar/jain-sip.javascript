/*
 * TeleStax, Open Source Cloud Communications  Copyright 2012. 
 * and individual contributors
 * by the @authors tag. See the copyright.txt in the distribution for a
 * full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */


function SimpleWebRtcSipPhone(configuration) {
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.stunServer:"+configuration.stunServer);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.sipOutboundProxy:"+configuration.sipOutboundProxy);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.sipDomain:"+configuration.sipDomain);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.sipDisplayName:"+configuration.sipDisplayName);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.sipUserName:"+configuration.sipUserName);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.sipLogin:"+configuration.sipLogin);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.sipPassword: "+configuration.sipPassword);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.sipRegisterMode:"+configuration.sipRegisterMode);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.localAudioVideoMediaStream:"+configuration.localAudioVideoMediaStream);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.localAudioMediaStream:"+configuration.localAudioMediaStream);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.localVideoMediaStream:"+configuration.localVideoMediaStream);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.audioMediaFlag:"+configuration.audioMediaFlag);
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): configuration.videoMediaFlag:"+configuration.videoMediaFlag);
   
    if(configuration.localAudioVideoMediaStream)
    {
        if(configuration.localAudioVideoMediaStream.getAudioTracks)
        {
            var audioMediaTracks  =  configuration.localAudioVideoMediaStream.getAudioTracks();
            console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():audioMediaTracks.length="+audioMediaTracks.length);
            for(var i=0;i<audioMediaTracks.length;i++)
            {
                var audioTrack= audioMediaTracks[i];
                audioTrack.enabled = configuration.audioMediaFlag;
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():audioTrack.kind="+audioTrack.kind);
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():audioTrack.id="+audioTrack.id); 
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():audioTrack.label="+audioTrack.label);
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():audioTrack.enabled="+audioTrack.enabled); 
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():audioTrack.readyState="+audioTrack.readyState); 
            }
        }
        if(configuration.localAudioVideoMediaStream.getVideoTracks)
        {
            var videoMediaTracks  =  configuration.localAudioVideoMediaStream.getVideoTracks();
            console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():videoMediaTracks.length="+videoMediaTracks.length);
            for(var i=0;i<videoMediaTracks.length;i++)
            {
                var videoTrack= videoMediaTracks[i];
                videoTrack.enabled = configuration.videoMediaFlag;
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():videoTrack.kind="+videoTrack.kind);
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():videoTrack.id="+videoTrack.id); 
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():videoTrack.label="+videoTrack.label);
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():videoTrack.enabled="+videoTrack.enabled); 
                console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone():videoTrack.readyState="+videoTrack.readyState); 
            }
        }
    }
   
    if(window.webkitRTCPeerConnection)
    {
        // Chrome user agent
        RTCPeerConnection = webkitRTCPeerConnection;
    }
    else  if(window.mozRTCPeerConnection)
    {
        // Firefox user agent
        RTCPeerConnection = mozRTCPeerConnection;
    }
    
     if (typeof RTCPeerConnection == "undefined") {
        alert("RTCPeerConnection is not supported/enabled in this browser, cannot test!");
    }
    else
    {
        // SIP Stack config
        this.configuration=configuration;
        this.sipUserAgentName="SimpleWebRtcSipPhone";
        this.init();
    }
}

// SIP listener heritage 
SimpleWebRtcSipPhone.prototype = new SipListener();
SimpleWebRtcSipPhone.prototype.constructor=SimpleWebRtcSipPhone;

//  State of REGISTER peerConnectionState machine
SimpleWebRtcSipPhone.prototype.UNREGISTERED_STATE="UNREGISTERED_STATE";
SimpleWebRtcSipPhone.prototype.REGISTERING_STATE="REGISTERING_STATE";
SimpleWebRtcSipPhone.prototype.REGISTER_REFRESHING_STATE="REGISTER_REFRESHING_STATE";
SimpleWebRtcSipPhone.prototype.REGISTERING_401_STATE="REGISTERING_401_STATE";
SimpleWebRtcSipPhone.prototype.REGISTERED_STATE="REGISTERED_STATE";
SimpleWebRtcSipPhone.prototype.UNREGISTERING_401_STATE="UNREGISTERING_401_STATE";
SimpleWebRtcSipPhone.prototype.UNREGISTERING_STATE="UNREGISTERING_STATE";

//  State of outgoing call peerConnectionState machine
SimpleWebRtcSipPhone.prototype.INVITING_INITIAL_STATE="INVITING_INITIAL_STATE";
SimpleWebRtcSipPhone.prototype.INVITING_STATE="INVITING_STATE";
SimpleWebRtcSipPhone.prototype.INVITING_407_STATE="INVITING_407_STATE";
SimpleWebRtcSipPhone.prototype.INVITING_ACCEPTED_STATE="INVITING_ACCEPTED_STATE";
SimpleWebRtcSipPhone.prototype.INVITING_LOCAL_HANGINGUP_STATE="INVITING_LOCAL_HANGINGUP_STATE";
SimpleWebRtcSipPhone.prototype.INVITING_LOCAL_HANGINGUP_407_STATE="INVITING_LOCAL_HANGINGUP_407_STATE";
SimpleWebRtcSipPhone.prototype.INVITING_CANCELLING_STATE="INVITING_CANCELLING_STATE";

//  State of outgoing call peerConnectionState machine
SimpleWebRtcSipPhone.prototype.INVITED_INITIAL_STATE="INVITED_INITIAL_STATE";
SimpleWebRtcSipPhone.prototype.INVITED_ACCEPTED_STATE="INVITED_ACCEPTED_STATE";
SimpleWebRtcSipPhone.prototype.INVITED_LOCAL_HANGINGUP_STATE="INVITED_LOCAL_HANGINGUP_STATE";
SimpleWebRtcSipPhone.prototype.INVITED_LOCAL_HANGINGUP_407_STATE="INVITED_LOCAL_HANGINGUP_407_STATE";
SimpleWebRtcSipPhone.prototype.INVITED_HANGUP_STATE="INVITED_HANGUP_STATE";

SimpleWebRtcSipPhone.prototype.init =function(){
    console.debug ("SimpleWebRtcSipPhone:init()");  
    
    this.initGUI();
    this.initSipRegisterStateMachine();
    this.initSipInvitingStateMachine();
    this.initSipInvitedStateMachine();
    this.initPeerConnectionStateMachine();
    this.initJainSipStack(); 
}

SimpleWebRtcSipPhone.prototype.initGUI=function(){
    console.debug ("SimpleWebRtcSipPhone:initGUI()");  
    hideRejectButton();
    hideAcceptButton();
    hideCallButton();
    hideByeButton();
    hideCancelButton();
    hideUnRegisterButton();
    if(this.configuration.sipRegisterMode==true) showRegisterButton();
}

SimpleWebRtcSipPhone.prototype.initSipRegisterStateMachine=function(){
    console.debug ("SimpleWebRtcSipPhone:initSipRegisterStateMachine()");  
    // SIP REGISTER machine 
    if(this.refreshRegisterTimer) clearTimeout(this.refreshRegisterTimer);
    this.registerState=this.UNREGISTERED_STATE;
    this.refreshRegisterTimer=null; 
    this.registerAuthenticatedFlag=false;
    this.refreshRegisterFlag=false;
    this.jainSipRegisterSentRequest=null;
    this.registeredFlag=false;
    this.unregisterPendingFlag=false;    
}

SimpleWebRtcSipPhone.prototype.initSipInvitingStateMachine=function(){
    console.debug ("SimpleWebRtcSipPhone:initSipInvitingStateMachine()");  
    // SIP ougoing call (INVITING) state machine 
    this.callee=null;
    this.invitingState=this.INVITING_INITIAL_STATE;
    this.jainSipInvitingRequest=null;
    this.jainSipInvitingDialog=null;
    this.jainSipInvitingTransaction=null;
}

SimpleWebRtcSipPhone.prototype.initSipInvitedStateMachine=function(){
    console.debug ("SimpleWebRtcSipPhone:initSipInvitedStateMachine()");  
    // SIP incoming call (INVITED) state machine 
    this.caller=null;
    this.invitedState=this.INVITED_INITIAL_STATE;
    this.jainSipInvitedRequest=null;
    this.jainSipInvitedDialog=null;
    this.jainSipInvitedTransaction=null;
}
    
SimpleWebRtcSipPhone.prototype.initJainSipStack=function(){
    console.debug ("SimpleWebRtcSipPhone:initJainSipStack()");  
   
    // Create JAIN SIP main object
    this.sipFactory=new SipFactory();
    this.sipStack=this.sipFactory.createSipStack(this.configuration.sipOutboundProxy,this.sipUserAgentName);
    this.listeningPoint=this.sipStack.createListeningPoint();
    this.sipProvider=this.sipStack.createSipProvider(this.listeningPoint);
    this.sipProvider.addSipListener(this);
    this.headerFactory=this.sipFactory.createHeaderFactory();
    this.addressFactory=this.sipFactory.createAddressFactory();
    this.messageFactory=this.sipFactory.createMessageFactory(this.listeningPoint); 
    this.jainSipContactHeader = this.listeningPoint.createContactHeader(this.configuration.sipUserName);
    this.jainSipUserAgentHeader = this.headerFactory.createUserAgentHeader(this.listeningPoint.getUserAgent());
    this.sipStack.start();
}
 
SimpleWebRtcSipPhone.prototype.initPeerConnectionStateMachine=function(){
    console.debug ("SimpleWebRtcSipPhone:initPeerConnectionStateMachine()");     
    
    if(this.peerConnection)
    {
        console.debug ("SimpleWebRtcSipPhone:initPeerConnectionStateMachine(): force peerConnection close");
        document.getElementById("remoteVideo").pause();
        document.getElementById("remoteVideo").src= null;
        this.peerConnection.close();
    }
    this.peerConnection = null;
    this.peerConnectionState = 'new';
    this.remoteAudioVideoMediaStream=null;
}
  
  
//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processDialogTerminated =function(dialogTerminatedEvent){
    console.debug ("SimpleWebRtcSipPhone:processDialogTerminated()");  
}

//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processIOException =function(exceptionEvent){
    console.error("SimpleWebRtcSipPhone:processIOException()");   
}

//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processTimeout =function(timeoutEvent){
    console.debug("SimpleWebRtcSipPhone:processTimeout(): timeoutEvent="+timeoutEvent); 
}

//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processTransactionTerminated =function(transactionTerminatedEvent){
    console.debug("SimpleWebRtcSipPhone:processTransactionTerminated()"); 
}
//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processDisconnected =function(){   
    console.error("SimpleWebRtcSipPhone:processDisconnected()"); 
    this.registeredFlag=false;
    alert("disconnected with SIP server");
    this.initGUI();
}

//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processConnectionError =function(error){
    console.error("SimpleWebRtcSipPhone:processConnectionError():error="+error); 
}

//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processConnected =function(){
    console.debug("SimpleWebRtcSipPhone:processConnected()");
    if(this.configuration.sipRegisterMode==true)  this.register();
    else 
    {
        this.registeredFlag=true;
        this.call(document.getElementById('sipContactPhoneNumber').value);
    }
}

//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processResponse =function(responseEvent){
    console.debug("SimpleWebRtcSipPhone:processResponse()");  
    var jainSipResponse=responseEvent.getResponse(); 
    if(jainSipResponse.getCSeq().getMethod()=="REGISTER")
    {
        this.handleStateMachineRegisterResponseEvent(responseEvent);
    }
    else if(this.invitingState!=this.INVITING_INITIAL_STATE) this.handleStateMachineInvitingResponseEvent(responseEvent); 
    else if(this.invitedState!=this.INVITED_INITIAL_STATE)  this.handleStateMachineInvitedResponseEvent(responseEvent);
    else
    {
        console.warn("SimpleWebRtcSipPhone:processResponse(): response ignored");      
    }
}

//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processRequest =function(requestEvent){
    console.debug("SimpleWebRtcSipPhone:processRequest()");
    var jainSipRequest=requestEvent.getRequest(); 
    var jainSipRequestMethod=jainSipRequest.getMethod();   
    if(jainSipRequestMethod=="INVITE")
    {
        // Incoming call 
        if(this.invitingState!=this.INVITING_INITIAL_STATE)
        {
            // ONLY ONE CALL at the same time authorized 
            // Temporarily Unavailable
            var jainSipResponse480=jainSipRequest.createResponse(480,"Temporarily Unavailable");
            jainSipResponse480.addHeader(this.jainSipRegisterSentRequest.getHeader("User-Agent"));
            requestEvent.getServerTransaction().sendMessage(jainSipResponse480);
        }
        else if(this.invitedState!=this.INVITED_INITIAL_STATE)
        {
            // ONLY ONE CALL at the same time  authorized 
            // Temporarily Unavailable
            jainSipResponse480=jainSipRequest.createResponse(480,"Temporarily Unavailable");
            jainSipResponse480.addHeader(this.jainSipRegisterSentRequest.getHeader("User-Agent"));
            requestEvent.getServerTransaction().sendMessage(jainSipResponse480);
        }
        else
        {
            // Handle Incoming Call
            this.handleStateMachineInvitedRequestEvent(requestEvent);
        }
    }
    else  if((jainSipRequestMethod=="BYE")||(jainSipRequestMethod=="ACK"))
    {
        // Subscequent request on ongoing dialog
        if(this.invitingState!=this.INVITING_INITIAL_STATE) this.handleStateMachineInvitingRequestEvent(requestEvent); 
        else if(this.invitedState!=this.INVITED_INITIAL_STATE)  this.handleStateMachineInvitedRequestEvent(requestEvent);
        else
        {
            console.warn("SimpleWebRtcSipPhone:processRequest(): request ignored");      
        }
    }
    else if(jainSipRequestMethod=="CANCEL")
    {
        // Subscequent request on ongoing dialog
        this.handleStateMachineInvitedRequestEvent(requestEvent);
    }
    else 
    {
        console.warn("SimpleWebRtcSipPhone:processResponse(): request ignored");      
    }
}

SimpleWebRtcSipPhone.prototype.changeSipRegisterMode =function(mode){
    console.debug("SimpleWebRtcSipPhone:changeSipRegisterMode(): mode="+mode); 
}

SimpleWebRtcSipPhone.prototype.register =function(){
    console.debug("SimpleWebRtcSipPhone:register()");
    if(this.registerState==this.UNREGISTERED_STATE)
    {
        try
        {   
            // Send SIP REGISTER request
            var fromSipUriString=this.configuration.sipUserName+"@"+this.configuration.sipDomain;            
            var jainSipCseqHeader=this.headerFactory.createCSeqHeader(1,"REGISTER");
            var jainSipCallIdHeader=this.headerFactory.createCallIdHeader();
            var jainSipExpiresHeader=this.headerFactory.createExpiresHeader(3600);
            var jainSipMaxForwardHeader=this.headerFactory.createMaxForwardsHeader(70);
            var jainSipRequestUri=this.addressFactory.createSipURI_user_host(null,this.configuration.sipDomain);
            var jainSipAllowListHeader=this.headerFactory.createHeaders("Allow: INVITE,UPDATE,ACK,CANCEL,BYE,NOTIFY,OPTIONS,MESSAGE,REFER");
            var jainSipFromUri=this.addressFactory.createSipURI_user_host(null,fromSipUriString);
            var jainSipFromAddress=this.addressFactory.createAddress_name_uri(null,jainSipFromUri);
            var random=new Date();
            var tag=random.getTime();
            var jainSipFromHeader=this.headerFactory.createFromHeader(jainSipFromAddress, tag);
            var jainSipToHeader=this.headerFactory.createToHeader(jainSipFromAddress, null);               
            var jainSipRegisterRequest=this.messageFactory.createRequest(jainSipRequestUri,"REGISTER",jainSipCallIdHeader,jainSipCseqHeader,jainSipFromHeader,jainSipToHeader,jainSipMaxForwardHeader);   
            this.messageFactory.addHeader(jainSipRegisterRequest, jainSipExpiresHeader);
            this.messageFactory.addHeader(jainSipRegisterRequest, this.jainSipUserAgentHeader);
            this.messageFactory.addHeader(jainSipRegisterRequest, jainSipAllowListHeader);
            this.messageFactory.addHeader(jainSipRegisterRequest, this.jainSipContactHeader); 
            this.jainSipRegisterSentRequest=jainSipRegisterRequest;
            var jainSipClientTransaction = this.sipProvider.getNewClientTransaction(jainSipRegisterRequest);
            jainSipRegisterRequest.setTransaction(jainSipClientTransaction);
            jainSipClientTransaction.sendRequest();
            this.registerState=this.REGISTERING_STATE;
        }
        catch(exception)
        {
            this.initGUI();
            this.initSipRegisterStateMachine();
            console.error("SimpleWebRtcSipPhone:register(): catched exception:"+exception);
            alert("SimpleWebRtcSipPhone:register(): catched exception:"+exception);  
        }
    }
    else
    {
        alert("SimpleWebRtcSipPhone:register(): bad state, action register unauthorized"); 
        console.warn("SimpleWebRtcSipPhone:register(): bad state, action register unauthorized"); 
    }  
}


SimpleWebRtcSipPhone.prototype.keepAliveRegister =function(){
    console.debug("SimpleWebRtcSipPhone:keepAliveRegister()");
    
    if( this.registeredFlag==true)
    {
        this.refreshRegisterTimer=null;
        this.registerState=this.REGISTER_REFRESHING_STATE;
        var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
        this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
        this.jainSipRegisterSentRequest = this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest);
        var jainSipClientTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
        this.jainSipRegisterSentRequest.setTransaction(jainSipClientTransaction);
        jainSipClientTransaction.sendRequest();
    }
    else
    {
        console.warn("SimpleWebRtcSipPhone:keepAliveRegister(): bad state, action keep alive register unauthorized");            
    }
}

SimpleWebRtcSipPhone.prototype.unRegister =function(){
    console.debug("SimpleWebRtcSipPhone:unRegister()");
    if(this.registerState==this.REGISTERED_STATE)
    {
        this.registerState=this.UNREGISTERING_STATE;
        if(this.refreshRegisterTimer!=null)
        {
            // Cancel SIP REGISTER refresh timer
            clearTimeout(this.refreshRegisterTimer);
        }
        var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
        this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
        this.jainSipRegisterSentRequest.getExpires().setExpires(0);
        this.jainSipRegisterSentRequest = this.jainSipRegisterSentRequest=this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest); 
        var jainSipClientTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
        this.jainSipRegisterSentRequest.setTransaction(jainSipClientTransaction);
        jainSipClientTransaction.sendRequest(); 
    }
    else if(this.registerState==this.UNREGISTERED_STATE)
    {
        alert("SimpleWebRtcSipPhone:unRegister(): bad state, action keep alive register unauthorized"); 
        console.warn("SimpleWebRtcSipPhone:unRegister(): bad state, action keep alive register unauthorized");            
    }
    else
    {
        this.unregisterPendingFlag=true;     
    }
}

SimpleWebRtcSipPhone.prototype.handleStateMachineRegisterResponseEvent =function(responseEvent){
    console.debug("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): this.registerState="+this.registerState);
    var jainSipResponse=responseEvent.getResponse(); 
    var statusCode = parseInt(jainSipResponse.getStatusCode()); 
    if(this.registerState==this.UNREGISTERED_STATE)
    {
        alert("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");     
        console.error("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");  
    }
    else if((this.registerState==this.REGISTERING_STATE) || (this.registerState==this.REGISTER_REFRESHING_STATE))
    {   
        if(statusCode < 200)
        {
            console.debug("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): 1XX response ignored"); 
        }
        else if(statusCode==401)
        {
            this.registerState=this.REGISTERING_401_STATE;
            this.jainSipRegisterSentRequest.removeHeader("Authorization");
            var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
            this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,this.jainSipRegisterSentRequest,this.configuration.sipPassword,this.configuration.sipLogin);
            this.messageFactory.addHeader(this.jainSipRegisterSentRequest, jainSipAuthorizationHeader); 
            this.jainSipRegisterSentRequest = this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest);
            var jainSipClientTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
            this.jainSipRegisterSentRequest.setTransaction(jainSipClientTransaction);
            jainSipClientTransaction.sendRequest();
        }
        else if(statusCode==200)
        {
            this.registerState=this.REGISTERED_STATE;
            if(this.registeredFlag==false)
            {
                this.registeredFlag=true;
                showCallButton();
                if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
                hideRegisterButton();
                hideByeButton();
                hideAcceptButton();
                hideRejectButton();
            }
            
            if(this.unregisterPendingFlag==true) {
                this.unRegister();
                this.unregisterPendingFlag=false;
            }
            
            // Start SIP REGISTER refresh timeout
            var application=this;
            this.refreshRegisterTimer=setTimeout(function(){
                application.keepAliveRegister();
            },40000);
        }
        else
        {
            console.error("SIP registration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString()); 
            alert("SIP registration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString())    
        }
    }                     
    else if(this.registerState==this.REGISTERING_401_STATE)
    {
        if(statusCode < 200)
        {
            console.debug("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): 1XX response ignored"); 
        }
        else if(statusCode==200)
        {
            this.registerState=this.REGISTERED_STATE; 
            if(this.registeredFlag==false)
            {
                console.debug("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): this.registeredFlag=true"); 
                this.registeredFlag=true;
                showCallButton();
                if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
                hideRegisterButton();
                hideByeButton();
                hideAcceptButton();
                hideRejectButton();
            }
                        
            if(this.unregisterPendingFlag==true) {
                this.unRegister();
                this.unregisterPendingFlag=false;
            }
            
            // Start SIP REGISTER refresh timeout
            var application=this;
            this.refreshRegisterTimer=setTimeout(function(){
                application.keepAliveRegister();
            },40000);
        }
        else
        {
            console.error("SIP registration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString()); 
            alert("SIP registration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            this.initGUI();
        } 
    }
    else if(this.registerState==this.REGISTERED_STATE)
    {
        alert("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");     
        console.error("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");   
    }
    else if(this.registerState==this.UNREGISTERING_STATE)
    {
        if(statusCode< 200)
        {
            console.debug("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): 1XX response ignored"); 
        }
        else if(statusCode==401)
        {
            this.registerState=this.UNREGISTERING_401_STATE;
            this.jainSipRegisterSentRequest.removeHeader("Authorization");
            var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
            this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,this.jainSipRegisterSentRequest,this.configuration.sipPassword,this.configuration.sipLogin);
            this.messageFactory.addHeader(this.jainSipRegisterSentRequest, jainSipAuthorizationHeader); 
            this.jainSipRegisterSentRequest = this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest);
            var jainSipClientTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
            this.jainSipRegisterSentRequest.setTransaction(jainSipClientTransaction);
            jainSipClientTransaction.sendRequest();
        }
        else if(statusCode==200)
        {
            this.registerState=this.UNREGISTERED_STATE;
            if(this.registeredFlag==true)
            {
                console.debug("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): this.registeredFlag=false"); 
                this.initGUI();
                this.initSipRegisterStateMachine();
            }
        }
        else
        {
            console.error("SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());  
            alert("SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());  
            this.initGUI();
            this.initSipRegisterStateMachine();
        }
    }
    else if(this.registerState==this.UNREGISTERING_401_STATE)
    {
        if(statusCode< 200)
        {
            console.debug("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): 1XX response ignored"); 
        }
        else if(statusCode==200)
        {
            this.registerState=this.UNREGISTERED_STATE;
            if(this.registeredFlag==true)
            {
                console.debug("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): this.registeredFlag=false"); 
                this.initGUI();
                this.initSipRegisterStateMachine();
            }
        }
        else
        {
            console.error("SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());  
            alert("SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            this.initGUI();
            this.initSipRegisterStateMachine();
        }
    }
    else if(this.registerState==this.UNREGISTERED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");  
        alert("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");
    }
    else
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");  
        alert("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");
    }
}

SimpleWebRtcSipPhone.prototype.call =function(to) {
    console.debug("SimpleWebRtcSipPhone:call():to: "+to);
    if(this.registeredFlag==true)
    {
        if(this.invitingState==this.INVITING_INITIAL_STATE)
        {
            try
            {
                this.callee=to;
                hideCallButton();
                hideRegisterButton();
                hideUnRegisterButton();
                hideAcceptButton();
                hideRejectButton();
                showCancelButton();
                this.createPeerConnection();
                if(this.configuration.localAudioVideoMediaStream)
                {
                    this.peerConnection.addStream(this.configuration.localAudioVideoMediaStream);
                }
                if(this.configuration.localAudioMediaStream && this.configuration.audioMediaFlag) 
                    this.peerConnection.addStream(this.configuration.localAudioMediaStream);
                if(this.configuration.localVideoMediaStream && this.configuration.videoMediaFlag) 
                    this.peerConnection.addStream(this.configuration.localVideoMediaStream);
                var application=this;
                if(window.webkitRTCPeerConnection)
                {
                    this.peerConnection.createOffer(function(offer) {
                        application.onPeerConnectionCreateOfferSuccessCallback(offer);
                    }, function(error) {
                        application.onPeerConnectionCreateOfferErrorCallback(error);
                    }); 
                }
                else if(window.mozRTCPeerConnection)
                {
                    this.peerConnection.createOffer(function(offer) {
                        application.onPeerConnectionCreateOfferSuccessCallback(offer);
                    }, function(error) {
                        application.onPeerConnectionCreateOfferErrorCallback(error);
                    },{
                        "mandatory": {
                            "MozDontOfferDataChannel": true
                        }
                    }); 
                }  
            }
            catch(exception)
            {
                console.error("SimpleWebRtcSipPhone:call(): catched exception:"+exception);
                alert("SimpleWebRtcSipPhone:call(): catched exception:"+exception);  
                this.initPeerConnectionStateMachine();
                this.initSipInvitingStateMachine();
                showCallButton();
                hideCancelButton();
            }
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:call(): bad state, action call unauthorized");
            alert("SimpleWebRtcSipPhone:call(): bad state, action call unauthorized");    
        }
    }
    else
    {
        console.error("SimpleWebRtcSipPhone:call(): bad state, action call unauthorized");
        alert("SimpleWebRtcSipPhone:call(): bad state, action call unauthorized");    
    }
}

SimpleWebRtcSipPhone.prototype.cancelCall =function(){
    console.debug("SimpleWebRtcSipPhone:cancelCall()");
    if(this.invitingState==this.INITIAL_INVITING_STATE)
    {
        this.initPeerConnectionStateMachine();
        this.initSipInvitingStateMachine();
        hideByeButton();
        showCallButton(); 
    }
    if(this.invitingState==this.INVITING_STATE || this.invitingState==this.INVITING_407_STATE)
    {
        try
        {
            this.jainSipInvitingCancelRequest = this.jainSipInvitingTransaction.createCancel();
            this.jainSipInvitingCancelRequest.addHeader(this.jainSipContactHeader);
            this.jainSipInvitingCancelRequest.addHeader(this.jainSipUserAgentHeader);
            this.jainSipInvitingCancelTransaction = this.sipProvider.getNewClientTransaction(this.jainSipInvitingCancelRequest);
            this.jainSipInvitingCancelTransaction.sendRequest();
            this.invitingState=this.INVITING_CANCELLING_STATE;
        }
        catch(exception)
        {
            console.error("SimpleWebRtcSipPhone:cancelCall(): catched exception:"+exception);
            alert("SimpleWebRtcSipPhone:cancelCall(): catched exception:"+exception); 
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
            hideByeButton();
            showCallButton();
        }
    }
    else
    {
        alert("SimpleWebRtcSipPhone:cancelCall(): bad state, action call unauthorized");     
    }
   
}

SimpleWebRtcSipPhone.prototype.acceptCall =function(){
    console.debug("SimpleWebRtcSipPhone:acceptCall()");
   
    if(this.invitedState==this.INVITED_INITIAL_STATE)
    {
        // Accepted 
        try
        {
            this.createPeerConnection();
            if(this.configuration.localAudioVideoMediaStream)
                this.peerConnection.addStream(this.configuration.localAudioVideoMediaStream);
            if(this.configuration.localAudioMediaStream && this.configuration.audioMediaFlag) 
                this.peerConnection.addStream(this.configuration.localAudioMediaStream);
            if(this.configuration.localVideoMediaStream && this.configuration.videoMediaFlag) 
                this.peerConnection.addStream(this.configuration.localVideoMediaStream);
            var sdpOfferString = this.jainSipInvitedRequest.getContent();
            if(window.webkitRTCPeerConnection)
            {
                var sdpOffer = new RTCSessionDescription({
                    type: 'offer',
                    sdp: sdpOfferString
                });
            }
            else if(window.mozRTCPeerConnection)
            {
                var sdpOffer = {
                    type: 'offer',
                    sdp: sdpOfferString
                };
            }
           
            var application=this;
            this.peerConnectionState = 'offer-received';
            this.peerConnection.setRemoteDescription(sdpOffer, function() {
                application.onPeerConnectionSetRemoteDescriptionSuccessCallback();
            }, function(error) {
                application.onPeerConnectionSetRemoteDescriptionErrorCallback(error);
            });
        }
        catch(exception)
        {
            // Temporarily Unavailable
            var jainSipResponse480=this.jainSipInvitedRequest.createResponse(480,"Temporarily Unavailable");
            jainSipResponse480.addHeader(this.jainSipContactHeader);
            jainSipResponse480.addHeader(this.jainSipUserAgentHeader);
            this.jainSipInvitedTransaction.sendResponse(jainSipResponse480);
            hideByeButton();
            hideAcceptButton();
            hideRejectButton();
            hideRegisterButton();
            showCallButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton(); 
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
            alert("SimpleWebRtcSipPhone:acceptCall(): catched exception:"+exception);
            console.error("SimpleWebRtcSipPhone:acceptCall(): catched exception:"+exception);
        }
    } 
    else
    {
        alert("SimpleWebRtcSipPhone:acceptCall(): bad state, action call unauthorized");   
        console.error("SimpleWebRtcSipPhone:acceptCall(): bad state, action call unauthorized");   
    }
}

SimpleWebRtcSipPhone.prototype.rejectCall =function(){
    console.debug("SimpleWebRtcSipPhone:rejectCall()");
   
    if(this.invitedState==this.INVITED_INITIAL_STATE)
    {
        // Rejected  Temporarily Unavailable
        var jainSipResponse480= this.jainSipInvitedRequest.createResponse(480,"Temporarily Unavailable");
        jainSipResponse480.addHeader(this.jainSipContactHeader);
        jainSipResponse480.addHeader(this.jainSipUserAgentHeader);
        this.jainSipInvitedTransaction.sendResponse(jainSipResponse480);
        hideByeButton();
        hideAcceptButton();
        hideRejectButton();
        hideRegisterButton();
        showCallButton();
        if(this.configuration.sipRegisterMode==true) showUnRegisterButton(); 
        this.initPeerConnectionStateMachine();
        this.initSipInvitedStateMachine(); 
    }
    else
    {
        alert("SimpleWebRtcSipPhone:rejectCall(): bad state, action call unauthorized"); 
        console.error("SimpleWebRtcSipPhone:rejectCall(): bad state, action call unauthorized");
    }
}

SimpleWebRtcSipPhone.prototype.byeCall =function(){
    console.debug("SimpleWebRtcSipPhone:byeCall()");
   
    if(this.invitingState==this.INVITING_ACCEPTED_STATE)
    {
        try
        {
            var jainSipByeRequest=this.jainSipInvitingDialog.createRequest("BYE");
            jainSipByeRequest.removeHeader("Contact");
            jainSipByeRequest.removeHeader("User-Agent");
            jainSipByeRequest.addHeader(this.jainSipContactHeader);
            jainSipByeRequest.addHeader(this.jainSipUserAgentHeader);
            var clientTransaction  = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
            this.jainSipInvitingDialog.sendRequest(clientTransaction);
            this.invitingState=this.INVITING_LOCAL_HANGINGUP_STATE;
        }
        catch(exception)
        {
            console.error("SimpleWebRtcSipPhone:byeCall(): catched exception:"+exception);
            alert("SimpleWebRtcSipPhone:byeCall(): catched exception:"+exception); 
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
            hideByeButton();
            hideAcceptButton();
            hideRejectButton();
            hideRegisterButton();
            showCallButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
        }
    }
    else if(this.invitedState==this.INVITED_ACCEPTED_STATE)
    {
        try
        {
            var jainSipByeRequest=this.jainSipInvitedDialog.createRequest("BYE");
            jainSipByeRequest.removeHeader("Contact");
            jainSipByeRequest.removeHeader("User-Agent");
            jainSipByeRequest.addHeader(this.jainSipContactHeader);
            jainSipByeRequest.addHeader(this.jainSipUserAgentHeader);
            var clientTransaction  = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
            this.jainSipInvitedDialog.sendRequest(clientTransaction);
            this.invitedState=this.INVITED_LOCAL_HANGINGUP_STATE;
        }
        catch(exception)
        {
            console.error("SimpleWebRtcSipPhone:byeCall(): catched exception:"+exception);
            alert("SimpleWebRtcSipPhone:byeCall(): catched exception:"+exception); 
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
            hideByeButton();
            hideAcceptButton();
            hideRejectButton();
            hideRegisterButton();
            showCallButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
        }
    }
    else
    {
        console.error("SimpleWebRtcSipPhone:byeCall(): bad state, action call unauthorized"); 
        alert("SimpleWebRtcSipPhone:byeCall(): bad state, action call unauthorized");     
    }
}


SimpleWebRtcSipPhone.prototype.sendInviteSipRequest =function(sdpOffer){
    console.debug("SimpleWebRtcSipPhone:sendInviteSipRequest()"); 
    try{
        var fromSipUriString=this.configuration.sipUserName+"@"+this.configuration.sipDomain;
        var toSipUriString= this.callee+"@"+this.configuration.sipDomain;
        var random=new Date();       
        var jainSipCseqHeader=this.headerFactory.createCSeqHeader(1,"INVITE");
        var jainSipCallIdHeader=this.headerFactory.createCallIdHeader();
        var jainSipMaxForwardHeader=this.headerFactory.createMaxForwardsHeader(70);
        var jainSipRequestUri=this.addressFactory.createSipURI_user_host(null,toSipUriString);
        var jainSipAllowListHeader=this.headerFactory.createHeaders("Allow: INVITE,ACK,CANCEL,BYE");         
        var jainSipFromUri=this.addressFactory.createSipURI_user_host(null,fromSipUriString);
        var jainSipFromAdress=this.addressFactory.createAddress_name_uri(null,jainSipFromUri);
        var tagfrom=random.getTime();
        var jainSipFromHeader=this.headerFactory.createFromHeader(jainSipFromAdress, tagfrom);           
        var jainSiptoUri=this.addressFactory.createSipURI_user_host(null,toSipUriString);
        var jainSipToAddress=this.addressFactory.createAddress_name_uri(null,jainSiptoUri);
        var jainSipToHeader=this.headerFactory.createToHeader(jainSipToAddress, null);           
        var jainSipContentTypeHeader=this.headerFactory.createContentTypeHeader("application","sdp");
        this.jainSipInvitingRequest=this.messageFactory.createRequest(jainSipRequestUri,"INVITE",
            jainSipCallIdHeader,
            jainSipCseqHeader,
            jainSipFromHeader,
            jainSipToHeader,
            jainSipMaxForwardHeader,
            jainSipContentTypeHeader,
            sdpOffer); 
                      
        this.messageFactory.addHeader( this.jainSipInvitingRequest, this.jainSipUserAgentHeader);
        this.messageFactory.addHeader( this.jainSipInvitingRequest, jainSipAllowListHeader);
        this.messageFactory.addHeader( this.jainSipInvitingRequest, this.jainSipContactHeader);   
        this.invitingState=this.INVITING_STATE;
        this.jainSipInvitingTransaction = this.sipProvider.getNewClientTransaction(this.jainSipInvitingRequest);
        this.jainSipInvitingRequest.setTransaction(this.jainSipInvitingTransaction);
        this.jainSipInvitingTransaction.sendRequest();
    }
    catch(exception)
    {
        console.error("SimpleWebRtcSipPhone:sendInviteSipRequest(): catched exception:"+exception);
        throw("SimpleWebRtcSipPhone:sendInviteSipRequest(): catched exception:"+exception);  
        this.initPeerConnectionStateMachine();
        this.initSipInvitingStateMachine();
        showCallButton();   
    }
}

SimpleWebRtcSipPhone.prototype.send200OKSipResponse =function(sdpOffer){
    console.debug("SimpleWebRtcSipPhone:send200OKSipResponse()"); 
    try{
        this.invitedState=this.INVITED_ACCEPTED_STATE;
        var jainSip200OKResponse=this.jainSipInvitedRequest.createResponse(200, "OK");
        jainSip200OKResponse.addHeader(this.jainSipContactHeader);
        jainSip200OKResponse.addHeader(this.jainSipUserAgentHeader);
        jainSip200OKResponse.setMessageContent("application","sdp",sdpOffer);
        this.jainSipInvitedTransaction.sendResponse(jainSip200OKResponse);
        showByeButton();
        hideCallButton();
        hideUnRegisterButton();
        hideRegisterButton();
    }
    catch(exception)
    {
        this.initPeerConnectionStateMachine();
        this.initSipInvitingStateMachine();
        showCallButton();
        console.error("SimpleWebRtcSipPhone:send200OKSipResponse(): catched exception:"+exception);
        throw("SimpleWebRtcSipPhone:send200OKSipResponse(): catched exception:"+exception);  
   
    }
}



SimpleWebRtcSipPhone.prototype.handleStateMachineInvitingResponseEvent =function(responseEvent){
    console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): this.invitingState="+this.invitingState);
    var jainSipResponse=responseEvent.getResponse(); 
    var statusCode = parseInt(jainSipResponse.getStatusCode()); 
    if(this.invitingState==this.INVITING_STATE)
    {
        if(statusCode< 200)
        {
            console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): 1XX response ignored"); 
        }
        else if(statusCode==407)
        {
            this.invitingState=this.INVITING_407_STATE;
            var num=new Number(this.jainSipInvitingRequest.getCSeq().getSeqNumber());
            this.jainSipInvitingRequest.getCSeq().setSeqNumber(num+1);
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,this.jainSipInvitingRequest,this.configuration.sipPassword,this.configuration.sipLogin);
            this.messageFactory.addHeader(this.jainSipInvitingRequest, jainSipAuthorizationHeader); 
            this.jainSipInvitingRequest = this.messageFactory.setNewViaHeader(this.jainSipInvitingRequest);
            this.jainSipInvitingTransaction = this.sipProvider.getNewClientTransaction(this.jainSipInvitingRequest);
            this.jainSipInvitingRequest.setTransaction(this.jainSipInvitingTransaction);
            this.jainSipInvitingTransaction.sendRequest();
        }
        else if(statusCode==200)
        {
            this.jainSipInvitingDialog=responseEvent.getOriginalTransaction().getDialog();
            
            this.invitingState=this.INVITING_ACCEPTED_STATE;
            
            showByeButton();
            hideCancelButton();
            hideUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            hideCallButton();
            
            this.jainSipInvitingDialog.setRemoteTarget(jainSipResponse.getHeader("Contact"));
            var jainSipMessageACK = this.jainSipInvitingTransaction.createAck();
            jainSipMessageACK.addHeader(this.jainSipContactHeader);
            jainSipMessageACK.addHeader(this.jainSipUserAgentHeader);
            this.jainSipInvitingDialog.sendAck(jainSipMessageACK);
            
            var sdpAnswerString = jainSipResponse.getContent();
            if(window.webkitRTCPeerConnection)
            {
                var sdpAnswer = new RTCSessionDescription({
                    type: 'answer',
                    sdp: sdpAnswerString
                });
            }
            else if(window.mozRTCPeerConnection)
            {
                var sdpAnswer = {
                    type: 'answer',
                    sdp: sdpAnswerString
                };
            }
           
            var application=this;
            this.peerConnectionState = 'answer-received';
            this.peerConnection.setRemoteDescription(sdpAnswer, function() {
                application.onPeerConnectionSetRemoteDescriptionSuccessCallback();
            }, function(error) {
                application.onPeerConnectionSetRemoteDescriptionErrorCallback(error);
            });        
        } 
        else if(statusCode==480)
        {
            alert(this.callee+" is busy, call rejected");  
            
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
            
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString())   
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString()) 
            
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
            
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
        }     
    } else if(this.invitingState==this.INVITING_CANCELLING_STATE)
{
        if(statusCode==200)
        {
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
          
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
            
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
        }    
    }
    else if(this.invitingState==this.INVITING_407_STATE)
    {
        if(statusCode< 200)
        {
            console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): 1XX response ignored"); 
        }
        else if(statusCode==200)
        {
            this.jainSipInvitingDialog=responseEvent.getOriginalTransaction().getDialog();
            this.invitingState=this.INVITING_ACCEPTED_STATE;
            
            showByeButton();
            hideCancelButton();
            hideUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            hideCallButton();
            
            this.jainSipInvitingDialog.setRemoteTarget(jainSipResponse.getHeader("Contact"));
            var jainSipMessageACK = this.jainSipInvitingTransaction.createAck();
            jainSipMessageACK.addHeader(this.jainSipContactHeader);
            jainSipMessageACK.addHeader(this.jainSipUserAgentHeader);
            this.jainSipInvitingDialog.sendAck(jainSipMessageACK);
            
            var sdpAnswerString = jainSipResponse.getContent();
            if(window.webkitRTCPeerConnection)
            {
                var sdpAnswer = new RTCSessionDescription({
                    type: 'answer',
                    sdp: sdpAnswerString
                });
            }
            else if(window.mozRTCPeerConnection)
            {
                var sdpAnswer = {
                    type: 'answer',
                    sdp: sdpAnswerString
                };
            }
            var application=this;
            this.peerConnectionState = 'answer-received';
            this.peerConnection.setRemoteDescription(sdpAnswer, function() {
                application.onPeerConnectionSetRemoteDescriptionSuccessCallback();
            }, function(error) {
                application.onPeerConnectionSetRemoteDescriptionErrorCallback(error);
            });
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
            
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
        }    
    } 
    else if(this.invitingState==this.INVITING_FAILED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): bad state, SIP response ignored"); 
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): bad state, SIP response ignored");
    } 
    else if(this.invitingState==this.INVITING_ACCEPTED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): bad state, SIP response ignored");
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): bad state, SIP response ignored");        
    } 
    else if(this.invitingState==this.INVITING_LOCAL_HANGINGUP_STATE)
    {
        if(statusCode==407)
        {
            this.invitingState=this.INVITING_HANGINGUP_407_STATE; 
            var jainSipByeRequest=this.jainSipInvitingDialog.createRequest("BYE");
            var clientTransaction  = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,jainSipByeRequest,this.configuration.sipPassword,this.configuration.sipLogin);
            this.messageFactory.addHeader(jainSipByeRequest, jainSipAuthorizationHeader); 
            this.jainSipInvitingDialog.sendRequest(clientTransaction);
        }
        else if(statusCode==200)
        {
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();

            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();

            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
        }
    } 
    else if(this.invitingState==this.INVITING_LOCAL_HANGINGUP_407_STATE)
    {
        if(statusCode==200)
        {
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
            
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
           
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();

            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
        }        
    } 
    else
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): bad state, SIP response ignored"); 
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): bad state, SIP response ignored");     
    }
}


SimpleWebRtcSipPhone.prototype.handleStateMachineInvitingRequestEvent =function(requestEvent){
    console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): this.invitingState="+this.invitingState);
    var jainSipRequest=requestEvent.getRequest();
    var requestMethod = jainSipRequest.getMethod();
    
    if(this.invitingState==this.INVITING_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");  
    } 
    else if(this.invitingState==this.INVITING_407_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");  
    } 
    else if(this.invitingState==this.INVITING_FAILED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");  
    } 
    else if(this.invitingState==this.INVITING_ACCEPTED_STATE)
    {
        if(requestMethod=="BYE")  
        {
            var jainSip200OKResponse=jainSipRequest.createResponse(200, "OK");
            jainSip200OKResponse.addHeader(this.jainSipContactHeader);
            requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
            
            alert(this.callee+" has hangup"); 
            
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();

            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
        }
    } 
    else if(this.invitingState==this.INVITING_LOCAL_HANGINGUP_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
    } 
    else if(this.invitingState==this.INVITING_LOCAL_HANGINGUP_407_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
    } 
    else
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
    } 
}

SimpleWebRtcSipPhone.prototype.handleStateMachineInvitedResponseEvent =function(responseEvent){
    console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): this.invitingState="+this.invitingState);
    var jainSipResponse=responseEvent.getResponse(); 
    var statusCode = parseInt(jainSipResponse.getStatusCode()); 
    if(this.invitedState==this.INVITED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): bad state, SIP response ignored"); 
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): bad state, SIP response ignored"); 
    } 
    else if(this.invitedState==this.INVITED_ACCEPTED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): bad state, SIP response ignored");
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): bad state, SIP response ignored");         
    } 
    else if(this.invitedState==this.INVITED_LOCAL_HANGINGUP_STATE)
    {
        if(statusCode==407)
        {
            this.invitedState=this.INVITED_HANGINGUP_407_STATE; 
            var jainSipByeRequest=this.jainSipInvitedDialog.createRequest("BYE");
            var clientTransaction  = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,jainSipByeRequest,this.configuration.sipPassword,this.configuration.sipLogin);
            this.messageFactory.addHeader(jainSipByeRequest, jainSipAuthorizationHeader); 
            this.jainSipInvitedDialog.sendRequest(clientTransaction);
        }
        else if(statusCode==200)
        {
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
        }
    } 
    else if(this.invitedState==this.INVITED_LOCAL_HANGINGUP_407_STATE)
    {
        if(statusCode==200)
        {
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString());
            hideByeButton();
            hideCancelButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideRegisterButton();
            hideAcceptButton();
            hideRejectButton();
            showCallButton();
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
        }        
    } 
}

SimpleWebRtcSipPhone.prototype.handleStateMachineInvitedRequestEvent =function(requestEvent){
    console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): this.invitedState="+this.invitedState);
    var jainSipRequest=requestEvent.getRequest();
    var requestMethod = jainSipRequest.getMethod();
    var headerFrom = jainSipRequest.getHeader("From");
    if(this.invitedState==this.INVITED_INITIAL_STATE)
    {
        if(requestMethod=="INVITE")  
        {
            // Store SIP context
            this.jainSipInvitedRequest=jainSipRequest;
            this.jainSipInvitedTransaction=requestEvent.getServerTransaction();
            this.jainSipInvitedDialog=requestEvent.getServerTransaction().getDialog();
        
            // Ringing
            var jainSip180ORingingResponse=jainSipRequest.createResponse(180, "Ringing");
            jainSip180ORingingResponse.addHeader(this.jainSipContactHeader);
            jainSip180ORingingResponse.addHeader(this.jainSipUserAgentHeader);
            requestEvent.getServerTransaction().sendResponse(jainSip180ORingingResponse);
            
            this.caller = sipUri = headerFrom.getAddress().getURI().getUser();
            console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent():  this.caller="+ this.caller);
            alert("Call from "+ this.caller + ": Accept or Reject");
            
            hideByeButton();
            hideRegisterButton();
            hideUnRegisterButton();
            hideCancelButton();
            hideCallButton();
            showAcceptButton();
            showRejectButton();
        } 
        else if(requestMethod=="CANCEL")  
        {
            // Send 200OK CANCEL
            var jainSip200OKResponse=jainSipRequest.createResponse(200, "OK");
            jainSip200OKResponse.addHeader(this.jainSipContactHeader);
            jainSip200OKResponse.addHeader(this.jainSipUserAgentHeader);
            requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
            
            // Send 487 (Request Cancelled) for the INVITE
            var jainSipResponse487=this.jainSipInvitedRequest.createResponse(487,"(Request Cancelled)");
            jainSipResponse487.addHeader(this.jainSipRegisterSentRequest.getHeader("User-Agent"));
            this.jainSipInvitedTransaction.sendMessage(jainSipResponse487);
            
            alert(this.caller + "has cancel"); 
            
            hideByeButton();
            hideRegisterButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideCancelButton();
            showCallButton();
            hideAcceptButton();
            hideRejectButton();

            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine(); 
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored"); 
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored"); 
        }
    } 
    else if(this.invitedState==this.INVITED_ACCEPTED_STATE)
    {
        if(requestMethod=="BYE")  
        {
            // Send 200OK
            var jainSip200OKResponse=jainSipRequest.createResponse(200, "OK");
            jainSip200OKResponse.addHeader(this.jainSipContactHeader);
            jainSip200OKResponse.addHeader(this.jainSipUserAgentHeader);
            requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
            
            alert(this.caller + "has hangup"); 
            
            hideByeButton();
            hideRegisterButton();
            if(this.configuration.sipRegisterMode==true) showUnRegisterButton();
            hideCancelButton();
            showCallButton();
            hideAcceptButton();
            hideRejectButton();

            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();

        }
        else if(requestMethod=="ACK")  
        {         
            this.jainSipInvitedDialog=requestEvent.getServerTransaction().getDialog();
        }
        else {
            alert("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored"); 
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored"); 
        }
    } 
    else if(this.invitedState==this.INVITED_LOCAL_HANGINGUP_STATE)
    {
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored"); 
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored");
    } 
    else if(this.invitedState==this.INVITED_LOCAL_HANGINGUP_407_STATE)
    {
        alert("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored"); 
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored");        
    } 
}
  
 
// RTCPeerConnection  state machine
 
SimpleWebRtcSipPhone.prototype.createPeerConnection =function(){
    console.debug("SimpleWebRtcSipPhone:createPeerConnection()");
    var peerConnectionConfiguration = {
        "iceServers": []
    };
    var application = this;
    if(this.configuration.stunServer)
    {
        peerConnectionConfiguration = {
            "iceServers": [{
                "url":"stun:"+this.configuration.stunServer
            }]
        };
    }
    if(window.webkitRTCPeerConnection)
    {
        this.peerConnection = new RTCPeerConnection(peerConnectionConfiguration);
    }
    else if(window.mozRTCPeerConnection)
    {
        this.peerConnection = new RTCPeerConnection();
    }
   
    this.peerConnection.onaddstream = function(event) {
        application.onPeerConnectionOnAddStreamCallback(event);
    }  
	
    this.peerConnection.onremovestream = function(event) {
        application.onPeerConnectionOnRemoveStreamCallback(event);
    }   
    
    this.peerConnection.onstatechange= function(event) {
        application.onPeerConnectionStateChangeCallback(event);
    }
          
    this.peerConnection.onicecandidate= function(rtcIceCandidateEvent) {
        application.onPeerConnectionIceCandidateCallback(rtcIceCandidateEvent);
    }
     
    this.peerConnection.ongatheringchange= function(event) {
        application.onPeerConnectionGatheringChangeCallback(event);
    }

    this.peerConnection.onicechange= function(event) {
        application.onPeerConnectionIceChangeCallback(event);
    } 
    
    if((window.webkitRTCPeerConnection))
    {
        this.peerConnection.onopen= function(event) {
            application.onPeerConnectionOnOpenCallback(event);
        }
     
        this.peerConnection.onidentityresult= function(event) {
            application.onPeerConnectionIdentityResultCallback(event);
        }
    
        this.peerConnection.onnegotationneeded= function(event) {
            application.onPeerConnectionIceNegotationNeededCallback(event);
        }
    }
}
 

  
SimpleWebRtcSipPhone.prototype.onPeerConnectionOnAddStreamCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback(): event="+event);   
    var peerConnection = event.currentTarget;
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback(): peerConnection.readyState="+ peerConnection.readyState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback(): this.peerConnectionState="+this.peerConnectionState);
    
    if(window.webkitRTCPeerConnection)
    {
        this.remoteAudioVideoMediaStream = event.stream;
        var url = webkitURL.createObjectURL(this.remoteAudioVideoMediaStream);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback():url="+url); 
        document.getElementById("remoteVideo").src= url;
        document.getElementById("remoteVideo").play();     
    }
    else if(window.mozRTCPeerConnection)
    {
        document.getElementById("remoteVideo").mozSrcObject=event.stream;
        document.getElementById("remoteVideo").play();
    } 
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionOnRemoveStreamCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback(): event="+event); 
    var peerConnection = event.currentTarget;
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback(): peerConnection.readyState="+peerConnection.readyState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback(): this.peerConnectionState="+this.peerConnectionState);
    
    if(window.webkitRTCPeerConnection)
    {
        this.remoteAudioVideoMediaStream = null; 
        document.getElementById("remoteVideo").src= null;
        document.getElementById("remoteVideo").pause();     
    }
    else if(window.mozRTCPeerConnection)
    {
        document.getElementById("remoteVideo").mozSrcObject=null;
        document.getElementById("remoteVideo").pause();
    } 
}


SimpleWebRtcSipPhone.prototype.onPeerConnectionOnOpenCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback(): event="+event); 
    var peerConnection = event.currentTarget;
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback():this.peerConnection.readyState="+peerConnection.readyState);   
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback(): this.peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback(): this.peerConnection.iceState="+peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback(): this.peerConnectionState="+this.peerConnectionState);
}
 
SimpleWebRtcSipPhone.prototype.onPeerConnectionStateChangeCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback(): event="+event);
    var peerConnection = event.currentTarget;
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback(): peerConnection.readyState="+peerConnection.readyState);   
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback(): this.peerConnectionState="+this.peerConnectionState);
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionIceCandidateCallback =function(rtcIceCandidateEvent){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): rtcIceCandidateEvent="+rtcIceCandidateEvent);
    var peerConnection = rtcIceCandidateEvent.currentTarget;
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): peerConnection.readyState="+peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback():  this.peerConnectionState="+this.peerConnectionState);
    
    if(rtcIceCandidateEvent.candidate!=null)
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback: RTCIceCandidateEvent.candidate.candidate="+rtcIceCandidateEvent.candidate.candidate);
    }
    else
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback: no anymore ICE candidate");
        if(window.webkitRTCPeerConnection)
        {
            if(this.peerConnectionState == 'preparing-offer') 
            {
                // Send INVITE
                this.sendInviteSipRequest(this.peerConnection.localDescription.sdp);
                this.peerConnectionState = 'offer-sent';
            } 
            else if (this.peerConnectionState == 'preparing-answer') 
            {
                // Send 200 OK
                this.send200OKSipResponse(this.peerConnection.localDescription.sdp)
                this.peerConnectionState = 'established';
                showByeButton();
                hideAcceptButton();
                hideRejectButton();
                hideRegisterButton();
                hideCallButton();
                hideUnRegisterButton(); 
            }
            else if (this.peerConnectionState == 'established') 
            {
            // Why this last ice candidate event
            } 
            else
            {
                console.log("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): RTCPeerConnection bad state!");
            }
        }
    }
}


SimpleWebRtcSipPhone.prototype.onPeerConnectionCreateOfferSuccessCallback =function(offer){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): offer="+offer.prototype); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): offer="+offer.sdp); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): this.peerConnectionState="+this.peerConnectionState);
 
    if(this.peerConnection!=null)
    {
        if (this.peerConnectionState == 'new') 
        {
            // Preparing offer.
            var application=this;
            this.peerConnectionState = 'preparing-offer';
            this.peerConnectionLocalDescription=offer;
            this.peerConnection.setLocalDescription(offer, function() {
                application.onPeerConnectionSetLocalDescriptionSuccessCallback();
            }, function(error) {
                application.onPeerConnectionSetLocalDescriptionErrorCallback(error);
            });
        } 
        else
        {
            console.error("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): RTCPeerConnection bad state!");
        }
    }
    else 
    {
        console.warn("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): this.peerConnection is null, bug in state machine!");        
    }
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionCreateOfferErrorCallback =function(error){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback():error="+error); 
     
    if(this.peerConnection!=null)
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback(): this.peerConnectionState="+this.peerConnectionState);
    // TODO Notify Error to INVITE state machine
    }
    else 
    {
        console.warn("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback(): this.peerConnection is null, bug in state machine!");        
    }
    alert("error:"+error);
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionSetLocalDescriptionSuccessCallback =function(){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback()"); 
    if(this.peerConnection!=null)
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback(): this.peerConnectionState="+this.peerConnectionState);
        if(window.mozRTCPeerConnection)
        {
            if(this.peerConnectionState == 'preparing-offer') 
            {
               
                // Send INVITE
                if(this.peerConnection.localDescription) this.sendInviteSipRequest(this.peerConnection.localDescription.sdp);
                else  this.sendInviteSipRequest(this.peerConnectionLocalDescription.sdp);
                this.peerConnectionState = 'offer-sent';
            } 
            else if (this.peerConnectionState == 'preparing-answer') 
            {
                // Send 200 OK
                if(this.peerConnection.localDescription) this.send200OKSipResponse(this.peerConnection.localDescription.sdp);
                else  this.send200OKSipResponse(this.peerConnectionLocalDescription.sdp);
                this.peerConnectionState = 'established';
                showByeButton();
                hideAcceptButton();
                hideRejectButton();
                hideRegisterButton();
                hideCallButton();
                hideUnRegisterButton(); 
            }
            else if (this.peerConnectionState == 'established') 
            {
            // Why this last ice candidate event
            } 
            else
            {
                console.log("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): RTCPeerConnection bad state!");
            }
        }
    }
    else 
    {
        console.warn("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback(): this.peerConnection is null, bug in state machine!");        
    }
// Nothing to do, just waiting end ICE resolution
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionSetLocalDescriptionErrorCallback =function(error){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback():error="+error); 
     
    if(this.peerConnection!=null)
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback(): this.peerConnectionState="+this.peerConnectionState);
    // TODO Notify Error to INVITE state machine
    }
    else 
    {
        console.warn("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback(): this.peerConnection is null, bug in state machine!");        
    }
    alert("error:"+error);

}

SimpleWebRtcSipPhone.prototype.onPeerConnectionCreateAnswerSuccessCallback =function(answer){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback():answer="+answer.sdp); 
    if(this.peerConnection!=null)
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback(): this.peerConnectionState="+this.peerConnectionState);

        if (this.peerConnectionState == 'offer-received') 
        {
            // Prepare answer.
            var application=this;
            this.peerConnectionState = 'preparing-answer';
            this.peerConnectionLocalDescription=answer;
            this.peerConnection.setLocalDescription(answer, function() {
                application.onPeerConnectionSetLocalDescriptionSuccessCallback();
            }, function(error) {
                application.onPeerConnectionSetLocalDescriptionErrorCallback(error);
            });
        } 
        else
        {
            console.log("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback(): RTCPeerConnection bad state!");
        }
    }
    else 
    {
        console.warn("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback(): this.peerConnection is null, bug in state machine!");        
    }
}


SimpleWebRtcSipPhone.prototype.onPeerConnectionCreateAnswerErrorCallback =function(error){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback():error="+error);
     
    if(this.peerConnection!=null)
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback(): this.peerConnectionState="+this.peerConnectionState);
    // TODO Notify Error to INVITE state machine
    }
    else 
    {
        console.warn("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback(): this.peerConnection is null, bug in state machine!");        
    }
    alert("error:"+error);

}


SimpleWebRtcSipPhone.prototype.onPeerConnectionSetRemoteDescriptionSuccessCallback =function(){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback()");
    
    if(this.peerConnection!=null)
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): this.peerConnectionState="+this.peerConnectionState);

        if (this.peerConnectionState == 'answer-received') 
        {            
            this.peerConnectionState = 'established';
        }
        else if (this.peerConnectionState == 'offer-received') 
        {            
            var application=this;
            if(window.webkitRTCPeerConnection)
            {
                this.peerConnection.createAnswer(function(answer) {
                    application.onPeerConnectionCreateAnswerSuccessCallback(answer);
                }, function(error) {
                    application.onPeerConnectionCreateAnswerErrorCallback(error);
                });  
            }
            else if(window.mozRTCPeerConnection)
            {
                this.peerConnection.createAnswer(function(answer) {
                    application.onPeerConnectionCreateAnswerSuccessCallback(answer);
                }, function(error) {
                    application.onPeerConnectionCreateAnswerErrorCallback(error);
                },{
                    "mandatory": {
                        "MozDontOfferDataChannel": true
                    }
                }); 
            } 
        }
        else {
            console.log("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): RTCPeerConnection bad state!");
        }
    }
    else 
    {
        console.warn("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): this.peerConnection is null, bug in state machine!");        
    }
}


SimpleWebRtcSipPhone.prototype.onPeerConnectionSetRemoteDescriptionErrorCallback =function(error){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback():error="+error);
     
    if(this.peerConnection!=null)
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback(): this.peerConnectionState="+this.peerConnectionState);
    // TODO Notify Error to INVITE state machine
    }
    else 
    {
        console.warn("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback(): this.peerConnection is null, bug in state machine!");        
    }
    alert("error:"+error);

}


SimpleWebRtcSipPhone.prototype.onPeerConnectionIceNegotationNeededCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback():event="+event);
    var peerConnection = event.currentTarget;
    
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback(): this.peerConnection.readyState="+peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback(): this.peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback(): this.peerConnection.iceState="+peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback(): this.peerConnectionState="+this.peerConnectionState);
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionGatheringChangeCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback():event="+event);
    var peerConnection = event.currentTarget;
    
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback(): peerConnection.readyState="+peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback(): this.peerConnectionState="+this.peerConnectionState);
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionIceChangeCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback():event="+event); 
    var peerConnection = event.currentTarget;
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback(): peerConnection.readyState="+peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback(): this.peerConnectionState="+this.peerConnectionState);
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionIdentityResultCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback():event="+event);
    var peerConnection = event.currentTarget; 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback(): peerConnection.readyState="+peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback(): this.peerConnectionState="+this.peerConnectionState);
}

