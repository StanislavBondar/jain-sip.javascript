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
 *  Implementation of the JAIN-SIP SipStackImpl .
 *  @see  gov/nist/javax/sip/SipStackImpl.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 */
function SipStackImpl() {
    if(logger!=undefined) logger.debug("SipStackImpl:SipStackImpl()");
    this.classname="SipStackImpl"; 
    this.messageProcessors=new Array();
    this.sipMessageFactory=null;
    this.activeClientTransactionCount = 0;
    this.mergeTable=new Array();
    this.stackLogger=null;
    this.serverLogger=null;
    this.defaultRouter=null;
    this.needsLogging=null;
    this.stackName=null;
    this.router=null;
    this.useRouterForAll=null;
    this.readTimeout= -1;
    this.outboundProxy=null;
    this.routerPath=null;
    this.forkedEvents=new Array();
    this.remoteTagReassignmentAllowed = true;
    this.logStackTraceOnMessageSend = true;
    this.stackDoesCongestionControl = true;
    this.checkBranchId=false;
    this.isDialogTerminatedEventDeliveredForNullDialog = false;
    this.serverTransactionTable=new Array();
    this.clientTransactionTable=new Array();
    this.terminatedServerTransactionsPendingAck=new Array();
    this.forkedClientTransactionTable=new Array();
    this.dialogCreatingMethods=new Array();
    this.dialogTable=new Array();
    this.earlyDialogTable=new Array();
    this.pendingTransactions=new Array();
    this.unlimitedServerTransactionTableSize = true;
    this.unlimitedClientTransactionTableSize = true;
    this.serverTransactionTableHighwaterMark = 5000;
    this.serverTransactionTableLowaterMark = 4000;
    this.clientTransactionTableHiwaterMark = 1000;
    this.clientTransactionTableLowaterMark = 800;
    this.timer=0;
    this.maxForkTime=0;
    this.toExit=false;
    this.isBackToBackUserAgent = false;
    this.maxListenerResponseTime=-1;
    this.non2XXAckPassedToListener=null;
    this.eventScanner=new EventScanner(this);
    this.listeningPoints=new Array();
    this.sipProviders=new Array();
    this.reEntrantListener=true;
    this.sipListener=null;
    this.deliverTerminatedEventForAck = false;
    this.deliverUnsolicitedNotify = false;
    this.maxConnections = 1;
    this.unlimitedServerTransactionTableSize = true;
    this.unlimitedClientTransactionTableSize = true;
    this.setNon2XXAckPassedToListener(false);
    this.generateTimeStampHeader = false;
    this.rfc2543Supported = true;
    this.cancelClientTransactionChecked = true;
    this.deliverTerminatedEventForAck = false;
    this.deliverUnsolicitedNotify = false;
    this.useRouterForAll = false;
    this.isAutomaticDialogSupportEnabled = true;
    this.isAutomaticDialogErrorHandlingEnabled = true;
    this.addressResolver = new DefaultAddressResolver();
    this.messagechannel=null;
    this.useragent=null;
    this.lastTransaction=null;
    
    this.dialogCreatingMethods.push("REFER");
    this.dialogCreatingMethods.push("INVITE");
    this.dialogCreatingMethods.push("SUBSCRIBE");
    //this.dialogCreatingMethods.push("REGISTER");
    
    if(arguments.length!=0)
    {
        this.wsurl=arguments[0];
        var address = arguments[1];
        this.ipAddressLocal=address;
        this.setHostAddress(address);       
        this.useragent=arguments[2];     
        var msgFactory = new NistSipMessageFactoryImpl(this);
        this.setMessageFactory(msgFactory);      
        this.defaultRouter = new DefaultRouter(this, this.ipAddressLocal);
    }
}

SipStackImpl.prototype = new SIPTransactionStack();
SipStackImpl.prototype.constructor=SipStackImpl;
SipStackImpl.prototype.MAX_DATAGRAM_SIZE=8 * 1024;

SipStackImpl.prototype.isAutomaticDialogSupportEnabledFunction =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:isAutomaticDialogSupportEnabledFunction()");
    return this.isAutomaticDialogSupportEnabled;
}

SipStackImpl.prototype.isAutomaticDialogErrorHandlingEnabledFunction =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:isAutomaticDialogErrorHandlingEnabledFunction()");
    return this.isAutomaticDialogErrorHandlingEnabled;
}

SipStackImpl.prototype.getEventScanner =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getEventScanner()");
    return this.eventScanner;
}

SipStackImpl.prototype.getSipListener =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getSipListener()");
    return this.sipListener;
}

