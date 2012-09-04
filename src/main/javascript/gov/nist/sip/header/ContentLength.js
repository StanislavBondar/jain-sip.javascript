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
 *  Implementation of the JAIN-SIP ContentLength .
 *  @see  gov/nist/javax/sip/header/ContentLength.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function ContentLength(length) {
    if(logger!=undefined) logger.debug("ContentLength:ContentLength(): length="+length);
    this.serialVersionUID = "1187190542411037027L";
    this.classname="ContentLength";
    this.headerName=this.NAME;
    this.contentLength=null;
    if(length==null)
    {
        this.headerName=this.NAME;
    }
    else
    {
        this.headerName=this.NAME;
        this.contentLength=length;
    }
}

ContentLength.prototype = new SIPHeader();
ContentLength.prototype.constructor=ContentLength;
ContentLength.prototype.NAME="Content-Length";

ContentLength.prototype.getContentLength =function(){
    if(logger!=undefined) logger.debug("ContentLength:getContentLength()");
    var x=this.contentLength-0;
    return x;
}

ContentLength.prototype.setContentLength =function(contentLength){
    if(logger!=undefined) logger.debug("ContentLength:setContentLength():contentLength="+contentLength);
    if (contentLength < 0)
    {
        console.error("ContentLength:setContentLength(): the contentLength parameter is < 0");
        throw "ContentLength:setContentLength(): the contentLength parameter is < 0";
}
    this.contentLength = contentLength;
}

ContentLength.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("ContentLength:encodeBody()");
    return this.encodeBodyBuffer("").toString();
}

ContentLength.prototype.encodeBodyBuffer =function(buffer){
    if(logger!=undefined) logger.debug("ContentLength:encodeBodyBuffer():buffer="+buffer);
    if (this.contentLength == null)
    {
        buffer=buffer+"0";
    }
    else
    {
        buffer=buffer+this.contentLength.toString();
    }
    return buffer;
}

ContentLength.prototype.match =function(other){
    if(logger!=undefined) logger.debug("ContentLength:match():other="+other);
    if (other instanceof ContentLength)
    {
        return true;
    }
    else
    {
        return false;
    }
}