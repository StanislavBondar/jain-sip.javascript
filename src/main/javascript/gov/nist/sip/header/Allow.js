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
 *  Implementation of the JAIN-SIP Allow .
 *  @see  gov/nist/javax/sip/header/Allow.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function Allow (m) {
    if(logger!=undefined) logger.debug("Allow:Allow(): m="+m);
    this.serialVersionUID = "-3105079479020693930L";
    this.classname="Allow"; 
    this.method=null;
    if(m==null)
    {
        this.headerName=this.ALLOW;
    }
    else if(arguments.length==1)
    {
        this.headerName=this.ALLOW;
        this.method=m;
    }
}

Allow.prototype = new SIPHeader();
Allow.prototype.constructor=Allow;
Allow.prototype.ALLOW="Allow";

Allow.prototype.getMethod =function(){
    if(logger!=undefined) logger.debug("Allow:getMethod()");
    return this.method;
}

Allow.prototype.setMethod =function(method){
    if(logger!=undefined) logger.debug("Allow:setMethod():method="+method);
    if (method == null)
    {
        console.error("Allow:setMethod(): JAIN-SIP Exception, the method parameter is null.");
        throw "Allow:setMethod(): the method parameter is null.";
    }
    this.method = method;
}

Allow.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("Allow:encodeBody()");
    return this.method;
}
