/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
function ApplicationSipTest() {
    console.info("ApplicationSipTest:ApplicationSipTest()");
        
    // SIP account attribut        
    this.localIpAddress=null;
    this.sipWsUrl=null;
    this.sipDomain=null;
    this.sipDisplayName=null;
    this.sipUserName=null;
    this.sipLogin=null;
    this.sipPassword=null;
    
    // JAIN SIP main object
    this.userAgent="JAIN SIP WebRTC UserAgent";
    this.sipFactory=null;
    this.sipStack=null;    
    this.listeningPoint=null;
    this.sipProvider=null; 
    
    // JAIN SIP state machine 
    this.refreshRegisterTimer=null; 
    this.stateMachineRegister=this.UNREGISTERED;
    this.registerAuthenticatedFlag=false;
    this.refreshRegisterFlag=false;
    this.stateMachineInvite=this.UNINVITED;
    this.inviteAuthenticatedFlag=false;
    this.cltransaction=null;
    this.svrtransaction=null;
    this.lastJainSipRegisterSentRequest=null;
    this.lastJainSipInviteSentRequest=null;
    this.lastJainSipMessageSent=null;
    this.keepAliveState="KeepAliveStart";
    this.isFirstRequest=true;
    this.responseEvent=null;
    this.requestEvent=null;
    this.jainSipInviteDialog=null;
}

// SIP listener heritage
ApplicationSipTest.prototype = new SipListener();
ApplicationSipTest.prototype.constructor=ApplicationSipTest;


ApplicationSipTest.prototype.UNREGISTERED="UNREGISTERED";
ApplicationSipTest.prototype.REGISTERED="REGISTERED";
ApplicationSipTest.prototype.UNREGISTERING="UNREGISTERING";
ApplicationSipTest.prototype.AUTHENTICATING="AUTHENTICATING";
ApplicationSipTest.prototype.UNINVITED="UNINVITED";
ApplicationSipTest.prototype.INVITEED="INVITEED";
ApplicationSipTest.prototype.UNINVITING="UNINVITING";


