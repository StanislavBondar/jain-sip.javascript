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
}