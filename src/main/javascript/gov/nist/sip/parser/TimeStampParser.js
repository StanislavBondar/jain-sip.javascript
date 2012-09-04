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
 *  Implementation of the JAIN-SIP TimeStampParser .
 *  @see  gov/nist/javax/sip/parser/TimeStampParser.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function TimeStampParser() {
    if(logger!=undefined) logger.debug("TimeStampParser:TimeStampParser()");
    this.classname="TimeStampParser"; 
    if(typeof arguments[0]=="object")
    {
        var lexer=arguments[0];
        this.lexer = lexer;
        this.lexer.selectLexer("command_keywordLexer");
    }
    else if(typeof arguments[0]=="string")
    {
        var timeStamp=arguments[0];
        this.lexer = new Lexer("command_keywordLexer", timeStamp);
    }
}

TimeStampParser.prototype = new HeaderParser();
TimeStampParser.prototype.constructor=TimeStampParser;
TimeStampParser.prototype.TIMESTAMP="Timestamp";

TimeStampParser.prototype.parse =function(){
    if(logger!=undefined) logger.debug("TimeStampParser:parse()");
    var timeStamp = new TimeStamp();
    this.headerName(TokenTypes.prototype.TIMESTAMP);
    timeStamp.setHeaderName(this.TIMESTAMP);
    this.lexer.SPorHT();
    var firstNumber = this.lexer.number();
    if (this.lexer.lookAhead(0) == '.') {
        this.lexer.match('.');
        var secondNumber = this.lexer.number();

        var s = firstNumber + "." + secondNumber;
        var ts = s;
        timeStamp.setTimeStamp(ts);
    } else {
        ts = firstNumber;
        timeStamp.setTime(ts);
    }

    this.lexer.SPorHT();
    if (this.lexer.lookAhead(0) != '\n') 
    {
        firstNumber = this.lexer.number();
    }
    if (this.lexer.lookAhead(0) == '.') {
        this.lexer.match('.');
        secondNumber = this.lexer.number();
        s = firstNumber + "." + secondNumber;
        ts = s;
        timeStamp.setDelay(ts);
    } else {
        ts = firstNumber;
        timeStamp.setDelay(ts);
    }
    return timeStamp;
}