ApplicationSipTest.prototype.register =function(sipWsUrl, localIpAddress, sipDomain, sipDisplayName, sipUserName, sipLogin, sipPassword){
    console.debug("ApplicationSipTest:ApplicationSipTest(): sipWsUrl="+sipWsUrl);
    console.debug("ApplicationSipTest:ApplicationSipTest(): localIpAddress="+localIpAddress);
    console.debug("ApplicationSipTest:ApplicationSipTest(): sipDomain="+sipDomain);
    console.debug("ApplicationSipTest:ApplicationSipTest(): sipDisplayName="+sipDisplayName);
    console.debug("ApplicationSipTest:ApplicationSipTest(): sipUserName="+sipUserName);
    console.debug("ApplicationSipTest:ApplicationSipTest(): sipLogin="+sipLogin);
    console.debug("ApplicationSipTest:ApplicationSipTest(): sipPassword="+sipPassword);
     
    this.sipWsUrl=sipWsUrl;
    this.localIpAddress=localIpAddress;
    this.sipDomain=sipDomain;
    this.sipDisplayName=sipDisplayName;
    this.sipUserName=sipUserName;
    this.sipLogin=sipLogin;
    this.sipPassword=sipPassword;
   
    this.sipFactory=new SipFactory(this.sipWsUrl,this.localIpAddress,this.userAgent,this.sipPassword,this.sipDomain);
    this.sipStack=this.sipFactory.createSipStack();
    this.listeningPoint=this.sipStack.createListeningPoint();
    this.sipProvider=this.sipStack.createSipProvider(this.listeningPoint);
    this.sipProvider.addSipListener(this);
    this.sipStack.start();
    
    this.headerFactory=this.sipFactory.createHeaderFactory();
    this.addressFactory=this.sipFactory.createAddressFactory();
    this.messageFactory=this.sipFactory.createMessageFactory(this.listeningPoint);
    
    var fromSipUriString=this.sipUserName+"@"+this.sipDomain;
    var contactUriString=this.sipUserName+"@"+this.localIpAddres;             
    var jainSipCseqHeader=this.headerFactory.createCSeqHeader(1,"REGISTER");
    var jainSipCallIdHeader=this.headerFactory.createCallIdHeader();
    var jainSipExpiresHeader=this.headerFactory.createExpiresHeader(3600);
    var jainSipMaxForwardHeader=this.headerFactory.createMaxForwardsHeader(70);
    var jainSipRequestUri=this.addressFactory.createSipURI_user_host(null,this.sipDomain);
    var jainSipAllowListHeader=this.headerFactory.createHeaders("Allow: INVITE,ACK,CANCEL,OPTION,BYE,REFER,NOTIFY,MESSAGE,SUBSCRIBE,INFO");
    var jainSipFromUri=this.addressFactory.createSipURI_user_host(null,fromSipUriString);
    var jainSipFromAddress=this.addressFactory.createAddress_name_uri(null,jainSipFromUri);
    var random=new Date();
    var tag=random.getTime();
    var jainSipFromHeader=this.headerFactory.createFromHeader(jainSipFromAddress, tag);
    var jainSipToHeader=this.headerFactory.createToHeader(jainSipFromAddress, null);    
    var jainSipContactUri=this.addressFactory.createSipURI_user_host(null,contactUriString);
    var jainSipContactAddress=this.addressFactory.createAddress_name_uri(null,jainSipContactUri);
    var jainSipContactHeader=this.headerFactory.createContactHeader(jainSipContactAddress);           
    var jainSipUseAgentHeader=this.headerFactory.createUserAgentHeader(this.listeningPoint.getUserAgent());      
    var jainSipRegisterRequest=this.messageFactory.createRequest(jainSipRequestUri,"REGISTER",jainSipCallIdHeader,jainSipCseqHeader,jainSipFromHeader,jainSipToHeader,jainSipMaxForwardHeader);   
    this.messageFactory.addHeader(jainSipRegisterRequest, jainSipExpiresHeader);
    this.messageFactory.addHeader(jainSipRegisterRequest, jainSipUseAgentHeader);
    this.messageFactory.addHeader(jainSipRegisterRequest, jainSipAllowListHeader);
    this.messageFactory.addHeader(jainSipRegisterRequest, jainSipContactHeader);   
    this.lastJainSipRegisterSentRequest=jainSipRegisterRequest;
    this.sendClientMessage(jainSipRegisterRequest);
}

ApplicationSipTest.prototype.processResponse =function(responseEvent){
    console.debug("ApplicationSipTest:processResponse()");  
    if(responseEvent.getResponse().getCSeq().getMethod()=="REGISTER")
    {
        this.handleStateMachineRegisterEvent(responseEvent);
    }
    else if(responseEvent.getResponse().getCSeq().getMethod()=="INVITE"||responseEvent.getResponse().getCSeq().getMethod()=="BYE")
    {
        this.handleStateMachineInviteEvent(responseEvent);   
    }
}

ApplicationSipTest.prototype.processRequest =function(requestEvent){
    console.debug("ApplicationSipTest:processRequest()");
    var jainSipReceivedMessage=requestEvent.getRequest();  
    this.requestEvent=requestEvent;
    if(jainSipReceivedMessage.getMethod()=="BYE")
    {
        hideByeButton();
        showInviteButton();
        this.answer(); 
    }
    else if(jainSipReceivedMessage.getMethod()=="ACK")
    {
        this.jainSipInviteDialog=this.svrtransaction.getDialog();
    }
    else if(jainSipReceivedMessage.getMethod()=="INVITE")
    {
        showAnswerButton();
        showByeButton();
        hideInviteButton();
        this.jainSipIncomingInviteRequest = jainSipReceivedMessage; 
        this.svrtransaction = this.requestEvent.getServerTransaction();
        var jainSipRingingResponse=jainSipReceivedMessage.createResponse(180, "Ringing");
        this.svrtransaction.sendMessage(jainSipRingingResponse);
        this.lastJainSipMessageSent=jainSipRingingResponse;
    }
}

