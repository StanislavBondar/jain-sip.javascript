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
 *  Implementation of the JAIN-SIP Reason .
 *  @see  gov/nist/javax/sip/header/Reason.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function Reason() {
    if(logger!=undefined) logger.debug("Reason:Reason()");
    this.serialVersionUID = "-8903376965568297388L";
    this.classname="Reason";
    this.headerName=this.NAME;
    this.parameters = new NameValueList();
    this.duplicates = new DuplicateNameValueList();
    this.protocol=null;
}

Reason.prototype = new ParametersHeader();
Reason.prototype.constructor=Reason;
Reason.prototype.NAME= "Reason";
Reason.prototype.TEXT = "text";
Reason.prototype.CAUSE = "cause";
Reason.prototype.SEMICOLON = ";";

Reason.prototype.getCause =function(){
    if(logger!=undefined) logger.debug("Reason:getCause()");
    return this.getParameterAsNumber(this.CAUSE);
}

Reason.prototype.setCause =function(cause){
    if(logger!=undefined) logger.debug("Reason:setCause():cause="+cause);
    this.parameters.set_name_value("cause", cause);
}

Reason.prototype.setProtocol =function(protocol){
    if(logger!=undefined) logger.debug("Reason:setProtocol():protocol="+protocol);
    this.protocol = protocol;
}

Reason.prototype.getProtocol =function(){
    if(logger!=undefined) logger.debug("Reason:getProtocol()");
    return this.protocol;
}

Reason.prototype.setText =function(text){
    if(logger!=undefined) logger.debug("Reason:setText():text="+text);
    if ( text.charAt(0) != '"' ) {
        var utils=new Utils();
        text = utils.getQuotedString(text);
    }
    this.parameters.set_name_value("text", text);
}

Reason.prototype.getText =function(){
    if(logger!=undefined) logger.debug("Reason:getText()");
    return this.parameters.getParameter("text");
}

Reason.prototype.getName =function(){
    if(logger!=undefined) logger.debug("Reason:getName()");
    return this.NAME;
}

Reason.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("Reason:encodeBody()");
    var s = "";
    s=s+this.protocol;
    if (this.parameters != null && this.parameters.hmap.length!=0)
    {
        s=s+this.SEMICOLON+this.parameters.encode()
    }
    return s.toString();
}