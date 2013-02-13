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

/*
* Class PrivateJainSipCallConnector
* Package  WebRtcComm
* @author Laurent STRULLU (laurent.strullu@orange.com) 
*/

/**
* Contructor
* @public
* @param  webRtcCommCall webRtcCommCall owner object
* @param  sipCallId 
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
        this.sipCallState=undefined;
        this.jainSipInvitingSentRequest=undefined;
        this.jainSipInvitingDialog=undefined;
        this.jainSipInvitingTransaction=undefined;
        this.jainSipInvitedReceivedRequest=undefined;
        this.jainSipInvitedDialog=undefined;
        this.jainSipInvitedTransaction=undefined;   
    }
    else 
    {
        throw "PrivateJainSipCallConnector:PrivateJainSipCallConnector(): bad arguments"      
    }
};

PrivateJainSipCallConnector.prototype.constructor=PrivateJainSipCallConnector;
 
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
 * Check if opened
 * @public
 * @return true is opened, false otherise
 */
PrivateJainSipCallConnector.prototype.isOpened=function(){
    return ((this.sipCallState==this.SIP_INVITING_ACCEPTED_STATE) || (this.sipCallState==this.SIP_INVITED_ACCEPTED_STATE));   
}

/**
 * Get call ID
 * @public
 * @return id  string
 */ 
PrivateJainSipCallConnector.prototype.getId= function() {
    return this.sipCallId;
}

/**
 /**
* Open SIP dialog
* @public 
* @asynchrounous, requires implementation of PrivateJainSipCallConnector listener interface 
* @throw String Exception "bad configuration, missing parameter"
* @throw String Exception "bad state, unauthorized action"
*/ 
PrivateJainSipCallConnector.prototype.open=function(configuration){
    console.debug("PrivateJainSipCallConnector:open()");
    if(this.sipCallState==undefined)
    {
        if(typeof(configuration) == 'object')  
        {
            // Calling
            this.sipCallState=this.SIP_INVITING_INITIAL_STATE;
            if(this.checkConfiguration(configuration)==true)
            {
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
 * close SIP dialog
 * @public 
 * @asynchrounous, requires implementation of PrivateJainSipCallConnector listener interface 
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception "internal error,check console logs"
 */ 
PrivateJainSipCallConnector.prototype.close =function(){
    console.debug("PrivateJainSipCallConnector:close(): this.sipCallState="+this.sipCallState);
    if(this.sipCallState!=undefined)
    {
        if(this.sipCallState==this.SIP_INITIAL_INVITING_STATE)
        {
            // SIP INVITE has not been sent yet.
            this.sipCallState=undefined;
            this.webRtcCommCall.webRtcCommClient.connector.removeWebRtcCommCall(this.sipCallId);
            // Notify asynchronously the error event
            var that=this;
            setTimeout(function(){
                that.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
            },1);
        }
        else if(this.sipCallState==this.SIP_INVITING_STATE || this.sipCallState==this.SIP_INVITING_407_STATE)
        {
            try
            {
                // SIP INIVTE has been sent, need to cancel it
                this.jainSipInvitingCancelRequest = this.jainSipInvitingTransaction.createCancel();
                this.jainSipInvitingCancelRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
                this.jainSipInvitingCancelRequest.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
                this.jainSipInvitingCancelTransaction = this.webRtcCommCall.webRtcCommClient.connector.sipProvider.getNewClientTransaction(this.jainSipInvitingCancelRequest);
                this.jainSipInvitingCancelTransaction.sendRequest();
                this.sipCallState=this.SIP_INVITING_CANCELLING_STATE;
            }
            catch(exception){
                console.error("PrivateJainSipCallConnector:close(): catched exception:"+exception);
                // Incoherent state, reset call
                this.sipCallState=undefined;
                this.jainSipInvitingSentRequest=undefined;
                this.jainSipInvitingDialog=undefined;
                this.jainSipInvitingTransaction=undefined;
                // Notify asynchronously the closed event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
                },1);
            } 
        } 
        else if(this.sipCallState==this.SIP_INVITING_ACCEPTED_STATE)
        {
            try
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
                // Notify asynchronously the closed event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
                },1);
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:close(): catched exception:"+exception);
                // Reset call context
                this.sipCallState=undefined;
                this.jainSipInvitingSentRequest=undefined;
                this.jainSipInvitingDialog=undefined;
                this.jainSipInvitingTransaction=undefined;
                // Notify asynchronously the closed event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
                },1);
            }
        }
        else if(this.sipCallState==this.SIP_INVITED_INITIAL_STATE)
        {
            try
            {
             // Rejected  480 Temporarily Unavailable
            var jainSipResponse480= this.jainSipInvitedRequest.createResponse(480,"Temporarily Unavailable");
            jainSipResponse480.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
            jainSipResponse480.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
            this.jainSipInvitedTransaction.sendResponse(jainSipResponse480);
            }
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:close(): catched exception:"+exception);
                // Reset call context
                this.sipCallState=undefined;
                this.jainSipInvitedSentRequest=undefined;
                this.jainSipInvitedDialog=undefined;
                this.jainSipInvitedTransaction=undefined;
                // Notify asynchronously the closed event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
                },1);
            }
        }
        else if(this.sipCallState==this.SIP_INVITED_ACCEPTED_STATE)
        {
            try
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
            catch(exception)
            {
                console.error("PrivateJainSipCallConnector:byeCall(): catched exception:"+exception);
                this.sipCallState=undefined;
                this.jainSipInvitedSentRequest=undefined;
                this.jainSipInvitedDialog=undefined;
                this.jainSipInvitedTransaction=undefined;
                // Notify asynchronously the closed event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
                },1); 
            }
        }
        else 
        {
            // Reset call context
            this.sipCallState=undefined;
            this.jainSipInvitingSentRequest=undefined;
            this.jainSipInvitingDialog=undefined;
            this.jainSipInvitingTransaction=undefined;
            this.jainSipInvitedSentRequest=undefined;
            this.jainSipInvitedDialog=undefined;
            this.jainSipInvitedTransaction=undefined;
            // Notify asynchronously the closed event
            var that=this;
            setTimeout(function(){
                that.webRtcCommCall.onPrivateCallConnectorCallClosedEvent();
            },1);     
        }
    }
}


