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
 *  Implementation of the JAIN-SIP GenericObjectList class.
 *  @see  gov/nist/core/GenericObjectList.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function GenericObjectList() {
    //if(logger!=undefined) logger.debug("GenericObjectList:GenericObjectList()");
    this.classname="GenericObjectList"; 
}

GenericObjectList.prototype.isMySubclass=function(other){
    //if(logger!=undefined) logger.debug("GenericObjectList:isMySubclass()");
    if((typeof other)!="object"||other instanceof Array)
    {
        return false;
    }
    else
    {
        var c=0;
        if(Object.getPrototypeOf(other).classname=="GenericObjectList")
        {
            return true;
        }
        else 
        {
            O=Object.getPrototypeOf(other);
            for(;O.classname!=undefined;)
            {
                if(Object.getPrototypeOf(O).classname=="GenericObjectList")
                {
                    c=1;
                    O=Object.getPrototypeOf(O);
                }
                else
                {
                    O=Object.getPrototypeOf(O);
                }
            }
            if(c==1)
            {
                return true;
            }
            else
            {
                return false;
            }
            
        }
    }
}
