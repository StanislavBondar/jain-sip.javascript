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
 *  Implementation of the JAIN-SIP AddressParametersParser .
 *  @see  gov/nist/javax/sip/parser/AddressParametersParser.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function AddressParametersParser() {
    if(logger!=undefined) logger.debug("AddressParametersParser:AddressParametersParser()");
    this.classname="AddressParametersParser"; 
    if(typeof arguments[0]=="object")
    {
        var lexer=arguments[0];
        this.lexer = lexer;
        this.lexer.selectLexer("command_keywordLexer");
    }
    else if(typeof arguments[0]=="string")
    {
        var buffer=arguments[0];
        this.lexer = new Lexer("command_keywordLexer", buffer);
    }
}

AddressParametersParser.prototype = new ParametersParser();
AddressParametersParser.prototype.constructor=AddressParametersParser;

AddressParametersParser.prototype.parse =function(addressParametersHeader){
    if(logger!=undefined) logger.debug("AddressParametersParser:parse():addressParametersHeader="+addressParametersHeader);
    try {
        var addressParser = new AddressParser(this.getLexer());
        var addr = addressParser.address(false);
        addressParametersHeader.setAddress(addr);
        this.lexer.SPorHT();
        var la = this.lexer.lookAhead(0);
        if (this.lexer.hasMoreChars() && la != '\0' && la != '\n' && this.lexer.startsId()) {
            ParametersParser.prototype.parseNameValueList.call(this,addressParametersHeader);
        } else {
            ParametersParser.prototype.parse.call(this,addressParametersHeader);
        }
    } catch (ex) {
        console.error("AddressParametersParser:parse(): address Error");
        throw ex;
    }
}