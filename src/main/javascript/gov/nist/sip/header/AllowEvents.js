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
 *  Implementation of the JAIN-SIP AllowEvents .
 *  @see  gov/nist/javax/sip/header/AllowEvents.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function AllowEvents(m) {
    if(logger!=undefined) logger.debug("AllowEvents:AllowEvents()");
    this.serialVersionUID = "5281728373401351378L";
    this.classname="AllowEvents";
    this.eventType=null;
    if(m==null)
    {
        this.headerName=this.ALLOW_EVENTS;
    }
    else
    {
        this.headerName=this.ALLOW_EVENTS;
        this.eventType=m;
    }
}

AllowEvents.prototype = new SIPHeader();
AllowEvents.prototype.constructor=AllowEvents;
AllowEvents.prototype.ALLOW_EVENTS="Allow-Events";

AllowEvents.prototype.setEventType =function(eventType){
    if(logger!=undefined) logger.debug("AllowEvents:setEventType():eventType="+eventType);
    if (eventType == null)
    {
        console.error("AllowEvents:setEventType(): the eventType parameter is null");
        throw "AllowEvents:setEventType(): the eventType parameter is null";      
    }
    this.eventType = eventType;
}


AllowEvents.prototype.getEventType =function(){
    if(logger!=undefined) logger.debug("AllowEvents:getEventType()");
    return this.eventType;
}

AllowEvents.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("AllowEvents:encodeBody()");
    return this.eventType;
}