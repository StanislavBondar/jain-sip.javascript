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

/** 
 * The JavaScript Framework WebRtcComm allow Web Application developers to easily 
 * integrate multimedia communication service (e.g. VoIP) in their web site, thanks 
 * to the W3C WebRTC API. The WebRTCComm Framework provides a high level communication 
 * API on top of the opensource JAIN SIP JavaScript Stack (implementing transport of SIP over WebSocket). 
 * By using a convergent HTTP/SIP Application Server (e.g. Mobicents MSS) or directly access a 
 * SIP server (e.g. Asterisk), the web developer can rapidly and easily link his web site to a 
 * telephony infrastructure. 
 * 
 * A simple test web application of the WebRtcComm Framework can be found 
 * <a src="http://code.google.com/p/jain-sip/source/browse/?repo=javascript#git%2Fsrc%2Ftest%2FWebRtcCommTestWebApp">here<a>
 * 
 * @module WebRtcComm 
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */

/**
 * @class PrivateJainSipCallConnector
 * @public
 * @classdesc Private framework class handling  SIP client/user call control: ringing, ringing back, accept, reject, cancel, bye 
 * @constructor
 * @param {WebRtcCommCall} webRtcCommCall WebRtcCommCall "connected" object
 * @param {string} sipCallId   SIP Call ID
 * @throw {String} Exception "bad argument"
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */ 
PrivateJainSipCallConnector = function(webRtcCommCall,sipCallId)
{
    if(webRtcCommCall instanceof WebRtcCommCall)
    {
        if( typeof(sipCallId)=='string') this.sipCallId = sipCallId;
        else this.sipCallId=new String(new Date().getTime());
        this.webRtcCommCall=webRtcCommCall;
        this.webRtcCommCall.id=this.sipCallId;
        this.configuration=undefined;
        this.resetSipContext();  
    }
    else 
    {
        throw "PrivateJainSipCallConnector:PrivateJainSipCallConnector(): bad arguments"      
    }
};

/**
 * SIP Call Control state machine constant
 * @private
 * @constant
 */ 
PrivateJainSipCallConnector.prototype.SIP_INVITING_INITIAL_STATE="INVITING_INITIAL_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_STATE="INVITING_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_407_STATE="INVITING_407_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_ACCEPTED_STATE="INVITING_ACCEPTED_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_LOCAL_HANGINGUP_STATE="INVITING_LOCAL_HANGINGUP_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_LOCAL_HANGINGUP_407_STATE="INVITING_LOCAL_HANGINGUP_407_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_CANCELLING_STATE="INVITING_CANCELLING_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_ERROR_STATE="INVITING_ERROR_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_HANGUP_STATE="INVITING_HANGUP_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITING_CANCELLED_STATE="SIP_INVITING_CANCELLED_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_INITIAL_STATE="INVITED_INITIAL_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_ACCEPTED_STATE="INVITED_ACCEPTED_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_LOCAL_HANGINGUP_STATE="INVITED_LOCAL_HANGINGUP_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_LOCAL_HANGINGUP_407_STATE="INVITED_LOCAL_HANGINGUP_407_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_HANGUP_STATE="INVITED_HANGUP_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_ERROR_STATE="INVITED_ERROR_STATE";
PrivateJainSipCallConnector.prototype.SIP_INVITED_CANCELLED_STATE="INVITING_HANGUP_STATE";

/**
 * Get SIP communication opened/closed status 
 * @public
 * @returns {boolean} true if opened, false if closed
 */
PrivateJainSipCallConnector.prototype.isOpened=function(){
    return ((this.sipCallState==this.SIP_INVITING_ACCEPTED_STATE) || (this.sipCallState==this.SIP_INVITED_ACCEPTED_STATE));   
}

/**
 * Get SIP call ID
 * @public
 * @returns {string} SIP Call ID  
 */ 
PrivateJainSipCallConnector.prototype.getId= function() {
    return this.sipCallId;
}

/**
 * Open JAIN SIP call/communication, asynchronous action,  opened or error event is notified to WebRtcClientCall eventListener
 * @public 
 * @param {object} configuration  WebRTC communication client configuration 
 *     configuration sample:<br> 
 *     { 
 *           sipUserAgent:"WebRtcCommTestWebApp/0.0.1",<br>
 *           sipOutboundProxy:this.DEFAULT_SIP_OUTBOUND_PROXY,<br>
 *           sipDomain:this.DEFAULT_SIP_DOMAIN,<br>
 *           sipUserName:this.DEFAULT_SIP_USER_NAME,<br>
 *           sipLogin:this.DEFAULT_SIP_LOGIN,<br>
 *           sipPassword:this.DEFAULT_SIP_PASSWORD,<br>
 *           sipApplicationProfile:this.DEFAULT_SIP_APPLICATION_PROFILE,<br>
 *           sipRegisterMode:this.DEFAULT_SIP_REGISTER_MODE<br>
 
 *      }<br>
* @public  
* @throw {String} Exception "bad configuration, missing parameter"
* @throw {String} Exception "bad state, unauthorized action"
*/ 
PrivateJainSipCallConnector.prototype.open=function(configuration){
    console.debug("PrivateJainSipCallConnector:open()");
    if(this.sipCallState==undefined)
    {
        if(typeof(configuration) == 'object')  
        {
            // Calling
            if(this.checkConfiguration(configuration)==true)
            {
                this.sipCallState=this.SIP_INVITING_INITIAL_STATE;
                this.configuration=configuration;     
            } 
            else
            {
                console.error("PrivateJainSipCallConnector:open(): bad configuration");
                throw "PrivateJainSipCallConnector:open(): bad configuration";   
            }
        }
        else 
        {
            // Called
            this.sipCallState= SIP_INVITED_INITIAL_STATE
        }
    }
    else
    {   
        console.error("PrivateJainSipCallConnector:open(): bad state, unauthorized action");
        throw "PrivateJainSipCallConnector:open(): bad state, unauthorized action";    
    }
}  

/**
 * Close JAIN SIP communication, asynchronous action, closed event are notified to the WebRtcCommClient eventListener
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */ 
PrivateJainSipCallConnector.prototype.close =function(){
    console.debug("PrivateJainSipCallConnector:close(): this.sipCallState="+this.sipCallState);
    if(this.sipCallState!=undefined)
    {
        try
        {
            if(this.sipCallState==this.SIP_INITIAL_INVITING_STATE)
            {
                // SIP INVITE has not been sent yet.
                this.resetSipContext();
                this.webRtcCommCall.webRtcCommClient.connector.removeCallConnector(this.sipCallId);
                // Notify closed event
                this.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
            }
            else if(this.sipCallState==this.SIP_INVITING_STATE || this.sipCallState==this.SIP_INVITING_407_STATE)
            {
                // SIP INIVTE has been sent, need to cancel it
                this.jainSipInvitingCancelRequest = this.jainSipInvitingTransaction.createCancel();
                this.jainSipInvitingCancelRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                this.jainSipInvitingCancelRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                this.jainSipInvitingCancelTransaction = this.webRtcCommCall.webRtcCommClient.connector.sipProvider.getNewClientTransaction(this.jainSipInvitingCancelRequest);
                this.jainSipInvitingCancelTransaction.sendRequest();
                this.sipCallState=this.SIP_INVITING_CANCELLING_STATE;
            } 
            else if(this.sipCallState==this.SIP_INVITING_ACCEPTED_STATE)
            {
                // Sent SIP BYE
                var jainSipByeRequest=this.jainSipInvitingRequest.createBYERequest(true);
                jainSipByeRequest.removeHeader("Contact");
                jainSipByeRequest.removeHeader("User-Agent");
                jainSipByeRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                jainSipByeRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                var clientTransaction  = this.webRtcCommCall.webRtcCommClient.connector.sipProvider.getNewClientTransaction(jainSipByeRequest);
                this.jainSipInvitingDialog.sendRequest(clientTransaction);
                this.sipCallState=this.SIP_INVITING_LOCAL_HANGINGUP_STATE;
                // Notify closed event
                this.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
            }
            else if(this.sipCallState==this.SIP_INVITED_INITIAL_STATE)
            {
                // Rejected  480 Temporarily Unavailable
                var jainSipResponse480= this.jainSipInvitedRequest.createResponse(480,"Temporarily Unavailable");
                jainSipResponse480.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                jainSipResponse480.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                this.jainSipInvitedTransaction.sendResponse(jainSipResponse480);
                this.resetSipContext();
                this.webRtcCommCall.webRtcCommClient.connector.removeCallConnector(this.sipCallId);
            }
            else if(this.sipCallState==this.SIP_INVITED_ACCEPTED_STATE)
            {
                // Sent SIP BYE
                var jainSipByeRequest=this.jainSipInvitedRequest.createBYERequest(true);
                jainSipByeRequest.removeHeader("Contact");
                jainSipByeRequest.removeHeader("User-Agent");
                jainSipByeRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                jainSipByeRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                var clientTransaction  = this.webRtcCommCall.webRtcCommClient.connector.sipProvider.getNewClientTransaction(jainSipByeRequest);
                this.jainSipInvitedDialog.sendRequest(clientTransaction);
                this.sipCallState=this.SIP_INVITED_LOCAL_HANGINGUP_STATE;    
            }
            else 
            {
                this.resetSipContext();
                this.webRtcCommCall.webRtcCommClient.connector.removeCallConnector(this.sipCallId);
                // Notify closed event
                this.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();   
            }
        }
        catch(exception)
        {
            console.error("PrivateJainSipCallConnector:byeCall(): catched exception:"+exception);
            this.resetSipContext();
            this.webRtcCommCall.webRtcCommClient.connector.removeCallConnector(this.sipCallId);
            // Notify closed event
            this.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
        }
    }
}

