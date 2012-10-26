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


function SimpleWebRtcSipPhone(sipWsUrl) {
    console.debug("SimpleWebRtcSipPhone:SimpleWebRtcSipPhone(): sipWsUrl="+sipWsUrl);
    // SIP Stack config
    this.sipWsUrl=sipWsUrl;
    this.sipUserAgentName="SimpleWebRtcSipPhone";
    this.init();
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

//  State of outgoing call peerConnectionState machine
SimpleWebRtcSipPhone.prototype.INVITED_INITIAL_STATE="INVITED_INITIAL_STATE";
SimpleWebRtcSipPhone.prototype.INVITED_ACCEPTED_STATE="INVITED_ACCEPTED_STATE";
SimpleWebRtcSipPhone.prototype.INVITED_LOCAL_HANGINGUP_STATE="INVITED_LOCAL_HANGINGUP_STATE";
SimpleWebRtcSipPhone.prototype.INVITED_LOCAL_HANGINGUP_407_STATE="INVITED_LOCAL_HANGINGUP_407_STATE";
SimpleWebRtcSipPhone.prototype.INVITED_HANGUP_STATE="INVITED_HANGUP_STATE";

SimpleWebRtcSipPhone.prototype.init =function(){
    console.debug ("SimpleWebRtcSipPhone:init()");  
    
    this.initGUI();
    this.initSipAccount();
    this.initSipRegisterStateMachine();
    this.initSipInvitingStateMachine();
    this.initSipInvitedStateMachine();
    this.initPeerConnectionStateMachine();
    this.initJainSipStack(); 
}

SimpleWebRtcSipPhone.prototype.initGUI=function(){
    console.debug ("SimpleWebRtcSipPhone:initGUI()");  
    hideCallButton();
    hideUnRegisterButton();
    showRegisterButton();
    hideByeButton();
}

SimpleWebRtcSipPhone.prototype.initSipAccount=function(){
    console.debug ("SimpleWebRtcSipPhone:initSipAccount()");    
    // SIP account config        
    this.sipDomain=null;
    this.sipDisplayName=null;
    this.sipUserName=null;
    this.sipLogin=null;
    this.sipPassword=null;
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
    this.jainSipInvitingSentRequest=null;
    this.jainSipInvitingDialog=null;
    this.jainSipInvitingTransaction=null;
}

SimpleWebRtcSipPhone.prototype.initSipInvitedStateMachine=function(){
    console.debug ("SimpleWebRtcSipPhone:initSipInvitedStateMachine()");  
    // SIP ougoing call (INVITED) state machine 
    this.invitedState=this.INVITED_INITIAL_STATE;
    this.jainSipInvitedReceivedRequest=null;
    this.jainSipInvitedDialog=null;
    this.jainSipInvitedTransaction=null;
}
    
SimpleWebRtcSipPhone.prototype.initJainSipStack=function(){
    console.debug ("SimpleWebRtcSipPhone:initJainSipStack()");  
   
    // Create JAIN SIP main object
    this.sipFactory=new SipFactory();
    this.sipStack=this.sipFactory.createSipStack(this.sipWsUrl,this.sipUserAgentName);
    this.listeningPoint=this.sipStack.createListeningPoint();
    this.sipProvider=this.sipStack.createSipProvider(this.listeningPoint);
    this.sipProvider.addSipListener(this);
    this.headerFactory=this.sipFactory.createHeaderFactory();
    this.addressFactory=this.sipFactory.createAddressFactory();
    this.messageFactory=this.sipFactory.createMessageFactory(this.listeningPoint); 
    this.sipStack.start();
}
 
SimpleWebRtcSipPhone.prototype.initPeerConnectionStateMachine=function(){
    console.debug ("SimpleWebRtcSipPhone:initPeerConnectionStateMachine()");     
    
    // PeerConnection/Media call context
    var stunServer=document.getElementById("stunServer").value;
    if(stunServer!="")
    {
        this.peerConnectionStunServer = stunServer; 
    }
    if(this.peerConnection)
    {
        console.debug ("SimpleWebRtcSipPhone:initPeerConnectionStateMachine(): force peerConnection close");
        document.getElementById("remoteVideo").pause();
        document.getElementById("remoteVideo").src= null;
        this.peerConnection.close();
    }
    this.peerConnection = null;
    this.peerConnectionMessage=null;
    this.peerConnectionActionNeeded = false;
    this.peerConnectionState = 'new';
    this.peerConnectionIceStarted = false;
    this.peerConnectionMoreIceComing = true;
    this.peerConnectionIceCandidateCount = 0;
    this.remoteAudioVideoMediaStream=null;
    this.lastReceivedSdpOfferString=null;
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
    console.debug("SimpleWebRtcSipPhone:processTimeout()"); 
}

//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processTransactionTerminated =function(transactionTerminatedEvent){
    console.debug("SimpleWebRtcSipPhone:processTransactionTerminated()"); 
}
//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processDisconnected =function(){   
    console.error("SimpleWebRtcSipPhone:processDisconnected()"); 
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
    this.register(
        document.getElementById("sipDomain").value,
        document.getElementById("sipDisplayName").value,
        document.getElementById("sipUserName").value,
        document.getElementById("sipLogin").value,
        document.getElementById("sipPassword").value);
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
        console.debug("SimpleWebRtcSipPhone:processResponse(): response ignored");      
    }
}

