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
 *  Implementation of the JAIN-SIP DialogTimeoutEvent .
 *  @see  gov/nist/javax/sip/DialogTimeoutEvent.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function DialogTimeoutEvent(source,dialog,reason) {
    if(logger!=undefined) logger.debug("DialogTimeoutEvent:DialogTimeoutEvent(): source="+source);
    if(logger!=undefined) logger.debug("DialogTimeoutEvent:DialogTimeoutEvent(): dialog="+dialog);
    if(logger!=undefined) logger.debug("DialogTimeoutEvent:DialogTimeoutEvent(): reason="+reason);
    this.classname="DialogTimeoutEvent";
    this.serialVersionUID = "-2514000059989311925L";
    this.source=source;
    this.m_dialog = dialog;
    this.m_reason = reason;
}

DialogTimeoutEvent.prototype.AckNotReceived="AckNotReceived";
DialogTimeoutEvent.prototype.AckNotSent="AckNotSent";
DialogTimeoutEvent.prototype.ReInviteTimeout="ReInviteTimeout";

DialogTimeoutEvent.prototype.getDialog =function(){
    if(logger!=undefined) logger.debug("DialogTimeoutEvent:getDialog()");
    return this.m_dialog;
}
DialogTimeoutEvent.prototype.getReason =function(){
    if(logger!=undefined) logger.debug("DialogTimeoutEvent:getReason()");
    return this.m_reason;
}
