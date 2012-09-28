#! /bin/sh -x

rm -R build
mkdir build

cat ./src/main/javascript/gov/nist/core/GenericObject.js > ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/GenericObjectList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/NameValue.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/NameValueList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/DuplicateNameValueList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/HostPort.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/Host.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/Token.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/StringTokenizer.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core//LexerCore.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/ParserCore.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/HostNameParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/core/MessageDigestAlgorithm.js >> ./build/jain-sip.js

cat ./src/main/javascript/gov/nist/sip/address/GenericURI.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/address/UserInfo.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/address/Authority.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/address/TelephoneNumber.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/address/SipUri.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/address/AddressImpl.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/address/AddressFactoryImpl.js >> ./build/jain-sip.js

cat ./src/main/javascript/gov/nist/sip/header/SIPObject.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/SIPHeader.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/SIPHeaderList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ParametersHeader.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/RequestLine.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/UserAgent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ContentLength.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ExtensionHeaderImpl.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Server.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/AddressParametersHeader.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/From.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/To.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Reason.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ReasonList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Protocol.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Via.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Contact.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/MediaRange.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/AuthenticationHeader.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/WWWAuthenticate.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Route.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ProxyAuthenticate.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ProxyAuthorization.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/StatusLine.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Authorization.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Allow.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/RecordRoute.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/MaxForwards.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ContentType.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/TimeStamp.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ContentLength.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ContentDisposition.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/CallIdentifier.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/CallID.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/CSeq.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Supported.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/Expires.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ContactList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ViaList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/WWWAuthenticateList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/RouteList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ProxyAuthenticateList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/ProxyAuthorizationList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/AuthorizationList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/AllowList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/RecordRouteList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header//SupportedList.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/header/HeaderFactoryImpl.js >> ./build/jain-sip.js

cat ./src/main/javascript/gov/nist/sip/parser/Parser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/Lexer.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/HeaderParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ParametersParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/TokenTypes.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser//TokenNames.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/StringMsgParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/AddressParametersParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ChallengeParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/URLParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/AddressParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ToParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/FromParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/CSeqParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ViaParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ContactParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ContentTypeParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ContentLengthParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/AuthorizationParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser//WWWAuthenticateParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/CallIDParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/RouteParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser//RecordRouteParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser//ProxyAuthenticateParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser//ProxyAuthorizationParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/TimeStampParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/UserAgentParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/SupportedParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ServerParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/SubjectParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/MaxForwardsParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ReasonParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/RequestLineParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ExpiresParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/EventParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/StatusLineParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ContentDispositionParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/AllowParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/AllowEventsParser.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/ParserFactory.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/parser/WSMsgParser.js >> ./build/jain-sip.js

cat ./src/main/javascript/gov/nist/sip/message/MessageObject.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/message/ListMap.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/message/SIPMessage.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/message/MessageFactoryImpl.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/message/SIPRequest.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/message/SIPResponse.js >> ./build/jain-sip.js

cat ./src/main/javascript/gov/nist/sip/stack/HopImpl.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/SIPTransactionStack.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/SIPTransactionErrorEvent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/DefaultRouter.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/WSMessageChannel.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack//WSMessageProcessor.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/SIPDialog.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/SIPDialogErrorEvent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/SIPDialogEventListener.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/SIPTransaction.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/SIPClientTransaction.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/stack/SIPServerTransaction.js >> ./build/jain-sip.js

cat ./src/main/javascript/gov/nist/sip/Utils.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/EventWrapper.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/EventScanner.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/DialogTerminatedEvent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/DialogTimeoutEvent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/TransactionTerminatedEvent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/RequestEvent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/TimeoutEvent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/TransactionTerminatedEvent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/DefaultAddressResolver.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/ResponseEvent.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/ResponseEventExt.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/DialogFilter.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/ListeningPointImpl.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip//NistSipMessageFactoryImpl.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/SipProviderImpl.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/SipStackImpl.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/SipListener.js >> ./build/jain-sip.js
cat ./src/main/javascript/gov/nist/sip/SipFactory.js >> ./build/jain-sip.js


