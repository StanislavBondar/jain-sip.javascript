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
 *  Implementation of the JAIN-SIP TokenNames .
 *  @see  gov/nist/javax/sip/parser/TokenNames.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function TokenNames() {
    if(logger!=undefined) logger.debug("TokenNames:TokenNames()");
    this.classname="TokenNames";
}

TokenNames.prototype.INVITE = "INVITE";
TokenNames.prototype.ACK = "ACK";
TokenNames.prototype.BYE = "BYE";
TokenNames.prototype.SUBSCRIBE = "SUBSCRIBE";
TokenNames.prototype.NOTIFY = "NOTIFY";
TokenNames.prototype.OPTIONS = "OPTIONS";
TokenNames.prototype.REGISTER = "REGISTER";
TokenNames.prototype.MESSAGE = "MESSAGE";
TokenNames.prototype.PUBLISH = "PUBLISH";

TokenNames.prototype.SIP = "sip";
TokenNames.prototype.SIPS = "sips";
TokenNames.prototype.TEL = "tel";
TokenNames.prototype.GMT = "GMT";
TokenNames.prototype.MON = "Mon";
TokenNames.prototype.TUE = "Tue";
TokenNames.prototype.WED = "Wed";
TokenNames.prototype.THU = "Thu";
TokenNames.prototype.FRI = "Fri";
TokenNames.prototype.SAT = "Sat";
TokenNames.prototype.SUN = "Sun";
TokenNames.prototype.JAN = "Jan";
TokenNames.prototype.FEB = "Feb";
TokenNames.prototype.MAR = "Mar";
TokenNames.prototype.APR = "Apr";
TokenNames.prototype.MAY = "May";
TokenNames.prototype.JUN = "Jun";
TokenNames.prototype.JUL = "Jul";
TokenNames.prototype.AUG = "Aug";
TokenNames.prototype.SEP = "Sep";
TokenNames.prototype.OCT = "Oct";
TokenNames.prototype.NOV = "Nov";
TokenNames.prototype.DEC = "Dec";
TokenNames.prototype.K = "K";
TokenNames.prototype.C = "C";
TokenNames.prototype.E = "E";
TokenNames.prototype.F = "F";
TokenNames.prototype.I = "I";
TokenNames.prototype.M = "M";
TokenNames.prototype.L = "L";
TokenNames.prototype.S = "S";
TokenNames.prototype.T = "T";
TokenNames.prototype.U = "U";// JvB: added
TokenNames.prototype.V = "V";
TokenNames.prototype.R = "R";
TokenNames.prototype.O = "O";
TokenNames.prototype.X = "X"; //Jozef Saniga added
TokenNames.prototype.B = "B";

