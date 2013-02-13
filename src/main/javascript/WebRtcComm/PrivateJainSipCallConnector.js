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
}