java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/DuplicateNameValueList.js -o ./build/DuplicateNameValueList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/GenericObject.js -o  ./build/GenericObject.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/GenericObjectList.js -o  ./build/GenericObjectList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/Host.js -o  ./build/Host.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/HostNameParser.js -o ./build/HostNameParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/HostPort.js -o  ./build/HostPort.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/LexerCore.js -o  ./build/LexerCore.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/MessageDigestAlgorithm.js -o  ./build/MessageDigestAlgorithm.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/NameValue.js -o  ./build/NameValue.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/NameValueList.js -o  ./build/NameValueList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/ParserCore.js -o  ./build/ParserCore.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/StringTokenizer.js -o  ./build/StringTokenizer.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/core/Token.js  -o  ./build/Token.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/address/AddressFactoryImpl.js -o  ./build/AddressFactoryImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/address/AddressImpl.js -o  ./build/AddressImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/address/Authority.js -o  ./build/Authority.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/address/GenericURI.js -o  ./build/GenericURI.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/address/SipUri.js -o  ./build/SipUri.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/address/TelephoneNumber.js -o  ./build/TelephoneNumber.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/address/TelURLImpl.js -o  ./build/TelURLImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/address/UserInfo.js -o  ./build/UserInfo.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/DefaultAddressResolver.js -o  ./build/DefaultAddressResolver.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/DialogFilter.js -o  ./build/DialogFilter.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/DialogTerminatedEvent.js -o  ./build/DialogTerminatedEvent.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/DialogTimeoutEvent.js -o  ./build/DialogTimeoutEvent.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/EventScanner.js -o  ./build/EventScanner.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/EventWrapper.js -o  ./build/EventWrapper.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/AddressParametersHeader.js -o  ./build/AddressParametersHeader.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Allow.js -o  ./build/Allow.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/AllowEvents.js -o  ./build/AllowEvents.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/AllowEventsList.js -o  ./build/AllowEventsList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/AllowList.js -o  ./build/AllowList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/AuthenticationHeader.js -o  ./build/AuthenticationHeader.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Authorization.js -o  ./build/Authorization.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/AuthorizationList.js -o  ./build/AuthorizationList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/CallID.js -o  ./build/CallID.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/CallIdentifier.js -o  ./build/CallIdentifier.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Challenge.js -o  ./build/Challenge.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Contact.js -o  ./build/Contact.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ContactList.js -o  ./build/ContactList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ContentDisposition.js -o  ./build/ContentDisposition.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ContentLength.js -o  ./build/ContentLength.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ContentType.js -o  ./build/ContentType.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/CSeq.js -o  ./build/CSeq.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Event.js -o  ./build/Event.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Expires.js -o  ./build/Expires.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ExtensionHeaderImpl.js -o  ./build/ExtensionHeaderImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/From.js -o  ./build/From.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/HeaderFactoryImpl.js -o  ./build/HeaderFactoryImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/MaxForwards.js -o  ./build/MaxForwards.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/MediaRange.js -o  ./build/MediaRange.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/NameMap.js -o  ./build/NameMap.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ParametersHeader.js -o  ./build/ParametersHeader.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Protocol.js -o  ./build/Protocol.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ProxyAuthenticate.js -o  ./build/ProxyAuthenticate.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ProxyAuthenticateList.js -o  ./build/ProxyAuthenticateList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ProxyAuthorization.js -o  ./build/ProxyAuthorization.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ProxyAuthorizationList.js -o  ./build/ProxyAuthorizationList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Reason.js -o  ./build/Reason.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ReasonList.js -o  ./build/ReasonList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/RecordRoute.js -o  ./build/RecordRoute.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/RecordRouteList.js -o  ./build/RecordRouteList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/RequestLine.js -o  ./build/RequestLine.min.js 
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Route.js -o  ./build/Route.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/RouteList.js -o  ./build/RouteList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Server.js -o  ./build/Server.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/SIPHeader.js -o  ./build/SIPHeader.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/SIPHeaderList.js -o  ./build/SIPHeaderList.min.js 
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/SIPObject.js -o  ./build/SIPObject.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/StatusLine.js -o  ./build/StatusLine.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Subject.js -o  ./build/Subject.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Supported.js -o  ./build/Supported.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/SupportedList.js -o  ./build/SupportedList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/TimeStamp.js -o  ./build/TimeStamp.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/To.js -o  ./build/To.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/UserAgent.js -o  ./build/UserAgent.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/Via.js -o  ./build/Via.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/ViaList.js -o  ./build/ViaList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/WWWAuthenticate.js -o  ./build/WWWAuthenticate.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/header/WWWAuthenticateList.js -o  ./build/WWWAuthenticateList.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/ListeningPointImpl.js -o  ./build/ListeningPointImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/message/ContentImpl.js -o  ./build/ContentImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/message/HeaderIterator.js -o  ./build/HeaderIterator.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/message/ListMap.js -o  ./build/ListMap.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/message/MessageFactoryImpl.js -o  ./build/MessageFactoryImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/message/MessageObject.js -o  ./build/MessageObject.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/message/MultipartMimeContentImpl.js -o  ./build/MultipartMimeContentImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/message/SIPMessage.js -o  ./build/SIPMessage.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/message/SIPRequest.js -o  ./build/SIPRequest.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/message/SIPResponse.js -o  ./build/SIPResponse.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/NistSipMessageFactoryImpl.js -o  ./build/NistSipMessageFactoryImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/AddressParametersParser.js -o  ./build/AddressParametersParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/AddressParser.js -o  ./build/AddressParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/AllowEventsParser.js -o  ./build/AllowEventsParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/AllowParser.js -o  ./build/AllowParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/AuthorizationParser.js -o  ./build/AuthorizationParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/CallIDParser.js -o  ./build/CallIDParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ChallengeParser.js -o  ./build/ChallengeParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ContactParser.js -o  ./build/ContactParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ContentDispositionParser.js -o  ./build/ContentDispositionParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ContentLengthParser.js -o  ./build/ContentLengthParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ContentTypeParser.js -o  ./build/ContentTypeParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/CSeqParser.js -o  ./build/CSeqParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/EventParser.js -o  ./build/EventParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ExpiresParser.js -o  ./build/ExpiresParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/FromParser.js -o  ./build/FromParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/HeaderParser.js -o  ./build/HeaderParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/Lexer.js -o  ./build/Lexer.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/MaxForwardsParser.js -o  ./build/MaxForwardsParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ParametersParser.js -o  ./build/ParametersParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ParseExceptionListener.js -o  ./build/ParseExceptionListener.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/Parser.js -o  ./build/Parser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ParserFactory.js -o  ./build/ParserFactory.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ProxyAuthenticateParser.js -o  ./build/ProxyAuthenticateParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ProxyAuthorizationParser.js -o  ./build/ProxyAuthorizationParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ReasonParser.js -o  ./build/ReasonParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/RecordRouteParser.js -o  ./build/RecordRouteParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/RequestLineParser.js -o  ./build/RequestLineParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/RouteParser.js -o  ./build/RouteParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ServerParser.js -o  ./build/ServerParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/SIPMessageListener.js -o  ./build/SIPMessageListener.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/StatusLineParser.js -o  ./build/StatusLineParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/StringMsgParser.js -o  ./build/StringMsgParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/SubjectParser.js -o  ./build/SubjectParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/SupportedParser.js -o  ./build/SupportedParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/TimeStampParser.js -o  ./build/TimeStampParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/TokenNames.js -o  ./build/TokenNames.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/TokenTypes.js -o  ./build/TokenTypes.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ToParser.js -o  ./build/ToParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/URLParser.js -o  ./build/URLParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/UserAgentParser.js -o  ./build/UserAgentParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/ViaParser.js -o  ./build/ViaParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/WSMsgParser.js -o  ./build/WSMsgParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/parser/WWWAuthenticateParser.js -o  ./build/WWWAuthenticateParser.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/RequestEvent.js -o  ./build/RequestEvent.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/ResponseEvent.js -o  ./build/ResponseEvent.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/ResponseEventExt.js -o  ./build/ResponseEventExt.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/SipFactory.js -o  ./build/SipFactory.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/SipListener.js -o  ./build/SipListener.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/SipProviderImpl.js -o  ./build/SipProviderImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/SipStackImpl.js -o  ./build/SipStackImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/DefaultRouter.js -o  ./build/DefaultRouter.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/HopImpl.js -o  ./build/HopImpl.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/SIPClientTransaction.js -o  ./build/SIPClientTransaction.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/SIPDialog.js -o  ./build/SIPDialog.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/SIPDialogErrorEvent.js -o  ./build/SIPDialogErrorEvent.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/SIPDialogEventListener.js -o  ./build/SIPDialogEventListener.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/SIPServerTransaction.js -o  ./build/SIPServerTransaction.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/SIPTransaction.js -o  ./build/SIPTransaction.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/SIPTransactionErrorEvent.js -o  ./build/SIPTransactionErrorEvent.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/SIPTransactionEventListener.js -o  ./build/SIPTransactionEventListener.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/SIPTransactionStack.js -o  ./build/SIPTransactionStack.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/WSMessageChannel.js -o  ./build/WSMessageChannel.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/stack/WSMessageProcessor.js -o  ./build/WSMessageProcessor.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/TimeoutEvent.js -o  ./build/TimeoutEvent.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/TransactionTerminatedEvent.js -o  ./build/TransactionTerminatedEvent.min.js
java -jar yuicompressor-2.4.7.jar  ./src/main/javascript/gov/nist/sip/Utils.js -o  ./build/Utils.min.js