//SIPListener interface implementation
SimpleWebRtcSipPhone.prototype.processRequest =function(requestEvent){
    console.debug("SimpleWebRtcSipPhone:processRequest()");
    var jainSipRequest=requestEvent.getRequest(); 
    var jainSipRequestMethod=jainSipRequest.getMethod();   
    if((jainSipRequestMethod=="BYE")||(jainSipRequestMethod=="ACK")||(jainSipRequestMethod=="CANCEL"))
    {
        // Subscequent request on ongoing dialog
        if(this.invitingState!=this.INVITING_INITIAL_STATE) this.handleStateMachineInvitingRequestEvent(requestEvent); 
        else if(this.invitedState!=this.INVITED_INITIAL_STATE)  this.handleStateMachineInvitedRequestEvent(requestEvent);
        else
        {
            console.debug("SimpleWebRtcSipPhone:processResponse(): request ignored");      
        }
    }
    else if(jainSipRequestMethod=="INVITE")
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
    else
    {
        console.debug("SimpleWebRtcSipPhone:processResponse(): request ignored");      
    }
}



SimpleWebRtcSipPhone.prototype.register =function(sipDomain, sipDisplayName, sipUserName, sipLogin, sipPassword){
    console.debug("SimpleWebRtcSipPhone:register(): sipDomain="+sipDomain);
    console.debug("SimpleWebRtcSipPhone:register(): sipDisplayName="+sipDisplayName);
    console.debug("SimpleWebRtcSipPhone:register(): sipUserName="+sipUserName);
    console.debug("SimpleWebRtcSipPhone:register(): sipLogin="+sipLogin);
    console.debug("SimpleWebRtcSipPhone:register(): sipPassword="+sipPassword);
    if(this.registerState==this.UNREGISTERED_STATE)
    {
        try
        {
            // Save SIP account profile
            this.sipDomain=sipDomain;
            this.sipDisplayName=sipDisplayName;
            this.sipUserName=sipUserName;
            this.sipLogin=sipLogin;
            this.sipPassword=sipPassword;
    
            this.jainSipContactHeader = this.listeningPoint.createContactHeader(sipUserName);
            this.jainSipUserAgentHeader = this.headerFactory.createUserAgentHeader(this.listeningPoint.getUserAgent());
            
            // Send SIP REGISTER request
            var fromSipUriString=this.sipUserName+"@"+this.sipDomain;            
            var jainSipCseqHeader=this.headerFactory.createCSeqHeader(1,"REGISTER");
            var jainSipCallIdHeader=this.headerFactory.createCallIdHeader();
            var jainSipExpiresHeader=this.headerFactory.createExpiresHeader(3600);
            var jainSipMaxForwardHeader=this.headerFactory.createMaxForwardsHeader(70);
            var jainSipSupportedHeader=this.headerFactory.createSupportedHeader("path");
            var jainSipRequestUri=this.addressFactory.createSipURI_user_host(null,this.sipDomain);
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
            this.messageFactory.addHeader(jainSipRegisterRequest, jainSipSupportedHeader); 
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
    }  
}


SimpleWebRtcSipPhone.prototype.keepAliveRegister =function(){
    console.debug("SimpleWebRtcSipPhone:keepAliveRegister()");
    
    if(this.registerState==this.REGISTERED_STATE)
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
        throw "SimpleWebRtcSipPhone:keepAliveRegister(): bad state, action keep alive register unauthorized";            
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
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,this.jainSipRegisterSentRequest,this.sipPassword,"sip:sip.mobistar.com",this.sipLogin);
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
                showUnRegisterButton();
                hideRegisterButton();
                hideByeButton();
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
            alert("SIP registration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine())    
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
                showUnRegisterButton();
                hideRegisterButton();
                hideByeButton();
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
            alert("SIP registration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            this.initGUI();
        } 
    }
    else if(this.registerState==this.REGISTERED_STATE)
    {
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
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,this.jainSipRegisterSentRequest,this.sipPassword,"sip:sip.mobistar.com",this.sipLogin);
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
                hideCallButton();
                hideUnRegisterButton();
                showRegisterButton();
                hideByeButton();
            }
        }
        else
        {
            alert("SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());  
            this.initGUI();
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
                this.registeredFlag=false;
                hideCallButton();
                hideUnRegisterButton();
                showRegisterButton();
                hideByeButton();
            }
        }
        else
        {
            alert("SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            this.initGUI();
        }
    }
    else if(this.registerState==this.UNREGISTERED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");  
    }
    else
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineRegisterResponseEvent(): bad state, SIP response ignored");    
    }
}