/**
 * Process reject of the SIP incoming communication
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception "internal error,check console logs"
 */ 
PrivateJainSipCallConnector.prototype.reject =function(){
    console.debug("PrivateJainSipCallConnector:reject()");
    if(this.sipCallState==this.SIP_INVITED_INITIAL_STATE)
    {
        try
        {
            // Rejected  Temporarily Unavailable
            var jainSipResponse486= this.jainSipInvitedRequest.createResponse(486,"Busy here");
            jainSipResponse486.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
            jainSipResponse486.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
            this.jainSipInvitedTransaction.sendResponse(jainSipResponse486);   
        }
        catch(exception)
        {       
            console.error("PrivateJainSipCallConnector:reject(): catched exception:"+exception);
        }       
        this.close();
    }
    else
    {
        console.error("PrivateJainSipCallConnector:reject(): bad state, unauthorized action");
        throw "PrivateJainSipCallConnector:reject(): bad state, unauthorized action";        
    }
}

/**
 * Check configuration 
 * param configuration SIP call configuration JSON object
 * @private
 * @return true configuration ok false otherwise
 */ 
PrivateJainSipCallConnector.prototype.checkConfiguration=function(configuration){
    console.debug("PrivateJainSipCallConnector:checkConfiguration()");      
    var check=true;
    return check;
}

/**
 * Reset SIP context 
 * @private
 */ 
PrivateJainSipCallConnector.prototype.resetSipContext=function(){
    console.debug("PrivateJainSipCallConnector:resetSipContext()");      
    this.sipCallState=undefined;
    this.jainSipInvitingSentRequest=undefined;
    this.jainSipInvitingDialog=undefined;
    this.jainSipInvitingTransaction=undefined;
    this.jainSipInvitedReceivedRequest=undefined;
    this.jainSipInvitedDialog=undefined;
    this.jainSipInvitedTransaction=undefined; 
}
       
/**
 * Process invitation of outgoing SIP communication 
 * @public 
 * @param {String} sdpOffer SDP offer received from RTCPeerConenction
 */ 
