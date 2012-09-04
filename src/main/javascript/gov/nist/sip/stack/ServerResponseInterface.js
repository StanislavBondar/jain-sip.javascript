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
 *  Implementation of the JAIN-SIP ServerResponseInterface .
 *  @see  gov/nist/javax/sip/stack/ServerResponseInterface.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function ServerResponseInterface() {
    if(logger!=undefined) logger.debug("ServerResponseInterface:ServerResponseInterface()");
    this.classname="ServerResponseInterface"; 
}

ServerResponseInterface.prototype.processResponse =function(){
    if(logger!=undefined) logger.debug("ServerResponseInterface:processResponse()");
    if(arguments.length==2)
    {
        var sipResponse=arguments[0];
        var incomingChannel=arguments[1];
        this.processResponseargu2(sipResponse, incomingChannel);
    }
    else if(arguments.length==3)
    {
        sipResponse=arguments[0];
        incomingChannel=arguments[1];
        var sipDialog=arguments[2];
        this.processResponseargu3(sipResponse, incomingChannel, sipDialog)
    }
}

ServerResponseInterface.prototype.processResponseargu2 =function(sipResponse,incomingChannel){
    if(logger!=undefined) logger.debug("ServerResponseInterface:processResponseargu2():sipResponse="+sipResponse+",incomingChannel="+incomingChannel);
}

ServerResponseInterface.prototype.processResponseargu3 =function(sipResponse,incomingChannel,sipDialog){
    if(logger!=undefined) logger.debug("ServerResponseInterface:processResponseargu3():sipResponse="+sipResponse+",incomingChannel="+incomingChannel+",,sipDialog="+sipDialog);
}
