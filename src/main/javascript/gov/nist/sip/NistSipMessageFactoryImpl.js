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
 *  Implementation of the JAIN-SIP NistSipMessageFactoryImpl .
 *  @see  gov/nist/javax/sip/NistSipMessageFactoryImpl.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function NistSipMessageFactoryImpl(sipStack) {
    if(logger!=undefined) logger.debug("NistSipMessageFactoryImpl:NistSipMessageFactoryImpl()");
    this.classname="NistSipMessageFactoryImpl"; 
    this.sipStack=sipStack;
}

NistSipMessageFactoryImpl.prototype.newSIPServerRequest =function(sipRequest,messageChannel){
    if(logger!=undefined) logger.debug("NistSipMessageFactoryImpl:newSIPServerResponse(): sipRequest="+ sipRequest);
    if(logger!=undefined) logger.debug("NistSipMessageFactoryImpl:newSIPServerResponse(): messageChannel:"+messageChannel);
    if (messageChannel == null || sipRequest == null) {
        console.error("NistSipMessageFactoryImpl:newSIPServerRequest(): null Arg!");
        throw "NistSipMessageFactoryImpl:newSIPServerRequest(): null Arg!";
    }
    var theStack = messageChannel.getSIPStack();
    var retval = new DialogFilter(theStack);
    if (messageChannel instanceof SIPTransaction) {
        retval.transactionChannel = messageChannel;
    }
    retval.listeningPoint = messageChannel.getMessageProcessor().getListeningPoint();
    if (retval.listeningPoint == null)
    {
        return null;
    }
    return retval;
}

NistSipMessageFactoryImpl.prototype.newSIPServerResponse =function(sipResponse,messageChannel){
    if(logger!=undefined) logger.debug("NistSipMessageFactoryImpl:newSIPServerResponse(): sipRequest="+ sipResponse);
    if(logger!=undefined) logger.debug("NistSipMessageFactoryImpl:newSIPServerResponse(): messageChannel:"+messageChannel);
    var theStack = messageChannel.getSIPStack();
    var tr = theStack.findTransaction(sipResponse, false);
    if (tr != null) {
        if (tr.getState() == null) {
            return null;
        } 
        else if ("COMPLETED" == tr.getState()
            && sipResponse.getStatusCode() / 100 == 1) {
            return null;
        }
    }
    var retval = new DialogFilter(this.sipStack);
    retval.transactionChannel = tr;
    retval.listeningPoint = messageChannel.getMessageProcessor().getListeningPoint();
    return retval;
}