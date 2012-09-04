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
 *  Implementation of the JAIN-SIP HostPort class.
 *  @see  gov/nist/core/HostPort.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function HostPort() {
    //if(logger!=undefined) logger.debug("HostPort:HostPort()");
    this.classname="HostPort"; 
    this.serialVersionUID = "-7103412227431884523L";
    this.port = -1;
    this.host=new Host();
}

HostPort.prototype = new GenericObject();
HostPort.prototype.constructor=HostPort;
HostPort.prototype.COLON=":";

HostPort.prototype.encode =function(){
    //if(logger!=undefined) logger.debug("HostPort:encode()");
    return this.encodeBuffer("");
}
HostPort.prototype.encodeBuffer =function(buffer){
    //if(logger!=undefined) logger.debug("HostPort:encode():buffer="+buffer);
    buffer=this.host.encodeBuffer(buffer);
    if (this.port != -1)
    {
        buffer=buffer+this.COLON+this.port;  
    }
    return buffer;
}
HostPort.prototype.equals =function(other){
    //if(logger!=undefined) logger.debug("HostPort:equals():other="+other);
    if (other == null) {
        return false;
    }
    if (this.classname==other.classname) {
        return false;
    }
    var that =  other;
    if(this.port == that.port && this.host.equals(that.host))
    {
        return true;
    }
    else
    {
        return false;
    }
}

HostPort.prototype.getHost =function(){
    //if(logger!=undefined) logger.debug("HostPort:getHost()");
    return this.host;
}

HostPort.prototype.getPort =function(){
    //if(logger!=undefined) logger.debug("HostPort:getPort()");    
    return this.port;
}

HostPort.prototype.hasPort =function(){
    if(logger!=undefined) logger.debug("HostPort:hasPort()");
    if(this.port!=-1)
    {
        return true;
    }
    else
    {
        return false;
    }
}

HostPort.prototype.removePort =function(){
    //if(logger!=undefined) logger.debug("HostPort:removePort()");
    this.port=-1;
}

HostPort.prototype.setHost =function(h){
    //if(logger!=undefined) logger.debug("HostPort:setHost():h="+h);
    this.host=h;
}

HostPort.prototype.setPort =function(p){
    //if(logger!=undefined) logger.debug("HostPort:setPort():p="+p);
    this.port=p;
}

HostPort.prototype.getInetAddress =function(){
    //if(logger!=undefined) logger.debug("HostPort:getInetAddress()");
    if (this.host == null)
    {
        return null;
    }
    else
    {
        return this.host.getInetAddress();
    }
}

HostPort.prototype.merge =function(mergeObject){
    //if(logger!=undefined) logger.debug("HostPort:merge(): mergeObject="+mergeObject);
    var go=new GenericObject();
    go.merge (mergeObject);
    if (this.port == -1)
    {
        this.port = mergeObject.port;
    }
}


HostPort.prototype.toString =function(){
    //if(logger!=undefined) logger.debug("HostPort:toString()");
    return this.encode();
}

HostPort.prototype.hashCode =function(){
    //if(logger!=undefined) logger.debug("HostPort:hashCode()"); 
    return this.host.hashCode()+this.port;
}