ApplicationSipTest.prototype.handleStateMachineRegisterEvent =function(responseEvent){
    console.debug("ApplicationSipTest:handleStateMachineRegisterEvent()");
    var jainSipMessage=responseEvent.getResponse(); 
    if(jainSipMessage.getStatusCode()=="401")
    {
        if(this.registerAuthenticatedFlag==false)
        {
            this.stateMachineRegister=this.AUTHENTICATING;
            this.registerAuthenticatedFlag=true;
        }
        else
        {
            this.lastJainSipRegisterSentRequest.removeHeader("Authorization");
        }
        var num=new Number(this.lastJainSipRegisterSentRequest.getCSeq().getSeqNumber());
        this.lastJainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
        var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipMessage,this.lastJainSipRegisterSentRequest,this.sipPassword,this.sipLogin);
        this.messageFactory.addHeader(this.lastJainSipRegisterSentRequest, jainSipAuthorizationHeader); 
        this.lastJainSipRegisterSentRequest = this.messageFactory.setNewViaHeader(this.lastJainSipRegisterSentRequest);
        this.sendClientMessage(this.lastJainSipRegisterSentRequest);
    }
    else if(jainSipMessage.getStatusCode()=="200")
    {
        if(this.stateMachineRegister!=this.UNREGISTERING)
        {
            if(this.keepAliveState!="KeepAliveStop")
            {
                this.stateMachineRegister=this.REGISTERED; 
                if(this.refreshRegisterFlag==false)
                {
                  showInviteButton();
                  showUnRegisterButton();
                  hideRegisterButton();
                  hideAnswerButton();
                  hideByeButton();
                }
                var application=this;
                this.refreshRegisterTimer=setTimeout(function(){
                    application.keepAliveRegister();
                },40000);
            }
            else
            {
                this.stateMachineRegister=this.UNREGISTERING;
                this.unRegister();
            }
        }
        else 
        {
            this.stateMachineRegister=this.UNREGISTERED;
            this.keepAliveState="KeepAliveStart";
            this.refreshRegisterFlag=false;
            hideUnRegisterButton();
            hideInviteButton();
            hideAnswerButton();
            hideByeButton();
            showRegisterButton();
            this.refreshRegisterTimer=null
        }
    }
}


ApplicationSipTest.prototype.unRegister =function(){
    console.debug("ApplicationSipTest:unRegister(): ");
    this.keepAliveState="KeepAliveStop";
    if(this.stateMachineRegister==this.UNREGISTERING||this.refreshRegisterTimer!=null)
    {
        if(this.refreshRegisterTimer!=null)
        {
            clearTimeout(this.refreshRegisterTimer);
            this.stateMachineRegister=this.UNREGISTERING;
        }
        var num=new Number(this.lastJainSipRegisterSentRequest.getCSeq().getSeqNumber());
        this.lastJainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
        this.lastJainSipRegisterSentRequest.getExpires().setExpires(0);
        this.lastJainSipRegisterSentRequest = this.lastJainSipRegisterSentRequest=this.messageFactory.setNewViaHeader(this.lastJainSipRegisterSentRequest); 
        this.sendClientMessage(this.lastJainSipRegisterSentRequest);  
    }
}


ApplicationSipTest.prototype.keepAliveRegister =function(){
    console.debug("ApplicationSipTest:keepAliveRegister()");
    if(this.keepAliveState!="KeepAliveStop"&&this.stateMachineRegister==this.REGISTERED)
    { 
        this.refreshRegisterTimer=null;
        this.refreshRegisterFlag=true;
        var num=new Number(this.lastJainSipRegisterSentRequest.getCSeq().getSeqNumber());
        this.lastJainSipRegisterSentRequest.getCSeq().setSeqNumber(num+1);
        this.lastJainSipRegisterSentRequest = this.messageFactory.setNewViaHeader(this.lastJainSipRegisterSentRequest);
        this.sendClientMessage(this.lastJainSipRegisterSentRequest);
    }
}