/**
 * reject/refuse SIP incomin communication
 * @public 
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception "internal error,check console logs"
 */ 
PrivateJainSipCallConnector.prototype.reject =function(){
    console.debug("PrivateJainSipCallConnector:rejectCall()");
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
            console.error("PrivateJainSipCallConnector:acceptOpen(): catched exception:"+exception);
        }       
        this.close();
    }
    else
    {
        console.error("PrivateJainSipCallConnector:acceptOpen(): bad state, unauthorized action");
        throw "PrivateJainSipCallConnector:acceptOpen(): bad state, unauthorized action";        
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
 *  WebRtcCommCall interface implementation
 */

/**
 * Handle RTC PeerConnection local SDP offring  
 * @private 
 * @param sdpOfferString 
 */ 
PrivateJainSipCallConnector.prototype.onWebRtcCommCallLocalSdpOfferEvent=function(sdpOfferString){
    console.debug("PrivateJainSipCallConnector:onWebRtcCommCallLocalSdpOfferEvent()");
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
        sdpOfferString); 
                      
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
 * Process 
 * @private 
 * @param sdpAnswerString
 */ 
PrivateJainSipCallConnector.prototype.onWebRtcCommCallLocalSdpAnswerEvent=function(sdpAnswerString){
    console.debug("PrivateJainSipCallConnector:onWebRtcCommCallLocalSdpAnswerEvent()");        
    // Send 200 OK
    var jainSip200OKResponse=this.jainSipInvitedRequest.createResponse(200, "OK");
    jainSip200OKResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipContactHeader);
    jainSip200OKResponse.addHeader(this.webRtcCommCall.webRtcCommClient.connector.jainSipUserAgentHeader);
    jainSip200OKResponse.setMessageContent("application","sdp",sdpAnswerString);
    this.jainSipInvitedTransaction.sendResponse(jainSip200OKResponse);
    
    this.sipCallState=this.SIP_INVITED_ACCEPTED_STATE;
}  


/**
 *  PrivateJainSipClientConnector interface implementation
 */

/**
 * Handle SIP Request event
 * @private 
 * @param requestEvent RequestEvent
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
 * Handle SIP response event
 * @private 
 * @param responseEvent ResponseEvent
 */ 
PrivateJainSipCallConnector.prototype.onJainSipClientConnectorSipResponseEvent=function(responseEvent){
    console.debug("PrivateJainSipCallConnector:processSipResponse()");   
    if(this.jainSipInvitingDialog!=undefined) 
        this.processInvitingSipResponseEvent(responseEvent); 
    else  if(this.jainSipInvitedDialog!=undefined) 
        this.processInvitedSipResponse(responseEvent); 
    else
    {
        console.warn("PrivateJainSipCallConnector:processSipResponse(): response ignored");      
    }
}

/**
 * Handle SIP timeout event
 * @private 
 */ 
PrivateJainSipCallConnector.prototype.onJainSipClientConnectorSipTimeoutEvent=function(){
    console.debug("PrivateJainSipCallConnector:onJainSipClientConnectorSipTimeoutEvent()"); 
    // For the time being force close of the call 
    this.close();
}