SipStackImpl.prototype.createSipProvider =function(listeningPoint){
    if(logger!=undefined) logger.debug("SipStackImpl:createSipProvider():listeningPoint="+listeningPoint);
    if (listeningPoint == null) {
        console.error("SipProviderImpl:createSipProvider(): null listeningPoint argument");
        throw "SipProviderImpl:createSipProvider(): null listeningPoint argument";
    }
    
    var listeningPointImpl = listeningPoint;
    if (listeningPointImpl.sipProvider != null) {
        console.error("SipProviderImpl:createSipProvider(): provider already attached!");
        throw "SipProviderImpl:createSipProvider(): provider already attached!";
    }
    
    var provider = new SipProviderImpl(this);
    provider.setListeningPoint(listeningPointImpl);
    listeningPointImpl.sipProvider = provider;
    var l=null;
    for(var i=0;i<this.sipProviders.length;i++)
    {
        if(this.sipProviders[i]==provider)
        {
            l=i;
        }
    }
    if(l==null)
    {
        this.sipProviders.push(provider);
    }
    return provider;
}

SipStackImpl.prototype.createListeningPoint =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:createListeningPoint()");
    if (!this.isAlive()) {
        this.toExit = false;
        this.reInitialize();
    }
    var transport="ws";
    var lp=new ListeningPointImpl(this);
    var key = lp.makeKey(this.ipAddressLocal, transport);
    var lip=null;
    for(var i=0;i<this.listeningPoints.length;i++)
    {
        if(this.listeningPoints[i]==key)
        {
            lip=this.listeningPoints[i][1];
        }
    }
    if (lip != null) {
        return lip;
    }
    else {
        var messageProcessor = this.createMessageProcessor();
        lip = new ListeningPointImpl(this);
        lip.messageProcessor = messageProcessor;
        messageProcessor.setListeningPoint(lip);
        var array=new Array();
        array[0]=key;
        array[1]=lip;
        this.listeningPoints.push(array);
        this.messagechannel=messageProcessor.createMessageChannel();
        return lip;
    }
}

SipStackImpl.prototype.createMessageProcessor =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:createMessageProcessor()");
    var wsMessageProcessor = new WSMessageProcessor(this);
    this.addMessageProcessor(wsMessageProcessor);
    return wsMessageProcessor;
}

SipStackImpl.prototype.reInitialize =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:reInitialize()");
    this.reInit();
    this.eventScanner = new EventScanner(this);
    this.listeningPoints = new Array();
    this.sipProviders = new Array();
    this.sipListener = null;
}

SipStackImpl.prototype.getIpAddress =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getIpAddress()");
    return this.ipAddressLocal;
}

SipStackImpl.prototype.getUrlWs =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getUrlWs()");
    return this.wsurl;
}

SipStackImpl.prototype.getUserAgent =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getUserAgent()");
    return this.useragent;
}


SipStackImpl.prototype.deleteListeningPoint =function(listeningPoint){
    if(logger!=undefined) logger.debug("SipStackImpl:deleteListeningPoint():listeningPoint="+listeningPoint);
    if (listeningPoint == null) {
        console.error("SipProviderImpl:deleteListeningPoint(): null listeningPoint arg");
        throw "SipProviderImpl:deleteListeningPoint(): null listeningPoint arg";
    }
    var lip = listeningPoint;
    this.removeMessageProcessor(lip.messageProcessor);
    var key = lip.getKey();
    var l=null;
    for(var i=0;i<this.listeningPoints.length;i++)
    {
        if(this.listeningPoints[i][0]==key)
        {
            l=i;
        }
    }
    if(l!=null)
    {
        this.listeningPoints.splice(l,1);
    }
}


SipStackImpl.prototype.deleteSipProvider =function(sipProvider){
    if(logger!=undefined) logger.debug("SipStackImpl:deleteSipProvider():sipProvider:"+sipProvider);
    if (sipProvider == null) {
        console.error("SipProviderImpl:deleteSipProvider(): null provider arg");
        throw "SipProviderImpl:deleteSipProvider(): null provider arg";
    }
    var sipProviderImpl = sipProvider;
    if (sipProviderImpl.getSipListener() != null) {
        console.error("SipProviderImpl:deleteSipProvider(): sipProvider still has an associated SipListener!");
        throw "SipProviderImpl:deleteSipProvider(): sipProvider still has an associated SipListener!";
    }
    sipProviderImpl.removeListeningPoints();
    sipProviderImpl.stop();
    var l=null;
    for(var i=0;i<this.sipProviders.length;i++)
    {
        if(this.sipProviders[i]==sipProvider)
        {
            l=i;
        }
    }
    if(l!=null)
    {
        this.sipProviders.splice(l,1);
    }
    if (this.sipProviders.length==0) {
        this.stopStack();
    }
}

