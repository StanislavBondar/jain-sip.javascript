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
 *  Implementation of the JAIN-SIP SipListener .
 *  @see  gov/nist/javax/sip/SipListener.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function SipListener() {
    if(logger!=undefined) logger.debug("SipListener:SipListener()");
}

SipListener.prototype.processDialogTerminated =function(dialogTerminatedEvent){
    if(logger!=undefined) logger.debug("SipListener:processDialogTerminated():dialogTerminatedEvent="+dialogTerminatedEvent);  
}

SipListener.prototype.processIOException =function(exceptionEvent){
    if(logger!=undefined) logger.debug("SipListener:processIOException():exceptionEvent="+exceptionEvent);   
}

SipListener.prototype.processRequest =function(requestEvent){
    if(logger!=undefined) logger.debug("SipListener:processRequest():requestEvent="+requestEvent);  
}

SipListener.prototype.processResponse =function(responseEvent){
    if(logger!=undefined) logger.debug("SipListener:processResponse():responseEvent="+responseEvent); 
}

SipListener.prototype.processTimeout =function(timeoutEvent){
    if(logger!=undefined) logger.debug("SipListener:processTimeout():timeoutEvent="+timeoutEvent); 
}

SipListener.prototype.processTransactionTerminated =function(transactionTerminatedEvent){
    if(logger!=undefined) logger.debug("SipListener:processTransactionTerminated():transactionTerminatedEvent="+transactionTerminatedEvent);  
}

SipListener.prototype.processIsConected =function(sipstack){
    if(logger!=undefined) logger.debug("SipListener:processTransactionTerminated():sipstack="+sipstack);  
    var num=sipstack.getChannel().getWebSocket().readyState;
    if(num==0)
    {
        return "CONNECTING";
    }
    else if(num==1)
    {
        return "CONNECTED";
    }
    else
    {
        return "CLOSED";
    }
}