SimpleWebRtcSipPhone.prototype.call =function(to){
    console.debug("SimpleWebRtcSipPhone:call():to: "+to);
    if(this.registeredFlag==true)
    {
        if(this.invitingState==this.INVITING_INITIAL_STATE)
        {
            try
            {
                this.callee=to;
                hideCallButton();
                this.createPeerConnection();
                this.peerConnection.addStream(this.localAudioVideoMediaStream, {
                    has_audio: true, 
                    has_video: true
                });
                var application=this;
                this.peerConnection.createOffer(function(offer) {
                    application.onPeerConnectionCreateOfferSuccessCallback(offer);
                }, function(error) {
                    application.onPeerConnectionCreateOfferErrorCallback(error);
                });
            }
            catch(exception)
            {
                console.error("SimpleWebRtcSipPhone:call(): catched exception:"+exception);
                alert("SimpleWebRtcSipPhone:call(): catched exception:"+exception);  
                this.initPeerConnectionStateMachine();
                this.initSipInvitingStateMachine();
                showCallButton(); 
            }
        }
        else
        {
            alert("SimpleWebRtcSipPhone:call(): bad state, action call unauthorized");    
        }
    }
    else
    {
        alert("SimpleWebRtcSipPhone:call(): unregistered, action call unauthorized");           
    }
}


