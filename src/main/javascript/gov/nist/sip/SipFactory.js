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
 *  Implementation of the JAIN-SIP SipFactory .
 *  @see  gov/nist/javax/sip/SipFactory.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function SipFactory() {
    if(logger!=undefined) logger.debug("SipFactory:SipFactory()");
    this.classname="SipFactory"; 
    this.sSipFactory=null;
    this.mNameSipStackMap=new Array();
    if(arguments.length!=0)
    {
        this.wsurl=arguments[0];
        this.ipAddressLocal=arguments[1];
        this.userAgent=arguments[2];
        this.password=arguments[3];
        this.sipuri="sip:"+arguments[4];
    }
}

SipFactory.prototype.getInstance =function(){
    if(logger!=undefined) logger.debug("SipFactory:getInstance()");
    if (this.sSipFactory == null) 
    {
        this.sSipFactory = new SipFactory();
    }
    return this.sSipFactory;
}

SipFactory.prototype.resetFactory =function(){
    if(logger!=undefined) logger.debug("SipFactory:resetFactory()");
    this.mNameSipStackMap=new Array();
}

SipFactory.prototype.createSipStack =function(){
    if(logger!=undefined) logger.debug("SipFactory:createSipStack()");
    var name = this.wsurl;
    var sipStack = null;
    for(var i=0;i<this.mNameSipStackMap.length;i++)
    {
        if(this.mNameSipStackMap[i][0]==name)
        {
            sipStack=this.mNameSipStackMap[i][1]
        }
    }
    if (sipStack == null) {
        var array=new Array();
        sipStack=new SipStackImpl(this.wsurl,this.ipAddressLocal,this.userAgent,this.password,this.sipuri);
        array[0]=name;
        array[1]=sipStack;
        this.mNameSipStackMap.push(array);
    }
    return sipStack;
}

SipFactory.prototype.createAddressFactory =function(){
    if(logger!=undefined) logger.debug("SipFactory:createAddressFactory()");
    try {
        var afi=new AddressFactoryImpl();
        return afi;
    } catch (ex) {
        console.error("SipFactory:createAddressFactory(): failed to create AddressFactory");
        throw "SipFactory:createAddressFactory(): failed to create AddressFactory";
    }
}
SipFactory.prototype.createHeaderFactory =function(){
    if(logger!=undefined) logger.debug("SipFactory:createHeaderFactory()");
    try {
        var hfi=new HeaderFactoryImpl();
        return hfi;
    } catch (ex) {
        console.error("SipFactory:createHeaderFactory(): failed to create HeaderFactory");
        throw "SipFactory:createHeaderFactory(): failed to create HeaderFactory";
    }
}
SipFactory.prototype.createMessageFactory =function(listeningpoint){
    if(logger!=undefined) logger.debug("SipFactory:createMessageFactory():listeningpoint:"+listeningpoint);
    try {
        var mfi=new MessageFactoryImpl(listeningpoint);
        return mfi;
    } catch (ex) {
        console.error("SipFactory:createMessageFactory(): failed to create MessageFactory");
        throw "SipFactory:createMessageFactory():failed to create MessageFactory";
    }
}