PrivateJainSipCallConnector.prototype.invite=function(sdpOffer){
    console.debug("PrivateJainSipCallConnector:invite()");
    // Send INVITE    
    var fromSipUriString=this.webRtcCommCall.webRtcCommClient.connector.configuration.sipUserName+"@"+this.webRtcCommCall.webRtcCommClient.connector.configuration.sipDomain;
    var toSipUriString= this.webRtcCommCall.calleePhoneNumber+"@"+this.webRtcCommCall.webRtcCommClient.connector.configuration.sipDomain;
    var random=new Date();       
    var jainSipCseqHeader=this.webRtcCommCall.webRtcCommClient.connector.headerFactory.createCSeqHeader(1,"INVITE");
    var jainSipCallIdHeader=this.webRtcCommCall.webRtcCommClient.connector.headerFactory.createCallIdHeader(this.sipCallId);
    var jainSipMaxForwardHeader=this.webRtcCommCall.webRtcCommClient.connector.headerFactory.createMaxForwardsHeader(70);
    var jainSipRequestUri=this.webRtcCommCall.webRtcCommClient.connector.addressFactory.createSipURI_user_host(null,toSipUriString);
    var jainSipAllowListHeader=this.webRtcCommCall.webRtcCommClient.connector.headerFactory.createHeaders("Allow: INVITE,ACK,CANCEL,BYE");         
    var jainSipFromUri=this.webRtcCommCall.webRtcCommClient.connector.addressFactory.createSipURI_user_host(null,fromSipUriString);
    var jainSipFromAdress=this.webRtcCommCall.webRtcCommClient.connector.addressFactory.createAddress_name_uri(null,jainSipFromUri);
    var tagfrom=random.getTime();
    var jainSipFromHeader=this.webRtcCommCall.webRtcCommClient.connector.headerFactory.createFromHeader(jainSipFromAdress, tagfrom);           
    var jainSiptoUri=this.webRtcCommCall.webRtcCommClient.connector.addressFactory.createSipURI_user_host(null,toSipUriString);
    var jainSipToAddress=this.webRtcCommCall.webRtcCommClient.connector.addressFactory.createAddress_name_uri(null,jainSiptoUri);
    var jainSipToHeader=this.webRtcCommCall.webRtcCommClient.connector.headerFactory.createToHeader(jainSipToAddress, null);           
    var jainSipContentTypeHeader=this.webRtcCommCall.webRtcCommClient.connector.headerFactory.createContentTypeHeader("application","sdp");
    this.jainSipInvitingRequest=this.webRtcCommCall.webRtcCommClient.connector.messageFactory.createRequest(jainSipRequestUri,"INVITE",
        jainSipCallIdHeader,
        jainSipCseqHeader,
        jainSipFromHeader,
        jainSipToHeader,
        jainSipMaxForwardHeader,
        jainSipContentTypeHeader,
        sdpOffer); 
                      
    this.webRtcCommCall.webRtcCommClient.connector.messageFactory.addHeader( this.jainSipInvitingRequest, this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
    this.webRtcCommCall.webRtcCommClient.connector.messageFactory.addHeader( this.jainSipInvitingRequest, jainSipAllowListHeader);
    this.webRtcCommCall.webRtcCommClient.connector.messageFactory.addHeader( this.jainSipInvitingRequest, this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);   
    this.sipCallState=this.SIP_INVITING_STATE;
    this.jainSipInvitingTransaction = this.webRtcCommCall.webRtcCommClient.connector.sipProvider.getNewClientTransaction(this.jainSipInvitingRequest);
    this.jainSipInvitingRequest.setTransaction(this.jainSipInvitingTransaction);
    this.jainSipInvitingDialog=this.jainSipInvitingTransaction.getDialog();
    this.jainSipInvitingTransaction.sendRequest();
    
    this.sipCallState=this.SIP_INVITING_STATE;
}  


/**
 * Process acceptation of incoming SIP communication
 * @public 
 * @param {string} sdpAnswer SDP answer received from RTCPeerConnection
 */ 
PrivateJainSipCallConnector.prototype.accept=function(sdpAnswer){
    console.debug("PrivateJainSipCallConnector:accept()");        
    // Send 200 OK
    var jainSip200OKResponse=this.jainSipInvitedRequest.createResponse(200, "OK");
    jainSip200OKResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
    jainSip200OKResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
    jainSip200OKResponse.setMessageContent("application","sdp",sdpAnswer);
    this.jainSipInvitedTransaction.sendResponse(jainSip200OKResponse);
    this.sipCallState=this.SIP_INVITED_ACCEPTED_STATE;
}  


/**
 * PrivateJainSipClientConnector interface implementation: handle SIP Request event
 * @public 
 * @param {RequestEvent} requestEvent 
 */ 
PrivateJainSipCallConnector.prototype.onJainSipClientConnectorSipRequestEvent=function(requestEvent){
    console.debug("PrivateJainSipCallConnector:onJainSipClientConnectorSipRequestEvent()");        
    if(this.jainSipInvitingDialog!=undefined) 
        this.processInvitingSipRequestEvent(requestEvent); 
    else  if(this.jainSipInvitedDialog!=undefined) 
        this.processInvitedSipRequestEvent(requestEvent); 
    else
    {
        this.processInvitedSipRequestEvent(requestEvent);  
    }
}  

/**
 * PrivateJainSipClientConnector interface implementation: handle SIP response event
 * @public 
 * @param {ResponseEvent} responseEvent 
 */ 
PrivateJainSipCallConnector.prototype.onJainSipClientConnectorSipResponseEvent=function(responseEvent){
    console.debug("PrivateJainSipCallConnector:onJainSipClientConnectorSipResponseEvent()");   
    if(this.jainSipInvitingDialog!=undefined) 
        this.processInvitingSipResponseEvent(responseEvent); 
    else  if(this.jainSipInvitedDialog!=undefined) 
        this.processInvitedSipResponseEvent(responseEvent); 
    else
    {
        console.warn("PrivateJainSipCallConnector:onJainSipClientConnectorSipResponseEvent(): response ignored");      
    }
}

/**
 * PrivateJainSipClientConnector interface implementation: handle SIP timeout event
 * @public 
 * @param {TimeoutEvent} timeoutEvent
 */ 
PrivateJainSipCallConnector.prototype.onJainSipClientConnectorSipTimeoutEvent=function(timeoutEvent){
    console.debug("PrivateJainSipCallConnector:onJainSipClientConnectorSipTimeoutEvent()");   
    // For the time being force close of the call 
    this.close();
}


/**
 * Handle SIP request event for inviting call
 * @private 
 * @param {RequestEvent} requestEvent 
 */ 
PrivateJainSipCallConnector.prototype.processInvitingSipRequestEvent =function(requestEvent){
    console.debug("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): this.sipCallState="+this.sipCallState);
    var jainSipRequest=requestEvent.getRequest();
    var requestMethod = jainSipRequest.getMethod();
    if(this.sipCallState==this.SIP_INVITING_INITIAL_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored"); 
    } 
    else if(this.sipCallState==this.SIP_INVITING_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored"); 
    } 
    else if(this.sipCallState==this.SIP_INVITING_407_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored"); 
    } 
    else if(this.sipCallState==this.SIP_INVITING_FAILED_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");  
    } 
    else if(this.sipCallState==this.SIP_INVITING_ACCEPTED_STATE)
    {
        if(requestMethod=="BYE")  
        {
            try
            {
                // Sent 200 OK BYE
                var jainSip200OKResponse=jainSipRequest.createResponse(200, "OK");
                jainSip200OKResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
                // Update SIP call state
                this.sipCallState=this.SIP_INVITING_HANGUP_STATE; 
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception exception:"+exception);  
            }
            
            // Notify the hangup event
            this.webRtcCommCall.onPrivateCallConnectorCallHangupEvent();
            
            // Close the call
            this.close();
        }
        else
        {
            console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");
        }
    } 
    else
    {
        console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");  
    } 
}


/**
 * Handle SIP response event for inviting call
 * @private 
 * @param {ResponseEvent} responseEvent 
 */ 
PrivateJainSipCallConnector.prototype.processInvitingSipResponseEvent =function(responseEvent){
    console.debug("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): this.sipCallState="+this.sipCallState);
    var jainSipResponse=responseEvent.getResponse(); 
    var statusCode = parseInt(jainSipResponse.getStatusCode()); 
    if(this.sipCallState==this.SIP_INVITING_STATE)
    {
        if(statusCode< 200)
        {
            if(statusCode== 180)
            {
                // Notify the ringing back event
                this.webRtcCommCall.onPrivateCallConnectorCallRingingBackEvent();     
            } 
            else if(statusCode== 183)
            {
                // Notify asynchronously the in progress event
                this.webRtcCommCall.onPrivateCallConnectorCallInProgressEvent();     
            }   
            console.debug("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): 1XX response ignored"); 
        }
        else if(statusCode==407)
        {
            // Send Authenticated SIP INVITE
            var num=new Number(this.jainSipInvitingRequest.getCSeq().getSeqNumber());
            this.jainSipInvitingRequest.getCSeq().setSeqNumber(num+1);
            var jainSipAuthorizationHeader=this.webRtcCommCall.webRtcCommClient.connector.headerFactory.createAuthorizationHeader(jainSipResponse,this.jainSipInvitingRequest,this.configuration.sipPassword,this.configuration.sipLogin);
            this.webRtcCommCall.webRtcCommClient.connector.messageFactory.addHeader(this.jainSipInvitingRequest, jainSipAuthorizationHeader); 
            this.jainSipInvitingRequest = this.webRtcCommCall.webRtcCommClient.connector.messageFactory.setNewViaHeader(this.jainSipInvitingRequest);
            this.jainSipInvitingTransaction = this.webRtcCommCall.webRtcCommClient.connector.sipProvider.getNewClientTransaction(this.jainSipInvitingRequest);
            this.jainSipInvitingRequest.setTransaction(this.jainSipInvitingTransaction);
            this.jainSipInvitingTransaction.sendRequest();
            // Update SIP call state            
            this.sipCallState=this.SIP_INVITING_407_STATE;
        }
        else if(statusCode==200)
        {
            this.jainSipInvitingDialog=responseEvent.getOriginalTransaction().getDialog();
            try
            {
                // Send SIP 200 OK ACK
                this.jainSipInvitingDialog.setRemoteTarget(jainSipResponse.getHeader("Contact"));
                var jainSipMessageACK = this.jainSipInvitingTransaction.createAck();
                jainSipMessageACK.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                jainSipMessageACK.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                this.jainSipInvitingDialog.sendAck(jainSipMessageACK);
                // Update SIP call state    
                this.sipCallState=this.SIP_INVITING_ACCEPTED_STATE;
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:"+exception);  
            }
            
            try
            {
                var sdpAnswerString = jainSipResponse.getContent();
                this.webRtcCommCall.onPrivateCallConnectorRemoteSdpAnswerEvent(sdpAnswerString);
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:"+exception);
                
                // Notify the error event
                this.webRtcCommCall.onPrivateCallConnectorCallOpenErrorEvent(exception);
                
                // Close the call
                this.close();
            }
        } 
        else 
        {
            console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString())   
            // Update SIP call state    
            this.sipCallState=this.SIP_INVITING_ERROR_STATE;
            // Notify asynchronously the error event
            this.webRtcCommCall.onPrivateCallConnectorCallOpenErrorEvent(jainSipResponse.getStatusLine().getReasonPhrase());
            
            this.close();
        }
    } 
    else if(this.sipCallState==this.SIP_INVITING_CANCELLING_STATE)
    {
        // Update SIP call state    
        this.sipCallState=this.SIP_INVITING_CANCELLED_STATE;
        this.close();
    }
    else if(this.sipCallState==this.SIP_INVITING_407_STATE)
    {
        if(statusCode< 200)
        {
            console.debug("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): 1XX response ignored"); 
        }
        else if(statusCode==200)
        {
            this.jainSipInvitingDialog=responseEvent.getOriginalTransaction().getDialog();
            
            try
            {
                // Send SIP 200 OK ACK
                this.jainSipInvitingDialog.setRemoteTarget(jainSipResponse.getHeader("Contact"));
                var jainSipMessageACK = this.jainSipInvitingTransaction.createAck();
                jainSipMessageACK.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                jainSipMessageACK.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                this.jainSipInvitingDialog.sendAck(jainSipMessageACK);
                // Update SIP call state
                this.sipCallState=this.SIP_INVITING_ACCEPTED_STATE;
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:"+exception);  
            }
            
            
            try
            {
                var sdpAnswerString = jainSipResponse.getContent();
                this.webRtcCommCall.onPrivateCallConnectorRemoteSdpAnswerEvent(sdpAnswerString);
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:"+exception);
                
                // Notify the error event
                this.webRtcCommCall.onPrivateCallConnectorCallOpenErrorEvent(exception);
                
                // Close the call
                this.close();
            }
        }
        else
        {
            // Update SIP call state
            this.sipCallState=this.SIP_INVITING_ERROR_STATE;
            
            // Notify the error event
            this.webRtcCommCall.onPrivateCallConnectorCallOpenErrorEvent(jainSipResponse.getStatusLine().getReasonPhrase());
            
            // Close the call
            this.close();
        }    
    } 
    else if(this.sipCallState==this.SIP_INVITING_FAILED_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): bad state, SIP response ignored"); 
    } 
    else if(this.sipCallState==this.SIP_INVITING_ACCEPTED_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): bad state, SIP response ignored");     
    } 
    else if(this.sipCallState==this.SIP_INVITING_LOCAL_HANGINGUP_STATE)
    {
        if(statusCode==407)
        {
            try
            {
                // Send Authenticated BYE request
                var jainSipByeRequest=this.jainSipInvitingDialog.createRequest("BYE");
                var clientTransaction  = this.webRtcCommCall.webRtcCommClient.connector.sipProvider.getNewClientTransaction(jainSipByeRequest);
                var jainSipAuthorizationHeader=this.webRtcCommCall.webRtcCommClient.connector.headerFactory.createAuthorizationHeader(jainSipResponse,jainSipByeRequest,this.configuration.sipPassword,this.configuration.sipLogin);
                this.webRtcCommCall.webRtcCommClient.connector.messageFactory.addHeader(jainSipByeRequest, jainSipAuthorizationHeader); 
                this.jainSipInvitingDialog.sendRequest(clientTransaction);
                // Update SIP call state
                this.sipCallState=this.SIP_INVITING_HANGINGUP_407_STATE; 
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:"+exception);  
                this.close();
            }
        }
        else 
        {
            // Force close
            this.close();
        }
    } 
    else if(this.sipCallState==this.SIP_INVITING_LOCAL_HANGINGUP_407_STATE)
    {
        // Force close
        this.close();
    } 
    else
    {
        console.error("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): bad state, SIP response ignored");    
    }
}

/**
 * Handle SIP request event for invited call
 * @private 
 * @param {RequestEvent} requestEvent request event
 */ 
