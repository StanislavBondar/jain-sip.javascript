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
 *  Implementation of the JAIN-SIP AllowEventsParser .
 *  @see  gov/nist/javax/sip/parser/AllowEventsParser.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function AllowEventsParser() {
    if(logger!=undefined) logger.debug("AllowEventsParser");
    this.classname="AllowEventsParser"; 
    if(typeof arguments[0]=="object")
    {
        var lexer=arguments[0];
        this.lexer = lexer;
        this.lexer.selectLexer("command_keywordLexer");
    }
    else if(typeof arguments[0]=="string")
    {
        var allowEvents=arguments[0];
        this.lexer = new Lexer("command_keywordLexer", allowEvents);
    }
}

AllowEventsParser.prototype = new HeaderParser();
AllowEventsParser.prototype.constructor=AllowEventsParser;
AllowEventsParser.prototype.ALLOW_EVENTS="Allow-Events";

AllowEventsParser.prototype.parse =function(){
    if(logger!=undefined) logger.debug("AllowEventsParser:parse()");
    var list = new AllowEventsList();
    this.headerName(TokenTypes.prototype.ALLOW_EVENTS);
    var allowEvents = new AllowEvents();
    allowEvents.setHeaderName(this.ALLOW_EVENTS);
    this.lexer.SPorHT();
    this.lexer.match(TokenTypes.prototype.ID);
    var token = this.lexer.getNextToken();
    allowEvents.setEventType(token.getTokenValue());
    list.add(allowEvents);
    this.lexer.SPorHT();
    while (this.lexer.lookAhead(0) == ',') {
        this.lexer.match(',');
        this.lexer.SPorHT();
        allowEvents = new AllowEvents();
        this.lexer.match(TokenTypes.prototype.ID);
        token = this.lexer.getNextToken();
        allowEvents.setEventType(token.getTokenValue());
        list.add(allowEvents);
        this.lexer.SPorHT();
    }
    this.lexer.SPorHT();
    this.lexer.match('\n');
    return list;
}

