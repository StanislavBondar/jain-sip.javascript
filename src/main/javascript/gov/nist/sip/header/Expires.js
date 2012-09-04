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
 *  Implementation of the JAIN-SIP Expires .
 *  @see  gov/nist/javax/sip/header/Expires.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function Expires() {
    if(logger!=undefined) logger.debug("Expires:Expires()");
    this.serialVersionUID = "3134344915465784267L";
    this.classname="Expires";
    this.headerName=this.NAME;
    this.expires=null;
}

Expires.prototype = new SIPHeader();
Expires.prototype.constructor=Expires;
Expires.prototype.NAME="Expires";

Expires.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("Expires:encodeBody()");
    return this.encodeBodyBuffer("").toString();
}

Expires.prototype.encodeBodyBuffer =function(buffer){
    if(logger!=undefined) logger.debug("Expires:encodeBodyBuffer():buffer="+buffer);
    buffer=buffer+this.expires;
    return buffer;
}

Expires.prototype.getExpires =function(){
    if(logger!=undefined) logger.debug("Expires:getExpires()");
    return this.expires;
}

Expires.prototype.setExpires =function(expires){
    if(logger!=undefined) logger.debug("Expires:setExpires():expires="+expires);
    if (expires < 0)
    {
        console.error("Expires:setExpires(): bad argument " + expires);
        throw "Expires:setExpires(): bad argument " + expires;
    }
    this.expires = expires;
}