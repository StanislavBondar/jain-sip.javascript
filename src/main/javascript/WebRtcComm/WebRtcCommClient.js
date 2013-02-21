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
 * <span style="margin-left: 60px">sipUserAgentCapabilities=undefined,<br></span>
 * <span style="margin-left: 60px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 60px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 60px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 60px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 60px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 60px">sipRegisterMode:true,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * <span style="margin-left: 30px">RTCPeerConnection: {,<br></span>
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
 * <span style="margin-left: 30px">displayedName:alice,<br></span>
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
 *  * <p> Client configuration sample: <br>
 * { <br>
 * <span style="margin-left: 30px">communicationMode:WebRtcCommClient.prototype.SIP,<br></span>
 * <span style="margin-left: 30px">sip: {,<br></span>
 * <span style="margin-left: 60px">sipUserAgent:"WebRtcCommTestWebApp/0.0.1",<br></span>
 * <span style="margin-left: 60px">sipUserAgentCapabilities=undefined,<br></span>
 * <span style="margin-left: 60px">sipOutboundProxy:"ws://localhost:5082",<br></span>
 * <span style="margin-left: 60px">sipDomain:"sip.net",<br></span>
 * <span style="margin-left: 60px">sipUserName:"alice",<br></span>
 * <span style="margin-left: 60px">sipLogin:"alice@sip.net,<br></span>
 * <span style="margin-left: 60px">sipPassword:"1234567890",<br></span>
 * <span style="margin-left: 60px">sipRegisterMode:true,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * <span style="margin-left: 30px">RTCPeerConnection: {,<br></span>
 * <span style="margin-left: 60px"stunServer:undefined,<br></span>
 * <span style="margin-left: 30px">}<br></span>
 * }<br>
 *  </p>
 * @returns {boolean} true valid false unvalid
 */ 
WebRtcCommClient.prototype.checkConfiguration=function(configuration){
    console.debug("WebRtcCommClient:checkConfiguration()");
    var check=true;
    if(configuration.communicationMode!=undefined)
    {
        if(configuration.communicationMode==WebRtcCommClient.prototype.SIP) 
        {
            console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.communicationMode:"+configuration.communicationMode);
        } 
        else  
        {
            check=false;
            console.error("WebRtcCommClient:checkConfiguration(): unsupported communicationMode");  
        } 
        console.debug("PrivateJainSipClientConnector:checkConfiguration(): configuration.RTCPeerConnection.stunServer:"+configuration.RTCPeerConnection.stunServer);
    }
    else
    {
        check=false;
        console.error("WebRtcCommClient:checkConfiguration(): missing configuration parameter communicationMode");           
    }
    return check;
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