/**
 * Handle SIP request event for inviting call
 * @private 
 * @param responseEvent ResponseEvent
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
            
            // Notify asynchronously the hangup event
            var that=this;
            setTimeout(function(){
                that.webRtcCommCall.onPrivateCallConnectorCallHangupEvent();
            },1);  
            
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
 * @param responseEvent response event
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
                // Notify asynchronously the ringing back event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommCall.onPrivateCallConnectorCallRingingBackEvent();
                },1);      
            } 
            else if(statusCode== 183)
            {
                // Notify asynchronously the in progress event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommCall.onPrivateCallConnectorCallInProgressEvent();
                },1);      
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
                
                // Notify asynchronously the error event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommCall.onPrivateCallConnectorCallOpenErrorEvent(exception);
                },1);
                
                // Close the call
                this.close();
            }
        } 
        else 
        {
            console.error("PrivateJainSipCallConnector:processInvitingSipResponseEvent(): SIP INVITE failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine().toString())   
            // Update SIP call state    
            this.sipCallState=this.SIP_INVITING_ERROR_STATE;
            // Notify asynchronously the error event
            var that=this;
            setTimeout(function(){
                that.webRtcCommCall.onPrivateCallConnectorCallOpenErrorEvent(jainSipResponse.getStatusLine().getReasonPhrase());
            },1); 
            
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
                
                // Notify asynchronously the error event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommCall.onPrivateCallConnectorCallOpenErrorEvent(exception);
                },1);
                
                // Close the call
                this.close();
            }
        }
        else
        {
            // Update SIP call state
            this.sipCallState=this.SIP_INVITING_ERROR_STATE;
            
            // Notify asynchronously the error event
            var that=this;
            setTimeout(function(){
                that.webRtcCommCall.onPrivateCallConnectorCallOpenErrorEvent(jainSipResponse.getStatusLine().getReasonPhrase());
            },1); 
            
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
 * @param requestEvent request event
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
            setTimeout(function(){
                that.webRtcCommCall.onPrivateCallConnectorCallRingingEvent(callerPhoneNumber);
            },1);
            
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
                console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:"+exception);  
            }
            
            // Notify asynchronously the hangup event
            var that=this;
            setTimeout(function(){
                that.webRtcCommCall.onPrivateCallConnectorCallHangupEvent();
            },1);  
            
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
                console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception exception:"+exception);  
            }
            
            // Notify asynchronously the hangup event
            var that=this;
            setTimeout(function(){
                that.webRtcCommCall.onPrivateCallConnectorCallHangupEvent();
            },1);  
            
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
 * @param responseEvent response event
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
                console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): catched exception, exception:"+exception);  
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
        console.error("PrivateJainSipCallConnector:processInvitingSipRequestEvent(): bad state, SIP request ignored");  
    } 
}/*
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

/*
 * Class PrivateJainSipClientConnector
 * Package  WebRtcComm
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */

/**
 * Contructor
 * @public
 * @param  webRtcCommClient PrivateJainSipClientConnector object
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

PrivateJainSipClientConnector.prototype.constructor=PrivateJainSipClientConnector;

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
 * Get opened status
 * @private
 * @return true is opened, false otherise
 */
PrivateJainSipClientConnector.prototype.isOpened=function(){
    return this.openedFlag;   
}

/**
 * Open 
 * @public 
 * @asynchronous: require PrivateJainSipClientConnector event listener implementation
 * @param configuration JSON object
 * @throw String Exception "bad argument, check API documentation"
 * @throw String Exception "bad configuration, missing parameter"
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception "internal error,check console logs"
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
 * Close 
 * @public 
 * @asynchronous: require PrivateJainSipClientConnector event listener implementation
 * @throw String Exception "bad argument, check API documentation"
 * @throw String Exception "bad configuration, missing parameter"
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception "internal error,check console logs"
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
                var that=this;
                setTimeout(function(){
                    that.webRtcCommClient.onClientConnectorClosedEvent();
                },1);
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
 * @param webRtcCommCall WebRtcCommCall
 * @param sipCallId  String SIP 
 * @throw String Exception "bad argument, check API documentation"
 * @throw String Exception "bad configuration, missing parameter"
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception "internal error,check console logs"
 */ 
PrivateJainSipClientConnector.prototype.createCallConnector=function(webRtcCommCall, sipCallId){
    console.debug("PrivateJainSipClientConnector:createCallConnector()");
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
                console.error("PrivateJainSipClientConnector:createCallConnector(): bad state, unauthorized action");
                throw "PrivateJainSipClientConnector:createCallConnector(): bad state, unauthorized action";    
            }
        }
        else
        {   
            console.error("PrivateJainSipClientConnector:createCallConnector(): bad argument, check API documentation");
            throw "PrivateJainSipClientConnector:createCallConnector(): bad argument, check API documentation"    
        }
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:createCallConnector(): catched exception:"+exception);
        throw exception;  
    }   
}

