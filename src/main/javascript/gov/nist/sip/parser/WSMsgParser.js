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
 *  Implementation of the JAIN-SIP WSMsgParser .
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function WSMsgParser(sipstack,data) {
    if(logger!=undefined) logger.debug("WSMsgParser:WSMsgParser()");
    this.classname="WSMsgParser"; 
    this.data=data;
    this.peerProtocol=null;
    this.messageProcessor = null;
    this.sipStack=sipstack;
    this.useragent=this.sipStack.getUserAgent();
}

WSMsgParser.prototype.RPORT="rport";
WSMsgParser.prototype.RECEIVED="received";

WSMsgParser.prototype.parsermessage =function(requestsent){
    if(logger!=undefined) logger.debug("WSMsgParser:parsermessage():requestsent="+requestsent);
    var smp = new StringMsgParser();
    var sipMessage = smp.parseSIPMessage(this.data);
    var cl =  sipMessage.getContentLength();
    var contentLength = 0;
    if (cl != null) {
        contentLength = cl.getContentLength();
    }
    else {
        contentLength = 0;
    }
    if (contentLength == 0) {
        sipMessage.removeContent();
    } 
    console.info("SIP message received: "+sipMessage.encode());
    this.processMessage(sipMessage,requestsent);
}

WSMsgParser.prototype.processMessage =function(sipMessage,requestSent){
    if(logger!=undefined) logger.debug("WSMsgParser:processMessage():sipMessage="+sipMessage+", requestsent:"+requestSent);
    if (sipMessage.getFrom() == null
        ||  sipMessage.getTo() == null || sipMessage.getCallId() == null
        || sipMessage.getCSeq() == null || sipMessage.getViaHeaders() == null) {
        return;
    }
    var channel=this.getSIPStack().getChannel();
    if (sipMessage instanceof SIPRequest) {
        this.peerProtocol = "TCP";//temporary
        var sipRequest =  sipMessage;
        var sipServerRequest = this.sipStack.newSIPServerRequest(sipRequest, channel);
        if (sipServerRequest != null) 
        {
            sipServerRequest.processRequest(sipRequest,channel);
        }//i delete all parts of logger 
    } 
    else {
        var sipResponse = sipMessage;
        try {
            sipResponse.checkHeaders();
        } catch (ex) {
            console.error("WSMsgParser:processMessage(): catched exception:"+ex);
            return;
        }
        var sipServerResponse = this.sipStack.newSIPServerResponse(sipResponse, channel);
        if (sipServerResponse != null) {
            if (sipServerResponse instanceof SIPClientTransaction
                && !sipServerResponse.checkFromTag(sipResponse)) 
                {
                return;
            }
            sipServerResponse.processResponse(sipResponse, channel);
        } 
    }
}


WSMsgParser.prototype.getSIPStack =function(){
    if(logger!=undefined) logger.debug("WSMsgParser:getSIPStack()");
    return this.sipStack;
}