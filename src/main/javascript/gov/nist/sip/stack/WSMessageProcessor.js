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
 *  Implementation of the JAIN-SIP WSMessageProcessor .
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function WSMessageProcessor() {
    if(logger!=undefined) logger.debug("WSMessageProcessor:WSMessageProcessor()");
    this.classname="WSMessageProcessor"; 
    this.nConnections=null;
    this.isRunning=null;
    this.wsMessageChannels=new Array(); 
    this.incomingwsMessageChannels=null;
    this.websocket=null;
    this.useCount=0;
    if(arguments.length!=0)
    {
        var sipStack=arguments[0];
        this.sipStack = sipStack;
        this.ipAddress = this.sipStack.getIpAddress();
        this.wsurl=this.sipStack.getUrlWs();
        this.useragent=this.sipStack.getUserAgent();
    }
    this.sentByHostPort=new HostPort();
    this.sentByHostPort.setHost(new Host(this.ipAddress));
    this.transport = "tcp";//it is temporaire. it should be change to ws
    this.sentBy=null;
    this.sentBySet=null;
}

WSMessageProcessor.prototype.start =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:start()");
    return this.run();
}

WSMessageProcessor.prototype.run =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:run()");
    this.incomingwsMessageChannels = new WSMessageChannel(this);
    return this.incomingwsMessageChannels;
}

WSMessageProcessor.prototype.getTransport =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getTransport()");
    return "tcp";
}

WSMessageProcessor.prototype.getIncomingwsMessageChannels =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getIncomingwsMessageChannels()");
    return this.incomingwsMessageChannels;
}

WSMessageProcessor.prototype.getSIPStack =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getSIPStack()");
    return this.sipStack;
}

WSMessageProcessor.prototype.getURLWS =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getURLWS()");
    return this.wsurl;
}

WSMessageProcessor.prototype.getInfoApp =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getURLWS()");
    return this.infoApp;
}

WSMessageProcessor.prototype.stop =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:stop()");
    this.isRunning = false;
    this.incomingwsMessageChannels.close();
}

WSMessageProcessor.prototype.createMessageChannel =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:createMessageChannel()");
    this.incomingwsMessageChannels = new WSMessageChannel(this.sipStack,this);
    return this.incomingwsMessageChannels;
}

WSMessageProcessor.prototype.getMaximumMessageSize =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getMaximumMessageSize()");
    return 0x7fffffff;
}

WSMessageProcessor.prototype.getViaHeader =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getViaHeader()");
    var via = new Via();
    if (this.sentByHostPort != null) {
        via.setSentBy(this.sentByHostPort);
        via.setTransport(this.getTransport());
    } else {
        var host = new Host();
        host.setHostname(this.getIpAddress());
        via.setHost(host);
        via.setTransport(this.getTransport());
    }
    var random=new Date();
    var viabranch="z9hG4bK"+new String(random.getTime());
    via.setBranch(viabranch);
    return via;
}

WSMessageProcessor.prototype.inUse =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:inUse()");
    if(this.useCount != 0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

WSMessageProcessor.prototype.getDefaultTargetPort =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getDefaultTargetPort()");
    return 5060;
}

WSMessageProcessor.prototype.isSecure =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:isSecure()");
    return false;
}

WSMessageProcessor.prototype.getListeningPoint =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getListeningPoint()");
    return this.listeningPoint;
}

WSMessageProcessor.prototype.setListeningPoint =function(lp){
    if(logger!=undefined) logger.debug("WSMessageProcessor:setListeningPoint():lp:"+lp);
    this.listeningPoint = lp;
}

WSMessageProcessor.prototype.initialize =function(infoApp,transactionStack){
    if(logger!=undefined) logger.debug("WSMessageProcessor:initialize():infoApp="+infoApp+", transactionStack="+transactionStack);
    this.sipStack = transactionStack;
    this.infoApp=infoApp;
}

WSMessageProcessor.prototype.setSentBy =function(sentBy){
    if(logger!=undefined) logger.debug("WSMessageProcessor:setSentBy():sentBy="+sentBy);
    var ind = sentBy.indexOf(":");
    if (ind == -1) {
        this.sentByHostPort = new HostPort();
        this.sentByHostPort.setHost(new Host(sentBy));
    } else {
        this.sentByHostPort = new HostPort();
        this.sentByHostPort.setHost(new Host(sentBy.substring(0, ind)));
        var portStr = sentBy.substring(ind + 1);
        try {
            var port = portStr;
            this.sentByHostPort.setPort(port);
        } catch (ex) {
            console.error("WSMessageProcessor:setSentBy(): bad format encountered at ", ind);
            throw "WSMessageProcessor:setSentBy(): bad format encountered at "+ ind;
        }
    }
    this.sentBySet = true;
    this.sentBy = sentBy;
}

WSMessageProcessor.prototype.getSentBy =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getSentBy()");
    if (this.sentBy == null && this.sentByHostPort != null) {
        this.sentBy = this.sentByHostPort.toString();
    }
    return this.sentBy;
}

WSMessageProcessor.prototype.getPort =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getPort()");
    return this.port;
}

WSMessageProcessor.prototype.getIpAddress =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getIpAddress()");
    return this.ipAddress;
}

WSMessageProcessor.prototype.getDefaultPort =function(){
    if(logger!=undefined) logger.debug("WSMessageProcessor:getDefaultPort()");
    var retval=5060
    return retval;
}