/**
 * Find a WebRtcCommCall from its SIP call ID in the call table
 * @private
 * @param sipCallId String
 * @return WebRtcCommCall
 */ 
PrivateJainSipClientConnector.prototype.findCallConnector=function(sipCallId){  
    console.debug("PrivateJainSipClientConnector:findCallConnector(): sipCallId="+sipCallId);
    return this.callConnectors[sipCallId];
}

/**
 * Find a WebRtcCommCall from its SIP call ID in the call table
 * @private
 * @param SIP callId String
 * @return WebRtcCommCall
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
 * @param configuration JSON object
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
 * JAIN SIP stack event listener interface implementation
 * @private 
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
                this.webRtcCommClient.onClientConnectorOpenedEvent();
                return;
            }
        }
        else
        {
            console.error("PrivateJainSipClientConnector:processConnected(): this.openedFlag==true !");      
        }
            
        // Open failed
        this.reset();
        this.webRtcCommClient.onClientConnectorOpenErrorEvent();
    }
    catch(exception){       
        this.reset();
        this.webRtcCommClient.onClientConnectorOpenErrorEvent();
        console.error("PrivateJainSipClientConnector:processConnected(): catched exception:"+exception);
    } 
}   

/**
 * JAIN SIP stack event listener interface SIPListener implementation 
 * @private
 */     
PrivateJainSipClientConnector.prototype.processDisconnected=function(){
    console.debug("PrivateJainSipClientConnector:processDisconnected(): SIP connectivity has been lost");  
    try
    { 
        this.reset();    
        this.webRtcCommClient.onClientConnectorClosedEvent();
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:processDisconnected(): catched exception:"+exception);
    }   
}

/**
 * JAIN SIP stack event listener interface SIPListener implementation
 * @private 
 * @param error
 */ 
PrivateJainSipClientConnector.prototype.processConnectionError=function(error){
    console.war("PrivateJainSipClientConnector:processConnectionError(): SIP connection has failed, error:"+error);
    try
    {
        this.reset();
        this.webRtcCommClient.onClientConnectorOpenErrorEvent();
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:processConnectionError(): catched exception:"+exception);  
    }   
}

/**
 * JAIN SIP stack event listener interface implementation
 * @private 
 * @param requestEvent RequestEvent
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
            // Find related WebRTC dialog
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
                    newWebRtcCommCall.connector=this.createCallConnector(newWebRtcCommCall, sipCallId); 
                    newWebRtcCommCall.connector.sipCallState=PrivateJainSipCallConnector.prototype.SIP_INVITED_INITIAL_STATE;
                    newWebRtcCommCall.connector.onJainSipClientConnectorSipRequestEvent(requestEvent);
                }
                else
                {
                    console.warn("PrivateJainSipClientConnector:processRequest(): related WebRtcCommCall not found, SIP response ignored"); 
                }
            }
        }
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:processRequest(): catched exception:"+exception);  
    }   
}  


/**
 * JAIN SIP stack event listener interface implementation
 * @private 
 * @param responseEvent ResponseEvent
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
            // Find related WebRTC INVITE dialog
            var callConnector = this.findCallConnector(jainSipResponse.getCallId().getCallId());
            if(callConnector)
            {
                callConnector.onJainSipClientConnectorSipResponseEvent(responseEvent);     
            }
            else
            {
                console.warn("PrivateJainSipClientConnector:processResponse(): related WebRtcCommCall not found, SIP response ignored");  
            }
        }
    }
    catch(exception){
        console.error("PrivateJainSipClientConnector:processResponse(): catched exception:"+exception);  
    }  
}
   
/**
 * JAIN SIP stack event listener interface SIPListener implementation
 * @private 
 */ 
PrivateJainSipClientConnector.prototype.processTransactionTerminated=function(){
    console.debug("PrivateJainSipClientConnector:processTransactionTerminated()");   
}   
    
/**
 * JAIN SIP stack event listener interface SIPListener implementation
 * @private 
 */ 
PrivateJainSipClientConnector.prototype.processDialogTerminated=function(){
    console.debug("PrivateJainSipClientConnector:processDialogTerminated()"); 
}
    
/**
 * JAIN SIP stack event listener interface SIPListener implementation
 * @private 
 * @param exceptionEvent ExceptionEvent
 */ 
PrivateJainSipClientConnector.prototype.processIOException=function(exceptionEvent){
    console.error("PrivateJainSipClientConnector:processIOException(): exceptionEvent="+exceptionEvent.message);  
}

/**
 * JAIN SIP stack event listener interface SIPListener implementation
 * @private 
 * @param timeoutEvent TimeoutEvent
 */ 
