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
 *  Implementation of the JAIN-SIP Server .
 *  @see  gov/nist/javax/sip/header/Server.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function Server(to) {
    if(logger!=undefined) logger.debug("Server:Server(): to="+to);
    this.serialVersionUID = "-3587764149383342973L";
    this.classname="Server";
    this.productTokens = new Array();
    this.headerName=this.NAME;
}

Server.prototype = new SIPHeader();
Server.prototype.constructor=Server;
Server.prototype.NAME="Server";

Server.prototype.encodeProduct =function(){
    if(logger!=undefined) logger.debug("Server:encodeProduct()");
    var tokens = "";
    for(var i=0;i<this.productTokens.length;i++)
    {
        tokens=tokens+this.productTokens[i];
        if (i!=this.productTokens.length-1)
        {
            tokens=tokens+"/";
        }
        else
        {
            break;
        }
    }
    return tokens.toString();
}

Server.prototype.addProductToken =function(pt){
    if(logger!=undefined) logger.debug("Server:addProductToken():pt="+pt);
    this.productTokens.push(pt);
}

Server.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("Server:encodeBody()");
    return this.encodeProduct();
}

Server.prototype.getProduct =function(){
    if(logger!=undefined) logger.debug("Server:getProduct()");
    if (this.productTokens == null || this.productTokens.length==0)
    {
        return null;
    }
    else
    {
        return this.productTokens;
    }
}

Server.prototype.setProduct =function(product){
    if(logger!=undefined) logger.debug("Server:setProduct():product="+product.toString());
    if (product == null)
    {
        console.error("Server:setProduct(): the product parameter is null");
        throw "Server:setProduct(): the product parameter is null";
    }
    this.productTokens = product;
}