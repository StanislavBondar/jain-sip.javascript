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


    
    