SimpleWebRtcSipPhone.prototype.sendInviteSipRequest =function(sdpOffer){
    console.debug("SimpleWebRtcSipPhone:sendInviteSipRequest()"); 
    try{
        var fromSipUriString=this.sipUserName+"@"+this.sipDomain;
        var toSipUriString= this.callee+"@"+this.sipDomain;
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
        this.jainSipInvitingSentRequest=this.messageFactory.createRequest(jainSipRequestUri,"INVITE",
            jainSipCallIdHeader,
            jainSipCseqHeader,
            jainSipFromHeader,
            jainSipToHeader,
            jainSipMaxForwardHeader,
            jainSipContentTypeHeader,
            sdpOffer); 
                      
        this.messageFactory.addHeader( this.jainSipInvitingSentRequest, this.jainSipUserAgentHeader);
        this.messageFactory.addHeader( this.jainSipInvitingSentRequest, jainSipAllowListHeader);
        this.messageFactory.addHeader( this.jainSipInvitingSentRequest, this.jainSipContactHeader);   
        this.invitingState=this.INVITING_STATE;
        this.jainSipInvitingTransaction = this.sipProvider.getNewClientTransaction(this.jainSipInvitingSentRequest);
        this.jainSipInvitingSentRequest.setTransaction(this.jainSipInvitingTransaction);
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
        var jainSip200OKResponse=this.jainSipInvitedReceivedRequest.createResponse(200, "OK");
        jainSip200OKResponse.addHeader(this.jainSipContactHeader);
        jainSip200OKResponse.addHeader(this.jainSipUserAgentHeader);
        jainSip200OKResponse.setMessageContent("application","sdp",sdpOffer);
        this.jainSipInvitedTransaction.sendResponse(jainSip200OKResponse);
        showByeButton();
        hideCallButton();
        hideUnRegisterButton();
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



SimpleWebRtcSipPhone.prototype.bye =function(){
    console.debug("SimpleWebRtcSipPhone:bye()");
   
    if(this.invitingState==this.INVITING_ACCEPTED_STATE)
    {
        try
        {
            var jainSipByeRequest=this.jainSipInvitingDialog.createRequest("BYE");
            jainSipByeRequest.addHeader(this.jainSipContactHeader);
            jainSipByeRequest.addHeader(this.jainSipUserAgentHeader);
            var clientTransaction  = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
            this.jainSipInvitingDialog.sendRequest(clientTransaction);
            this.invitingState=this.INVITING_LOCAL_HANGINGUP_STATE;
        }
        catch(exception)
        {
            console.error("SimpleWebRtcSipPhone:bye(): catched exception:"+exception);
            alert("SimpleWebRtcSipPhone:bye(): catched exception:"+exception); 
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
            hideByeButton();
            showCallButton();
        }
    }
    else if(this.invitedState==this.INVITED_ACCEPTED_STATE)
    {
        try
        {
            var jainSipByeRequest=this.jainSipInvitedDialog.createRequest("BYE");
            jainSipByeRequest.addHeader(this.jainSipContactHeader);
            jainSipByeRequest.addHeader(this.jainSipUserAgentHeader);
            var clientTransaction  = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
            this.jainSipInvitedDialog.sendRequest(clientTransaction);
            this.invitedState=this.INVITED_LOCAL_HANGINGUP_STATE;
        }
        catch(exception)
        {
            console.error("SimpleWebRtcSipPhone:bye(): catched exception:"+exception);
            alert("SimpleWebRtcSipPhone:bye(): catched exception:"+exception); 
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
            hideByeButton();
            showCallButton();
            showUnRegisterButton();
        }
    }
    else
    {
        alert("SimpleWebRtcSipPhone:bye(): bad state, action call unauthorized");     
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
            var num=new Number(this.jainSipInvitingSentRequest.getCSeq().getSeqNumber());
            this.jainSipInvitingSentRequest.getCSeq().setSeqNumber(num+1);
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,this.jainSipInvitingSentRequest,this.sipPassword,this.sipLogin);
            this.messageFactory.addHeader(this.jainSipInvitingSentRequest, jainSipAuthorizationHeader); 
            this.jainSipInvitingSentRequest = this.messageFactory.setNewViaHeader(this.jainSipInvitingSentRequest);
            var jainSipClientTransaction = this.sipProvider.getNewClientTransaction(this.jainSipInvitingSentRequest);
            this.jainSipInvitingSentRequest.setTransaction(jainSipClientTransaction);
            jainSipClientTransaction.sendRequest();
        }
        else if(statusCode==200)
        {
            this.jainSipInvitingDialog=responseEvent.getOriginalTransaction().getDialog();
            this.invitingState=this.INVITING_ACCEPTED_STATE;
            showByeButton();
            hideUnRegisterButton();
            this.jainSipInvitingDialog.setRemoteTarget(jainSipResponse.getHeader("Contact"));
            var jainSipMessageACK = responseEvent.getOriginalTransaction().createAck();
            this.jainSipInvitingDialog.sendAck(jainSipMessageACK);
            var sdpAnswerString = jainSipResponse.getContent();
            var sdpAnswer = new RTCSessionDescription({
                type: 'answer',
                sdp: sdpAnswerString
            });
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
            alert("SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine()) 
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
            showCallButton();
            hideByeButton();
            showUnRegisterButton();

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
            hideUnRegisterButton();
            this.jainSipInvitingDialog.setRemoteTarget(jainSipResponse.getHeader("Contact"));
            var jainSipMessageACK = responseEvent.getOriginalTransaction().createAck();
            this.jainSipInvitingDialog.sendAck(jainSipMessageACK);
        }
        else
        {
            alert("SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            hideByeButton();
            showCallButton();
            showUnRegisterButton();
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
        }    
    } 
    else if(this.invitingState==this.INVITING_FAILED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): bad state, SIP response ignored");        
    } 
    else if(this.invitingState==this.INVITING_ACCEPTED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): bad state, SIP response ignored");        
    } 
    else if(this.invitingState==this.INVITING_LOCAL_HANGINGUP_STATE)
    {
        if(statusCode==407)
        {
            this.invitingState=this.INVITING_HANGINGUP_407_STATE; 
            var jainSipByeRequest=this.jainSipInvitingDialog.createRequest("BYE");
            var clientTransaction  = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,jainSipByeRequest,this.sipPassword,this.sipLogin);
            this.messageFactory.addHeader(jainSipByeRequest, jainSipAuthorizationHeader); 
            this.jainSipInvitingDialog.sendRequest(clientTransaction);
        }
        else if(statusCode==200)
        {
            hideByeButton();
            showUnRegisterButton();
            showCallButton();
            document.getElementById("remoteVideo").pause();
            document.getElementById("remoteVideo").src= null;
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
        }
        else
        {
            alert("SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            hideByeButton();
            showUnRegisterButton();
            showCallButton();
            document.getElementById("remoteVideo").pause();
            document.getElementById("remoteVideo").src= null;
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
        }
    } 
    else if(this.invitingState==this.INVITING_LOCAL_HANGINGUP_407_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingResponseEvent(): bad state, SIP response ignored"); 
        if(statusCode==200)
        {
            hideByeButton();
            showUnRegisterButton();
            showCallButton();
            document.getElementById("remoteVideo").pause();
            document.getElementById("remoteVideo").src= null;
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
        }
        else
        {
            alert("SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            hideByeButton();
            showUnRegisterButton();
            showCallButton();
            document.getElementById("remoteVideo").pause();
            document.getElementById("remoteVideo").src= null;
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
        }        
    } 
}

SimpleWebRtcSipPhone.prototype.handleStateMachineInvitingRequestEvent =function(requestEvent){
    console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): this.invitingState="+this.invitingState);
    var jainSipRequest=requestEvent.getRequest();
    var requestMethod = jainSipRequest.getMethod();
    
    if(this.invitingState==this.INVITING_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");  
    } 
    else if(this.invitingState==this.INVITING_407_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");  
    } 
    else if(this.invitingState==this.INVITING_FAILED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");        
    } 
    else if(this.invitingState==this.INVITING_ACCEPTED_STATE)
    {
        if(requestMethod=="BYE")  
        {
            var jainSip200OKResponse=jainSipRequest.createResponse(200, "OK");
            jainSip200OKResponse.addHeader(this.jainSipContactHeader);
            requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
            hideByeButton();
            showUnRegisterButton();
            showCallButton();
            document.getElementById("remoteVideo").pause();
            document.getElementById("remoteVideo").src= null;
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();  
            alert("Contact has hangup"); 
        }
        else
        {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored"); 
        }
    } 
    else if(this.invitingState==this.INVITING_LOCAL_HANGINGUP_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");
    } 
    else if(this.invitingState==this.INVITING_LOCAL_HANGINGUP_407_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitingRequestEvent(): bad state, SIP request ignored");        
    } 
}

