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
 *  Implementation of the JAIN-SIP ServerParser .
 *  @see  gov/nist/javax/sip/parser/ServerParser.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function ServerParser() {
    if(logger!=undefined) logger.debug("ServerParser:ServerParser()");
    this.classname="ServerParser"; 
    if(typeof arguments[0]=="object")
    {
        var lexer=arguments[0];
        this.lexer = lexer;
        this.lexer.selectLexer("command_keywordLexer");
    }
    else if(typeof arguments[0]=="string")
    {
        var server=arguments[0];
        this.lexer = new Lexer("command_keywordLexer", server);
    }
}

ServerParser.prototype = new HeaderParser();
ServerParser.prototype.constructor=ServerParser;

ServerParser.prototype.parse =function(){
    if(logger!=undefined) logger.debug("ServerParser:parse()");
    var server = new Server();
    this.headerName(TokenTypes.prototype.SERVER);
    if (this.lexer.lookAhead(0) == '\n')
    {
       console.error("ServerParser:parse(): empty header");
       throw "ServerParser:parse():  empty header";
    }
    while (this.lexer.lookAhead(0) != '\n'
        && this.lexer.lookAhead(0) != '\0') {
        if (this.lexer.lookAhead(0) == '(') {
            var comment = this.lexer.comment();
            server.addProductToken('(' + comment + ')');
        } else {
            var tok;
            var marker = 0;
            try {
                marker = this.lexer.markInputPosition();
                tok = this.lexer.getString('/');
                if (tok.charAt(tok.length() - 1) == '\n')
                {
                    tok = tok.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '');
                }
                server.addProductToken(tok);
            } catch (ex) {
                console.error("ServerParser:parse(): catched exception:"+ex);
                this.lexer.rewindInputPosition(marker);
                tok = this.lexer.getRest().replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '');
                server.addProductToken(tok);
                break;
            }
        }
    }
    return server;
}