ApplicationSipTest.prototype.call =function(to){
    console.debug("ApplicationSipTest:call():to: "+to);
    var fromSipUriString=this.sipUserName+"@"+this.sipDomain;
    var contactUriString=this.sipUserName+"@"+this.localIpAddress;
    var toSipUriString=to+"@"+this.sipDomain;
    var random=new Date();
                
    var jainSipCseqHeader=this.headerFactory.createCSeqHeader(1,"INVITE");
    var jainSipCallIdHeader=this.headerFactory.createCallIdHeader();
    var jainSipMaxForwardHeader=this.headerFactory.createMaxForwardsHeader(70);
    var jainSipRequestUri=this.addressFactory.createSipURI_user_host(null,toSipUriString);
    var jainSipAllowListHeader=this.headerFactory.createHeaders("Allow: INVITE,ACK,CANCEL,OPTION,BYE"+",REFER,NOTIFY,MESSAGE,SUBSCRIBE,INFO");         
    var jainSipFromUri=this.addressFactory.createSipURI_user_host(null,fromSipUriString);
    var jainSipFromAdress=this.addressFactory.createAddress_name_uri(null,jainSipFromUri);
    var tagfrom=random.getTime();
    var jainSipFromHeader=this.headerFactory.createFromHeader(jainSipFromAdress, tagfrom);           
    var jainSiptoUri=this.addressFactory.createSipURI_user_host(null,toSipUriString);
    var jainSipToAddress=this.addressFactory.createAddress_name_uri(null,jainSiptoUri);
    var jainSipToHeader=this.headerFactory.createToHeader(jainSipToAddress, null);           
    var jainSipContactUri=this.addressFactory.createSipURI_user_host(null,contactUriString);
    var jainSipContactAddress=this.addressFactory.createAddress_name_uri(null,jainSipContactUri);
    var jainSipContactHeader=this.headerFactory.createContactHeader(jainSipContactAddress);     
    var jainSipUserAgentHeader=this.headerFactory.createUserAgentHeader(this.listeningPoint.getUserAgent());
    var jainSipContentTypeHeader=this.headerFactory.createContentTypeHeader("application","sdp");
    
    var dummySdpOfferString="v=0"+ "\n"+   
    "o=- 12985789420868628 1 IN IP4 10.193.7.13"+ "\n"+ 
    "s=dummyTest"+ "\n" +   
    "c=IN IP4 10.193.7.13"+ "\n" +   
    "t=0 0"+ "\n" +   
    "m=audio 5062 RTP/AVP 107 0 8 101"+ "\n" +   
    "b=AS:1638"+ "\n" +    
    "a=sendrecv"+ "\n" +   
    "a=rtpmap:107 BV32/16000"+ "\n" +   
    "a=rtpmap:101 telephone-event/8000"+ "\n" +  
    "a=fmtp:101 0-15 ";
                
    var jainSipOutgoingInviteRequest=this.messageFactory.createRequest(jainSipRequestUri,"INVITE",
        jainSipCallIdHeader,
        jainSipCseqHeader,
        jainSipFromHeader,
        jainSipToHeader,
        jainSipMaxForwardHeader,
        jainSipContentTypeHeader,
        dummySdpOfferString); 
                      
    this.messageFactory.addHeader(jainSipOutgoingInviteRequest, jainSipUserAgentHeader);
    this.messageFactory.addHeader(jainSipOutgoingInviteRequest, jainSipAllowListHeader);
    this.messageFactory.addHeader(jainSipOutgoingInviteRequest, jainSipContactHeader);   
    this.lastJainSipInviteSentRequest=jainSipOutgoingInviteRequest;
    this.sendClientMessage(jainSipOutgoingInviteRequest);
}