SimpleWebRtcSipPhone.prototype.handleStateMachineInvitedResponseEvent =function(responseEvent){
    console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): this.invitingState="+this.invitingState);
    var jainSipResponse=responseEvent.getResponse(); 
    var statusCode = parseInt(jainSipResponse.getStatusCode()); 
    if(this.invitedState==this.INVITED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): bad state, SIP response ignored");    
    } 
    else if(this.invitedState==this.INVITED_ACCEPTED_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedResponseEvent(): bad state, SIP response ignored");        
    } 
    else if(this.invitedState==this.INVITED_LOCAL_HANGINGUP_STATE)
    {
        if(statusCode==407)
        {
            this.invitedState=this.INVITED_HANGINGUP_407_STATE; 
            var jainSipByeRequest=this.jainSipInvitedDialog.createRequest("BYE");
            var clientTransaction  = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,jainSipByeRequest,this.sipPassword,this.sipLogin);
            this.messageFactory.addHeader(jainSipByeRequest, jainSipAuthorizationHeader); 
            this.jainSipInvitedDialog.sendRequest(clientTransaction);
        }
        else if(statusCode==200)
        {
            hideByeButton();
            showUnRegisterButton();
            showCallButton();
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
        }
        else
        {
            alert("SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            hideByeButton();
            showUnRegisterButton();
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
            showUnRegisterButton();
            showCallButton();
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
        }
        else
        {
            alert("SIP BYE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            hideByeButton();
            showUnRegisterButton();
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
        var jainSip180ORingingResponse=jainSipRequest.createResponse(180, "Ringing");
        jainSip180ORingingResponse.addHeader(this.jainSipContactHeader);
        jainSip180ORingingResponse.addHeader(this.jainSipUserAgentHeader);
        requestEvent.getServerTransaction().sendResponse(jainSip180ORingingResponse);
            
        var sipUri = headerFrom.getAddress().getURI();
        console.debug("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): sipUri.getUser()="+sipUri.getUser());
        var result = confirm("Call from "+sipUri.getUser()+ ": Accept or Reject");
        if (result==true)
        {
            // Accepted 
            try
            {
                this.jainSipInvitedReceivedRequest=jainSipRequest;
                this.jainSipInvitedTransaction=requestEvent.getServerTransaction();
                this.jainSipInvitedDialog=requestEvent.getServerTransaction().getDialog();
                this.createPeerConnection();
                this.peerConnection.addStream(this.localAudioVideoMediaStream, {
                    has_audio: true, 
                    has_video: true
                });
                this.lastReceivedSdpOfferString = jainSipRequest.getContent();
                var sdpOffer = new RTCSessionDescription({
                    type: 'offer',
                    sdp: this.lastReceivedSdpOfferString
                });
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
                var jainSipResponse480=jainSipRequest.createResponse(480,"Temporarily Unavailable");
                jainSipResponse480.addHeader(this.jainSipContactHeader);
                jainSipResponse480.addHeader(this.jainSipUserAgentHeader);
                requestEvent.getServerTransaction().sendResponse(jainSipResponse480);
                hideByeButton();
                showCallButton();
                showUnRegisterButton(); 
                this.initPeerConnectionStateMachine();
                this.initSipInvitedStateMachine();
                console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): catched exception:"+exception);
                alert("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): catched exception:"+exception);  
            }
        }
        else
        {
            // Rejected 
            // Temporarily Unavailable
            var jainSipResponse480=jainSipRequest.createResponse(480,"Temporarily Unavailable");
            jainSipResponse480.addHeader(this.jainSipContactHeader);
            jainSipResponse480.addHeader(this.jainSipUserAgentHeader);
            requestEvent.getServerTransaction().sendResponse(jainSipResponse480);
            hideByeButton();
            showCallButton();
            showUnRegisterButton();
            this.initPeerConnectionStateMachine();
            this.initSipInvitedStateMachine();
        }  
    } 
    else if(this.invitedState==this.INVITED_ACCEPTED_STATE)
    {
        if(requestMethod=="BYE")  
        {
            showCallButton();
            hideByeButton();
            showUnRegisterButton(); 
            var jainSip200OKResponse=jainSipRequest.createResponse(200, "OK");
            jainSip200OKResponse.addHeader(this.jainSipContactHeader);
            jainSip200OKResponse.addHeader(this.jainSipUserAgentHeader);
            requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
            this.invitedState=this.INVITED_INITIAL_STATE;
            this.jainSipInvitedReceivedRequest=null;
            this.jainSipInvitedDialog=null;
            document.getElementById("remoteVideo").pause();
            document.getElementById("remoteVideo").src= null;
            this.initPeerConnectionStateMachine();
            this.initSipInvitingStateMachine();
            alert("Contact has hangup"); 
        }
        else if(requestMethod=="ACK")  
        {         
            this.jainSipInvitedDialog=requestEvent.getServerTransaction().getDialog();
        }
        else {
            console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored"); 
        }
    } 
    else if(this.invitedState==this.INVITED_LOCAL_HANGINGUP_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored");
    } 
    else if(this.invitedState==this.INVITED_LOCAL_HANGINGUP_407_STATE)
    {
        console.error("SimpleWebRtcSipPhone:handleStateMachineInvitedRequestEvent(): bad state, SIP request ignored");        
    } 
}
 
 
 
