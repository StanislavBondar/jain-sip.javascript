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
 *  Implementation of the JAIN-SIP To .
 *  @see  gov/nist/javax/sip/header/To.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function To(from) {
    if(logger!=undefined) logger.debug("To:To()");
    this.serialVersionUID = "-4057413800584586316L";
    this.classname="To";
    if(from==null)
    {
        this.headerName=this.NAME;
        this.parameters = new NameValueList();
        this.duplicates = new DuplicateNameValueList();
    }
    else
    {
        this.headerName=this.NAME;
        this.parameters = new NameValueList();
        this.duplicates = new DuplicateNameValueList();
        this.setAddress(from.address);
        this.setParameters(from.parameters);
    }
}

To.prototype = new AddressParametersHeader();
To.prototype.constructor=To;
To.prototype.NAME="To";
To.prototype.ADDRESS_SPEC = 2;
To.prototype.LESS_THAN="<";
To.prototype.GREATER_THAN=">";
To.prototype.SEMICOLON=";";
To.prototype.TAG="tag";
To.prototype.COLON=":";
To.prototype.SP=" ";
To.prototype.NEWLINE="\r\n";

To.prototype.encode =function(){
    if(logger!=undefined) logger.debug("To:encode()");
    return this.headerName + this.COLON + this.SP + this.encodeBody() + this.NEWLINE;
}

To.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("To:encodeBody()");
    return this.encodeBodyBuffer("").toString();
}

To.prototype.encodeBodyBuffer =function(buffer){
    if(logger!=undefined) logger.debug("To:encodeBodyBuffer():buffer="+buffer);
    if (this.address != null) {
        if (this.address.getAddressType() == this.ADDRESS_SPEC) {
            buffer=buffer+this.LESS_THAN;
        }
        buffer=this.address.encodeBuffer(buffer);
        if (this.address.getAddressType() == this.ADDRESS_SPEC) {
            buffer=buffer+this.GREATER_THAN;
        }
        if (!this.parameters.isEmpty()) {
            buffer=buffer+this.SEMICOLON
            buffer=this.parameters.encodeBuffer(buffer);
        }
    }
    return buffer;
}

To.prototype.getHostPort =function(){
    if(logger!=undefined) logger.debug("To:getHostPort()");
    if (this.address == null)
    {
        return null;
    }
    return this.address.getHostPort();
}

To.prototype.getDisplayName =function(){
    if(logger!=undefined) logger.debug("To:getDisplayName()");
    if (this.address == null)
    {
        return null;
    }
    return this.address.getDisplayName();
}

To.prototype.getTag =function(){
    if(logger!=undefined) logger.debug("To:getTag()");
    if (this.parameters == null)
    {
        return null;
    }
    return this.getParameter(this.TAG);
}

To.prototype.hasTag =function(){
    if(logger!=undefined) logger.debug("To:hasTag()");
    if (this.parameters == null)
    {
        return false;
    }
    return this.hasParameter(this.TAG);
}

To.prototype.removeTag =function(){
    if(logger!=undefined) logger.debug("To:removeTag()");
    if (this.parameters != null)
    {
        this.parameters.delet(this.TAG);
    }
}

To.prototype.setTag =function(t){
    if(logger!=undefined) logger.debug("To:setTag():t="+t);
    var parser=new Parser();
    parser.checkToken(t);
    this.setParameter(this.TAG, t);
}

To.prototype.getUserAtHostPort =function(){
    if(logger!=undefined) logger.debug("To:getUserAtHostPort()");
    if (this.address == null)
    {
        return null;
    }
    return this.address.getUserAtHostPort();
}