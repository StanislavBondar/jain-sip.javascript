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
 *  Implementation of the JAIN-SIP AddressParametersHeader .
 *  @see  gov/nist/javax/sip/header/AddressParametersHeader.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */

function AddressParametersHeader(name, sync) {
    if(logger!=undefined) logger.debug("AddressParametersHeader:AddressParametersHeader(): name="+name+",sync="+sync);
    this.classname="AddressParametersHeader";
    this.address=new AddressImpl();
    this.headerName=null;
    if(name!=null&&sync==null)
    {
        this.headerName=name;
        this.parameters = new NameValueList();
        this.duplicates = new DuplicateNameValueList();
    }
    else if(name!=null&&sync!=null)
    {
        this.headerName=name;
        this.parameters = new NameValueList(sync);
        this.duplicates = new DuplicateNameValueList();
    }
}

AddressParametersHeader.prototype = new ParametersHeader();
AddressParametersHeader.prototype.constructor=AddressParametersHeader;

AddressParametersHeader.prototype.getAddress =function(){
    if(logger!=undefined) logger.debug("AddressParametersHeader:getAddress()");
    return this.address;
}

AddressParametersHeader.prototype.setAddress =function(address){
    if(logger!=undefined) logger.debug("AddressParametersHeader:setAddress():address"+address);
    this.address=address;
}

AddressParametersHeader.prototype.equals =function(other){
    if(logger!=undefined) logger.debug("AddressParametersHeader:equals():other"+other);
    if (this==other) {
        return true;
    }
    if (/*other instanceof HeaderAddress && */other instanceof ParametersHeader) {//i hava not found the class which implement headeraddress, so i delete this condition
        var o = other;
        if(this.getAddress().equals(o.getAddress())&& this.equalParameters(o))
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    return false;
}