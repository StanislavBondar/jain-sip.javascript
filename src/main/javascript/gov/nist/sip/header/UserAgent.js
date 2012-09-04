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
 *  Implementation of the JAIN-SIP UserAgent .
 *  @see  gov/nist/javax/sip/header/UserAgent.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function UserAgent() {
    if(logger!=undefined) logger.debug("UserAgent:UserAgent()");
    this.serialVersionUID = "4561239179796364295L";
    this.classname="UserAgent";
    this.productTokens=new Array();
    this.headerName=this.NAME;
}

UserAgent.prototype = new SIPHeader();
UserAgent.prototype.constructor=UserAgent;
UserAgent.prototype.NAME="User-Agent";

UserAgent.prototype.encodeProduct =function(){
    if(logger!=undefined) logger.debug("UserAgent_encodeProduct");
    var tokens = "";
    for(var i=0;i<this.productTokens.length;i++)
    {
        tokens=tokens+this.productTokens[i];
    }
    return tokens.toString();
}

UserAgent.prototype.addProductToken =function(pt){
    if(logger!=undefined) logger.debug("UserAgent_addProductToken");
    var x=this.productTokens.length;
    this.productTokens[x]=pt;
}

UserAgent.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("UserAgent_encodeBody");
    return this.encodeProduct();
}

UserAgent.prototype.getProduct =function(){
    if(logger!=undefined) logger.debug("UserAgent_getProduct");
    if (this.productTokens == null || this.productTokens.length==0)
    {
        return null;
    }
    else
    {
        return this.productTokens;
    }
}

UserAgent.prototype.setProduct =function(product){
    if(logger!=undefined) logger.debug("UserAgent_setProduct");
    if (product == null)
    {
        console.error("UserAgent:setProduct(): the product parameter is null");
        throw "UserAgent:setProduct(): the product parameter is null"; 
    }
    this.productTokens = product;
}