// RTCPeerConnection  state machine
 
SimpleWebRtcSipPhone.prototype.createPeerConnection =function(){
    console.debug("SimpleWebRtcSipPhone:createPeerConnection()");
    var application = this;
    this.peerConnection = new webkitRTCPeerConnection(null, null);	
		
    this.peerConnection.onaddstream = function(event) {
        application.onPeerConnectionOnAddStreamCallback(event);
    }  
	
    this.peerConnection.onremovestream = function(event) {
        application.onPeerConnectionOnRemoveStreamCallback(event);
    }   
    
    this.peerConnection.onopen= function(event) {
        application.onPeerConnectionOnOpenCallback(event);
    }
    
    this.peerConnection.onstatechange= function(event) {
        application.onPeerConnectionStateChangeCallback(event);
    }
    
    this.peerConnection.onicecandidate= function(rtcIceCandidateEvent) {
        application.onPeerConnectionIceCandidateCallback(rtcIceCandidateEvent);
    }
    
    this.peerConnection.onnegotationneeded= function(event) {
        application.onPeerConnectionIceNegotationNeededCallback(event);
    }
    
    this.peerConnection.ongatheringchange= function(event) {
        application.onPeerConnectionGatheringChangeCallback(event);
    }

    this.peerConnection.onicechange= function(event) {
        application.onPeerConnectionIceChangeCallback(event);
    } 
    
    this.peerConnection.onidentityresult= function(event) {
        application.onPeerConnectionIdentityResultCallback(event);
    }
}
 

  
SimpleWebRtcSipPhone.prototype.onPeerConnectionOnAddStreamCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback(): event="+event); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback():this.peerConnection.readyState="+this.peerConnection.readyState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback: this.peerConnectionState="+this.peerConnectionState);
    
    this.remoteAudioVideoMediaStream = event.stream;
    var url = webkitURL.createObjectURL(this.remoteAudioVideoMediaStream);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnAddStreamCallback():url="+url); 
    document.getElementById("remoteVideo").src= url;
    document.getElementById("remoteVideo").play();   
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionOnRemoveStreamCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback(): event="+event); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback(): this.peerConnection.readyState="+this.peerConnection.readyState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnRemoveStreamCallback: this.peerConnectionState="+this.peerConnectionState);
    
    this.remoteAudioVideoMediaStream = null;
    document.getElementById("remoteVideo").pause();
    document.getElementById("remoteVideo").src= null; 
}


