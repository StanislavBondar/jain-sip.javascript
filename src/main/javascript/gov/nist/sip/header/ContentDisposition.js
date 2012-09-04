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
 *  Implementation of the JAIN-SIP ContentDisposition .
 *  @see  gov/nist/javax/sip/header/ContentDisposition.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function ContentDisposition (m) {
    if(logger!=undefined) logger.debug("ContentDisposition:ContentDisposition(): m="+m);
    this.serialVersionUID = "835596496276127003L";
    this.classname="ContentDisposition"; 
    this.dispositionType=null;
    this.headerName=this.NAME;
    this.parameters = new NameValueList();
    this.duplicates = new DuplicateNameValueList();
}

ContentDisposition.prototype = new ParametersHeader();
ContentDisposition.prototype.constructor=ContentDisposition;
ContentDisposition.prototype.NAME="Content-Disposition";
ContentDisposition.prototype.SEMICOLON=";";

ContentDisposition.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("ContentDisposition:encodeBody()");
    var encoding = this.dispositionType;
    if (this.parameters.hmap.length!=0) {
        encoding=encoding+this.SEMICOLON+this.parameters.encode();
    }
    return encoding.toString();
}

ContentDisposition.prototype.setDispositionType =function(dispositionType){
    if(logger!=undefined) logger.debug("ContentDisposition:setDispositionType():dispositionType="+dispositionType);
    if (dispositionType == null)
    {
        console.error("ContentDisposition:setDispositionType(): the dispositionType parameter is null");
        throw "ContentDisposition:setDispositionType(): the dispositionType parameter is null";
    }
    this.dispositionType = dispositionType;
}

ContentDisposition.prototype.getDispositionType =function(){
    if(logger!=undefined) logger.debug("ContentDisposition:getDispositionType()");
    return this.dispositionType;
}

ContentDisposition.prototype.getHandling =function(){
    if(logger!=undefined) logger.debug("ContentDisposition:getHandling()");
    return this.getParameter("handling");
}

ContentDisposition.prototype.setHandling =function(handling){
    if(logger!=undefined) logger.debug("ContentDisposition:setHandling():handling"+handling);
    if (handling == null)
    {
        console.error("ContentDisposition:setHandling(): the handling parameter is null");
        throw "ContentDisposition:setHandling(): the handling parameter is null";
    }
    this.setParameter("handling", handling);
}

ContentDisposition.prototype.getContentDisposition =function(){
    if(logger!=undefined) logger.debug("ContentDisposition:getContentDisposition()");
    return this.encodeBody();
}