PrivateJainSipCallConnector.prototype.processInvitedSipRequestEvent =function(requestEvent){
    console.debug("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): this.sipCallState="+this.sipCallState);
    var jainSipRequest=requestEvent.getRequest();
    var requestMethod = jainSipRequest.getMethod();
    var headerFrom = jainSipRequest.getHeader("From");
    if(this.sipCallState==this.SIP_INVITED_INITIAL_STATE)
    {
        if(requestMethod=="INVITE")  
        {
            try
            {
                // Store SIP context
                this.jainSipInvitedRequest=jainSipRequest;
                this.jainSipInvitedTransaction=requestEvent.getServerTransaction();
                this.jainSipInvitedDialog=requestEvent.getServerTransaction().getDialog();
        
                // Ringing
                var jainSip180ORingingResponse=jainSipRequest.createResponse(180, "Ringing");
                jainSip180ORingingResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                jainSip180ORingingResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                requestEvent.getServerTransaction().sendResponse(jainSip180ORingingResponse);
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): catched exception, exception:"+exception);  
            }
            
            //  Notify remote SDP offer to WebRtcCommCall
            this.webRtcCommCall.onPrivateCallConnectorRemoteSdpOfferEvent(this.jainSipInvitedRequest.getContent());
            
            // Notify incoming communication
            var that=this;
            var callerPhoneNumber = headerFrom.getAddress().getURI().getUser();
            this.webRtcCommCall.onPrivateCallConnectorCallRingingEvent(callerPhoneNumber);    
        } 
        else if(requestMethod=="CANCEL")  
        {
            try
            {
                // Send 200OK CANCEL
                var jainSip200OKResponse=jainSipRequest.createResponse(200, "OK");
                jainSip200OKResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                jainSip200OKResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
            
                // Send 487 (Request Cancelled) for the INVITE
                var jainSipResponse487=this.jainSipInvitedRequest.createResponse(487,"(Request Cancelled)");
                jainSipResponse487.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                this.jainSipInvitedTransaction.sendMessage(jainSipResponse487);
                
                // Update SIP call state
                this.sipCallState=this.SIP_INVITED_CANCELLED_STATE; 
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): catched exception, exception:"+exception);  
            }
            
            // Notify asynchronously the hangup event
            this.webRtcCommCall.onPrivateCallConnectorCallHangupEvent();
            
            // Close the call
            this.close();
        }
        else
        {
            console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): bad state, SIP request ignored"); 
        }
    } 
    else if(this.sipCallState==this.SIP_INVITED_ACCEPTED_STATE)
    {
        if(requestMethod=="BYE")  
        {
            try
            {
                // Send 200OK
                var jainSip200OKResponse=jainSipRequest.createResponse(200, "OK");
                jainSip200OKResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                jainSip200OKResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
                
                // Update SIP call state
                this.sipCallState=this.SIP_INVITED_HANGUP_STATE; 
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): catched exception exception:"+exception);  
            }
            
            // Notify asynchronously the hangup event
            this.webRtcCommCall.onPrivateCallConnectorCallHangupEvent(); 
            
            // Close the call
            this.close();
        }
        else if(requestMethod=="ACK")  
        {         
            this.jainSipInvitedDialog=requestEvent.getServerTransaction().getDialog();
        }
        else
        {
            console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): bad state, SIP request ignored"); 
        }
    } 
    else if(this.sipCallState==this.SIP_INVITED_LOCAL_HANGINGUP_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): bad state, SIP request ignored");
    } 
    else if(this.sipCallState==this.SIP_INVITED_LOCAL_HANGINGUP_407_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitedSipRequestEvent(): bad state, SIP request ignored");        
    } 
}

/**
 * Handle SIP response event for invited call
 * @private 
 * @param {ResponseEvent} responseEvent response event
 */ 
PrivateJainSipCallConnector.prototype.processInvitedSipResponseEvent =function(responseEvent){
    console.debug("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): this.invitingState="+this.invitingState);
    var jainSipResponse=responseEvent.getResponse(); 
    var statusCode = parseInt(jainSipResponse.getStatusCode()); 
    if(this.sipCallState==this.SIP_INVITED_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): bad state, SIP response ignored"); 
    } 
    else if(this.sipCallState==this.SIP_INVITED_ACCEPTED_STATE)
    {
        console.error("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): bad state, SIP response ignored");        
    } 
    else if(this.sipCallState==this.SIP_INVITED_LOCAL_HANGINGUP_STATE)
    {
        if(statusCode==407)
        {
            try
            {
                // Send Authenticated BYE request
                var jainSipByeRequest=this.jainSipInvitedDialog.createRequest("BYE");
                var clientTransaction  = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
                var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,jainSipByeRequest,this.configuration.sipPassword,this.configuration.sipLogin);
                this.messageFactory.addHeader(jainSipByeRequest, jainSipAuthorizationHeader); 
                jainSipByeRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                jainSipByeRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
  
                this.jainSipInvitedDialog.sendRequest(clientTransaction);
                
                // Update SIP call state
                this.sipCallState=this.SIP_INVITED_HANGINGUP_407_STATE; 
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): catched exception, exception:"+exception);  
                this.close();
            }
        }
        else
        {
            this.close();
        }
    } 
    else if(this.sipCallState==this.SIP_INVITED_LOCAL_HANGINGUP_407_STATE)
    {
        // Force close
        this.close();  
    } 
    else
    {
        console.error("PrivateJainSipCallConnector:processInvitedSipResponseEvent(): bad state, SIP request ignored");  
    } 
}







/**
 * @class PrivateJainSipClientConnector
 * @classdesc Private framework class handling  SIP client/user agent control 
 * @constructor 
 * @public
 * @param {WebRtcCommClient} webRtcCommClient "connected" WebRtcCommClient object 
 * @throw {String} Exception "bad argument"
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */ 
PrivateJainSipClientConnector = function(webRtcCommClient)
{
    console.debug("PrivateJainSipClientConnector:PrivateJainSipClientConnector()");
    if(webRtcCommClient instanceof WebRtcCommClient)
    {
        this.webRtcCommClient=webRtcCommClient;
        this.reset();
    }
    else 
    {
        throw "PrivateJainSipClientConnector:PrivateJainSipClientConnector(): bad arguments"      
    }
} 

// Private webRtc class variable
PrivateJainSipClientConnector.prototype.SIP_ALLOW_HEADER="Allow: INVITE,ACK,CANCEL,BYE, OPTIONS";

//  State of SIP REGISTER state machine
PrivateJainSipClientConnector.prototype.SIP_UNREGISTERED_STATE="SIP_UNREGISTERED_STATE";
PrivateJainSipClientConnector.prototype.SIP_REGISTERING_STATE="SIP_REGISTERING_STATE";
PrivateJainSipClientConnector.prototype.SIP_REGISTER_REFRESHING_STATE="SIP_REGISTER_REFRESHING_STATE";
PrivateJainSipClientConnector.prototype.SIP_REGISTERING_401_STATE="SIP_REGISTERING_401_STATE";
PrivateJainSipClientConnector.prototype.SIP_REGISTERED_STATE="SIP_REGISTERED_STATE";
PrivateJainSipClientConnector.prototype.SIP_UNREGISTERING_401_STATE="SIP_UNREGISTERING_401_STATE";
PrivateJainSipClientConnector.prototype.SIP_UNREGISTERING_STATE="SIP_UNREGISTERING_STATE";

/**
 * Get SIP client/user agent opened/closed status 
 * @public
 * @returns {boolean} true if opened, false if closed
 */
PrivateJainSipClientConnector.prototype.isOpened=function(){
    return this.openedFlag;   
}

/**
 * Open SIP client/user agent, asynchronous action, opened or error event is notified to WebRtcClientComm
 * @public 
 * @param {object} configuration   SIP client/user agent configuration <br>
 * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">sipUserAgent:"WebRtcCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 30px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 30px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 30px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 30px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 30px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 30px">sipApplicationProfile,<br></span>
 * <span style="margin-left: 30px">sipRegisterMode:true,<br></span>
 * }<br>
 *  </p>
 * @throw {String} Exception "bad argument"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception [internal error]
 */ 
PrivateJainSipClientConnector.prototype.open=function(configuration){
    console.debug("PrivateJainSipClientConnector:open()");
    try
    {
        if(typeof(configuration) == 'object')
        {
            if(this.openedFlag==false)
            {
                if(this.checkConfiguration(configuration)==true)
                {
                    this.configuration=configuration;
                    
                    // Create JAIN SIP main objects
                    this.sipFactory=new SipFactory();
                    this.sipStack=this.sipFactory.createSipStack(this.configuration.sipOutboundProxy,this.configuration.sipUserAgent);
                    this.listeningPoint=this.sipStack.createListeningPoint();
                    this.sipProvider=this.sipStack.createSipProvider(this.listeningPoint);
                    this.sipProvider.addSipListener(this);
                    this.headerFactory=this.sipFactory.createHeaderFactory();
                    this.addressFactory=this.sipFactory.createAddressFactory();
                    this.messageFactory=this.sipFactory.createMessageFactory(this.listeningPoint);
                    this.jainSipContactHeader = this.listeningPoint.createContactHeader(this.configuration.sipUserName);
                    if((this.configuration.sipApplicationProfile!=undefined)&&(this.configuration.sipApplicationProfile.length!=0))
                    {
                        this.jainSipContactHeader.setParameter(this.configuration.sipApplicationProfile,null);
                    }
                    this.jainSipUserAgentHeader = this.headerFactory.createUserAgentHeader(this.listeningPoint.getUserAgent());
                    this.sipStack.start();                   
                } 
                else
                {
                    console.error("PrivateJainSipClientConnector:open(): bad configuration");
                    throw "PrivateJainSipClientConnector:open(): bad configuration";   
                }
            }
            else
            {   
                console.error("PrivateJainSipClientConnector:open(): bad state, unauthorized action");
                throw "PrivateJainSipClientConnector:open(): bad state, unauthorized action";    
            }
        }
        else
        {   
            console.error("PrivateJainSipClientConnector:open(): bad argument, check API documentation");
            throw "PrivateJainSipClientConnector:open(): bad argument, check API documentation"    
        }
    }
    catch(exception){
        this.reset();
        console.error("PrivateJainSipClientConnector:open(): catched exception:"+exception);
        throw exception;  
    }   
}

