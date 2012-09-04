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
 *  Implementation of the JAIN-SIP EventScanner .
 *  @see  gov/nist/javax/sip/EventScanner.java 
 *  @author Yuemin Qin (yuemin.qin@orange.com)
 *  @author Laurent STRULLU (laurent.strullu@orange.com)
 *  @version 1.0 
 *   
 */
function EventScanner(sipStackImpl) {
    if(logger!=undefined) logger.debug("EventScanner:EventScanner()");
    this.classname="EventScanner";
    this.isStopped=null;
    this.refCount=null;
    this.pendingEvents = new Array();
    this.eventMutex = new Array();
    this.eventMutex[0]=0;
    this.sipStack=sipStackImpl;
}

EventScanner.prototype.BRANCH_MAGIC_COOKIE="z9hG4bK";

EventScanner.prototype.incrementRefcount =function(){
    if(logger!=undefined) logger.debug("EventScanner:incrementRefcount()");
    
}

EventScanner.prototype.addEvent =function(eventWrapper){
    if(logger!=undefined) logger.debug("EventScanner:addEvent():eventWrapper="+eventWrapper);
    this.pendingEvents.push(eventWrapper);
//this.eventMutex.notify();
}

EventScanner.prototype.stop =function(){
    if(logger!=undefined) logger.debug("EventScanner:stop()");
    if (this.refCount > 0)
    {
        this.refCount--;
    }
    if (this.refCount == 0) {
        this.isStopped = true;
    //this.eventMutex.notify();
    }
}

EventScanner.prototype.forceStop =function(){
    if(logger!=undefined) logger.debug("EventScanner:forceStop()");
    this.isStopped = true;
    this.refCount = 0;
//this.eventMutex.notify();
}

EventScanner.prototype.deliverEvent =function(eventWrapper){
    if(logger!=undefined) logger.debug("EventScanner:deliverEvent():eventWrapper="+eventWrapper);
    var sipEvent = eventWrapper.sipEvent;
    var sipListener = this.sipStack.getSipListener();
    if (sipEvent instanceof RequestEvent) {
        var sipRequest = sipEvent.getRequest();
        var tx = this.sipStack.findTransaction(sipRequest, true);
        if (tx != null && !tx.passToListener()) {
            return;
        }
        else if (this.sipStack.findPendingTransaction(sipRequest) != null) {
            return;
        }
        else {
            var st = eventWrapper.transaction;
            this.sipStack.putPendingTransaction(st);
        }
        sipRequest.setTransaction(eventWrapper.transaction);
        if (sipListener != null)
        {
            sipListener.processRequest(sipEvent);
        }
        if (eventWrapper.transaction != null) {
            var dialog = eventWrapper.transaction.getDialog();
            if (dialog != null)
            {
                dialog.requestConsumed();
            }
        }
        if (eventWrapper.transaction != null)
        {
            this.sipStack.removePendingTransaction(eventWrapper.transaction);
        }
        if (eventWrapper.transaction.getOriginalRequest().getMethod()=="ACK") {

            eventWrapper.transaction.setState("TERMINATED");
        }
    }
    else if (sipEvent instanceof ResponseEvent) {
        var responseEvent = sipEvent;
        var sipResponse = responseEvent.getResponse();
        var sipDialog = responseEvent.getDialog();
        if (sipListener != null) {
            tx = eventWrapper.transaction;
            if (tx != null) {
                tx.setPassToListener();
            }
            //alert(sipEvent.mResponse.encode());
            sipListener.processResponse(sipEvent);//for the level application
        }
        if ((sipDialog != null && (sipDialog.getState() == null || sipDialog.getState()!="TERMINATED"))
            && (sipResponse.getStatusCode() == 481 || sipResponse.getStatusCode() == 408)) {
            sipDialog.doDeferredDelete();
        }
        if (sipResponse.getCSeq().getMethod()=="INVITE"&& sipDialog != null
            && sipResponse.getStatusCode() == 200) {
            sipDialog.doDeferredDeleteIfNoAckSent(sipResponse.getCSeq().getSeqNumber());
        }
        var ct = eventWrapper.transaction;
        if (ct != null && "COMPLETED" == ct.getState() && ct.getOriginalRequest() != null
            && ct.getOriginalRequest().getMethod()!="INVITE") {
            ct.clearState();
        }
    } else if (sipEvent instanceof TimeoutEvent) {
        if (sipListener != null)
        {
            sipListener.processTimeout(sipEvent);//the application level will process the infomation
        }
    } else if (sipEvent instanceof DialogTimeoutEvent) {
        if (sipListener != null && sipListener instanceof SipListenerExt) {
            sipListener.processDialogTimeout(sipEvent);  //the application level will process the infomation                  
        }

    } else if (sipEvent instanceof TransactionTerminatedEvent) {
        if (sipListener != null)
        {
            //alert("Terminated");
            sipListener.processTransactionTerminated(sipEvent);//the application level will process the infomation
        }
    } else if (sipEvent instanceof DialogTerminatedEvent) {
        if (sipListener != null)
        {
            sipListener.processDialogTerminated(sipEvent);//the application level will process the infomation
        }
    }
}

EventScanner.prototype.run =function(){
    if(logger!=undefined) logger.debug("EventScanner:run()");
    while (true) {
        var eventWrapper = null;
        var eventsToDeliver;
        while (this.pendingEvents.length==0) {
            if (this.isStopped) {
                return;
            }
            try {
            //setTimeout();
            //eventMutex.wait(threadHandle.getPingIntervalInMillisecs());
            } catch (ex) {
                console.error("EventScanner:run(): catched exception:"+ex);
                return;
            }
        }
        eventsToDeliver = this.pendingEvents;
        this.pendingEvents = new Array();
        for(var i=0;i<eventsToDeliver.length;i++)
        {
            eventWrapper = eventsToDeliver[i];
            this.deliverEvent(eventWrapper);
        }
    } 
}

