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
 *  Implementation of the JAIN-SIP  UserInfo.
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *  @see  gov/nist/javax/sip/address/UserInfo.java  
 */
function UserInfo() {
    if(logger!=undefined) logger.debug("UserInfo:UserInfo()");
    this.serialVersionUID = "7268593273924256144L";
    this.user =null;
    this.password=null;
    this.userType = null;
    this.classname="UserInfo"; 
}

UserInfo.prototype.TELEPHONE_SUBSCRIBER =1;
UserInfo.prototype.USER=2;
UserInfo.prototype.COLON=":";
UserInfo.prototype.POUND="#";
UserInfo.prototype.SEMICOLON=";"

UserInfo.prototype.equals =function(obj){
    if(logger!=undefined) logger.debug("UserInfo:equals():obj:"+obj);
    if (obj.classname!="UserInfo") {
        return false;
    }
    var other = new UserInfo();
    other=obj;
    if (this.userType != other.userType) {
        return false;
    }
    if (this.user!=other.user) {
        return false;
    }
    if (this.password != null && other.password == null) {
        return false;
    } 
    if (other.password != null && this.password == null){
        return false;
    }
    return this.password == other.password;  
}

UserInfo.prototype.encode =function(){
    if(logger!=undefined) logger.debug("UserInfo:encode()");
    return this.encodeBuffer("").toString();
}

UserInfo.prototype.encodeBuffer =function(buffer){
    if(logger!=undefined) logger.debug("UserInfo:encodeBuffer():buffer="+buffer);
    var encode=null;
    if(this.password!=null)
    {
        encode=buffer+this.user+this.COLON+this.password;
    }
    else
    {
        encode=buffer+this.user;
    }
    
    return encode;
}

UserInfo.prototype.clearPassword =function(){
    if(logger!=undefined) logger.debug("UserInfo:clearPassword()");
    this.password=null;
}

UserInfo.prototype.getUserType =function(){
    if(logger!=undefined) logger.debug("UserInfo:getUserType()");
    return this.userType;
}

UserInfo.prototype.getUser =function(){
    if(logger!=undefined) logger.debug("UserInfo:getUser()");
    return this.user;
}

UserInfo.prototype.setUser =function(user){
    if(logger!=undefined) logger.debug("UserInfo:setUser()");
    this.user=user;
    if (user != null
        && (user.indexOf(this.POUND) >= 0 || user.indexOf(this.SEMICOLON) >= 0)) {
        this.setUserType(this.TELEPHONE_SUBSCRIBER);
    } else {
        this.setUserType(this.USER);
    }
}

UserInfo.prototype.getPassword =function(){
    if(logger!=undefined) logger.debug("UserInfo:getPassword()");
    return this.password;
}

UserInfo.prototype.setPassword =function(p){
    if(logger!=undefined) logger.debug("UserInfo:setPassword():p="+p);
    this.password=p;
}

UserInfo.prototype.setUserType =function(type){
    if(logger!=undefined) logger.debug("UserInfo:setUserType():type="+type);
    if (type != this.USER && type != this.TELEPHONE_SUBSCRIBER) {
        console.error("UserInfo:setUserType(): parameter not in range");
        throw "UserInfo:setUserType(): parameter not in range";
    }
    this.userType = type;
}
