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
 *  Implementation of the JAIN-SIP Supported .
 *  @see  gov/nist/javax/sip/header/Supported.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function Supported(option_tag) {
    if(logger!=undefined) logger.debug("Supported:Supported()");
    this.serialVersionUID = "-7679667592702854542L";
    this.classname="Supported";
    this.optionTag=null;
    if(option_tag!=null)
    {
        this.headerName="Supported";
        this.optionTag=option_tag;
    }
    else
    {
        this.headerName="Supported";
        this.optionTag=null;    
    }
}

Supported.prototype = new SIPHeader();
Supported.prototype.constructor=Supported;
Supported.prototype.COLON=":";
Supported.prototype.NEWLINE="\r\n";

Supported.prototype.encode =function(){
    if(logger!=undefined) logger.debug("Supported:encode()");
    var retval = this.headerName + this.COLON;
    if (this.optionTag != null)
    {
        retval = retval+this.SP + this.optionTag;
    }
    retval = retval+this.NEWLINE;
    return retval;
}

Supported.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("Supported:encodeBody()");
    return this.optionTag != null ? this.optionTag : "";
}

Supported.prototype.setOptionTag =function(optionTag){
    if(logger!=undefined) logger.debug("Supported:setOptionTag():optionTag="+optionTag);
    if (optionTag == null)
    {
        console.error("Supported:setOptionTag(): the optionTag parameter is null");
        throw "Supported:setOptionTag(): the optionTag parameter is null"; 
    }
    this.optionTag = optionTag;
}

Supported.prototype.getOptionTag =function(){
    if(logger!=undefined) logger.debug("Supported:getOptionTag()");
    return this.optionTag;
}