cat ./build/GenericObject.min.js > ./build/jain-sip.min.js.temp
cat ./build/GenericObjectList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/NameValue.min.js >> ./build/jain-sip.min.js.temp
cat ./build/NameValueList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/DuplicateNameValueList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/HostPort.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Host.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Token.min.js >> ./build/jain-sip.min.js.temp
cat ./build/StringTokenizer.min.js >> ./build/jain-sip.min.js.temp
cat ./build/LexerCore.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ParserCore.min.js >> ./build/jain-sip.min.js.temp
cat ./build/HostNameParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/MessageDigestAlgorithm.min.js >> ./build/jain-sip.min.js.temp

cat ./build/GenericURI.min.js >> ./build/jain-sip.min.js.temp
cat ./build/UserInfo.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Authority.min.js >> ./build/jain-sip.min.js.temp
cat ./build/TelephoneNumber.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SipUri.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AddressImpl.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AddressFactoryImpl.min.js >> ./build/jain-sip.min.js.temp

cat ./build/SIPObject.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPHeader.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPHeaderList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ParametersHeader.min.js >> ./build/jain-sip.min.js.temp
cat ./build/RequestLine.min.js >> ./build/jain-sip.min.js.temp
cat ./build/UserAgent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ContentLength.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ExtensionHeaderImpl.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Server.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AddressParametersHeader.min.js >> ./build/jain-sip.min.js.temp
cat ./build/From.min.js >> ./build/jain-sip.min.js.temp
cat ./build/To.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Reason.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ReasonList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Protocol.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Via.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Contact.min.js >> ./build/jain-sip.min.js.temp
cat ./build/MediaRange.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AuthenticationHeader.min.js >> ./build/jain-sip.min.js.temp
cat ./build/WWWAuthenticate.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Route.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ProxyAuthenticate.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ProxyAuthorization.min.js >> ./build/jain-sip.min.js.temp
cat ./build/StatusLine.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Authorization.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Allow.min.js >> ./build/jain-sip.min.js.temp
cat ./build/RecordRoute.min.js >> ./build/jain-sip.min.js.temp
cat ./build/MaxForwards.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ContentType.min.js >> ./build/jain-sip.min.js.temp
cat ./build/TimeStamp.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ContentLength.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ContentDisposition.min.js >> ./build/jain-sip.min.js.temp
cat ./build/CallIdentifier.min.js >> ./build/jain-sip.min.js.temp
cat ./build/CallID.min.js >> ./build/jain-sip.min.js.temp
cat ./build/CSeq.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Supported.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Expires.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ContactList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ViaList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/WWWAuthenticateList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/RouteList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ProxyAuthenticateList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ProxyAuthorizationList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AuthorizationList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AllowList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/RecordRouteList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SupportedList.min.js >> ./build/jain-sip.min.js.temp
cat ./build/HeaderFactoryImpl.min.js >> ./build/jain-sip.min.js.temp

