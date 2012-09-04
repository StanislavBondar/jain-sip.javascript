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
 *  Implementation of the JAIN-SIP TimeoutEvent .
 *  @see  gov/nist/javax/sip/TimeoutEvent.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function TimeoutEvent() {
    if(logger!=undefined) logger.debug("TimeoutEvent:TimeoutEvent()");
    this.classname="TimeoutEvent";
    this.mTimeout=null;
    this.mIsServerTransaction=null;
    this.mServerTransaction=null;
    this.mClientTransaction=null;
    this.source=null;
    if(arguments[1] instanceof SIPServerTransaction)
    {
        var source=arguments[0];
        var serverTransaction=arguments[1];
        var timeout=arguments[2];
        this.source=source;
        this.mTimeout = timeout;
        this.mServerTransaction = serverTransaction;
        this.mIsServerTransaction = true;
    }
    else if(arguments[1] instanceof SIPClientTransaction)
    {
        source=arguments[0];
        var clientTransaction=arguments[1];
        timeout=arguments[2];
        this.source=source;
        this.mTimeout = timeout;
        this.mClientTransaction = clientTransaction;
        this.mIsServerTransaction = false;
    }
}

TimeoutEvent.prototype = new TransactionTerminatedEvent();
TimeoutEvent.prototype.constructor=TimeoutEvent;

TimeoutEvent.prototype.getTimeout =function(){
    if(logger!=undefined) logger.debug("TimeoutEvent:getTimeout()");
    return this.mTimeout;
}

