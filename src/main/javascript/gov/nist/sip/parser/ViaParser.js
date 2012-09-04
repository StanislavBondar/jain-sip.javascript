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
 *  Implementation of the JAIN-SIP ViaParser .
 *  @see  gov/nist/javax/sip/parser/ViaParser.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function ViaParser() {
    if(logger!=undefined) logger.debug("ViaParser:ViaParser()");
    this.classname="ViaParser"; 
    if(typeof arguments[0]=="object")
    {
        var lexer=arguments[0];
        this.lexer = lexer;
        this.lexer.selectLexer("command_keywordLexer");
    }
    else if(typeof arguments[0]=="string")
    {
        var via=arguments[0];
        this.lexer = new Lexer("command_keywordLexer", via);
    }
}

ViaParser.prototype = new HeaderParser();
ViaParser.prototype.constructor=ViaParser;
ViaParser.prototype.RECEIVED="received";
ViaParser.prototype.BRANCH="branch";

ViaParser.prototype.parseVia =function(v){
    if(logger!=undefined) logger.debug("ViaParser:parseVia():v="+v.classname);
    this.lexer.match(TokenTypes.prototype.ID);
    var protocolName = this.lexer.getNextToken();
    this.lexer.SPorHT();
    this.lexer.match('/');
    this.lexer.SPorHT();
    this.lexer.match(TokenTypes.prototype.ID);
    this.lexer.SPorHT();
    var protocolVersion = this.lexer.getNextToken();
    this.lexer.SPorHT();
    this.lexer.match('/');
    this.lexer.SPorHT();
    this.lexer.match(TokenTypes.prototype.ID);
    this.lexer.SPorHT();
    var transport = this.lexer.getNextToken();
    this.lexer.SPorHT();
    var protocol = new Protocol();
    protocol.setProtocolName(protocolName.getTokenValue());
    protocol.setProtocolVersion(protocolVersion.getTokenValue());
    if(transport.getTokenValue()=="WS")
    {
        protocol.setTransport("TCP");//just for the test
    }
    else
    {
        protocol.setTransport(transport.getTokenValue());
    }
    v.setSentProtocol(protocol);
    var hnp = new HostNameParser(this.getLexer());
    var hostPort = hnp.hostPort( true );
    v.setSentBy(hostPort);
    this.lexer.SPorHT();
    while (this.lexer.lookAhead(0) == ';') {
        this.lexer.consume(1);
        this.lexer.SPorHT();
        var nameValue = this.nameValue();
        var name = nameValue.getName();
        if (name==this.BRANCH) {
            var branchId = nameValue.getValueAsObject();
            if (branchId == null)
            {
                console.error("ViaParser:parseVia(): null branch Id", this.lexer.getPtr());
                throw "ViaParser:parseVia(): null branch Id"+ this.lexer.getPtr();
            }
        }
        v.setParameter_nv(nameValue);
        this.lexer.SPorHT();
    }
    if (this.lexer.lookAhead(0) == '(') {
        this.lexer.selectLexer("charLexer");
        this.lexer.consume(1);
        var comment = "";
        while (true) {
            var ch = this.lexer.lookAhead(0);
            if (ch == ')') {
                this.lexer.consume(1);
                break;
            } else if (ch == '\\') {
                // Escaped character
                var tok = this.lexer.getNextToken();
                comment=comment+tok.getTokenValue();
                this.lexer.consume(1);
                tok = this.lexer.getNextToken();
                comment=comment+tok.getTokenValue();
                this.lexer.consume(1);
            } else if (ch == '\n') {
                break;
            } else {
                comment=comment+ch;
                this.lexer.consume(1);
            }
        }
        v.setComment(comment.toString());
    }
}

ViaParser.prototype.nameValue =function(){
    if(logger!=undefined) logger.debug("ViaParser:nameValue()");
    this.lexer.match(LexerCore.prototype.ID);
    var name = this.lexer.getNextToken();
    this.lexer.SPorHT();
    try {
        var quoted = false;
        var la = this.lexer.lookAhead(0);
        if (la == '=') {
            this.lexer.consume(1);
            this.lexer.SPorHT();
            var str = null;
            if (name.getTokenValue().toLowerCase()==this.RECEIVED.toLowerCase()) {
                str = this.lexer.byteStringNoSemicolon();
            } else {
                if (this.lexer.lookAhead(0) == '\"') {
                    str = this.lexer.quotedString();
                    quoted = true;
                } else {
                    this.lexer.match(LexerCore.prototype.ID);
                    var value = this.lexer.getNextToken();
                    str = value.getTokenValue();
                }
            }
            var nv = new NameValue(name.getTokenValue().toLowerCase(), str);
            if (quoted)
            {
                nv.setQuotedValue();
            }
            return nv;
        } else {
            return new NameValue(name.getTokenValue().toLowerCase(), null);
        }
    } catch (ex) {
        console.error("ViaParser:nameValue(): catched exception:"+ex);
        return new NameValue(name.getTokenValue(), null);
    }
}

ViaParser.prototype.parse =function(){
    if(logger!=undefined) logger.debug("ViaParser:parseVia()");
    var viaList = new ViaList();
    this.lexer.match(TokenTypes.prototype.VIA);
    this.lexer.SPorHT(); // ignore blanks
    this.lexer.match(':'); // expect a colon.
    this.lexer.SPorHT(); // ingore blanks.
    while (true) {
        var v = new Via();
        this.parseVia(v);
        viaList.add(v);
        this.lexer.SPorHT(); // eat whitespace.
        if (this.lexer.lookAhead(0) == ',') {
            this.lexer.consume(1); // Consume the comma
            this.lexer.SPorHT(); // Ignore space after.
        }
        if (this.lexer.lookAhead(0) == '\n')
        {
            break;
        }
    }
    this.lexer.match('\n');
    return viaList;
}