cat ./build/Parser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/Lexer.min.js >> ./build/jain-sip.min.js.temp
cat ./build/HeaderParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ParametersParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/TokenTypes.min.js >> ./build/jain-sip.min.js.temp
cat ./build/TokenNames.min.js >> ./build/jain-sip.min.js.temp
cat ./build/StringMsgParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AddressParametersParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ChallengeParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/URLParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AddressParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ToParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/FromParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/CSeqParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ViaParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ContactParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ContentTypeParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ContentLengthParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AuthorizationParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/WWWAuthenticateParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/CallIDParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/RouteParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/RecordRouteParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ProxyAuthenticateParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ProxyAuthorizationParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/TimeStampParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/UserAgentParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SupportedParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ServerParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SubjectParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/MaxForwardsParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ReasonParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/RequestLineParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ExpiresParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/EventParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/StatusLineParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ContentDispositionParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AllowParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/AllowEventsParser.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ParserFactory.min.js >> ./build/jain-sip.min.js.temp
cat ./build/WSMsgParser.min.js >> ./build/jain-sip.min.js.temp

cat ./build/MessageObject.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ListMap.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPMessage.min.js >> ./build/jain-sip.min.js.temp
cat ./build/MessageFactoryImpl.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPRequest.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPResponse.min.js >> ./build/jain-sip.min.js.temp