/**
 * Close SIP client/User Agent, asynchronous action,closed event is notified to WebRtcClientComm
 * Open SIP Call/communication are closed
 * @public 
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception [internal error]
 */ 
PrivateJainSipClientConnector.prototype.close=function(){
    console.debug("PrivateJainSipClientConnector:close()");
    try
    {
        if(this.openedFlag==true)
        {
            //Force close of open SIP communication
            for(var sipCallId in this.callConnectors){
                var callConnector = this.findCallConnector(sipCallId);
                if(callConnector.isOpened())
                {
                    callConnector.close();     
                }
            }
            if(this.configuration.sipRegisterMode==true)
            {
                if(this.sipRegisterState==this.SIP_REGISTERED_STATE)
                {
                    this.sipUnregisterPendingFlag=false; 
                    this.sipRegisterState=this.SIP_UNREGISTERING_STATE;
                    if(this.sipRegisterRefreshTimer)
                    {
                        // Cancel SIP REGISTER refresh timer
                        clearTimeout(this.sipRegisterRefreshTimer);
                    }
                    var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
                    this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
                    this.jainSipRegisterSentRequest.getExpires().setExpires(0);
                    this.jainSipRegisterSentRequest = this.jainSipRegisterSentRequest=this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest); 
                    this.jainSipRegisterTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
                    this.jainSipRegisterSentRequest.setTransaction(this.jainSipRegisterTransaction);
                    this.jainSipRegisterTransaction.sendRequest(); 
                }
                else
                {
                    // Refresh SIP REGISTER ongoing, wait the end and excute SIP unregistration
                    this.sipUnregisterPendingFlag=true;      
                }
            }
            else
            {
                this.reset();
                this.webRtcCommClient.onPrivateClientConnectorClosedEvent();
            }
        }
        else
        {   
            console.error("PrivateJainSipClientConnector:close(): bad state, unauthorized action");
            throw "PrivateJainSipClientConnector:close(): bad state, unauthorized action";    
        }     
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:close(): catched exception:"+exception);
        throw exception;  
    }   
}
 
/**
 * Create new CallConnector object
 * @public 
 * @param {WebRtcCommCall} webRtcCommCall connected "object"
 * @param {string} sipCallId  SIP call ID 
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception [internal error]
 */ 
PrivateJainSipClientConnector.prototype.createPrivateCallConnector=function(webRtcCommCall, sipCallId){
    console.debug("PrivateJainSipClientConnector:createPrivateCallConnector()");
    try
    {
        if(webRtcCommCall instanceof WebRtcCommCall)
        {
            if(this.openedFlag==true)
            {
                var callConnector = new PrivateJainSipCallConnector(webRtcCommCall,sipCallId);
                this.callConnectors[callConnector.sipCallId]=callConnector;
                return callConnector;
            }
            else
            {   
                console.error("PrivateJainSipClientConnector:createPrivateCallConnector(): bad state, unauthorized action");
                throw "PrivateJainSipClientConnector:createPrivateCallConnector(): bad state, unauthorized action";    
            }
        }
        else
        {   
            console.error("PrivateJainSipClientConnector:createPrivateCallConnector(): bad argument, check API documentation");
            throw "PrivateJainSipClientConnector:createPrivateCallConnector(): bad argument, check API documentation"    
        }
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:createPrivateCallConnector(): catched exception:"+exception);
        throw exception;  
    }   
}


/**
 * Find a PrivateJainSipClientConnector object from its SIP call ID in the call table
 * @private
 * @param {string} sipCallId SIP call ID 
 * @return PrivateJainSipClientConnector object or undefined if not found
 */ 
PrivateJainSipClientConnector.prototype.findCallConnector=function(sipCallId){  
    console.debug("PrivateJainSipClientConnector:findCallConnector(): sipCallId="+sipCallId);
    return this.callConnectors[sipCallId];
}

/**
 * Remove a PrivateJainSipClientConnector object  in the call table
 * @private
 * @param {string} sipCallId SIP SIP call ID
 */ 
PrivateJainSipClientConnector.prototype.removeCallConnector=function(sipCallId){  
    console.debug("PrivateJainSipClientConnector:removeCallConnector(): sipCallId="+sipCallId);
    delete this.callConnectors.sipCallId;
}


/**
 * Reset client context
 * @private
 */ 
PrivateJainSipClientConnector.prototype.reset=function(){
    console.debug ("PrivateJainSipClientConnector:reset()");  
    this.openedFlag  = false;
    this.configuration=undefined;
    this.resetSipRegisterContext();
    this.callConnectors={};
}

/**
 * Reset SIP register context
 * @private
 */
PrivateJainSipClientConnector.prototype.resetSipRegisterContext=function(){
    console.debug ("PrivateJainSipClientConnector:resetSipRegisterContext()");  
    if(this.sipRegisterRefreshTimer!=undefined) clearTimeout(this.sipRegisterRefreshTimer);
    this.sipRegisterState=this.SIP_UNREGISTERED_STATE;
    this.sipRegisterRefreshTimer=undefined; 
    this.sipRegisterAuthenticatedFlag=false;
    this.jainSipRegisterSentRequest=undefined;
    this.jainSipRegisterTransaction=undefined;
    this.sipUnregisterPendingFlag=false;    
}

/**
 * Check configuration 
 * @private
 * @param {object} configuration SIP user agent configuration
 * * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">sipUserAgent:"WebRtcCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 30px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 30px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 30px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 30px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 30px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 30px">sipApplicationProfile,<br></span>
 * <span style="margin-left: 30px">sipRegisterMode:true,<br></span>
 * }<br>
 *  </p>
 * @return true configuration ok false otherwise
 */ 
PrivateJainSipClientConnector.prototype.checkConfiguration=function(configuration){
    console.debug("PrivateJainSipClientConnector:checkConfiguration()");
    try
    {
        var check=true;
        // stunServer, sipLogin, sipPassword, sipApplicationprofile not mandatory
        if(configuration.sipUserAgent==undefined || configuration.sipUserAgent.length==0) 
        {
            check=false;
            console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipUserAgent");       
        }
        
        // stunServer, sipLogin, sipPassword, sipApplicationprofile not mandatory
        if(configuration.sipOutboundProxy==undefined || configuration.sipOutboundProxy.length==0) 
        {
            check=false;
            console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipOutboundProxy");       
        }
                
        if(configuration.sipDomain==undefined || configuration.sipDomain.length==0)
        {
            check=false;
            console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipDomain");       
        }
                
        if(configuration.sipUserName==undefined || configuration.sipUserName.length==0)
        {
            check=false;
            console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipUserName");       
        }
                
        if(configuration.sipRegisterMode==undefined  || configuration.sipRegisterMode.length==0)
        {
            check=false;
            console.error("PrivateJainSipClientConnector:checkConfiguration(): missing configuration parameter sipRegisterMode");       
        }
                
        if(configuration.sipLogin!=undefined  && configuration.sipLogin.length==0)
        {
            configuration.sipLogin=undefined;
        }
     
        if(configuration.sipPassword!=undefined  && configuration.sipPassword.length==0)
        {
            configuration.sipPassword=undefined;
        }
                
        if(configuration.sipApplicationProfile!=undefined  && configuration.sipApplicationProfile.length==0)
        {
            configuration.sipApplicationProfile=undefined;
        }
                
        console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipUserAgent:"+configuration.sipUserAgent);
        console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipOutboundProxy:"+configuration.sipOutboundProxy);
        console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipDomain:"+configuration.sipDomain);
        console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipUserName:"+configuration.sipUserName);
        console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipLogin:"+configuration.sipLogin);
        console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipPassword: "+configuration.sipPassword);
        console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipRegisterMode:"+configuration.sipRegisterMode);
        console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.sipApplicationProfile:"+configuration.sipApplicationProfile);
        return check;
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:checkConfiguration(): catched exception:"+exception);
        return false;  
    }  
}  
    
/**
 * Implementation of JAIN SIP stack event listener interface: process WebSocket connection event
 * @public 
 */ 