SimpleWebRtcSipPhone.prototype.onPeerConnectionOnOpenCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback(): event="+event); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback():this.peerConnection.readyState="+this.peerConnection.readyState);   
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionOnOpenCallback: this.peerConnectionState="+this.peerConnectionState);
}
 
SimpleWebRtcSipPhone.prototype.onPeerConnectionStateChangeCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback(): event="+event); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);   
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionStateChangeCallback: this.peerConnectionState="+this.peerConnectionState);
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionIceCandidateCallback =function(rtcIceCandidateEvent){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): rtcIceCandidateEvent="+rtcIceCandidateEvent); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback: this.peerConnectionState="+this.peerConnectionState);
    
    if(rtcIceCandidateEvent.candidate!=null)
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback: RTCIceCandidateEvent.candidate.candidate="+rtcIceCandidateEvent.candidate.candidate);
    }
    else
    {
        console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceCandidateCallback: no anymore ICE candidate");
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


SimpleWebRtcSipPhone.prototype.onPeerConnectionCreateOfferSuccessCallback =function(offer){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): newOffer="+offer); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferSuccessCallback: this.peerConnectionState="+this.peerConnectionState);
 
    if (this.peerConnectionState == 'new') 
    {
        // Preparing offer.
        var application=this;
        this.peerConnectionState = 'preparing-offer';
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


SimpleWebRtcSipPhone.prototype.onPeerConnectionCreateOfferErrorCallback =function(error){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback():error="+error); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateOfferErrorCallback: this.peerConnectionState="+this.peerConnectionState);
    alert("error:"+error);
    // TODO Notify Error to INVITE state machine
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionSetLocalDescriptionSuccessCallback =function(){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback()"); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionSuccessCallback: this.peerConnectionState="+this.peerConnectionState);
     
    // Nothing to do, just waiting end ICE resolution
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionSetLocalDescriptionErrorCallback =function(error){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback():error="+error); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetLocalDescriptionErrorCallback: this.peerConnectionState="+this.peerConnectionState);
    alert("error:"+error);
   // TODO Notify Error to INVITE state machine
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionCreateAnswerSuccessCallback =function(answer){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback():answer="+answer); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerSuccessCallback: this.peerConnectionState="+this.peerConnectionState);

    if (this.peerConnectionState == 'offer-received') 
    {
        // Prepare answer.
        var application=this;
        this.peerConnectionState = 'preparing-answer';
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


SimpleWebRtcSipPhone.prototype.onPeerConnectionCreateAnswerErrorCallback =function(error){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback():error="+error);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionCreateAnswerErrorCallback: this.peerConnectionState="+this.peerConnectionState);

    alert("error:"+error);
    // TODO Notify Error to INVITE state machine
}


SimpleWebRtcSipPhone.prototype.onPeerConnectionSetRemoteDescriptionSuccessCallback =function(){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback()");
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback: this.peerConnectionState="+this.peerConnectionState);

    if (this.peerConnectionState == 'answer-received') 
    {            
        this.peerConnectionState = 'established';
    }
    else if (this.peerConnectionState == 'offer-received') 
    {            
        var application=this;
        this.peerConnection.createAnswer(function(answer) {
            application.onPeerConnectionCreateAnswerSuccessCallback(answer);
        }, function(error) {
            application.onPeerConnectionCreateAnswerErrorCallback(error);
        }); 
    }
    else {
        console.log("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionSuccessCallback(): RTCPeerConnection bad state!");
    }
}


SimpleWebRtcSipPhone.prototype.onPeerConnectionSetRemoteDescriptionErrorCallback =function(error){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback():error="+error);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionSetRemoteDescriptionErrorCallback: this.peerConnectionState="+this.peerConnectionState);
  
    alert("error:"+error);
    // TODO Notify Error to INVITE state machine
}


SimpleWebRtcSipPhone.prototype.onPeerConnectionIceNegotationNeededCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback():event="+event);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceNegotationNeededCallback: this.peerConnectionState="+this.peerConnectionState);
     
    // Nothing to do?
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionGatheringChangeCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback():event="+event);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionGatheringChangeCallback: this.peerConnectionState="+this.peerConnectionState);
   
     // Nothing to do?
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionIceChangeCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback():event="+event);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIceChangeCallback: this.peerConnectionState="+this.peerConnectionState);
    
    // Nothing to do?
}

SimpleWebRtcSipPhone.prototype.onPeerConnectionIdentityResultCallback =function(event){
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback():event="+event);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback(): this.peerConnection.readyState="+this.peerConnection.readyState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback(): this.peerConnection.iceGatheringState="+this.peerConnection.iceGatheringState);
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback(): this.peerConnection.iceState="+this.peerConnection.iceState); 
    console.debug("SimpleWebRtcSipPhone:onPeerConnectionIdentityResultCallback: this.peerConnectionState="+this.peerConnectionState);

    // Nothing to do?
}