ApplicationSipTest.prototype.handleStateMachineInviteEvent =function(responseEvent){
    console.debug("ApplicationSipTest:handleStateMachineInviteEvent()");
    this.responseEvent=responseEvent;
    this.jainSipInviteDialog=this.responseEvent.getOriginalTransaction().getDialog();
    var jainSipMessage=responseEvent.getResponse(); 
    if(jainSipMessage.getStatusCode()=="407")
    {
        if(this.inviteAuthenticatedFlag==false)

        {
            this.stateMachineInvite=this.AUTHENTICATING;
            this.inviteAuthenticatedFlag=true;
        }
        else
        {
            this.lastJainSipInviteSentRequest.removeHeader("Authorization");
        }  
        var num=new Number(this.lastJainSipInviteSentRequest.getCSeq().getSeqNumber());
        this.lastJainSipInviteSentRequest.getCSeq().setSeqNumber(num+1);
        var jainSipAuthorizationHeader=this.headerFactory.createAuthorizationHeader(jainSipMessage,this.lastJainSipInviteSentRequest,this.sipPassword,this.sipLogin);
        this.messageFactory.addHeader(this.lastJainSipInviteSentRequest, jainSipAuthorizationHeader); 
        this.lastJainSipInviteSentRequest = this.messageFactory.setNewViaHeader(this.lastJainSipInviteSentRequest);
        this.sendClientMessage(this.lastJainSipInviteSentRequest);
    }
    else if(jainSipMessage.getStatusCode()=="200")
    {
        if(this.stateMachineInvite!=this.UNINVITING)
        {
            this.stateMachineInvite=this.INVITEED;
            showByeButton();
            var jainSipContactUri=jainSipMessage.getContactHeader().getAddress().getURI();
            var jainSipCallIdHeader=this.lastJainSipInviteSentRequest.getCallId();
            var jainSipCseqHeader=this.headerFactory.createCSeqHeader(jainSipMessage.getCSeq().getSequenceNumber(),"ACK");
            var jainSipFromHeader=this.lastJainSipInviteSentRequest.getFrom();
            var jainSipToHeader=this.lastJainSipInviteSentRequest.getTo();
            jainSipToHeader.setTag(jainSipMessage.getTo().getTag());
            var jainSipMaxForwardHeader=this.lastJainSipInviteSentRequest.getMaxForwards();
            var routelist=this.jainSipInviteDialog.getRouteList();
            var jainSipMessageACK=this.messageFactory.createRequest(
                jainSipContactUri,
                "ACK",
                jainSipCallIdHeader,
                jainSipCseqHeader,
                jainSipFromHeader,
                jainSipToHeader,
                jainSipMaxForwardHeader);
            jainSipMessageACK.addHeader(routelist);
            if(jainSipMessageACK.getContent()!=null)
            {
                jainSipMessageACK.removeContent();
            }
            this.jainSipInviteDialog.sendAck(jainSipMessageACK);
            this.lastJainSipMessageSent=jainSipMessageACK;
        }
        else 
        {
            this.stateMachineInvite=this.UNINVITEED;
        }
    }
}


ApplicationSipTest.prototype.bye =function(){
    console.debug("ApplicationSipTest:bye()");
    this.stateMachineInvite=this.UNINVITING;
    if(this.jainSipInviteDialog!=null)
    {
        var jainSipByeRequest;
        jainSipByeRequest=this.jainSipInviteDialog.createRequest("BYE");
        this.cltransaction = this.sipProvider.getNewClientTransaction(jainSipByeRequest);
        this.jainSipInviteDialog.sendRequest(this.cltransaction);
    }
    else
    {
        var request=this.requestEvent.getRequest(); 
        var response480=request.createResponse(480,"Temporarily Unavailable");
        response480.addHeader(this.lastJainSipRegisterSentRequest.getContactHeader());
        response480.addHeader(this.lastJainSipRegisterSentRequest.getHeader("User-Agent"));
        this.sendServerMessage(response480);
        showInviteButton();
    }
    this.lastJainSipMessageSent=jainSipByeRequest;
}

ApplicationSipTest.prototype.answer =function(){
    console.debug("ApplicationSipTest:answer()");
    var jainSip200OKResponse=this.jainSipIncomingInviteRequest.createResponse(200, "OK");
    jainSip200OKResponse.addHeader(this.lastJainSipRegisterSentRequest.getContactHeader());
    jainSip200OKResponse.addHeader(this.lastJainSipRegisterSentRequest.getHeader("User-Agent"));
    this.sendServerMessage(jainSip200OKResponse);
    this.lastJainSipMessageSent=jainSip200OKResponse;
}


ApplicationSipTest.prototype.sendClientMessage =function(message){
    console.debug("ApplicationSipTest:sendClientMessage()");
    this.cltransaction = message.getTransaction();
    if (this.cltransaction == null) {   
        this.cltransaction = this.sipProvider.getNewClientTransaction(message);
        message.setTransaction(this.cltransaction);
    }
    if(this.isFirstRequest)
    {
        this.isFirstRequest=false;
        this.sipStack.onOpen(this.cltransaction);
    }
    else
    {
        this.cltransaction.sendRequest();
    }
}

ApplicationSipTest.prototype.sendServerMessage =function(message){
    console.debug("ApplicationSipTest:sendServerMessage()");
    this.svrtransaction = this.requestEvent.getServerTransaction();
    this.svrtransaction.sendMessage(message);
}
