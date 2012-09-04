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
 *  Implementation of the JAIN-SIP AuthorizationList .
 *  @see  gov/nist/javax/sip/header/AuthorizationList.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function CSeq() {
    if(logger!=undefined) logger.debug("CSeq:CSeq()");
    this.serialVersionUID = "-5405798080040422910L";
    this.classname="CSeq";
    this.method=null;
    this.seqno=null;
    if(arguments.length==0)
    {
        this.headerName=this.CSEQ;
    }
    else
    {
        var seqno=arguments[0];
        var method=arguments[1];
        this.headerName=this.CSEQ;
        this.seqno = seqno;
        var siprequest=new SIPRequest();
        this.method = siprequest.getCannonicalName(method);
    }
}

CSeq.prototype = new SIPHeader();
CSeq.prototype.constructor=CSeq;
CSeq.prototype.CSEQ="CSeq";
CSeq.prototype.COLON=":";
CSeq.prototype.SP=" ";
CSeq.prototype.NEWLINE="\r\n";


CSeq.prototype.encode =function(){
    if(logger!=undefined) logger.debug("CSeq:encode()");
    return this.headerName+this.COLON+this.SP+this.encodeBody()+this.NEWLINE;
}

CSeq.prototype.encodeBody =function(){
    if(logger!=undefined) logger.debug("CSeq:encodeBody()");
    return this.encodeBodyBuffer("").toString();
}

CSeq.prototype.encodeBodyBuffer =function(buffer){
    if(logger!=undefined) logger.debug("CSeq:encodeBodyBuffer():buffer="+buffer);
    buffer=buffer+this.seqno+this.SP+this.method.toUpperCase();
    return buffer;
}

CSeq.prototype.getMethod =function(){
    if(logger!=undefined) logger.debug("CSeq:getMethod()");
   
   return this.method;
}

CSeq.prototype.setSeqNumber =function(sequenceNumber){
    if(logger!=undefined) logger.debug("CSeq:setSeqNumber():sequenceNumber="+sequenceNumber);
    if (sequenceNumber < 0 )
    {
       console.error("CSeq:setSeqNumber(): the sequence number parameter is < 0 : " + sequenceNumber);
       throw "CSeq:setSeqNumber(): the sequence number parameter is < 0 : " + sequenceNumber;
    }
    else if ( sequenceNumber > 2147483647)
    {
       console.error("CSeq:setSeqNumber(): the sequence number parameter is too large : " + sequenceNumber);
       throw "CSeq:setSeqNumber(): the sequence number parameter is too large : " + sequenceNumber;
    }
    this.seqno = sequenceNumber;
}

CSeq.prototype.setSequenceNumber =function(sequenceNumber){
    if(logger!=undefined) logger.debug("CSeq:setSequenceNumber():sequenceNumber:"+sequenceNumber);
    this.setSeqNumber(sequenceNumber);
}

CSeq.prototype.setMethod =function(method){
    if(logger!=undefined) logger.debug("CSeq:setMethod(): method="+method);
    if (method == null)
    {
        console.error("CSeq:setMethod(): the method parameter is null");
         throw "CSeq:setMethod(): the meth parameter is null";
    }
    var siprequest=new SIPRequest();
    this.method = siprequest.getCannonicalName(method);
}

CSeq.prototype.getSequenceNumber =function(){
    if(logger!=undefined) logger.debug("CSeq:getSequenceNumber()");
    if (this.seqno == null)
    {
        return 0;
    }
    else
    {
        return this.seqno;
    }
}
CSeq.prototype.getSeqNumber =function(){
    if(logger!=undefined) logger.debug("CSeq:getSeqNumber()");
    return this.seqno;
}