/* 
    Copyright (C) 2012 France Telecom S.A.
	 
    This file is part of JAIN-SIP JavaScript API. 
    JAIN-SIP JavaScript API has been developed by Orange based on a JAIN-SIP Java implementation.
    Orange has implemented the transport of SIP over WebSocket based on current IETF work 
    (http://datatracker.ietf.org/doc/draft-ietf-sipcore-sip-websocket/)
	
    JAIN-SIP JavaScript API is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JavaScript SIP API is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JAIN-SIP JavaScript API.  If not, see <http://www.gnu.org/licenses/>. 
*/

/*
 *  Implementation of the JAIN-SIP ListeningPointImpl .
 *  @see  gov/nist/javax/sip/ListeningPointImpl.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function ListeningPointImpl() {
    if(logger!=undefined) logger.debug("ListeningPointImpl:ListeningPointImpl()");
    this.classname="ListeningPointImpl";
    this.transport="ws";
    this.messageProcessor=null;
    this.sipProvider=null;
    if(arguments.length!=0)
    {
        var sipStack=arguments[0];
        this.sipStack=sipStack;
        this.useragent=this.sipStack.getUserAgent();
    }
}

ListeningPointImpl.prototype.makeKey =function(host,transport){
    if(logger!=undefined) logger.debug("ListeningPointImpl:makeKey():host="+host);
    if(logger!=undefined) logger.debug("ListeningPointImpl:makeKey():transport="+transport);
    var string="";
    string=(string+host+"/"+transport).toLowerCase();
    return string;
}

ListeningPointImpl.prototype.getKey =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getKey()");
    return this.makeKey(this.getIPAddress(), this.transport);
}

ListeningPointImpl.prototype.getUserAgent =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getUserAgent()");
    return this.useragent;
}

ListeningPointImpl.prototype.setSipProvider =function(sipProviderImpl){
    if(logger!=undefined) logger.debug("ListeningPointImpl:setSipProvider():sipProviderImpl="+sipProviderImpl);
    this.sipProvider = sipProviderImpl;
}

ListeningPointImpl.prototype.removeSipProvider =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:removeSipProvider()");
    this.sipProvider = null;
}

ListeningPointImpl.prototype.getURLWS =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getURLWS()");
    return this.messageProcessor.getURLWS();
}

ListeningPointImpl.prototype.getTransport =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getTransport()");
    return this.messageProcessor.getTransport();
}

ListeningPointImpl.prototype.getProvider =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getProvider()");
    return this.sipProvider;
}

ListeningPointImpl.prototype.setSentBy =function(sentBy){
    if(logger!=undefined) logger.debug("ListeningPointImpl:setSentBy():sentBy="+sentBy);
    this.messageProcessor.setSentBy(sentBy);
}

ListeningPointImpl.prototype.getSentBy =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getSentBy()");
    return this.messageProcessor.getSentBy();
}

ListeningPointImpl.prototype.isSentBySet =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:isSentBySet()");
    return this.messageProcessor.isSentBySet();
}

ListeningPointImpl.prototype.getViaHeader =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getViaHeader()");
    return this.messageProcessor.getViaHeader();
}

ListeningPointImpl.prototype.getMessageProcessor =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getMessageProcessor()");
    return this.messageProcessor;
}

ListeningPointImpl.prototype.getHost =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getMessageProcessor()");
    return this.hostname;
}

ListeningPointImpl.prototype.createContactHeader =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:createContactHeader()");
    try {
        var hostname = this.getHost();
        var sipURI = new SipUri();
        sipURI.setHost(hostname);
        sipURI.setTransportParam(this.transport);
        var contact = new Contact();
        var address = new AddressImpl();
        address.setURI(sipURI);
        contact.setAddress(address);
        return contact;
    } catch (ex) {
        console.error("ListeningPointImpl:createContactHeader(): catched exception:"+ex);
        return null;
    }
}

ListeningPointImpl.prototype.sendHeartbeat =function(infoApp){
    if(logger!=undefined) logger.debug("ListeningPointImpl:sendHeartbeat()");
    var messageChannel = this.messageProcessor.createMessageChannel(infoApp);
    var siprequest = new SIPRequest();
    siprequest.setNullRequest();
    messageChannel.sendMessage(siprequest);
}

ListeningPointImpl.prototype.createViaHeader =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:createViaHeader()");
    return this.getViaHeader();
}

ListeningPointImpl.prototype.getPort =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getPort()");
    return this.messageProcessor.getPort();
}

ListeningPointImpl.prototype.getIPAddress =function(){
    if(logger!=undefined) logger.debug("ListeningPointImpl:getIPAddress()");
    return this.messageProcessor.getIpAddress();
}