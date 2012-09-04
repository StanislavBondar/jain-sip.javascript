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
 *  Implementation of the JAIN-SIP RequestLine .
 *  @see  gov/nist/javax/sip/header/RequestLine.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function RequestLine(requestURI, method) {
    if(logger!=undefined) logger.debug("RequestLine:RequestLine()");
    this.serialVersionUID = "-3286426172326043129L";
    this.classname="RequestLine";
    this.uri=new GenericURI();
    this.method=null;
    this.sipVersion= "SIP/2.0";
    if(requestURI!=null&&method!=null)
    {
        this.uri=requestURI;
        this.method=method;
    }
}

RequestLine.prototype = new SIPObject();
RequestLine.prototype.constructor=RequestLine;
RequestLine.prototype.SP=" ";
RequestLine.prototype.NEWLINE="\r\n";

RequestLine.prototype.encode =function(){
    if(logger!=undefined) logger.debug("RequestLine:encode()");
    return this.encodeBuffer("").toString();
}

RequestLine.prototype.encodeBuffer =function(buffer){
    if(logger!=undefined) logger.debug("RequestLine:encodeBuffer();buffer="+buffer);
    if (this.method != null) {
        buffer=buffer+this.method+this.SP;
    }
    if (this.uri != null) {
        buffer=this.uri.encodeBuffer(buffer);
        buffer=buffer+this.SP;
    }
    buffer=buffer+this.sipVersion+this.NEWLINE;
    return buffer;
}

RequestLine.prototype.getUri =function(){
    if(logger!=undefined) logger.debug("RequestLine:getUri()");
    return this.uri;
}

RequestLine.prototype.getMethod =function(){
    if(logger!=undefined) logger.debug("RequestLine:getMethod()");
    return this.method;
}

RequestLine.prototype.getSipVersion =function(){
    if(logger!=undefined) logger.debug("RequestLine:getSipVersion()");
    return this.sipVersion;
}

RequestLine.prototype.setUri =function(uri){
    if(logger!=undefined) logger.debug("RequestLine:setUri(): uri="+uri);
    return this.uri=uri;
}

RequestLine.prototype.setMethod =function(method){
    if(logger!=undefined) logger.debug("RequestLine:setMethod():method="+method);
    this.method=method
}

RequestLine.prototype.setSipVersion =function(version){
    if(logger!=undefined) logger.debug("RequestLine:setSipVersion():version="+version);
    this.sipVersion=version
}

RequestLine.prototype.getVersionMajor =function(){
    if(logger!=undefined) logger.debug("RequestLine:getVersionMajor()");
    if (this.sipVersion == null)
        return null;
    var major = null;
    var slash = false;
    for (var i = 0; i < this.sipVersion.length; i++) {
        if (this.sipVersion.charAt(i) == '.')
        {
            break;
        }
        if (slash) 
        {
            if (major == null)
            {
                major = "" + this.sipVersion.charAt(i);
            }
            else
            {
                major += this.sipVersion.charAt(i);
            }
        }
        if (this.sipVersion.charAt(i) == '/')
        {
            slash = true;
        }
    }
    return major;
}

RequestLine.prototype.getVersionMinor =function(){
    if(logger!=undefined) logger.debug("RequestLine:getVersionMinor()");
    if (this.sipVersion == null)
        return null;
    var minor = null;
    var dot = false;
    for (var i = 0; i < this.sipVersion.length; i++) {
        if (this.sipVersion.charAt(i) == '.')
        {
            break;
        }
        if (dot) 
        {
            if (minor == null)
            {
                minor = "" + this.sipVersion.charAt(i);
            }
            else
            {
                minor += this.sipVersion.charAt(i);
            }
        }
        if (this.sipVersion.charAt(i) == '/')
        {
            dot = true;
        }
    }
    return minor;
}