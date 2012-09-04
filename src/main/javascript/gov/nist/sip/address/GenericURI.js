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
 *  Implementation of the JAIN-SIP  GenericURI.
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *  @see  gov/nist/javax/sip/address/GenericURI.java  
 */


function GenericURI(uriString) {
    if(logger!=undefined) logger.debug("GenericURI:GenericURI()");
    this.classname="GenericURI"; 
    this.serialVersionUID = "3237685256878068790L";
    this.uriString=null;
    this.scheme=null;
    if(uriString!=null)
    {
        this.uriString = uriString;
        var i = uriString.indexOf(":");
        this.scheme = uriString.substring(0, i);
    }
}

GenericURI.prototype.SIP="sip";
GenericURI.prototype.SIPS="sips";
GenericURI.prototype.POSTDIAL = "postdial";
GenericURI.prototype.PHONE_CONTEXT_TAG ="context-tag";
GenericURI.prototype.ISUB = "isub";
GenericURI.prototype.PROVIDER_TAG = "provider-tag";
GenericURI.prototype.TEL="tel";

GenericURI.prototype.encode=function(){
    if(logger!=undefined) logger.debug("GenericURI:encode()");
    return this.uriString;
}

GenericURI.prototype.encodeBuffer=function(buffer){
    if(logger!=undefined) logger.debug("GenericURI:encodeBuffer():buffer="+buffer);
    buffer=buffer+this.uriString;
    return buffer;
}

GenericURI.prototype.toString=function(){
    if(logger!=undefined) logger.debug("GenericURI:tostring()");
    return this.encode();
}

GenericURI.prototype.getScheme=function(){
    if(logger!=undefined) logger.debug("GenericURI:getScheme()");
    return this.scheme;
}

GenericURI.prototype.isSipURI=function(){
    if(logger!=undefined) logger.debug("GenericURI:isSipURI()");
    if(this instanceof SipUri)
    {
        return true;
    }
    else
    {
        return false;
    }
}

GenericURI.prototype.equals=function(that){
    if(logger!=undefined) logger.debug("GenericURI:equals():that="+that);
    if (this==that) {
        return true;
    }
    else if (that instanceof URI) {
        var o = that;
        // This is not sufficient for equality; revert to String equality...
        // return this.getScheme().equalsIgnoreCase( o.getScheme() )
        if(this.toString().toLowerCase()==o.toString().toLowerCase())
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    return false;
}

GenericURI.prototype.hashCode=function(){
    if(logger!=undefined) logger.debug("GenericURI:hashCode()");
    var hash = 0;
    var x=this.toString();
    if(!(x == null || x.value == ""))  
    {  
        for (var i = 0; i < x.length; i++)  
        {  
            hash = hash * 31 + x.charCodeAt(i);  
            var MAX_VALUE = 0x7fffffff;  
            var MIN_VALUE = -0x80000000;  
            if(hash > MAX_VALUE || hash < MIN_VALUE)  
            {  
                hash &= 0xFFFFFFFF;  
            }  
        }  
    }  
    return hash;
}