PrivateJainSipClientConnector.prototype.processConnected=function(){
    console.debug("PrivateJainSipClientConnector:processConnected()"); 
    try
    {
        // Start SIP REGISTER process
        if(this.openedFlag==false)
        {
            if(this.configuration.sipRegisterMode==true) 
            {
                this.resetSipRegisterContext();
                // Send SIP REGISTER request
                var fromSipUriString=this.configuration.sipUserName+"@"+this.configuration.sipDomain;            
                var jainSipCseqHeader=this.headerFactory.createCSeqHeader(1,"REGISTER");
                var jainSipCallIdHeader=this.headerFactory.createCallIdHeader();
                var jainSipExpiresHeader=this.headerFactory.createExpiresHeader(3600);
                var jainSipMaxForwardHeader=this.headerFactory.createMaxForwardsHeader(70);
                var jainSipRequestUri=this.addressFactory.createSipURI_user_host(null,this.configuration.sipDomain);
                var jainSipAllowListHeader=this.headerFactory.createHeaders(PrivateJainSipClientConnector.prototype.SIP_ALLOW_HEADER);
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
                this.jainSipRegisterTransaction = this.sipProvider.getNewClientTransaction(jainSipRegisterRequest);
                jainSipRegisterRequest.setTransaction(this.jainSipRegisterTransaction);
                this.jainSipRegisterTransaction.sendRequest();
                this.sipRegisterState=this.SIP_REGISTERING_STATE;
                return;
            }
            else
            {
                this.openedFlag=true;
                this.webRtcCommClient.onPrivateClientConnectorOpenedEvent();
                return;
            }
        }
        else
        {
            console.error("PrivateJainSipClientConnector:processConnected(): this.openedFlag==true !");      
        }
            
        // Open failed
        this.reset();
        this.webRtcCommClient.onPrivateClientConnectorOpenErrorEvent();
    }
    catch(exception){       
        this.reset();
        this.webRtcCommClient.onPrivateClientConnectorOpenErrorEvent();
        console.error("PrivateJainSipClientConnector:processConnected(): catched exception:"+exception);
    } 
}   

/**
 * Implementation of JAIN SIP stack event listener interface: process WebSocket disconnection/close event
 * @public
 */     
PrivateJainSipClientConnector.prototype.processDisconnected=function(){
    console.debug("PrivateJainSipClientConnector:processDisconnected(): SIP connectivity has been lost");  
    try
    { 
        this.reset();    
        this.webRtcCommClient.onPrivateClientConnectorClosedEvent();
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:processDisconnected(): catched exception:"+exception);
    }   
}

/**
 * Implementation of JAIN SIP stack event listener interface: process WebSocket connection error event
 * @public 
 * @param {string} error WebSocket connection error
 */ 
PrivateJainSipClientConnector.prototype.processConnectionError=function(error){
    console.war("PrivateJainSipClientConnector:processConnectionError(): SIP connection has failed, error:"+error);
    try
    {
        this.reset();
        this.webRtcCommClient.onPrivateClientConnectorOpenErrorEvent();
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:processConnectionError(): catched exception:"+exception);  
    }   
}

/**
 * Implementation of JAIN SIP stack event listener interface: process SIP request event
 * @public 
 * @param {RequestEvent} requestEvent JAIN SIP request event
 */ 
PrivateJainSipClientConnector.prototype.processRequest=function(requestEvent){
    console.debug("PrivateJainSipClientConnector:processRequest()");        
    try
    {
        var jainSipRequest=requestEvent.getRequest(); 
        var jainSipRequestMethod=jainSipRequest.getMethod();   
        if(jainSipRequestMethod=="OPTIONS")
        {
            this.processSipOptionRequest(requestEvent);      
        } 
        else 
        {
            // Find related PrivateJainSipCallConnector (subsequent request)
            var sipCallId = jainSipRequest.getCallId().getCallId();
            var callConnector = this.findCallConnector(sipCallId);
            if(callConnector)
            {
                callConnector.onJainSipClientConnectorSipRequestEvent(requestEvent);     
            }
            else
            {   
                if(jainSipRequestMethod=="INVITE")
                {
                    // Incoming SIP Call
                    var newWebRtcCommCall = new WebRtcCommCall(this.webRtcCommClient);
                    newWebRtcCommCall.connector=this.createPrivateCallConnector(newWebRtcCommCall, sipCallId); 
                    newWebRtcCommCall.id=newWebRtcCommCall.connector.getId();
                    newWebRtcCommCall.connector.sipCallState=PrivateJainSipCallConnector.prototype.SIP_INVITED_INITIAL_STATE;
                    newWebRtcCommCall.connector.onJainSipClientConnectorSipRequestEvent(requestEvent);
                }
                else
                {
                    console.warn("PrivateJainSipClientConnector:processRequest(): SIP request ignored"); 
                //@todo Should send SIP response 404 NOT FOUND or 501 NOT_IMPLEMENTED 
                }
            }
        }
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:processRequest(): catched exception:"+exception);  
    }   
}  


/**
 * Implementation of JAIN SIP stack event listener interface: process SIP response event
 * @public 
 * @param {ResponseEvent} responseEvent JAIN SIP response event
 */ 
PrivateJainSipClientConnector.prototype.processResponse=function(responseEvent){
    console.debug("PrivateJainSipClientConnector:processResponse()");   
    try
    {
        var jainSipResponse=responseEvent.getResponse(); 
        if(jainSipResponse.getCSeq().getMethod()=="REGISTER")
        {
            this.processSipRegisterResponse(responseEvent); 
        }
        else 
        {
            // Find related PrivateJainSipCallConnector
            var callConnector = this.findCallConnector(jainSipResponse.getCallId().getCallId());
            if(callConnector)
            {
                callConnector.onJainSipClientConnectorSipResponseEvent(responseEvent);     
            }
            else
            {
                console.warn("PrivateJainSipClientConnector:processResponse(): PrivateJainSipCallConnector not found, SIP response ignored");  
            }
        }
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:processResponse(): catched exception:"+exception);  
    }  
}
   
/**
 * Implementation of JAIN SIP stack event listener interface: process SIP transaction terminated event
 * @public 
 */ 
PrivateJainSipClientConnector.prototype.processTransactionTerminated=function(){
    console.debug("PrivateJainSipClientConnector:processTransactionTerminated()");   
}   
    
/**
 * Implementation of JAIN SIP stack event listener interface: process SIP dialog terminated event
 * @public 
 */ 
PrivateJainSipClientConnector.prototype.processDialogTerminated=function(){
    console.debug("PrivateJainSipClientConnector:processDialogTerminated()"); 
}
    
/**
 * Implementation of JAIN SIP stack event listener interface: process I/O websocket  error event
 * @public 
 * @param {ExceptionEvent} exceptionEvent JAIN SIP exception event 
 */ 
PrivateJainSipClientConnector.prototype.processIOException=function(exceptionEvent){
    console.error("PrivateJainSipClientConnector:processIOException(): exceptionEvent="+exceptionEvent.message);  
}

/**
 * Implementation of JAIN SIP stack event listener interface: process SIP Dialog Timeout event
 * @public 
 * @param {TimeoutEvent} timeoutEvent JAIN SIP timeout event
 */ 
PrivateJainSipClientConnector.prototype.processTimeout=function(timeoutEvent){
    console.debug("PrivateJainSipClientConnector:processTimeout():timeoutEvent="+timeoutEvent);
    try
    {
        var sipClientTransaction = timeoutEvent.getClientTransaction();
        // Find related PrivateJainSipCallConnector
        var sipCallId=sipClientTransaction.getDialog().getCallId().getCallId();
        var callConnector = this.findCallConnector(sipCallId,false);
        if(callConnector)
        {
            callConnector.onJainSipClientConnectorSipTimeoutEvent(timeoutEvent);   
        }
        else if(this.jainSipRegisterSentRequest.getCallId().getCallId()==sipCallId)
        {
            console.error("PrivateJainSipClientConnector:processTimeout(): SIP registration failed, request timeout, no response from SIP server") 
            this.reset();
            this.webRtcCommClient.onPrivateClientConnectorOpenErrorEvent("Request Timeout"); 
        }
        else
        {
            console.warn("PrivateJainSipClientConnector:processTimeout(): no dialog found, SIP timeout ignored");  
        }
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:processTimeout(): catched exception:"+exception);  
    }  
}
 
/**
 * SIP REGISTER refresh timeout
 * @private 
 */ 
PrivateJainSipClientConnector.prototype.onSipRegisterTimeout=function(){
    console.debug("PrivateJainSipClientConnector:onSipRegisterTimeout()");
    try
    {  
        if(this.sipRegisterState==this.SIP_REGISTERED_STATE)
        {
            this.sipRegisterRefreshTimer=undefined;
            this.sipRegisterState=this.SIP_REGISTER_REFRESHING_STATE;
            var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
            this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
            this.jainSipRegisterSentRequest = this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest);
            this.jainSipRegisterTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
            this.jainSipRegisterSentRequest.setTransaction(this.jainSipRegisterTransaction);
            this.jainSipRegisterTransaction.sendRequest();
        }
        else
        {
            console.warn("PrivateJainSipClientConnector:onSipRegisterTimeout(): SIP REGISTER refresh stopped");       
        }
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:onSipRegisterTimeout(): catched exception:"+exception);
    }  
}


/**
 * SIP REGISTER state machine
 * @private 
 * @param {ResponseEvent} responseEvent JAIN SIP response to process
 */ 
