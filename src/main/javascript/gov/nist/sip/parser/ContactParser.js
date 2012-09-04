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
 *  Implementation of the JAIN-SIP ContactParser .
 *  @see  gov/nist/javax/sip/parser/ContactParser.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function ContactParser() {
    if(logger!=undefined) logger.debug("ContactParser");
    this.classname="ContactParser"; 
    if(typeof arguments[0]=="object")
    {
        var lexer=arguments[0];
        this.lexer = lexer;
        this.lexer.selectLexer("command_keywordLexer");
    }
    else if(typeof arguments[0]=="string")
    {
        var contact=arguments[0];
        this.lexer = new Lexer("command_keywordLexer", contact);
    }
}

ContactParser.prototype = new AddressParametersParser();
ContactParser.prototype.constructor=ContactParser;

ContactParser.prototype.parse =function(){
    if(logger!=undefined) logger.debug("ContactParser:parse()");
    this.headerName(TokenTypes.prototype.CONTACT);
    var retval = new ContactList();
    while (true) {
        var contact = new Contact();
        if (this.lexer.lookAhead(0) == '*') {
            var next = this.lexer.lookAhead(1);
            if (next == ' ' || next == '\t' || next == '\r' || next == '\n') {
                this.lexer.match('*');
                contact.setWildCardFlag(true);
            } else {
                AddressParametersParser.prototype.parse.call(this,contact);
            }
        } else {
            AddressParametersParser.prototype.parse.call(this,contact);
        }
        retval.add(contact);
        this.lexer.SPorHT();
        var la = this.lexer.lookAhead(0);
        if (la == ',') {
            this.lexer.match(',');
            this.lexer.SPorHT();
        } 
        else if (la == '\n' || la == '\0')
        {
            break;
        }
        else
        {
           console.error("ContactParser:address(): unexpected char");
           throw "ContactParser:parse(): unexpected char";
        }
    }
    return retval;
}

