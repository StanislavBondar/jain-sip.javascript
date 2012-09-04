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
 *  Implementation of the JAIN-SIP AddressParser .
 *  @see  gov/nist/javax/sip/parser/AddressParser.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function AddressParser() {
    if(logger!=undefined) logger.debug("AddressParser:AddressParser()");
    this.classname="AddressParser"; 
    if(typeof arguments[0]=="object")
    {
        var lexer=arguments[0];
        this.lexer = lexer;
        this.lexer.selectLexer("command_keywordLexer");
    }
    else if(typeof arguments[0]=="string")
    {
        var address=arguments[0];
        this.lexer = new Lexer("command_keywordLexer", address);
    }
}

AddressParser.prototype = new Parser();
AddressParser.prototype.constructor=AddressParser;
AddressParser.prototype.NAME_ADDR=1;
AddressParser.prototype.ADDRESS_SPEC=2;

AddressParser.prototype.nameAddr =function(){
    if(logger!=undefined) logger.debug("AddressParser:nameAddr()");
    if (this.lexer.lookAhead(0) == '<') {
        this.lexer.consume(1);
        this.lexer.selectLexer("sip_urlLexer");
        this.lexer.SPorHT();
        var uriParser = new URLParser(this.lexer);
        var uri = uriParser.uriReference( true );
        var retval = new AddressImpl();
        retval.setAddressType(this.NAME_ADDR);
        retval.setURI(uri);
        this.lexer.SPorHT();
        this.lexer.match('>');
        return retval;
    } else {
        var addr = new AddressImpl();
        addr.setAddressType(this.NAME_ADDR);
        var name = null;
        if (this.lexer.lookAhead(0) == '\"') {
            name = this.lexer.quotedString();
            this.lexer.SPorHT();
        } 
        else
        {
            name = this.lexer.getNextToken('<');
        }
        addr.setDisplayName(name.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, ''));
        
        this.lexer.match('<');
        
        this.lexer.SPorHT();
        uriParser = new URLParser(this.lexer);
        uri = uriParser.uriReference( true );
        retval = new AddressImpl();
        addr.setAddressType(this.NAME_ADDR);
        addr.setURI(uri);
        this.lexer.SPorHT();
        this.lexer.match('>');
        return addr;
    }  
}

AddressParser.prototype.address =function(inclParams){
    if(logger!=undefined) logger.debug("AddressParser:address():inclParams="+inclParams);
    var retval = null;
    var k = 0;
    while (this.lexer.hasMoreChars()) {
        var la = this.lexer.lookAhead(k);
        if (la == '<'|| la == '\"'|| la == ':'|| la == '/')
        {
            break;
        }
        else if (la == '\0')
        {
           console.error("AddressParser:address(): unexpected EOL");
           throw "AddressParser:parse(): unexpected EOL";
        }
        else
        {
            k++;
        }
    }
    la = this.lexer.lookAhead(k);
    if (la == '<' || la == '\"') {
        retval = this.nameAddr();
    } else if (la == ':' || la == '/') {
        retval = new AddressImpl();
        var uriParser = new URLParser(this.lexer);
        var uri = uriParser.uriReference( inclParams );
        retval.setAddressType(this.ADDRESS_SPEC);
        retval.setURI(uri);
    } else {
        console.error("AddressParser:address(): bad address spec");
        throw "AddressParser:parse(): bad address spec";
    }
    return retval;
}