PrivateJainSipClientConnector.prototype.processSipRegisterResponse=function(responseEvent){
    console.debug ("PrivateJainSipClientConnector:processSipRegisterResponse(): this.sipRegisterState="+this.sipRegisterState);  

    var jainSipResponse=responseEvent.getResponse(); 
    var statusCode = parseInt(jainSipResponse.getStatusCode()); 
    if(this.sipRegisterState==this.SIP_UNREGISTERED_STATE)
    {
        console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): bad state, SIP response ignored");  
    }
    else if((this.sipRegisterState==this.SIP_REGISTERING_STATE) || (this.sipRegisterState==this.SIP_REGISTER_REFRESHING_STATE))
    {   
        if(statusCode < 200)
        {
            console.debug("PrivateJainSipClientConnector:processSipRegisterResponse(): 1XX response ignored"); 
        }
        else if(statusCode==401)
        {
            if(this.configuration.sipPassword!=undefined && this.configuration.sipLogin!=undefined)
            {
                this.sipRegisterState=this.SIP_REGISTERING_401_STATE;
                this.jainSipRegisterSentRequest.removeHeader("Authorization");
                var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
                this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
                var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,this.jainSipRegisterSentRequest,this.configuration.sipPassword,this.configuration.sipLogin);
                this.messageFactory.addHeader(this.jainSipRegisterSentRequest, jainSipAuthorizationHeader); 
                this.jainSipRegisterSentRequest = this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest);
                this.jainSipRegisterTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
                this.jainSipRegisterSentRequest.setTransaction(this.jainSipRegisterTransaction);
                this.jainSipRegisterTransaction.sendRequest();
            }
            else
            {
                // Authentification required but not SIP credentials in SIP profile
                console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP registration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine()) 
                this.reset();
                this.webRtcCommClient.onPrivateClientConnectorOpenErrorEvent();
            }
        }
        else if(statusCode==200)
        {
            this.sipRegisterState=this.SIP_REGISTERED_STATE;
            if(this.openedFlag==false)
            {
                this.openedFlag=true;
                this.webRtcCommClient.onPrivateClientConnectorOpenedEvent();
            }           
            
            if(this.sipUnregisterPendingFlag==true) {
                this.sipUnregisterPendingFlag=false; 
                this.sipRegisterState=this.SIP_UNREGISTERING_STATE;
                if(this.sipRegisterRefreshTimer)
                {
                    // Cancel SIP REGISTER refresh timer
                    clearTimeout(this.sipRegisterRefreshTimer);
                }
                var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
                this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
                this.jainSipRegisterSentRequest.getExpires().setExpires(0);
                this.jainSipRegisterSentRequest = this.jainSipRegisterSentRequest=this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest); 
                this.jainSipRegisterTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
                this.jainSipRegisterSentRequest.setTransaction(this.jainSipRegisterTransaction);
                this.jainSipRegisterTransaction.sendRequest(); 
            }
            else
            {
                // Start SIP REGISTER refresh timeout
                var that=this;
                if(this.sipRegisterRefreshTimer) clearTimeout(this.sipRegisterRefreshTimer);
                this.sipRegisterRefreshTimer=setTimeout(function(){
                    that.onSipRegisterTimeout();
                },40000);
            }
        }
        else
        {
            console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP registration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine()) 
            this.reset();
            this.webRtcCommClient.onPrivateClientConnectorOpenErrorEvent();
        }
    }                     
    else if(this.sipRegisterState==this.SIP_REGISTERING_401_STATE)
    {
        if(statusCode < 200)
        {
        //  No temporary response for SIP REGISTER request 
        }
        else if(statusCode==200)
        {
            this.sipRegisterState=this.SIP_REGISTERED_STATE; 
            if(this.openedFlag==false) 
            {
                console.debug("PrivateJainSipClientConnector:processSipRegisterResponse(): this.openedFlag=true"); 
                this.openedFlag=true;
                this.webRtcCommClient.onPrivateClientConnectorOpenedEvent();
            }
            
            if(this.sipUnregisterPendingFlag==true) {
                this.sipUnregisterPendingFlag=false; 
                this.sipRegisterState=this.SIP_UNREGISTERING_STATE;
                if(this.sipRegisterRefreshTimer)
                {
                    // Cancel SIP REGISTER refresh timer
                    clearTimeout(this.sipRegisterRefreshTimer);
                }
                var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
                this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
                this.jainSipRegisterSentRequest.getExpires().setExpires(0);
                this.jainSipRegisterSentRequest = this.jainSipRegisterSentRequest=this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest); 
                this.jainSipRegisterTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
                this.jainSipRegisterSentRequest.setTransaction(this.jainSipRegisterTransaction);
                this.jainSipRegisterTransaction.sendRequest();  
            }
            else
            {
                // Start SIP REGISTER refresh timeout
                var that=this;
                if(this.sipRegisterRefreshTimer) clearTimeout(this.sipRegisterRefreshTimer);
                this.sipRegisterRefreshTimer=setTimeout(function(){
                    that.onSipRegisterTimeout();
                },40000);
            }
        }
        else
        {
            console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP registration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            this.reset();
            this.webRtcCommClient.onPrivateClientConnectorErrorEvent();
        } 
    }
    else if(this.sipRegisterState==this.SIP_REGISTERED_STATE)
    {
        console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): bad state, SIP response ignored");   
    }
    else if(this.sipRegisterState==this.SIP_UNREGISTERING_STATE)
    {
        if(statusCode< 200)
        {
        //  Not temporary response for SIP REGISTER request  
        }
        else if(statusCode==401)
        {
            this.sipRegisterState=this.SIP_UNREGISTERING_401_STATE;
            this.jainSipRegisterSentRequest.removeHeader("Authorization");
            var num=new Number(this.jainSipRegisterSentRequest.getCSeq().getSeqNumber());
            this.jainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
            var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipResponse,this.jainSipRegisterSentRequest,this.configuration.sipPassword,this.configuration.sipLogin);
            this.messageFactory.addHeader(this.jainSipRegisterSentRequest, jainSipAuthorizationHeader); 
            this.jainSipRegisterSentRequest = this.messageFactory.setNewViaHeader(this.jainSipRegisterSentRequest);
            this.jainSipRegisterTransaction = this.sipProvider.getNewClientTransaction(this.jainSipRegisterSentRequest);
            this.jainSipRegisterSentRequest.setTransaction(this.jainSipRegisterTransaction);
            this.jainSipRegisterTransaction.sendRequest();
        }
        else if(statusCode==200)
        {
            this.reset();
            this.webRtcCommClient.onPrivateClientConnectorClosedEvent();
        }
        else
        {
            console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());  
            this.reset();
            this.webRtcCommClient.onPrivateClientConnectorClosedEvent();
        }
    }
    else if(this.sipRegisterState==this.SIP_UNREGISTERING_401_STATE)
    {
        if(statusCode< 200)
        { 
        //  Not temporary response for SIP REGISTER request 
        }
        else if(statusCode==200)
        {
            this.reset();
            this.webRtcCommClient.onPrivateClientConnectorClosedEvent();
        }
        else
        {
            console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            this.reset();
            this.webRtcCommClient.onPrivateClientConnectorClosedEvent();
        }
    }
    else if(this.sipRegisterState==this.SIP_UNREGISTERED_STATE)
    {
        console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): bad state, SIP response ignored");  
    }
    else
    {
        console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): bad state, SIP response ignored");    
    }
}

/**
 * Handle SIP OPTIONS RESPONSE (default behaviour: send 200 OK response)                  
 * @param {RequestEvent} requestEvent JAIN SIP request event to process
 * @private 
 */ 