cat ./build/HopImpl.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPTransactionStack.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPTransactionErrorEvent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/DefaultRouter.min.js >> ./build/jain-sip.min.js.temp
cat ./build/WSMessageChannel.min.js >> ./build/jain-sip.min.js.temp
cat ./build/WSMessageProcessor.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPDialog.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPDialogErrorEvent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPDialogEventListener.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPTransaction.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPClientTransaction.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SIPServerTransaction.min.js >> ./build/jain-sip.min.js.temp

cat ./build/Utils.min.js >> ./build/jain-sip.min.js.temp
cat ./build/EventWrapper.min.js >> ./build/jain-sip.min.js.temp
cat ./build/EventScanner.min.js >> ./build/jain-sip.min.js.temp
cat ./build/DialogTerminatedEvent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/DialogTimeoutEvent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/TransactionTerminatedEvent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/RequestEvent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/TimeoutEvent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/TransactionTerminatedEvent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/DefaultAddressResolver.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ResponseEvent.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ResponseEventExt.min.js >> ./build/jain-sip.min.js.temp
cat ./build/DialogFilter.min.js >> ./build/jain-sip.min.js.temp
cat ./build/ListeningPointImpl.min.js >> ./build/jain-sip.min.js.temp
cat ./build/NistSipMessageFactoryImpl.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SipProviderImpl.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SipStackImpl.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SipListener.min.js >> ./build/jain-sip.min.js.temp
cat ./build/SipFactory.min.js >> ./build/jain-sip.min.js.temp

rm  -f ./build/*.min.js
mv ./build/jain-sip.min.js.temp ./build/jain-sip.min.js

