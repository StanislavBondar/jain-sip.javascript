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
 *  Implementation of the JAIN-SIP ParserCore class.
 *  @see  gov/nist/core/ParserCore.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */

function ParserCore() {
    //if(logger!=undefined) logger.debug("ParserCore:ParserCore()");
    this.classname="ParserCore";
    this.nesting_level=null;
    this.lexer=new LexerCore();
}

ParserCore.prototype.nameValue =function(separator){
    //if(logger!=undefined) logger.debug("ParserCore:nameValue():separator="+separator);
    if(separator==null)
    {
        var nv=this.nameValue("=")
        return nv;
    }
    else
    {
        this.lexer.match(LexerCore.prototype.ID);
        var name = this.lexer.getNextToken();
        this.lexer.SPorHT();
        try {
            var quoted = false;
            var la = this.lexer.lookAhead(0);
            if (la == separator) {
                this.lexer.consume(1);
                this.lexer.SPorHT();
                var str = null;
                var isFlag = false;
                if (this.lexer.lookAhead(0) == '\"') {
                    str = this.lexer.quotedString();
                    quoted = true;
                } else {
                    this.lexer.match(LexerCore.prototype.ID);
                    var value = this.lexer.getNextToken();
                    str = value.tokenValue;
                    if (str == null) {
                        str = "";
                        isFlag = true;
                    }
                }
                var nv = new NameValue(name.tokenValue, str, isFlag);
                if (quoted) {
                    nv.setQuotedValue();
                }
                return nv;
            } else {
                nv=new NameValue(name.tokenValue, "", true);
                return nv;
            }
        } catch (ex) {    
            console.error("ParserCore:nameValue(): catched exception:"+ex);
            nv=new NameValue(name.tokenValue, null, false);
            return nv;
        }
    }
    return nv;
}