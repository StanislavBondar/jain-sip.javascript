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
 *  Implementation of the JAIN-SIP From .
 *  @see  gov/nist/javax/sip/header/ExtensionHeaderImpl.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function From(to) {
    if(logger!=undefined) logger.debug("From:From(): to="+to);
    this.serialVersionUID = "-6312727234330643892L";
    this.classname="From";
    this.parameters=null;
    this.duplicates=null;
    this.address = new AddressImpl();
    if(to==null)
    {
        this.headerName=this.NAME;
        this.parameters = new NameValueList();
        this.duplicates = new DuplicateNameValueList();
    }
    else
    {
        this.headerName=this.NAME;
        this.address = to.address;
        this.parameters = to.parameters;
    }
}

From.prototype = new AddressParametersHeader();
From.prototype.constructor=From;
From.prototype.NAME="From";
From.prototype.ADDRESS_SPEC = 2;
From.prototype.LESS_THAN="<";
From.prototype.GREATER_THAN=">";
From.prototype.SEMICOLON=";";
From.prototype.TAG="tag";

From.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("From:encodeBody()");
    return this.encodeBodyBuffer("").toString();
}

From.prototype.encodeBodyBuffer =function(buffer){
    if(logger!=undefined) logger.debug("From:encodeBodyBuffer():buffer="+buffer);
    if (this.address.getAddressType() == this.ADDRESS_SPEC) {
        buffer=buffer+this.LESS_THAN;
    }
    buffer=this.address.encodeBuffer(buffer);
    if (this.address.getAddressType() == this.ADDRESS_SPEC) {
        buffer=buffer+this.GREATER_THAN;
    }
    if (this.parameters.hmap.length!=0) {
        buffer=buffer+this.SEMICOLON;
        buffer=this.parameters.encodeBuffer(buffer);
    }
    return buffer;
}

From.prototype.getHostPort =function(){
    if(logger!=undefined) logger.debug("From:getHostPort()");
    return this.address.getHostPort();
}

From.prototype.getDisplayName =function(){
    if(logger!=undefined) logger.debug("From:getDisplayName()");
    return this.address.getDisplayName();
}

From.prototype.getTag =function(){
    if(logger!=undefined) logger.debug("From:getTag()");
    if (this.parameters == null)
    {
        return null;
    }
    return this.getParameter(this.TAG);
}

From.prototype.hasTag =function(){
    if(logger!=undefined) logger.debug("From:hasTag()");
    return this.hasParameter(this.TAG);
}

From.prototype.removeTag =function(){
    if(logger!=undefined) logger.debug("From:removeTag()");
    this.parameters.delet(this.TAG);
}

From.prototype.setAddress =function(address){
    if(logger!=undefined) logger.debug("From:setAddress():address="+address);
    this.address=address;
}

From.prototype.setTag =function(t){
    if(logger!=undefined) logger.debug("From:setTag():t="+t);
    var parser=new Parser();
    parser.checkToken(t);
    this.setParameter(this.TAG, t);
}

From.prototype.getUserAtHostPort =function(){
    if(logger!=undefined) logger.debug("From:getUserAtHostPort()");
    return this.address.getUserAtHostPort();
}

From.prototype.equals =function(other){
    if(logger!=undefined) logger.debug("From:equals():other="+other);
    if((other instanceof From) && Object.getPrototypeOf(this).equals(other))
    {
        return true;
    }
    else
    {
        return false;
    }
}

From.prototype.getAddress=function(){
    if(logger!=undefined) logger.debug("From:getAddress()");
    return this.address;
}