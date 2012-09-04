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
 *  Implementation of the JAIN-SIP ProxyAuthenticate .
 *  @see  gov/nist/javax/sip/header/ProxyAuthenticate.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function ProxyAuthenticate() {
    if(logger!=undefined) logger.debug("ProxyAuthenticate:ProxyAuthenticate()");
    this.serialVersionUID = "-3826145955463251116L";
    this.classname="ProxyAuthenticate";
    this.headerName=this.PROXY_AUTHENTICATE;
    this.parameters = new NameValueList();
    this.duplicates = new DuplicateNameValueList();
    this.parameters.setSeparator(this.COMMA);
    this.scheme = this.DIGEST;
}

ProxyAuthenticate.prototype = new AuthenticationHeader();
ProxyAuthenticate.prototype.constructor=ProxyAuthenticate;
ProxyAuthenticate.prototype.PROXY_AUTHENTICATE="Proxy-Authenticate";
ProxyAuthenticate.prototype.COMMA = ",";
ProxyAuthenticate.prototype.DIGEST = "Digest";

ProxyAuthenticate.prototype.getURI =function(){
    if(logger!=undefined) logger.debug("ProxyAuthenticate:getURI()");
    return null
}

ProxyAuthenticate.prototype.setURI =function(uri){
    if(logger!=undefined) logger.debug("ProxyAuthenticate:setURI():uri="+uri);
    
}