SipStackImpl.prototype.getListeningPoints =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getListeningPoints()");
    return this.listeningPoints;
}

SipStackImpl.prototype.getSipProviders =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getSipProviders()");
    if(this.sipProviders.length==1)
    {
        return this.sipProviders[0];
    }
    else
    {
        return this.sipProviders;
    }
}

SipStackImpl.prototype.getStackName =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getStackName()");
    return this.stackName;
}

SipStackImpl.prototype.finalize =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:finalize()");
    this.stopStack();
}

SipStackImpl.prototype.stop =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:stop()");
    this.stopStack();
    this.sipProviders = new Array();
    this.listeningPoints = new Array();
    if (this.eventScanner != null) {
        this.eventScanner.forceStop();
    }
    this.eventScanner = null;
}

SipStackImpl.prototype.start =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:start()");
    if (this.eventScanner == null) {
        this.eventScanner = new EventScanner(this);
    }
}

SipStackImpl.prototype.getSipListener =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getSipListener()");
    return this.sipListener;
}

SipStackImpl.prototype.setEnabledCipherSuites =function(newCipherSuites){
    if(logger!=undefined) logger.debug("SipStackImpl:setEnabledCipherSuites():newCipherSuites="+newCipherSuites);
    this.cipherSuites = newCipherSuites;
}

SipStackImpl.prototype.getEnabledCipherSuites =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getEnabledCipherSuites()");
    return this.cipherSuites;
}

SipStackImpl.prototype.setEnabledProtocols =function(newProtocols){
    if(logger!=undefined) logger.debug("SipStackImpl:setEnabledProtocols():newProtocols="+newProtocols);
    this.enabledProtocols = newProtocols;
}

SipStackImpl.prototype.getEnabledProtocols =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getEnabledProtocols()");
    return this.enabledProtocols;
}

SipStackImpl.prototype.setIsBackToBackUserAgent =function(flag){
    if(logger!=undefined) logger.debug("SipStackImpl:setIsBackToBackUserAgent():flag="+flag);
    this.isBackToBackUserAgent = flag;
}

SipStackImpl.prototype.isBackToBackUserAgent =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:isBackToBackUserAgent()");
    return this.isBackToBackUserAgent;
}

SipStackImpl.prototype.isAutomaticDialogErrorHandlingEnabled =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:isAutomaticDialogErrorHandlingEnabled()");
    return this.isAutomaticDialogErrorHandlingEnabled;
}

SipStackImpl.prototype.getChannel =function(){
    if(logger!=undefined) logger.debug("SipStackImpl:getChannel()");
    return this.messagechannel;
}

SipStackImpl.prototype.onOpen =function(clienttransaction){
    if(logger!=undefined) logger.debug("SipStackImpl:onOpen()");
    var websocket=this.getChannel().getWebSocket();
    websocket.onopen=function()
    {
        clienttransaction.sendRequest();
    }
}

SipStackImpl.prototype.newSIPServerRequest =function(requestReceived,requestMessageChannel){
    if(logger!=undefined) logger.debug("SipStackImpl:newSIPServerRequest(): requestReceived="+ requestReceived);
    if(logger!=undefined) logger.debug("SipStackImpl:newSIPServerRequest(): requestMessageChannel="+requestMessageChannel);
    var nextTransaction=null;
    var currentTransaction=null;
    var key = requestReceived.getTransactionId();
    requestReceived.setMessageChannel(requestMessageChannel); 
    var l=null;
    for(var i=0;i<this.serverTransactionTable.length;i++)
    {
        if(this.serverTransactionTable[i][0]==key)
        {
            l=i;
        }
    }
    if(l!=null)
    {
        currentTransaction=this.serverTransactionTable[l][1]; 
    }
    if (currentTransaction == null|| !currentTransaction.isMessagePartOfTransaction(requestReceived)) {
        currentTransaction = null;
        var length=this.BRANCH_MAGIC_COOKIE_LOWER_CASE.length;
        var chaine=key.toLowerCase().substr(0, length-1);
        if (chaine!=this.BRANCH_MAGIC_COOKIE_LOWER_CASE) {
            for(i=0;i<this.serverTransactionTable.length&& currentTransaction == null;i++)
            {
                nextTransaction=this.serverTransactionTable[i][1];
                if (nextTransaction.isMessagePartOfTransaction(requestReceived)) {
                    currentTransaction = nextTransaction;
                }
            }
        }
        if (currentTransaction == null) {
            currentTransaction = this.findPendingTransaction(requestReceived);
            if (currentTransaction != null) {
                requestReceived.setTransaction(currentTransaction);
                if (currentTransaction != null) {
                    return currentTransaction;
                } else {
                    return null;
                }

            }
            currentTransaction = this.createServerTransaction(requestMessageChannel);
            currentTransaction.setOriginalRequest(requestReceived);
            requestReceived.setTransaction(currentTransaction);
            if(requestReceived.getMethod()!="ACK")
            {
                currentTransaction=this.getSipProviders().getNewServerTransaction(requestReceived);
            }
        }
    }
    if (currentTransaction != null) {
        currentTransaction.setRequestInterface(this.sipMessageFactory.newSIPServerRequest(
            requestReceived, currentTransaction));
    }
    if(requestReceived.getMethod()=="ACK")
    {
        currentTransaction=this.lastTransaction;
    }
    else
    {
        this.lastTransaction=currentTransaction;
    }
    return currentTransaction;
}


