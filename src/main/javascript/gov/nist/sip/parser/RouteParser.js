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
 *  Implementation of the JAIN-SIP RouteParser .
 *  @see  gov/nist/javax/sip/parser/RouteParser.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function RouteParser() {
    if(logger!=undefined) logger.debug("RouteParser");
    this.classname="RouteParser"; 
    if(typeof arguments[0]=="object")
    {
        var lexer=arguments[0];
        this.lexer = lexer;
        this.lexer.selectLexer("command_keywordLexer");
    }
    else if(typeof arguments[0]=="string")
    {
        var route=arguments[0];
        this.lexer = new Lexer("command_keywordLexer", route);
    }
}

RouteParser.prototype = new AddressParametersParser();
RouteParser.prototype.constructor=RouteParser;

RouteParser.prototype.parse =function(){
    if(logger!=undefined) logger.debug("RouteParser:parse()");
    var routeList = new RouteList();
    this.lexer.match(TokenTypes.prototype.ROUTE);
    this.lexer.SPorHT();
    this.lexer.match(':');
    this.lexer.SPorHT();
    while (true) {
        var route = new Route();
        AddressParametersParser.prototype.parse.call(this,route);
        routeList.add(route);
        this.lexer.SPorHT();
        var la = this.lexer.lookAhead(0);
        if (la == ',') {
            this.lexer.match(',');
            this.lexer.SPorHT();
        } 
        else if (la == '\n')
        {
            break;
        }
        else
        {
            console.error("RouteParser:parse(): unexpected char");
            throw "RouteParser:parse(): unexpected char";
        }
    }
    return routeList;
}

