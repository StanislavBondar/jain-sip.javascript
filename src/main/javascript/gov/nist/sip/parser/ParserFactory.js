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
 *  Implementation of the JAIN-SIP ParserFactory .
 *  @see  gov/nist/javax/sip/parser/ParserFactory.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function ParserFactory() {
    if(logger!=undefined) logger.debug("ParserFactory:ParserFactory()");
    this.classname="ParserFactory"; 
    this.parserTable=new Array();
    this.constructorArgs=null;
    //i use type String to replace the type of class in Java and creat the object when it is in need.
    this.parserConstructorCache=new Array();
    this.put(this.parserTable,"t",new ToParser().classname);
    this.put(this.parserTable,"To".toLowerCase(), new ToParser().classname);
    this.put(this.parserTable,"From".toLowerCase(),new FromParser().classname);
    this.put(this.parserTable,"f",new FromParser().classname);
    this.put(this.parserTable,"CSeq".toLowerCase(),new CSeqParser().classname);
    this.put(this.parserTable,"Via".toLowerCase(),new ViaParser().classname);
    this.put(this.parserTable,"v",new ViaParser().classname);
    this.put(this.parserTable,"Contact".toLowerCase(),new ContactParser().classname);
    this.put(this.parserTable,"m",new ContactParser().classname);
    this.put(this.parserTable,"Content-Type".toLowerCase(),new ContentTypeParser().classname);
    this.put(this.parserTable,"c",new ContentTypeParser().classname);
    this.put(this.parserTable,"Content-Length".toLowerCase(),new ContentLengthParser().classname);
    this.put(this.parserTable,"l",new ContentLengthParser().classname);
    this.put(this.parserTable,"Authorization".toLowerCase(),new AuthorizationParser().classname);
    this.put(this.parserTable,"WWW-Authenticate".toLowerCase(),new WWWAuthenticateParser().classname);
    this.put(this.parserTable,"Call-ID".toLowerCase(),new CallIDParser().classname);
    this.put(this.parserTable,"i",new CallIDParser().classname);
    this.put(this.parserTable,"Route".toLowerCase(),new RouteParser().classname);
    this.put(this.parserTable,"Record-Route".toLowerCase(),new RecordRouteParser().classname);
    this.put(this.parserTable,"Proxy-Authorization".toLowerCase(),new ProxyAuthorizationParser().classname);
    this.put(this.parserTable,"Proxy-Authenticate".toLowerCase(),new ProxyAuthenticateParser().classname);
    this.put(this.parserTable,"Timestamp".toLowerCase(),new TimeStampParser().classname);
    this.put(this.parserTable,"User-Agent".toLowerCase(),new UserAgentParser().classname);
    this.put(this.parserTable,"Supported".toLowerCase(),new SupportedParser().classname);
    this.put(this.parserTable,"k",new SupportedParser().classname);
    this.put(this.parserTable,"Server".toLowerCase(),new ServerParser().classname);
    this.put(this.parserTable,"Subject".toLowerCase(),new SubjectParser().classname);
    this.put(this.parserTable,"s",new SubjectParser().classname); 
    this.put(this.parserTable,"Max-Forwards".toLowerCase(),new MaxForwardsParser().classname);
    this.put(this.parserTable,"Reason".toLowerCase(),new ReasonParser().classname);
    this.put(this.parserTable,"Expires".toLowerCase(),new ExpiresParser().classname);
    this.put(this.parserTable,"Event".toLowerCase(),new EventParser().classname);
    this.put(this.parserTable,"o",new EventParser().classname);
    this.put(this.parserTable,"Content-Disposition".toLowerCase(),new ContentDispositionParser().classname);
    this.put(this.parserTable,"Allow".toLowerCase(),new AllowParser().classname);
    this.put(this.parserTable,"Allow-Events".toLowerCase(),new AllowEventsParser().classname);
    this.put(this.parserTable,"u",new AllowEventsParser().classname);
}

ParserFactory.prototype.createParser =function(line){
    if(logger!=undefined) logger.debug("ParserFactory:createParser():line="+line);
    var lexer=new Lexer("","");
    var headerName = lexer.getHeaderName(line);
    var headerValue = lexer.getHeaderValue(line);
    if (headerName == null || headerValue == null) {
        console.error("ParserFactory:createParser(): the header name or value is null");
        throw "ParserFactory:createParser(): the header name or value is null";
    }
    var parserClass = null;
    for(var i=0;i<this.parserTable.length;i++)
    {
        if(this.parserTable[i][0]==headerName.toLowerCase())
        {
            parserClass=this.parserTable[i][1];
        }
    }
    if (parserClass != null) {
        var cons = null;
        for(i=0;i<this.parserConstructorCache.length;i++)
        {
            if(this.parserConstructorCache[i][0]==parserClass)
            {
                parserClass=this.parserConstructorCache[i][1];
            }
        }
        if (cons == null) {
            cons = new Function('return new ' + parserClass)();
            this.put(this.parserConstructorCache, parserClass, cons);
        }
        var args = line;
        var retval =  new window[parserClass](args);
        return retval;
    } else {
        return new HeaderParser(line);
    }
}

ParserFactory.prototype.put =function(table,name, value){
    if(logger!=undefined) logger.debug("ParserFactory:put():table="+table.toString()+", name="+name+", value:"+value);
    var n=0;
    for(var i=0;i<table.length;i++)// loop for method put() of hashtable
    {
        var key = table[i][0];
        if (key==name) {
            n=1;
            var x=new Array();
            x[0]=key;
            x[1]=value;
            table[i]=x;
        } 
    }
    if(n==0)
    {
        x=new Array();
        x[0]=name;
        x[1]=value;
        table.push(x);
    }
    return table;
}