SipStackImpl.prototype.newSIPServerResponse =function(responseReceived,responseMessageChannel){
    if(logger!=undefined) logger.debug("SipStackImpl:newSIPServerResponse(): responseReceived="+responseReceived);
    if(logger!=undefined) logger.debug("SipStackImpl:newSIPServerResponse(): responseMessageChannel="+responseMessageChannel);
    var nextTransaction=null;
    var currentTransaction=null;
    var key = responseReceived.getTransactionId();
    var l=null;
    for(var i=0;i<this.clientTransactionTable.length;i++)
    {
        if(this.clientTransactionTable[i][0]==key)
        {
            l=i;
        }
    }
    if(l!=null)
    {
        currentTransaction=this.clientTransactionTable[l][1];
    }
    var length=this.BRANCH_MAGIC_COOKIE_LOWER_CASE.length;
    var chaine=key.toLowerCase().substr(0, length-1);
    if (currentTransaction == null
        || (!currentTransaction.isMessagePartOfTransaction(responseReceived) 
            && chaine!=this.BRANCH_MAGIC_COOKIE_LOWER_CASE)) {
        for(i=0;i<this.clientTransactionTable.length&& currentTransaction == null;i++)
        {
            nextTransaction=this.serverTransactionTable[i][1];
            if (nextTransaction.isMessagePartOfTransaction(responseReceived)) {
                currentTransaction = nextTransaction;
            }
        }
        if (currentTransaction == null) {
            return this.sipMessageFactory.newSIPServerResponse(responseReceived,
                responseMessageChannel);
        }
    }
    var sri = this.sipMessageFactory.newSIPServerResponse(responseReceived, currentTransaction);
    if (sri != null) {
        currentTransaction.setResponseInterface(sri);
    }
    else {
        return null;
    }
    return currentTransaction;
}

SipStackImpl.prototype.createServerTransaction =function(encapsulatedMessageChannel){
    if(logger!=undefined) logger.debug("SipStackImpl:createServerTransaction():encapsulatedMessageChannel="+encapsulatedMessageChannel);
    return new SIPServerTransaction(this, encapsulatedMessageChannel);
}

SipStackImpl.prototype.removeTransaction =function(sipTransaction){
    if(logger!=undefined) logger.debug("SipStackImpl:removeTransaction():sipTransaction="+sipTransaction);
    if (sipTransaction instanceof SIPServerTransaction) {
        var key = sipTransaction.getTransactionId();
        var removed=null;
        var l=null;
        for(var i=0;i<this.serverTransactionTable.length;i++)
        {
            if(key==this.serverTransactionTable[i])
            {
                l=i
                removed=this.serverTransactionTable[i][1];
            }
        }
        this.serverTransactionTable.splice(l,1);
        var method = sipTransaction.getMethod();
        this.removePendingTransaction(sipTransaction);
        this.removeTransactionPendingAck(sipTransaction);
        if (method.toUpperCase()=="INVITE") {
            this.removeFromMergeTable(sipTransaction);
        }
        var sipProvider = sipTransaction.getSipProvider();
        if (removed != null && sipTransaction.testAndSetTransactionTerminatedEvent()) {
            var event = new TransactionTerminatedEvent(sipProvider,sipTransaction);
            sipProvider.handleEvent(event, sipTransaction);
        }
    } 
    else {
        key = sipTransaction.getTransactionId();
        var l=null;
        for(var i=0;i<this.clientTransactionTable.length;i++)
        {
            if(this.clientTransactionTable[i][0]==key)
            {
                l=i;
            }
        }
        removed = this.clientTransactionTable[l][1];
        if(l!=null)
        {
            this.clientTransactionTable.splice(l,1);
        }
        if (removed != null && sipTransaction.testAndSetTransactionTerminatedEvent()) {
            sipProvider = sipTransaction.getSipProvider();
            event = new TransactionTerminatedEvent(sipProvider,sipTransaction);
            sipProvider.handleEvent(event, sipTransaction);
        }
    }
}