PrivateJainSipClientConnector.prototype.processTimeout=function(timeoutEvent){
    console.debug("PrivateJainSipClientConnector:processTimeout():timeoutEvent="+timeoutEvent);
    try
    {
        var sipClientTransaction = timeoutEvent.getClientTransaction();
        // Find related WebRTC INVITE dialog
        var sipCallId=sipClientTransaction.getDialog().getCallId().getCallId();
        var callConnector = this.findCallConnector(sipCallId,false);
        if(callConnector)
        {
            callConnector.webRtcCommCall.onPrivateCallConnectorCallOpenErrorEvent("Request Timeout");     
        }
        else if(this.jainSipRegisterSentRequest.getCallId().getCallId()==sipCallId)
        {
            console.error("PrivateJainSipClientConnector:processTimeout(): SIP registration failed, request timeout, no response from SIP server") 
            this.reset();
            this.webRtcCommClient.onClientConnectorOpenErrorEvent("Request Timeout"); 
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
 * @throw Exception "bad state"
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
 * @param responseEvent ResponseEvent
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
                this.webRtcCommClient.onClientConnectorOpenErrorEvent();
            }
        }
        else if(statusCode==200)
        {
            this.sipRegisterState=this.SIP_REGISTERED_STATE;
            if(this.openedFlag==false)
            {
                this.openedFlag=true;
                this.webRtcCommClient.onClientConnectorOpenedEvent();
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
            this.webRtcCommClient.onClientConnectorOpenErrorEvent();
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
                this.webRtcCommClient.onClientConnectorOpenedEvent();
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
            this.webRtcCommClient.onClientConnectorErrorEvent();
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
            this.webRtcCommClient.onClientConnectorClosedEvent();
        }
        else
        {
            console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());  
            this.reset();
            this.webRtcCommClient.onClientConnectorClosedEvent();
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
            this.webRtcCommClient.onClientConnectorClosedEvent();
        }
        else
        {
            console.error("PrivateJainSipClientConnector:processSipRegisterResponse(): SIP unregistration failed:" + jainSipResponse.getStatusCode()+ "  "+ jainSipResponse.getStatusLine());
            this.reset();
            this.webRtcCommClient.onClientConnectorClosedEvent();
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
 *  Handle SIP OPTIONS RESPONSE (default behaviour: send 200OK repsonse)                  
 * @param requestEvent RequestEvent
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
}/*
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

/*
 * Class WebRtcCommCall
 * Package  WebRtcComm
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */

/**
 * Contructor
 * @public
 * @param  webRtcCommClient event Listener object
 */ 
WebRtcCommCall = function(webRtcCommClient)
{
    if(webRtcCommClient instanceof WebRtcCommClient)
    {
        this.webRtcCommClient=webRtcCommClient;
        console.debug("WebRtcCommCall:WebRtcCommCall(): callId="+this.id);
        this.calleePhoneNumber = undefined;
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

WebRtcCommCall.prototype.constructor=WebRtcCommCall;


/*
 * Public methods 
 */

/**
 * Check if opened
 * @public
 * @return true is opened, false otherise
 */
WebRtcCommCall.prototype.isOpened=function(){
    if(this.connector) return this.connector.isOpened();
    else return false;   
}


/**
 * Get call ID
 * @public
 * @return id  string
 */ 
WebRtcCommCall.prototype.getId= function() {
    return this.id;
}

/**
 * Get caller phone number
 * @public
 * @return callerPhoneNumber string
 */ 
WebRtcCommCall.prototype.getCallerPhoneNumber= function() {
    return this.callerPhoneNumber;
}

/**
 * Get callee phone number
 * @public
 * @return calleePhoneNumber string
 */ 
WebRtcCommCall.prototype.getCalleePhoneNumber= function() {
    return this.configuration.calleePhoneNumberPhoneNumber;
}

/**
 * get remote media stream
 * @public
 * @return remoteMediaStream RemoetMediaStream
 * @throw Exception "bad state"
 */ 
WebRtcCommCall.prototype.getRemoteMediaStream= function() {
    return this.remoteMediaStream;
}

/**
 * Open WebRTC communication
 * @public 
 * @asynchrounous, requires implementation of the WebRtcCommCall listener interface 
 * @param calleePhoneNumber callee phone number
 * @param configuration communication configuration JSON object
 *  configuration = {
 *       calleePhoneNumber:"+33xxxxxxx",
 *       localMediaStream: [LocalMediaStream],
 *       audio: true,
 *       video: true,
 *       data:false
 *   }
 *   
 * @throw String Exception "bad argument, check API documentation"
 * @throw String Exception "bad configuration, missing parameter"
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception internal error
 */ 
WebRtcCommCall.prototype.open=function(calleePhoneNumber, configuration){
    console.debug("WebRtcCommCall:open():calleePhoneNumber="+calleePhoneNumber);
    if(typeof(configuration) == 'object')
    {
        if(this.webRtcCommClient.isOpened()==true)
        {
            if(this.checkConfiguration(configuration)==true)
            {
                if(this.isOpened()==false)
                {
                    try
                    {
                        this.calleePhoneNumber=calleePhoneNumber;
                        this.configuration=configuration; 
                        this.connector.open(configuration);
                    
                        // Setup RTCPeerConnection first
                        this.createRTCPeerConnection();
                        if(this.configuration.localMediaStream)
                        {
                            this.peerConnection.addStream(this.configuration.localMediaStream);
                        }
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
                        } catch(exception) {} 
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
 * Close WebRTC communication
 * @public 
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception internal error
 */ 
WebRtcCommCall.prototype.close =function(){
    console.debug("WebRtcCommCall:close()");
    if(this.webRtcCommClient.isOpened()==true)
    {
        try
        {
            // Close Connector
            if(this.connector) 
            {
                this.connector.close();
                // notify asynchronously the closed event
                var that=this;
                setTimeout(function(){
                    that.webRtcCommClient.eventListener.onWebRtcCommCallClosedEvent(that);
                },1);
                this.connector=undefined;
            }
            // Close RTCPeerConnection
            if(this.peerConnection && this.peerConnection.readyState!='closed') 
            {
                this.peerConnection.close();
                this.peerConnection=undefined;
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
 *  configuration = {
 *       calleePhoneNumber:"+33xxxxxxx",
 *       localMediaStream: [LocalMediaStream],
 *       audio: true,
 *       video: true,
 *       data:false
 *   }
 * @asynchronous, requires implementation of the WebRtcCommCall listener interface 
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception "internal error,check console logs"
 */ 
WebRtcCommCall.prototype.accept =function(configuration){
    console.debug("WebRtcCommCall:accept()");
    if(typeof(configuration) == 'object')
    {
        if(this.webRtcCommClient.isOpened()==true)
        {
            if(this.checkConfiguration(configuration)==true)
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
                        // Close properly the communication
                        try {
                            this.close();
                        } catch(exception) {} 
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
                console.error("WebRtcCommCall:open(): bad configuration");
                throw "WebRtcCommCall:open(): bad configuration";   
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
        console.error("WebRtcCommCall:open(): bad argument, check API documentation");
        throw "WebRtcCommCall:open(): bad argument, check API documentation"    
    }
}

/**
 * Reject/refuse incoming WebRTC communication
 * @public 
 * @asynchronous, requires implementation of the WebRtcCommCall listener interface 
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception "internal error,check console logs"
 */ 
WebRtcCommCall.prototype.reject =function(){
    console.debug("WebRtcCommCall:reject()");
    if(this.webRtcCommClient.isOpened()==true)
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
            } catch(exception) {}    
            throw exception;  
        } 
    }
    else
    {   
        console.error("WebRtcCommCall:reject(): bad state, unauthorized action");
        throw "WebRtcCommCall:reject(): bad state, unauthorized action";    
    }
}



/*
 * Private methods 
 */

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
 * Implementation of the PrivateJainSipCallConnector  listener interface
 **/

/**
 * Process remote SDP offer event
 * @private 
 * @param remoteSdpOffer String
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorRemoteSdpOfferEvent=function(remoteSdpOffer){
    console.debug("WebRtcCommCall:onPrivateCallConnectorSdpOfferEvent()");   
    this.remoteSdpOffer = remoteSdpOffer;
}  

/**
 * Process remote SDP answer event
 * @private 
 * @param remoteSdpAnswer
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
 * Process connector call opened event
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallOpenedEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent()"); 
    // Notify the closed event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallOpenEvent)
    {
        try {
            this.webRtcCommClient.eventListener.onWebRtcCommCallOpenEvent(this);
        }
        catch(exception)
        {
            console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:"+exception);    
        }
    }
}

/**
 * Process connector call opened event
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallInProgressEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent()"); 
    // Notify the closed event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallInProgressEvent)
    {
        try {
            this.webRtcCommClient.eventListener.onWebRtcCommCallInProgressEvent(this);
        }
        catch(exception)
        {
            console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:"+exception);    
        }
    }
}

/**
 * Process connector call error event
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallOpenErrorEvent=function(error)
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallOpenErrorEvent():error="+error);
    // Notify the error event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallOpenErrorEvent)
    {
        try {
            this.webRtcCommClient.eventListener.onWebRtcCommCallOpenErrorEvent(this,error);
        }
        catch(exception)
        {
            console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:"+exception);    
        }
    }
}

/**
 * Process connector call ringing event
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallRingingEvent=function(callerPhoneNumber)
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallRingingEvent():callerPhoneNumber="+callerPhoneNumber);
    // Notify the closed event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallRingingEvent)
    {
        try {
            this.webRtcCommClient.eventListener.onWebRtcCommCallRingingEvent(this,callerPhoneNumber);
        }
        catch(exception)
        {
            console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:"+exception);    
        }
    }
}

/**
 * Process connector call ringing back event 
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallRingingBackEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallRingingBackEvent()");
    // Notify the closed event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallRingingBackEvent)
    {
        try {
            this.webRtcCommClient.eventListener.onWebRtcCommCallRingingBackEvent(this);
        }
        catch(exception)
        {
            console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:"+exception);    
        }
    }
}


/**
 * Process connector call closed event 
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallClosedEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallClosedEvent()");
    // Close properly the communication
    try {
        this.close();
    } catch(exception) {}   
}
 

/**
 * Process connector call closed event 
 * @private 
 */ 
WebRtcCommCall.prototype.onPrivateCallConnectorCallHangupEvent=function()
{
    console.debug("WebRtcCommCall:onPrivateCallConnectorCallHangupEvent()");
    // Notify the closed event to the listener
    if(this.webRtcCommClient.eventListener.onWebRtcCommCallHangupEvent)
    {
        try {
            this.webRtcCommClient.eventListener.onWebRtcCommCallHangupEvent(this);
        }
        catch(exception)
        {
            console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:"+exception);    
        }
    }  
}

 
/**
 * Implementation of the RTCPeerConnection listener interface
 **/

/**
 * Handle RTCPeerConnection error event
 * @private 
 * @param error 
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
                console.error("WebRtcCommCall:onPrivateCallConnectorCallOpenedEvent(): catched exception in listener:"+exception);    
            }
        },1); 
    }
    
    try {
        this.close();
    } catch(exception) {}
}


/**
 * RTCPeerConnection listener implementation
 * @private
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
        else
        {
                
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionOnAddStream(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();
    }
}

/**
 * RTCPeerConnection listener implementation
 * @private
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
 * RTCPeerConnection listener implementation
 * @private
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
                        this.connector.onWebRtcCommCallLocalSdpOfferEvent(this.peerConnection.localDescription.sdp)
                        this.peerConnectionState = 'offer-sent';
                    } 
                    else if (this.peerConnectionState == 'preparing-answer') 
                    {
                        this.connector.onWebRtcCommCallLocalSdpAnswerEvent(this.peerConnection.localDescription.sdp)
                        this.peerConnectionState = 'established';
                        // Notify opened event to listener
                        if(this.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent) 
                        {
                            try{
                                this.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent(this);
                            } 
                            catch(exception){
                                console.error("WebRtcCommCall:processInvitingSipRequest(): catched exception in event listener:"+exception);
                            }   
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
 * RTCPeerConnection listener implementation
 * @private
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
 * RTCPeerConnection listener implementation
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
 * RTCPeerConnection listener implementation
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
                    try{
                        this.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent(this);
                    } 
                    catch(exception){
                        console.error("WebRtcCommCall:processInvitingSipRequest(): catched exception in event listener:"+exception);
                    }   
                } 
            }
            else if (this.peerConnectionState == 'established') 
            {
            // Why this last ice candidate event ?
            } 
            else
            {
                console.error("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): RTCPeerConnection bad state!");
            }
        }
    }
    catch(exception)
    {
        console.error("WebRtcCommCall:processRtcPeerConnectionIceCandidate(): catched exception, exception:"+exception);
        this.processRtcPeerConnectionError();     
    }
}

/**
 * RTCPeerConnection listener implementation
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
 * RTCPeerConnection listener implementation
 * @private
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
 * RTCPeerConnection listener implementation
 * @private
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
                try{
                    this.webRtcCommClient.eventListener.onWebRtcCommCallOpenedEvent(this);
                } 
                catch(exception){
                    console.error("WebRtcCommCall:processInvitingSipRequest(): catched exception in event listener:"+exception);
                }   
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
 */ 
WebRtcCommCall.prototype.onRtcPeerConnectionIdentityResultEvent=function(event){
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult():event="+event);
    var peerConnection = event.currentTarget; 
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): peerConnection.readyState="+peerConnection.readyState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): peerConnection.iceGatheringState="+peerConnection.iceGatheringState);
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): peerConnection.iceState="+peerConnection.iceState); 
    console.debug("WebRtcCommCall:processRtcPeerConnectionIdentityResult(): this.peerConnectionState="+this.peerConnectionState);
}
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

/*
 * Class WebRtcCommClient
 * Package  WebRtcComm
 * @author Laurent STRULLU (laurent.strullu@orange.com) 
 */

/**
 * Contructor
 * @public
 * @param  eventListener event Listener object
 */ 
WebRtcCommClient = function(eventListener)
{ 
    if(typeof eventListener == 'object')
    {
        this.id = "WebRtcCommClient" + Math.floor(Math.random() * 2147483648);
        console.debug("WebRtcCommClient:WebRtcCommClient():this.id="+this.id);
        WebRtcCommClient.prototype.WEBRTC_CLIENTS[this.id] = this;
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

WebRtcCommClient.prototype.constructor=WebRtcCommClient;

// Private webRtc class variable
WebRtcCommClient.prototype.WEBRTC_CLIENTS = new Array(); 
WebRtcCommClient.prototype.SIP="SIP"

/**
 * Get opened status
 * @public
 * @return true is opened, false otherise
 */
WebRtcCommClient.prototype.isOpened=function(){
    if(this.connector) return this.connector.isOpened();
    else return false;   
}


/**
 * Open WebRtcCommClient 
 * @public 
 * @asynchronous : requires WebRtcCommClient  listener interface implementation
 * @param configuration
 *     configuration =  { 
        communicationMode:WebRtcCommClient.prototype.SIP,
        sip:{
            sipUserAgent:"WebRtcCommTestWebApp/0.0.1",
            sipOutboundProxy:this.DEFAULT_SIP_OUTBOUND_PROXY,
            sipDomain:this.DEFAULT_SIP_DOMAIN,
            sipUserName:this.DEFAULT_SIP_USER_NAME,
            sipLogin:this.DEFAULT_SIP_LOGIN,
            sipPassword:this.DEFAULT_SIP_PASSWORD,
            sipApplicationProfile:this.DEFAULT_SIP_APPLICATION_PROFILE,
            sipRegisterMode:this.DEFAULT_SIP_REGISTER_MODE
        },
        rtcPeerConnection:
        {
            stunServer:undefined         
        } 
 * @throw String Exception "bad argument, check API documentation"
 * @throw String Exception "bad configuration, missing parameter"
 * @throw String Exception "bad state, unauthorized action"
 * @throw String Exception internal error
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
 * Close WebRtcCommClient  
 * @public 
 * @asynchronous : requires WebRtcCommClient  listener interface implementation 
 * @throw String Exception "bad argument, check API documentation"
 * @throw String Exception "bad configuration, missing parameter"
 * @throw String Exception "bad state, unauthorized action"
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
            // Force notification of closed event
            this.closePendingFlag=false;
            this.connector=undefined;
            var that=this;
            setTimeout(function(){
                that.webRtcCommClient.eventListener.onWebRtcCommClientClosed(that);
            },40000);
        } 
    }
}
 
/**
 * Initiate a WebRTC communication 
 * @public 
 * @asynchronous : requires WebRtcCommClient  listener interface implementation 
 * @param calleePhoneNumber String
 * @param callConfiguration JSON object
 * @throw String Exception "bad argument, check API documentation"
 * @throw String Exception "bad configuration, missing parameter"
 * @throw String Exception "bad state, unauthorized action"
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
                newWebRtcCommCall.connector=this.connector.createCallConnector(newWebRtcCommCall); 
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
 * Check configuration 
 * @private
 * @param configuration JSON object
 * @return true configuration ok false otherwise
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
  * Implements ClientConnector listener interface
  * @private
  */
WebRtcCommClient.prototype.onClientConnectorOpenedEvent=function()
{
    console.debug ("WebRtcCommClient:onClientConnectorOpenedEvent()");
    if(this.eventListener.onWebRtcCommClientOpenedEvent!=undefined) 
    {
        try{
            this.eventListener.onWebRtcCommClientOpenedEvent();
        } 
        catch(exception){
            console.error("WebRtcCommClient:onClientConnectorOpenedEvent(): catched exception in event listener:"+exception);
        }   
    }
}

/**
  * Implements ClientConnector listener interface
  * @private
  */
WebRtcCommClient.prototype.onClientConnectorOpenErrorEvent=function(error)
{
    console.debug ("WebRtcCommClient:onClientConnectorOpenErrorEvent():error:"+error); 
    if(this.eventListener.onWebRtcCommClientOpenErrorEvent!=undefined) 
    {
        try{
            this.eventListener.onWebRtcCommClientOpenErrorEvent();
        } 
        catch(exception){
            console.error("WebRtcCommClient:onClientConnectorOpenErrorEvent(): catched exception in event listener:"+exception);
        } 
        // Close properly the client
        try {
            this.close();
        } catch(exception) {}
    }
} 
    
/**
  * Implements ClientConnector listener interface
  * @private
 */
WebRtcCommClient.prototype.onClientConnectorClosedEvent=function()
{
    console.debug ("WebRtcCommClient:onClientConnectorClosedEvent()");
       
    // Close properly the client
    try {
        if(this.closePendingFlag==false) this.close();
        else  this.connector=undefined;
    } catch(exception) {     
    }
    
    if(this.eventListener.onWebRtcCommClientClosedEvent!=undefined) 
    {
        try{
            this.eventListener.onWebRtcCommClientClosedEvent();
        } 
        catch(exception){
            console.error("WebRtcCommClient:onClientConnectorClosedEvent(): catched exception in event listener:"+exception);
        }   
    }
}


    
    
