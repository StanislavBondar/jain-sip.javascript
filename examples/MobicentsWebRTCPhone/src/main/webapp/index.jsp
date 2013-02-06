<html>
    <head>
        <title>MobicentsWebRTCPhone</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">	
        <link rel="icon" type="image/png" href="img/telestax-favicon.png">
        <link href="css/bootstrap.min.css" rel="stylesheet"> 
        <link href="css/bootstrap-responsive.css" rel="stylesheet">
        <link href="css/docs.css" rel="stylesheet">	   
    </head>
    <body onload="onLoad()" onbeforeunload="onBeforeUnload()">
        <div class="navbar navbar-inverse navbar-fixed-top">
            <div class="navbar-inner">        
                <div class="container">
                    <a class="brand" href="#">Mobicents HTML5 WebRTC Client, By </a>
                    <div class="container">
                        <img  width="50"  height="50" alt="Orange" src="img/logo-orange.jpg" />
                        <img alt="TeleStax" src="img/TeleStax_logo_small.png" />
                    </div>
                </div>
                <!--div class="container">
                  <a class="brand" href="#">By</a>    
                  <a href="http://www.telestax.com"><img style="display: block;" alt="TeleStax" src="img/TeleStax_logo_small.png" /></a>
                </div-->
            </div>
        </div>
        <div class="container-fluid">
            <div class="row-fluid">
                <div class="span5">
                    <div class="form-horizontal well">
                        <div id="sipAccountSettings" >
                            <div class="nav-header">Registration</div>
                            <div class="nav-header">&nbsp;</div>			        
                            <div class="control-group" id='sipDisplayNameDiv'>
                                <label class="control-label">
                                    <a style="color:#555555" href="#" rel="tooltip" title="Name that will be displayed when you contact others" data-placement="top" data-delay: { show: 10, hide: 100 }>Display Name</a>:</label>
                                <input id="sipDisplayName"  type="text" size="30"> 
                            </div>
                            <div class="control-group" id='sipDomainDiv'>
                                <label class="control-label">
                                    <a style="color:#555555" href="#" rel="tooltip" title="Domain to be registered under" data-placement="top" data-delay: { show: 10, hide: 100 }>Domain</a>:</label>
                                <input id="sipDomain"  type="text" size="30"> 
                            </div>           
                            <div class="control-group" id='sipUserNameDiv'>
                                <label class="control-label">
                                    <a style="color:#555555" href="#" rel="tooltip" title="User Name to be registered under" data-placement="top" data-delay: { show: 10, hide: 100 }>User Name</a>:</label>
                                <input id="sipUserName"  type="text" size="30"> 
                            </div>
                            <div class="accordion" id="accordion1">
                                <div class="accordion-group">
                                    <div class="accordion-heading">           
                                        <a class="accordion-toggle nav-header" data-toggle="collapse" data-parent="#accordion1" href="#security">
                                            Security
                                        </a>						 
                                    </div>
                                    <div id="security" class="accordion-body collapse">
                                        <div class="accordion-inner">
                                            <div class="control-group" id='sipLoginDiv'>
                                                <label class="control-label">
                                                    <a style="color:#555555" href="#" rel="tooltip" title="Login to authenticate" data-placement="top" data-delay: { show: 10, hide: 100 }>SIP Login</a>:</label>
                                                <input id="sipLogin"   type="text" size="30"> 
                                            </div>
                                            <div class="control-group" id='sipPasswordDiv'>
                                                <label class="control-label">
                                                    <a style="color:#555555" href="#" rel="tooltip" title="Password to authenticate" data-placement="top" data-delay: { show: 10, hide: 100 }>SIP Password</a>:</label>
                                                <input id="sipPassword"   type="password" size="30"> 
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-group">
                                    <div class="accordion-heading">           
                                        <a class="accordion-toggle nav-header" data-toggle="collapse" data-parent="#accordion1" href="#advancedSettings">
                                            Advanced Settings
                                        </a>						 
                                    </div>
                                    <div id="advancedSettings" class="accordion-body collapse">
                                        <div class="accordion-inner">
                                            <div class="control-group" id='stunServerDiv'>
                                                <label class="control-label" for="stunServer"><a style="color:#555555" href="#" rel="tooltip" title="Specify the IP Address and Port of a Stun Server" data-placement="top" data-delay: { show: 10, hide: 100 }>STUN server</a>:</label>
                                                <input id="stunServer"  type="text" size="30"> 
                                            </div>
                                            <div class="control-group" id='sipOutboundProxyDiv'>
                                                <label class="control-label"><a style="color:#555555" href="#" rel="tooltip" title="Specify the IP Address and Port of a WebSocket Server" data-placement="top" data-delay: { show: 10, hide: 100 }>Outbound Proxy</a> :</label>
                                                <input  id="sipOutboundProxy"  type="text" size="30"> 
                                            </div>							
                                        </div>
                                    </div>					    
                                </div>
                            </div>				
                            <div class="control-group" id ='input'>
                                <input id='Register' class="btn btn-primary" type='submit' name='Register' disabled="disabled" value='Register' onclick = "register();"/>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <input id='UnRegister' class="btn btn-primary" type='submit' name='UnRegister' value='UnRegister' disabled="disabled" onclick = "unRegister();"/>
                            </div>
                        </div>
                    </div><!--/.well -->
                </div><!--/span-->
                <div class="span7">
                    <div class="form-horizontal well">
                        <div>
                            <div class="nav-header">Communicate</div>		    				      
                            <p class="lead"> 
                            <div id='sipContactUriDiv'>
                                <div id='input'>
                                    Contact To Call: <input id="sipContactUri" type="text" size="60" class="input-xlarge focused" >					
                                    &nbsp;<input id='Call' class="btn btn-primary" type='submit' name='Call' value='Call' disabled="disabled" onclick = "call(document.getElementById('sipContactUri').value);"/>
                                    &nbsp;<input id='Bye' class="btn btn-primary" type='submit' name='Bye' value='Bye' disabled="disabled" onclick = "bye();"/>
                                    <div id='media'>
                                        <div id='over'>
                                            <video id="localVideoPreview" autoplay="autoplay" class="ui-widget-content" style="height:120px; width:160px; margin-top: 10px; margin-right: 600px; -webkit-transition-property: opacity;-webkit-transition-duration: 2s;"></video>  
                                        </div>
                                        <div id='resizable'>
                                            <video id="remoteVideo" onDblClick="toggleFullScreen();" width="640" height="480" autoplay="autoplay" style="margin-top: 10px;-webkit-transition-property: opacity; -webkit-transition-duration: 2s;"></video>  
                                        </div>						    
                                    </div>	
                                    <p><i>Double-Click the video to enter Full Screen mode </i></p>										  
                                </div>						
                            </div>    		        
                        </div>
                    </div>
                </div>			
            </div>


            <div class="modal hide fade" id="callModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-header">
                    <!--button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button-->
                    <h3 id="call_message">Incoming Call</h3>
                </div>	  
                <div class="modal-footer">
                    <button class="btn reject-btn" data-dismiss="modal" aria-hidden="true">Reject</button>
                    <button class="btn btn-primary accept-btn" data-dismiss="modal">Accept</button>
                </div>
            </div>

            <div class="modal hide fade" id="messageModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-header">
                    <!--button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button-->
                    <h3 id="modal_message">Incoming Call</h3>
                </div>	  
                <div class="modal-footer">
                    <button class="btn btn-primary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>

        <audio id="ringing" loop src="audio/ringing.wav" />

        <script src="js/jquery-1.7.2.min.js"></script>
        <script src="js/jquery-ui-1.8.23.custom.min.js"></script>	
        <script src="js/bootstrap.js"></script>
        <script src="js/bootstrap.min.js"></script>
        <script src="js/jain-sip.js" type="text/javascript"></script>
        <script src="js/MobicentsWebRTCPhone.js" type="text/javascript" ></script>
        <script type='text/javascript'>	
            
            var mobicentsWebRTCPhone=null; 
            var localAudioVideoMediaStream=null; // use when Google Chrome agent is detected
            var localAudioMediaStream=null; // use when Mozilla Firefox agent is detected
            var localVideoMediaStream=null; // use when Mozilla Firefox agent is detected
            
            // Default SIP profile    
            var sipOutboundProxy="ws://localhost:5082"
            var defaultStunServer="";
            var sipDomain="test.com";
            var sipDisplayName="Alice";
            var sipUserName="alice";
            var sipLogin=sipUserName+"@test.com";
            var sipPassword="1234";
            var sipContactUri="bob@test.com";
                       
            // retrieve SIP profile is provided in service URL
            if(location.search.length>0)
            {
                var argumentsString = location.search.substring(1);
                var arguments = argumentsString.split('&');
                if(arguments.length==0) arguments = [argumentsString];
                for(var i=0;i<arguments.length;i++)
                {   
                    var argument = arguments[i].split("=");
                    if("sipUserName"==argument[0])
                    {
                        sipUserName =argument[1];
                    } else if("sipDomain"==argument[0])
                    {
                        sipDomain =argument[1];
                    } else if("sipDisplayName"==argument[0])
                    {
                        sipDisplayName =argument[1];
                    } else if("sipPassword"==argument[0])
                    {
                        sipPassword =argument[1];
                    } else if("sipLogin"==argument[0])
                    {
                        sipLogin =argument[1];
                    }  else if("sipContactUri"==argument[0])
                    {
                        sipContactUri =argument[1];
                    }
                }
            }
            
            function onLoad()
            {
                console.debug("onLoad");
                document.getElementById("stunServer").value=defaultStunServer;
                document.getElementById("sipOutboundProxy").value=sipOutboundProxy;
                document.getElementById("sipDomain").value=sipDomain;
                document.getElementById("sipDisplayName").value=sipDisplayName;
                document.getElementById("sipUserName").value=sipUserName;
                document.getElementById("sipLogin").value=sipLogin;
                document.getElementById("sipPassword").value=sipPassword;
                document.getElementById("sipContactUri").value=sipContactUri;
                if(navigator.webkitGetUserMedia)
                    navigator.webkitGetUserMedia({audio:true, video:true},webkitGetUserMediaSuccess, webkitGetUserMediaError);
                else if(navigator.mozGetUserMedia)
                {
                    navigator.mozGetUserMedia({audio:true},mozGetUserAudioMediaSuccess, mozGetUserMediaError);
                }
            }

            function onBeforeUnload()
            {
                unRegister();
                for(var i=0;i<5000;i++)
                {
                    console.log("OnBeforeUnLoad()");  
                }     
            }
                 
            function webkitGetUserMediaSuccess (localStream) {
                try
                {
                    console.debug("webkitGetUserMediaSuccess localStream.id="+localStream.id);
                    if(localStream.getAudioTracks) console.debug("webkitGetUserMediaSuccess localStream.getAudioTracks()="+localStream.getAudioTracks());
                    else console.info("MediaStream:getAudioTracks() not supported")
                    if(localStream.getVideoTracks) console.debug("webkitGetUserMediaSuccess localStream.getVideoTracks()="+localStream.getVideoTracks());
                    else console.info("MediaStream:getVideoTracks() not supported")
                    localAudioVideoMediaStream=localStream;
                    document.getElementById("localVideoPreview").src=webkitURL.createObjectURL(localStream);
                    document.getElementById("localVideoPreview").play();
                    showRegisterButton();
                   
                }
                catch(exception)
                {
                    console.debug("mozGetUserMediaSuccess: catched exception: "+exception);
                    hideRegisterButton();
                }
            }
            
            
            function  webkitGetUserMediaError(code) 
            {
                console.debug("webkitGetUserMediaError");
                alert("Failed to get access to local media. Error code was " + code + ".");
            }	
    
            function mozGetUserVideoMediaSuccess (localStream) {
                try
                {
                    console.debug("mozGetUserVideoMediaSuccess localStream.id="+localStream.id);
                    if(localStream.getAudioTracks) console.debug("mozGetUserMediaSuccess: localStream.getAudioTracks()="+localStream.getAudioTracks());
                    else console.info("MediaStream:getAudioTracks() not supported")
                    if(localStream.getVideoTracks) console.debug("mozGetUserMediaSuccess: localStream.getVideoTracks()="+localStream.getVideoTracks());
                    else console.info("MediaStream:getVideoTracks() not supported")
                    localVideoMediaStream=localStream;
                    document.getElementById("localVideoPreview").mozSrcObject=localVideoMediaStream;
                    document.getElementById("localVideoPreview").play();
                    showRegisterButton();
                }
                catch(exception)
                {
                    console.debug("mozGetUserVideoMediaSuccess catched exception: "+exception);
                    hideRegisterButton();
                }
            }
            
            function mozGetUserAudioMediaSuccess (localStream) {
                try
                {
                    console.debug("mozGetUserAudioMediaSuccess localStream.id="+localStream.id);
                    if(localStream.getAudioTracks) console.debug("mozGetUserMediaSuccess: localStream.getAudioTracks()="+localStream.getAudioTracks());
                    else console.info("MediaStream:getAudioTracks() not supported")
                    if(localStream.getVideoTracks) console.debug("mozGetUserMediaSuccess: localStream.getVideoTracks()="+localStream.getVideoTracks());
                    else console.info("MediaStream:getVideoTracks() not supported")
                    localAudioMediaStream=localStream;
                    navigator.mozGetUserMedia({video:true},mozGetUserVideoMediaSuccess, mozGetUserMediaError);
                }
                catch(exception)
                {
                    console.debug("mozGetUserAudioMediaSuccess catched exception: "+exception);
                    hideRegisterButton();
                }
            }
                    

            function  mozGetUserMediaError(code) 
            {
                console.debug("mozGetUserMediaError");
                alert("Failed to get access to local media. Error code was " + code + ".");
            }	
           
    
    
            function register()
            {
                // enable notifications if not already done		
                if (window.webkitNotifications) {
                    window.webkitNotifications.requestPermission();
                }
                
                var configuration = {
                    stunServer:document.getElementById("stunServer").value,
                    sipOutboundProxy:document.getElementById("sipOutboundProxy").value,
                    sipDomain: document.getElementById("sipDomain").value,
                    sipDisplayName: document.getElementById("sipDisplayName").value,
                    sipUserName: document.getElementById("sipUserName").value,
                    sipLogin: document.getElementById("sipLogin").value,
                    sipPassword: document.getElementById("sipPassword").value,
                    localAudioVideoMediaStream:localAudioVideoMediaStream,
                    localAudioMediaStream:localAudioMediaStream,
                    localVideoMediaStream:localVideoMediaStream,
                    audioMediaFlag:true,
                    videoMediaFlag:true
                }
                mobicentsWebRTCPhone=new MobicentsWebRTCPhone(configuration);
            }

            function unRegister()
            {
                if(mobicentsWebRTCPhone!=null)
                {
                    mobicentsWebRTCPhone.unRegister();   
                }
            }

            function call(from,to)
            {   
                if(mobicentsWebRTCPhone!=null)
                {
                    mobicentsWebRTCPhone.call(from,to);
                }
            }


            function bye()
            {
                if(mobicentsWebRTCPhone!=null)
                {
                    mobicentsWebRTCPhone.byeCall();
                }
            }
                
                
            function hideCallButton()
            {
                var call=document.getElementById("Call");
                call.disabled=true;
            }
            
            function showCallButton()
            {
                var call=document.getElementById("Call");
                call.disabled=false;
            }
            
            function hideByeButton()
            {
                var bye=document.getElementById("Bye");
                bye.disabled=true;
            }
            
            function showByeButton()
            {
                var bye=document.getElementById("Bye");
                bye.disabled=false;
            }
            
            function showUnRegisterButton()
            {
                var unRegister=document.getElementById("UnRegister");
                unRegister.disabled=false;
            }
            
            function showRegisterButton()
            {
                var register=document.getElementById("Register");
                register.disabled=false;
            }
            function hideUnRegisterButton()
            {
                var unRegister=document.getElementById("UnRegister");
                unRegister.disabled=true;
            }
            
            function hideRegisterButton()
            {
                var register=document.getElementById("Register");
                register.disabled=true;
            }	
		
            function startRinging() {
                ringing.play(); 
            }

            function stopRinging() {
                ringing.pause();
            }
        </script>        
        <script>
            $(function() {
                $( "#resizable" ).resizable({
                    maxHeight: 640,
                    maxWidth: 480,
                    minHeight: 220,
                    minWidth: 160
                });
            });
            $(function() {
                $( "#localVideoPreview" ).draggable({ containment: "#media", scroll: false });
            });
	
            var videoElement = document.getElementById("remoteVideo");
    
            function toggleFullScreen() {
                if (!document.mozFullScreen && !document.webkitFullScreen) {
                    if (videoElement.mozRequestFullScreen) {
                        videoElement.mozRequestFullScreen();
                    } else {
                        videoElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                    }
                } else {
                    if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else {
                        document.webkitCancelFullScreen();
                    }
                }
            }
        </script>
    </body>
</html>	
