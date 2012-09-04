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
 *  Implementation of the JAIN-SIP StatusLineParser .
 *  @see  gov/nist/javax/sip/parser/StatusLineParser.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function StatusLineParser() {
    if(logger!=undefined) logger.debug("StatusLineParser:StatusLineParser()");
    this.classname="StatusLineParser"; 
    if(typeof arguments[0]=="string")
    {
        var statusLine=arguments[0];
        this.lexer = new Lexer("status_lineLexer", statusLine);
    }
    else if(typeof arguments[0]=="object")
    {
        var lexer=arguments[0];
        this.lexer = lexer;
        this.lexer.selectLexer("status_lineLexer");
    }
}

StatusLineParser.prototype = new Parser();
StatusLineParser.prototype.constructor=StatusLineParser;

StatusLineParser.prototype.statusCode =function(){
    if(logger!=undefined) logger.debug("Parser:statusCode()");
    var scode = this.lexer.number();
    var retval = scode;
    return retval;
}
StatusLineParser.prototype.reasonPhrase =function(){
    if(logger!=undefined) logger.debug("Parser:reasonPhrase()");
    return this.lexer.getRest().replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '');
}
StatusLineParser.prototype.parse =function(){
    if(logger!=undefined) logger.debug("Parser:parse()");
    var retval = new StatusLine();
    var version = this.sipVersion();
    retval.setSipVersion(version);
    this.lexer.SPorHT();
    var scode = this.statusCode();
    retval.setStatusCode(scode);
    this.lexer.SPorHT();
    var rp = this.reasonPhrase();
    retval.setReasonPhrase(rp);
    this.lexer.SPorHT();
    return retval;
}