PrivateJainSipClientConnector.prototype.processSipOptionRequest=function(requestEvent){
    console.debug ("PrivateJainSipClientConnector:processSipOptionRequest()");  
    // Build SIP OPTIONS 200 OK response   
    var jainSipRequest=requestEvent.getRequest();
    var jainSip200OKResponse=jainSipRequest.createResponse(200, "OK");
    jainSip200OKResponse.addHeader(this.jainSipContactHeader);
    jainSip200OKResponse.addHeader(this.jainSipUserAgentHeader);
    jainSip200OKResponse.removeHeader("P-Asserted-Identity");
    jainSip200OKResponse.removeHeader("P-Charging-Vector");
    jainSip200OKResponse.removeHeader("P-Charging-Function-Addresses");
    jainSip200OKResponse.removeHeader("P-Called-Party-ID");
    requestEvent.getServerTransaction().sendResponse(jainSip200OKResponse);
}
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
 * <p> Call configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audio: true,<br></span>
 * <span style="margin-left: 30px">video: true,<br></span>
 * <span style="margin-left: 30px">data:false<br></span>
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
                
    console.debug("WebRtcCommCall:checkConfiguration(): configuration.displayedName="+configuration.displayedName);
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
    var peerConnectionConfiguration = {
        "iceServers": []
    };
    this.peerConnectionState='new';
    var that = this;
    if(this.configuration.stunServer)
    {
        peerConnectionConfiguration = {
            "iceServers": [{
                "url":this.webRtcCommClient.configuration.rtcPeerConnection.stunServer
            }]
        };
    }
    if(window.webkitRTCPeerConnection)
    {
        this.peerConnection = new window.webkitRTCPeerConnection(peerConnectionConfiguration);
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



/**
 * @class WebRtcCommClient
 * @classdesc Main class of the WebRtcComm Framework providing high level communication service: call and be call
 * @constructor
 * @public
 * @param  {object} eventListener event listener object implementing WebRtcCommClient and WebRtcCommCall listener interface
 */ 
WebRtcCommClient = function(eventListener)
{ 
    if(typeof eventListener == 'object')
    {
        this.id = "WebRtcCommClient" + Math.floor(Math.random() * 2147483648);
        console.debug("WebRtcCommClient:WebRtcCommClient():this.id="+this.id);
        this.eventListener = eventListener;  
        this.configuration=undefined; 
        this.connector=undefined; 
        this.closePendingFlag=false; 
    }
    else 
    {
        throw "WebRtcCommClient:WebRtcCommClient(): bad arguments"      
    }
} 


/**
 * SIP call control protocol mode 
 * @public
 * @constant
 */ 
WebRtcCommClient.prototype.SIP="SIP";


/**
 * Get opened/closed status 
 * @public
 * @returns {boolean} true if opened, false if closed
 */
WebRtcCommClient.prototype.isOpened=function(){
    if(this.connector) return this.connector.isOpened();
    else return false;   
}

/**
 * Get client configuration
 * @public
 * @returns {object} configuration
 */
WebRtcCommClient.prototype.getConfiguration=function(){
    return this.configuration;  
}

/**
 * Open the WebRTC communication client, asynchronous action, opened or error event are notified to the eventListener
 * @public 
 * @param {object} configuration  WebRTC communication client configuration <br>
 * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">communicationMode:WebRtcCommClient.prototype.SIP,<br></span>
 * <span style="margin-left: 30px">sip: {,<br></span>
 * <span style="margin-left: 60px">sipUserAgent:"WebRtcCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 60px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 60px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 60px"> sipUserName:"alice",<br></span>
 * <span style="margin-left: 60px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 60px"> sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 60px">sipApplicationProfile,<br></span>
 * <span style="margin-left: 60px">sipRegisterMode:true,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * <span style="margin-left: 30px">webRtcPeeConnection: {,<br></span>
 * <span style="margin-left: 60px"stunServer:undefined,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * }<br>
 *  </p>
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 * @throw {String} Exception [internal error]
 */
WebRtcCommClient.prototype.open=function(configuration){
    console.debug("WebRtcCommClient:open()");
    if(typeof(configuration) == 'object')
    {
        if(this.isOpened()==false)
        {
            if(this.checkConfiguration(configuration)==true)
            {
                this.configuration=configuration;
                if(configuration.communicationMode==WebRtcCommClient.prototype.SIP)
                {
                    this.connector = new PrivateJainSipClientConnector(this);
                    this.connector.open(this.configuration.sip);
                }
            } 
            else
            {
                console.error("WebRtcCommClient:open(): bad configuration");
                throw "WebRtcCommClient:open(): bad configuration";   
            }
        }
        else
        {   
            console.error("WebRtcCommClient:open(): bad state, unauthorized action");
            throw "WebRtcCommClient:open(): bad state, unauthorized action";    
        }
    }
    else
    {   
        console.error("WebRtcCommClient:open(): bad argument, check API documentation");
        throw "WebRtcCommClient:open(): bad argument, check API documentation"    
    } 
}

/**
 * Close the WebRTC communication client, asynchronous action, closed event is notified to the eventListener
 * @public 
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 */ 
WebRtcCommClient.prototype.close=function(){
    console.debug("WebRtcCommClient:close()");
    if(this.isOpened())
    {    
        try
        {
            this.closePendingFlag=true;
            this.connector.close();
        }
        catch(exception){
            console.error("WebRtcCommClient:close(): catched exception:"+exception);
            // Force notification of closed event to listener
            this.closePendingFlag=false;
            this.connector=undefined;
            if(this.eventListener.onWebRtcCommClientClosedEvent!=undefined) 
            {
                var that=this;
                setTimeout(function(){
                    try{
                        that.eventListener.onWebRtcCommClientClosedEvent(that);
                    }
                    catch(exception)
                    {
                        console.error("WebRtcCommClient:onWebRtcCommClientClosed(): catched exception in event listener:"+exception);  
                    }
                },1);
            }
        } 
    }
}
 
/**
 * Request a WebRTC communication, asynchronous action, call events are notified to the eventListener 
 * @public 
 * @param {string} calleePhoneNumber Callee contact identifier (Tel URI, SIP URI: sip:bob@sip.net)
 * @param {object} callConfiguration Communication configuration <br>
 * <p> Communication configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">displayedName:sip:alice,<br></span>
 * <span style="margin-left: 30px">localMediaStream: [LocalMediaStream],<br></span>
 * <span style="margin-left: 30px">audioMediaFlag:true,<br></span>
 * <span style="margin-left: 30px">videoMediaFlag:false,<br></span>
 * <span style="margin-left: 30px">dataMediaFlag:false,<br></span>
 * }<br>
 * </p>
 * @throw {String} Exception "bad argument, check API documentation"
 * @throw {String} Exception "bad configuration, missing parameter"
 * @throw {String} Exception "bad state, unauthorized action"
 */ 
WebRtcCommClient.prototype.call=function(calleePhoneNumber, callConfiguration){
    console.debug("WebRtcCommClient:call():calleePhoneNumber="+calleePhoneNumber);
    console.debug("WebRtcCommClient:call():callConfiguration="+callConfiguration);
    try
    {
        if(typeof(calleePhoneNumber) == 'string' && typeof(callConfiguration) == 'object')
        {
            if(this.isOpened())
            {       
                var newWebRtcCommCall = new WebRtcCommCall(this);
                newWebRtcCommCall.connector=this.connector.createPrivateCallConnector(newWebRtcCommCall); 
                newWebRtcCommCall.id=newWebRtcCommCall.connector.getId();
                newWebRtcCommCall.open(calleePhoneNumber, callConfiguration);
                return newWebRtcCommCall;
            }
            else
            {   
                console.error("WebRtcCommClient:call(): bad state, unauthorized action");
                throw "WebRtcCommClient:call(): bad state, unauthorized action";    
            }
        }
        else
        {   
            console.error("WebRtcCommClient:call(): bad argument, check API documentation");
            throw "WebRtcCommClient:call(): bad argument, check API documentation"    
        }
    }
    catch(exception){
        console.error("WebRtcCommClient:call(): catched exception:"+exception);
        throw exception;  
    }  
}


/**
 * Check validity of the client configuration 
 * @private
 * @param {object} configuration client configuration
 * @returns {boolean} true valid false unvalid
 */ 
WebRtcCommClient.prototype.checkConfiguration=function(configuration){
    console.debug("WebRtcCommClient:checkConfiguration()");
    if(configuration.communicationMode!=undefined)
    {
        if(configuration.communicationMode==WebRtcCommClient.prototype.SIP) 
        {
            return true
        }
    }
    return false;
}

/**
  * Implements PrivateClientConnector opened event listener interface
  * @private
  */
WebRtcCommClient.prototype.onPrivateClientConnectorOpenedEvent=function()
{
    console.debug ("WebRtcCommClient:onPrivateClientConnectorOpenedEvent()");
    if(this.eventListener.onWebRtcCommClientOpenedEvent!=undefined) 
    {
        var that=this;
        setTimeout(function(){
            try{
                that.eventListener.onWebRtcCommClientOpenedEvent();
            } 
            catch(exception){
                console.error("WebRtcCommClient:onPrivateClientConnectorOpenedEvent(): catched exception in event listener:"+exception);
            }          
        },1);    
    }
}

/**
  * Implements PrivateClientConnector error event listener interface
  * @private
  * @param {string} error Error message
  */
WebRtcCommClient.prototype.onPrivateClientConnectorOpenErrorEvent=function(error)
{
    console.debug ("WebRtcCommClient:onPrivateClientConnectorOpenErrorEvent():error:"+error); 
    // Force closing of the client
    try {
        this.close();
    } catch(exception) {}
        
    if(this.eventListener.onWebRtcCommClientOpenErrorEvent!=undefined) 
    {
        var that=this;
        setTimeout(function(){
            try{
                that.eventListener.onWebRtcCommClientOpenErrorEvent(error);
            } 
            catch(exception){
                console.error("WebRtcCommClient:onPrivateClientConnectorOpenErrorEvent(): catched exception in event listener:"+exception);
            }          
        },1); 
    }
} 
    
/**
  * Implements PrivateClientConnector closed event listener interface
  * @callback PrivatePrivateClientConnector interface
  * @private
  */

WebRtcCommClient.prototype.onPrivateClientConnectorClosedEvent=function()
{
    console.debug ("WebRtcCommClient:onPrivateClientConnectorClosedEvent()");  
    var wasOpenedFlag = this.isOpened()||this.closePendingFlag;
    
    // Close properly the client
    try {
        if(this.closePendingFlag==false) this.close();
        else  this.connector=undefined;
    } catch(exception) {     
    }
    
    if(wasOpenedFlag && this.eventListener.onWebRtcCommClientClosedEvent!=undefined) 
    {
        var that=this;
        setTimeout(function(){
            try{
                that.eventListener.onWebRtcCommClientClosedEvent();
            } 
            catch(exception){
                console.error("WebRtcCommClient:onPrivateClientConnectorClosedEvent(): catched exception in event listener:"+exception);
            }          
        },1);  
    } 
    else  if(!wasOpenedFlag && this.eventListener.onWebRtcCommClientOpenErrorEvent!=undefined) 
    {
        var that=this;
        setTimeout(function(){
            try{
                that.eventListener.onWebRtcCommClientOpenErrorEvent("Connection to WebRtcCommServer has failed");
            } 
            catch(exception){
                console.error("WebRtcCommClient:onWebRtcCommClientOpenErrorEvent(): catched exception in event listener:"+exception);
            }          
        },1);  
    } 
}
