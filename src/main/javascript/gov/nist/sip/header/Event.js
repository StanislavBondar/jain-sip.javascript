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
 *  Implementation of the JAIN-SIP Event .
 *  @see  gov/nist/javax/sip/header/Event.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function Event() {
    if(logger!=undefined) logger.debug("Event:Event()");
    this.serialVersionUID = "-6458387810431874841L";
    this.classname="Event";
    this.eventType=null;
    this.headerName=this.EVENT;
    this.parameters = new NameValueList();
    this.duplicates = new DuplicateNameValueList();
}

Event.prototype = new ParametersHeader();
Event.prototype.constructor=Event;
Event.prototype.EVENT="Event";
Event.prototype.ID="id";
Event.prototype.SEMICOLON=";";


Event.prototype.setEventType =function(eventType){
    if(logger!=undefined) logger.debug("Event:setEventType():eventType="+eventType);
    if (eventType == null)
    {
        console.error("Event:setEventType(): the eventType is null");
        throw "Event:setEventType():  the eventType is null";
    }
    this.eventType = eventType;
}

Event.prototype.getEventType =function(){
    if(logger!=undefined) logger.debug("Event:getEventType()");
    return this.eventType;
}

Event.prototype.setEventId =function(eventId){
    if(logger!=undefined) logger.debug("Event:setEventId():eventId="+eventId);
    if (eventId == null)
    {
        console.error("Event:setEventId(): the eventId is null");
        throw "Event:setEventId(): the eventId is null";
    }
    this.setParameter(this.ID, eventId);
}

Event.prototype.getEventId =function(){
    if(logger!=undefined) logger.debug("Event:getEventId()");
    return this.getParameter(this.ID);
}

Event.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("Event:encodeBody()");
    return this.encodeBodyBuffer("").toString();
}

Event.prototype.encodeBodyBuffer =function(buffer){
    if(logger!=undefined) logger.debug("Event:encodeBodyBuffer():buffer="+buffer);
    if (this.eventType != null)
    {
        buffer=buffer+this.eventType;
    }

    if (this.parameters.hmap.length!=0) {
        buffer=buffer+this.SEMICOLON;
        buffer=this.parameters.encodeBuffer(buffer);
    }
    return buffer;
}

Event.prototype.match =function(matchTarget){
    if(logger!=undefined) logger.debug("Event:match():matchTarget="+matchTarget);
    if (matchTarget.eventType == null && this.eventType != null)
    {
        return false;
    }
    else if (matchTarget.eventType != null && this.eventType == null)
    {
        return false;
    }
    else if (this.eventType == null && matchTarget.eventType == null)
    {
        return false;
    }
    else if (getEventId() == null && matchTarget.getEventId() != null)
    {
        return false;
    }
    else if (getEventId() != null && matchTarget.getEventId() == null)
    {
        return false;
    }
    if(matchTarget.eventType.toLowerCase()==this.eventType
        && ((this.getEventId() == matchTarget.getEventId())
            || this.getEventId().toLowerCase()==matchTarget.getEventId()))
            {
        return true
    }
    else
    {
        return false
    }
}