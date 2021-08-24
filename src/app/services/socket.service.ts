import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { CurrentUserService } from './currentuser.service';
import * as CryptoJS from 'crypto-js';
import { Subject, Observable } from 'rxjs';
import { HttpService } from './http.service';
import { constantApis } from '../constant/constantapis';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { constantMessages } from '../constant/app.contantmessages';
const patch = require('socketio-wildcard')(io.Manager);
import { CookieService } from 'ngx-cookie';
import { DeviceDetectorService } from 'ngx-device-detector';
import { msgStatusUpdateWeb } from '../interfaces/eventsObj';
import { Logger, Apm as apm } from '../utils/logger';
import { MessageService } from './message.service';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  online$: Subject<any> = new Subject<any>();
  qrMultiTenant$: Subject<any> = new Subject<any>();
  profileChange$: Subject<void> = new Subject<void>();
  qrSocket: any;
  socket: any;
  user: any = {};
  qrData: any = {};
  url: string = '';
  chatData: any = {};
  prod: boolean = environment.production;
  userPic: string = constantMessages.userPic;
  groupPic: string = constantMessages.groupPic;
  isEncryption: number = 0;
  isValidated: boolean = false;
  tenantId: string;
  isDisconnected: boolean = false;
  withoutAuthEvent: Array<string> = ['getSettings', 'checkVerifyUser', 'verifyGuest', 'verifyUser', 'ping', 'pong', 'disconnect', 'connect', 'qrdata', 'qrdataresponse', 'remove_user', 'remove_user_group']

  constructor(private _message: MessageService, private _currentUser: CurrentUserService, private _http: HttpService, private _toastr: ToastrService, private _router: Router, private _cookieService: CookieService, private _deviceService: DeviceDetectorService) {
    this.user = _currentUser.currentUser
    this.tenantId = this.user && this.user['activeTenant'] && this.user['activeTenant']._id || ''
    this.url = environment.url;
    _currentUser.getChatData().subscribe(chatData => {
      this.chatData = chatData;
    });
  }
  public online(): Observable<any> {
    return this.online$.asObservable();
  }
  public qrMultiTenantData(): Observable<any> {
    return this.qrMultiTenant$.asObservable();
  }
  public profileChange(): Observable<void> {
    return this.profileChange$.asObservable();
  }

  userConnect(): void {
    if (typeof this.socket != 'undefined')
      this.socket.close();
    if(typeof this.user == 'undefined'){
      this.user = this._currentUser.currentUser
      this.tenantId = this.user && this.user['activeTenant'] && this.user['activeTenant']._id || ''
    }
    this.isEncryption = 0;
    this.user = this._currentUser.currentUser
    if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
      // this._http.loginCall(constantApis.socketConnect, 'post', {userId: this.user['_id'],tenantId:  this.tenantId}).then(res => {
      //   console.log(new Date(), "success socket api call", res)
      this.isEncryption = this.user['isEncryption'];
      this.socket = io(environment.url + '/user?type=web&userId=' + this.user['_id'] + '&name=' + this.user['name'] + '&tenantId=' + this.tenantId, {
        forceNew: false,
        'reconnection delay': 3000,
        'reconnection limit': 100,
        transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],
        'secure': true,
        'max reconnection attempts': 'Infinity',
        'lang': 'th'
      });
      // console.log(new Date(), this.socket)
      patch(this.socket);
      // }).catch(err => {
      //   console.log(new Date(), "err at socket api call", err)
      // })      
    } else {
      if (typeof this.qrSocket != 'undefined')
        this.qrSocket.close();
      this.qrSocket = io(environment.url + '/user?type=web&userId=' + this.qrData['random'].replace(' ', ''), {
        forceNew: false,
        'reconnection delay': 3000,
        'reconnection limit': 100,
        transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],
        'secure': true,
        'max reconnection attempts': 'Infinity',
        'lang': 'th'
      });
      patch(this.qrSocket);
    }
    if (typeof this.qrSocket != 'undefined') {
      this.qrSocket.on('*', eventData => {
        if (eventData.data[0] == 'qrdata')
          this.qrdata(eventData.data[1])
      })
      this.qrSocket.on('connect', () => {
        console.log(new Date(), "qrSocket Connected")
        Logger.send("qrSocket Connected")
      });
      this.qrSocket.on('disconnect', () => {
        console.log(new Date(), "qrSocket Disconnected")
        Logger.send("qrSocket Disconnected")
      });
    }

    if (typeof this.socket != 'undefined') {
      this.socket.on('*', eventData => {
        let event: string = eventData.data[0]
        let data: any = eventData.data[1]
        const span = apm.startSpan(`${event} Event`,'socket-event');
        span?.addLabels({data:JSON.stringify(data)});
        if (this.isEncryption == 1 && !this.withoutAuthEvent.includes(event))
          data = this.decryption(this.user['token'], data)
        if (event == 'mobileToWebLogout')
          this.mobileToWebLogout(data)
        else if (event == 'checkVerifyUser')
          this.checkVerifyUser(data)
        else if (event == 'sc_typing')
          this.typing(data, true)
        else if (event == 'sc_stop_typing')
          this.typing(data, false)
        else if (event == 'group')
          this.group(data)
        else if (event == 'sc_mute_chat')
          this.sc_mute_chat(data)
        else if (event == 'sc_remove_message_everyone')
          this.sc_remove_message_everyone(data)
        else if (event == 'UpdateOnlineStatus')
          this.UpdateOnlineStatus(data)
        else if (event == 'sc_emitAllChatList_phone')
          this.sc_emitAllChatList_phone(data)
        else if (event == 'changeName')
          this.changeName(data)
        else if (event == 'changeProfileStatus')
          this.changeProfileStatus(data)
        else if (event == 'uploadImage')
          this.uploadImage(data)
        else if (event == 'sc_change_online_status')
          this.sc_change_online_status(data)
        else if (event == 'liveCall')
          this.audioLiveCalls(data)
        else if (event == 'sc_message_status_update' || event == 'sc_message_ack' || event == 'msgAck')
          this.msgStatusUpdate(data)
        else if (event == 'verifyUser')
          this.verifyUser(data)
        else if (event == 'unauthenticated')
          this.unauthenticated(data)
        else if (event == 'exitTenant')
          this.unauthenticated(data)
        else if (event == 'groupOnline')
          this.groupOnline(data)
        else if (event == 'callStatus')
          this.callStatus(data)
        // else if (event == 'suicide')
        //   this.suicide(data)
        else if (event == 'newMessage')
          this.newMessage(data)
        else if (event == 'clearChat')
          this.clearChat(data)
        else if (event == 'deleteChat')
          this.deleteChat(data)
        else if (event == 'deleteForMe')
          this.deleteForMe(data)
        else if (event == 'starredMessage')
          this.starredMessage(data)
        else if (event == 'messageAck')
          this.messageAck(data)
        else if (event == 'archiveMessage')
          this.archiveMessage(data)
        else if (event == 'unarchiveAll')
          this.unarchiveAll(data)
        else if (event == 'sc_oneToOneCalling')
          this.sc_oneToOneCalling(data)
        span.end()
      })
      this.socket.on('connect', () => {
        console.log(new Date(), "Socket Connected")
        this._message.messages = {}
        Logger.send("Socket Connected")
        const span = apm.startSpan("Socket Connected",'socket-event');
        if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
          // let bob = dh.createDiffieHellman(1024)
          // bob.generateKeys();
          // let publicKey = bob.getPublicKey()
          // console.log(new Date(), publicKey, "hello")
          console.log(new Date(), 'user connected', this.user['_id'], this.user['msisdn'], this.user['name'])
          let verifyObj = { _id: this.user['_id'], mode: 'web', device: 'web', name: this.user['name'], token: this.user['token']}
          let event = 'verifyGuest'  
          if(this.tenantId != ''){
            event = 'verifyUser';
            verifyObj['tenantId'] = this.tenantId 
          }
          this.emit(event, verifyObj)
        }
        span.end();
      });
      this.socket.on('disconnect', () => {
        const span = new Array();
        span[0] = apm.startSpan('Socket Disconnected','socket-event');
        console.log(new Date(), "Socket Disconnected")
        Logger.send("Socket Disconnected");
        this.isDisconnected = true;
        this.isValidated = false;
        if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
          console.log(new Date(), 'user diconnected', this.user['_id'], this.user['msisdn'])
          Logger.send('user diconnected',{userId:this.user._id,userMSISDN:this.user.msisdn,})
          span[1] = apm.startSpan('user disconnected')
          span[1]?.addLabels({ userId:this.user['_id'], userMsisdn: this.user['msisdn']});
          span[1].end();
        }
        span[0].end();
      });
    }
  }
  // suicide(data): void {
  //   console.log(new Date(), "suicide")
  //   this.socket.close()
  // }

  unauthenticated(data): void {
    const span = [];
    span[0] =  apm.startSpan('unauthenticated() called');
    this._currentUser.logout()
    span[1] = apm.startSpan('Emitting webLogout','socket-event');
    span[1]?.addLabels({input:JSON.stringify({from: this.user['_id']})});
    this.emitCallback('webLogout', {from: this.user['_id']}, data => {
      span[1]?.addLabels({output: JSON.stringify(data)});
      if (data.err != 0) {
        console.log(new Date(), 'err at weblogout event', data);
        apm.captureError(new Error('err at weblogout event'));
      }
      span[1].end();
    });
    this._router.navigate(['/web']);
    console.log(new Date(), data, "unauthenticated")
    Logger.send("unauthenticated",data)
    span[0].end();
  }
  verifyUser(data): void {
    const span:Array<Span> =[];
    span[0] = apm.startSpan('verifyUser() Called','socker-event');
    span[0]?.addLabels({input: JSON.stringify(data)});
    if (data.err == 0) {
      this.isValidated = true;
      console.log(new Date(), "user validated");
      apm.startSpan("user validated").end();
      this.emit('sc_change_status', { from: this.user['_id'], status: +localStorage.getItem('online') })
      if (this._currentUser.chatIds.length > 0)
        this.emit('sc_web_chatupdates', { data:this._currentUser.chatIds})
      // let mobiles = ['+917032652120', '+919989018761', '+918897985410', '+919603235703', '+918688985915', '+919966404606', '+919505550726', '+918712998558', '+918121230308', '+918523088073', '+919703636468', '+919618791583']
      // if (!mobiles.includes(this.user['msisdn']) && this.prod) {
      //   console.log(new Date(), this.user['_id'] )
      //   this.emitCallback('checkWebLoginStatus', { from: this.user['_id'] }, data => {
      //     console.log(new Date(), data, "checkWebLoginStatus")
      //     if (data.err == 2)
      //       this._router.navigate(['/check']);
      //     else if (data.err == 0) {
      //       console.log(new Date(), "Emit to get data")
      //       this.emit('sc_emitAllChatList_web', { from: this.user['_id'], tenantId: this.tenantId })
      //       this._router.navigate(['/chat']);
      //     } else {
      //       this._currentUser.logout();
      //       this._router.navigate(['/web']);
      //     }
      //   })
      // }      
    } else {
      this._currentUser.logout()
      this._router.navigate(['/web']);
      console.log(new Date(), data, "error at user validation")
      Logger.send("error at user validation",data)
      apm.captureError("error at user validation");
    }
    span[0].end();
  }
  checkVerifyUser(data): void {
    console.log(new Date(), data, "verify user failed")
    if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
      // let bob = dh.createDiffieHellman(1024)
      // bob.generateKeys();
      // let publicKey = bob.getPublicKey()
      // console.log(new Date(), publicKey, "hello")
      console.log(new Date(), 'user connected', this.user['_id'], this.user['msisdn'], this.user['name'])
      const {_id,msisdn,name} = this.user;
      Logger.send('user connected',{user:{_id,msisdn,name}})
      this.emit('verifyUser', { _id: this.user['_id'], mode: 'web', device: 'web', name: this.user['name'], token: this.user['token'], tenantId: this.tenantId })
    }
  }
  sc_oneToOneCalling(data): void {
    // callUUID: ""
  // codecs: "PCMU,PCMA"
  // doc_id: "5dbfc1c914a1c83967bdcef1-5e7630a1bdee537178d7e289-1597746158941"
  // err: "0"
  // event_type: "Register"
  // fromId: "5dbfc1c914a1c83967bdcef1"
  // fromMobileNumber: "+918790608029"
  // fromName: "Gouthami"
  // fromProfilePic: "./uploads/users/5dbfc1c914a1c83967bdcef1-1594904736687.png"
  // id: "1597746158941"
  // messagetype: "call"
  // os: ""
  // recordId: "5f3babeefcd462180311602c"
  // sip_ip: "192.168.75.165"
  // sip_password: "1234abcd"
  // sip_port: "5071"
  // sip_type: "TLS"
  // to: "5e7630a1bdee537178d7e289"
  // toMobileNumber: "+919493553919"
  // toName: "BalaKrishna"
  // toProfilePic: ""
  // toUserOnline: "false"
  // type: "single"
    console.log("sc_oneToOneCalling", data)
    Logger.send('sc_oneToOneCalling',data)

    // const callStr: string = JSON.stringify({
    //   callName: this.chatData['name'],
    //   callType: 10,
    //   host: 'You',
    //   callIcon: url + './' + data.fromProfilePic,
    //   convId: this.chatData['convId']
    // })
    // this.chatData['voipCall'] = true;
    // this._currentUser.setChatData(this.chatData)
    // this._voipCalling.isHold = false;
    // this._voipCalling.isMute = false;
    // localStorage.setItem('calling', btoa(unescape(encodeURIComponent(callStr))))
    // this._voipCalling.makeCall(this.chatData['from'], this.chatData['convId'])
  }
  starredMessage(data): void {
    // console.log(new Date(), data, "starredMessage")
    this._currentUser.setDeleteMessage({
      msgId: data.msgId,
      isStar: true,
      status: data['status']
    })
  }
  clearChat(data): void {
    // console.log(new Date(), data, "clearChat")
    if (data['convId'] == this.chatData['convId'])
      this._currentUser.setChatListData({ isClear: true, convId: data['convId'] })
    if(typeof this._message.messages[data['convId']] != 'undefined')
      delete this._message.messages[data['convId']]
  }
  unarchiveAll(data): void {
    // console.log(new Date(), data, "unarchiveAll")
    this._currentUser.setChatListData({ unarchiveAll: true })
  }
  archiveMessage(data): void {
    // console.log(new Date(), data, "archiveMessage")
    this._currentUser.setChatListData({ isArchive: true, convId: data['convId'], status: data['status'] })
  }
  deleteChat(data): void {
    // console.log(new Date(), data, "deleteChat")
    this._currentUser.deleteChats(data['convId'])
    if(typeof this._message.messages[data['convId']] != 'undefined')
      delete this._message.messages[data['convId']]
  }
  deleteForMe(data): void {
    // console.log(new Date(), data, "deleteForMe")
    this._currentUser.setDeleteMessage({
      msgId: data.msgId,
      msg: 'You deleted this message'
    })
    this._message.deleteMessage({convId: data['convId'], msgId: data.msgId, msg: 'You deleted this message'})
    this._currentUser.setChatListData({ isDeleteMsg: true, convId: data['convId'], msgId: data.msgId, msg: 'You deleted this message' })
  }
  newMessage(data): void {
    console.log(new Date(), data, "newMessage")
    Logger.send('newMessage',data)
    let convId, icon, name, isMine
    if (data['from'] == this.user['_id']) {
      convId = data.to
      icon = data.toAvatar
      name = data.toName
      isMine = '0'
    } else {
      convId = data.from
      icon = data.fromAvatar
      name = data.fromName
      isMine = '1'
    }
    this.pushChats(icon, name, convId, data.timestamp, data.converseId ? 3 : 1, data.type, data.payload, '', isMine, data['is_tag_applied'], data['tagged_users'], data.id, 0)
    if (this.chatData['convId'] == convId)
      this.newchat(data['contacts'], data['recordId'], data['from'], convId, data['timestamp'], data['doc_id'], data['type'], data['id'], data['thumb_url'], data['thumbnail'], data['filesize'], data.fromName, data['message'], data['width'], data['height'], data['is_tag_applied'], data['tagged_users'], data.link_details, data.reply_details, '', data.isForwarded)
    if (data['from'] != this.user['_id']) {
      let obj: msgStatusUpdateWeb = {
        from: this.user['_id'],
        type: 'single',
        groupId: data['from'],
        converseId: data['from'],
        msgId: [data['id']],
        status: (this.chatData['convId'] == data['from'] && localStorage.getItem('online') == '1' && this.chatData['posMax']) ? 5 : 4,
        tenantId: this.tenantId,
        msgFrom: data['from'],
        doc_id: data['doc_id']
      }
      this.emitCallback('msgStatusUpdateWeb', obj, res => {
        if (res.err == 0) {
        } else {
          console.log(new Date(), res, "err at msgStatusUpdateWeb event");
          Logger.send("err at msgStatusUpdateWeb event",res)
        }
      })
    }
  }
  newchat(contacts, _id, from, convId, timestamp, doc_id, type, id, thumb_url, thumbnail, filesize, DisplayName, message, width, height, is_tag_applied, tagged_users, link_details, reply_details, fromProfilePic, isForwarded) {
    let obj = {
      contacts: contacts,
      _id: _id,
      from: from,
      convId: convId,
      timestamp: timestamp,
      doc_id: doc_id,
      type: type,
      id: id,
      thumb_url: thumb_url,
      thumbnail: thumbnail,
      filesize: filesize,
      DisplayName: DisplayName,
      message: message,
      status: 1,
      width: width,
      height: height,
      is_tag_applied: is_tag_applied,
      reply_details: reply_details,
      tagged_users: tagged_users,
      link_details: link_details,
      payloadType: 0,
      ProfilePic: fromProfilePic,
      isForwarded: isForwarded
    }
    this._currentUser.setNewChats(obj)
    this._message.newChat(obj)
  }
  swapChats(grpId, payload, type, fromName, icon, time, groupName, is_tag_applied, tagged_users, msgId, is_broadcast) {
    let obj = {
      _id: grpId,
      payload: payload,
      new: fromName == 'You' ? false : true,
      type: type,
      fromMsg: fromName == 'You' ? '0' : '1',
      memName: fromName,
      timestamp: time,
      chatName: groupName,
      chatIcon: icon,
      is_tag_applied: is_tag_applied,
      tagged_users: tagged_users,
      isSwap: true,
      id: msgId,
      is_broadcast: is_broadcast
    }
    this._currentUser.setChatListData(obj)
  }
  pushChats(icon, name, id, time, chatType, type, payload, memName, isMine, is_tag_applied, tagged_users, msgId, is_broadcast) {
    let obj = {
      chatIcon: icon,
      chatName: name,
      _id: id,
      timestamp: time,
      message_status: "1",
      fromMsg: isMine,
      chatType: chatType,
      type: type,
      payload: payload,
      new: isMine == "0" ? false : true,
      id: msgId,
      isSwap: false,
      is_tag_applied: is_tag_applied,
      tagged_users: tagged_users,
      is_broadcast: is_broadcast
    }
    if (memName != '')
      obj['memName'] = memName
    this._currentUser.setChatListData(obj)
  }
  newGroupchat(convId, message, id, timestamp) {
    let obj = {
      convId: convId,
      message: message,
      payloadType: 1,
      from: this.chatData['from'],
      id: id,
      timestamp: timestamp
    }
    this._currentUser.setNewChats(obj)
    this._message.newChat(obj)
  }
  callStatus(data) {
    console.log(new Date(), data, "callStatus")
    Logger.send('callStatus',data)
    if (this.chatData['sidebar'] == 'call') {
      this._currentUser.setCallStatus(data)
    }
    if (data['status'] == 3) {
      if (localStorage.getItem('calling') != null) {
        let calling = JSON.parse(decodeURIComponent(escape(atob(localStorage.getItem('calling')))));
        if (calling['callId'] == data['callId']) {
          this._currentUser.setChatData({ sidebar: this.chatData['sidebar'], audioCall: true })
          localStorage.removeItem('calling');
          setTimeout(() => {
            this.chatData['audioCall'] = false;
            this._currentUser.setChatData(this.chatData)
          }, 1000)
        }
      }
    }
  }
  emit(event, data) {
    const span = apm.startSpan(`emit() EventName: ${event}`,'socket-emit');
    span?.addLabels({input: JSON.stringify(data),eventName:event});
    if (typeof this._currentUser.currentUser != 'undefined') {
      if (event == 'verifyUser' || event == 'verifyGuest' || this.isValidated) {
        if (this.isEncryption == 1 && !this.withoutAuthEvent.includes(event))
          data = this.encryption(this.user['token'], data)
        this.socket.emit(event, data);
      }
    } else {
      this._router.navigate(['/web']);
    }
    span.end();
  }

  emitCallback(event, data, callback) {
    const span = apm.startSpan(`emitCallback() EventName: ${event}`,'socket-emit-callback');
    span?.addLabels({input: JSON.stringify(data),eventName:event});
    if (typeof this._currentUser.currentUser != 'undefined') {
      if (this.isValidated) {
        if (this.isEncryption == 1 && !this.withoutAuthEvent.includes(event))
          data = this.encryption(this.user['token'], data)
        this.socket.emit(event, data, callbackData => {
          callback(callbackData)
        });
      }
    } else {
      this._router.navigate(['/web']);
    }
    span.end();
  }

  groupOnline(data): void {
    // console.log(new Date(), data, "groupOnline")
    if (data.err == 0 && this.chatData['convId'] == data.groupId)
      this.online$.next({single: false, count: data.onlineCount})
  }
  msgStatusUpdate(data): void {
    // console.log(new Date(), data, "msgStatusUpdate")
    if(!(data.from == this.user["_id"] && data.status != 3)){
      let from = data.from == this.user["_id"] ? data['to'] : data['from']
      this._currentUser.setChatListData({
        readStatus: true,
        convId: from,
        status: data.status,
        msgIds: data['msgIds']
      })
      if (this.chatData['convId'] == from) {
        this._currentUser.setMsgStatus(data)
      }
      if(typeof this._message.messages[from] != 'undefined'){
        this._message.msgStatus(data)
      }
    }    
  }
  messageAck(data): void {
    // console.log('messageAck', data)
    data.data.forEach(msg => {
      if(!(msg.from == this.user["_id"] && data.status != 3)){
        let from = msg.to == this.user["_id"] ? msg['from'] : msg['to']
        this._currentUser.setChatListData({
          readStatus: true,
          convId: from,
          status: data.status,
          msgIds: [msg['id']]
        })
        if (this.chatData['convId'] == from) {
          this._currentUser.setMsgStatus({
            to: msg['from'],
            from: msg['to'],
            status: data.status,
            msgIds: [msg['id']]
          })
        }
      }
    });
  }
  sc_change_online_status(data) {
    console.log(new Date(), data, "onlinestatus")
    Logger.send('onlinestatus',data)
    if (this.chatData['convId'] == data._id) {
      this.online$.next({
        single: true,
        lastSeen: data.DateTime,
        status: data.Status
      })
    }
    this._currentUser.setChatListData({
      onlineOffline: true,
      convId: data._id,
      status: data.Status,
    })
  }
  typing(data, isTyping) {
    // console.log(data, isTyping, "sc typing")
    if(data.from != this.user['_id']){
      let id = data.type == 'single' || data.type == 'support' ? data.from: data.convId
      if (this.chatData['convId'] == id) {
        this.chatData['typing'] = isTyping;
        this.chatData['Name'] = data['name'] || '';
        this._currentUser.setChatData(this.chatData);
      }
      data.isTyping = true;
      data.typing = isTyping
      if (data['type'] != 'group')
        data.convId = data['from'];
      this._currentUser.setChatListData(data);
    }
  }

  group(data) {
    console.log(new Date(), data, "group_message")
    Logger.send('group_message',data)
    if (data.groupType == 2) {
      let name = data.from == this.user['_id'] ? 'You' : data.fromName
      let payload = name + " changed this group's icon"
      let icon = data.avatar != '' ? this.url + './' + data.avatar : this.groupPic
      this.swapChats(data.groupId, payload, '7', name, icon, data.timestamp, '', 0, [], data['id'], data.is_broadcast);
      if (this.chatData['convId'] == data.groupId) {
        this.chatData['icon'] = icon;
        this._currentUser.setChatData(this.chatData)
        this.newGroupchat(data.groupId, payload, data['id'], data.timestamp);
      }
    } else if (data.groupType == 4) {
      if (data.removeId == this.user['_id']) {
        this._currentUser.deleteChats(data.groupId);
        this._toastr.info(data.fromName + ' removed you');
        this.emit('remove_user_group', { userId: data.groupId })
      } else {
        let name = data.from == this.user['_id'] ? 'You' : data.fromName
        if (this.chatData['convId'] == data.groupId) {
          this._currentUser.setGrpActions({
            type: 2,
            convId: data.groupId,
            memId: data.removeId
          })
          this.chatData['total'] = this.chatData['total'] - 1;
          this._currentUser.setChatData(this.chatData);
          this.newGroupchat(data.groupId, name + ' removed ' + data.removeName, data['id'], data.timestamp)
        }
        this.swapChats(data.groupId, name + ' removed ' + data.removeName, data.type, name, '', data.timestamp, '', 0, [], data['id'], data.is_broadcast);
      }
    } else if (data.groupType == 5) {
      let name = data.from == this.user['_id'] ? 'You' : data.fromName
      let payload = name + ' added ';
      data.createdToListsArr.forEach(created => {
        payload += created.Name + ', '
      });
      payload = payload.substring(0, (payload.length - 2));
      this.swapChats(data.groupId, payload, data.type, name, '', data.timestamp, '', 0, [], data['id'], data.is_broadcast);
      if (this.chatData['convId'] == data.groupId) {
        this._currentUser.setGrpActions({
          type: 3,
          convId: data.groupId,
          mems: data.createdToListsArr
        })
        this.chatData['total'] = this.chatData['total'] + data.createdToListsArr.length;
        this._currentUser.setChatData(this.chatData);
        this.newGroupchat(data.groupId, payload, data['id'], data.timestamp)
      }
    } else if (data.groupType == 6) {
      let name = data.from == this.user['_id'] ? 'You' : data.fromName
      let payload = name + " changed the subject from " + data.prev_name + ' to ' + data.groupName;
      if (this.chatData['convId'] == data.groupId) {
        this.chatData['name'] = data.groupName
        this._currentUser.setChatData(this.chatData)
        this.newGroupchat(data.groupId, payload, data['id'], data.timestamp)
        this._currentUser.setGrpActions({
          type: 4,
          convId: data.groupId,
          name: this.chatData['name']
        })
      }
      this.swapChats(data.groupId, payload, data.type, name, '', data.timestamp, data.groupName, 0, [], data['id'], data.is_broadcast);
    } else if (data.groupType == 7) {
      let payload = data.createdTo == this.user['_id'] ? 'You' : data.adminName
      if (data.make_admin_status == 'make_admin')
        payload += ' now an admin'
      else
        payload += ' no longer an admin'
      if (this.chatData['convId'] == data.groupId) {
        if (this.user['_id'] == data.createdTo) {
          this.chatData['is_admin'] = data.make_admin_status == 'make_admin'
          this._currentUser.setChatData(this.chatData)
        }
        this._currentUser.setGrpActions({
          type: 5,
          convId: data.groupId,
          memId: data.createdTo,
          isAdmin: data.make_admin_status == 'make_admin'
        })
        this.newGroupchat(data.groupId, payload, data['id'], data.timestamp)
      }
      this.swapChats(data.groupId, payload, data.type, data.from == this.user['_id'] ? 'You' : data.fromName, '', data.timestamp, '', 0, [], data['id'], data.is_broadcast);
    } else if (data.groupType == 8) {
      let name = data.from == this.user['_id'] ? 'You' : data.fromName
      let payload = name + ' Left';
      if (data.from == this.user['_id']) {
        this._currentUser.deleteChats(data.groupId);
        this._toastr.info(payload);
        this.emit('remove_user_group', { userId: data.groupId })
      } else {
        this.swapChats(data.groupId, payload, data.type, name, '', data.timestamp, '', 0, [], data['id'], data.is_broadcast);
        if (this.chatData['convId'] == data.groupId) {
          this._currentUser.setGrpActions({
            type: 6,
            convId: data.groupId,
            memId: data.from
          })
          this.newGroupchat(data.groupId, payload, data['id'], data['timestamp']);
          this.chatData['total'] = this.chatData['total'] - 1;
          this._currentUser.setChatData(this.chatData)
        }
      }
    } else if (data.groupType == 9) {
      let name = data.from == this.user['_id'] ? 'You' : data.fromName
      this.swapChats(data.groupId, data.payload, data.type, name, '', data.timestamp, '', data.is_tag_applied, data.tagged_users, data['id'], data.is_broadcast)
      let fromProfilePic = data.fromAvatar != undefined && data.fromAvatar != '' ? data.fromAvatar.substring(data.fromAvatar.indexOf("./uploads/")) : ''
      if (this.chatData['convId'] == data['groupId'])
        this.newchat(data['contacts'], data['recordId'], data['from'], data['groupId'], data['timestamp'], data['doc_id'], data['type'], data['id'], data['thumb_url'], data['thumbnail'], data['filesize'], data['fromName'], data['payload'], data['width'], data['height'], data['is_tag_applied'], data['tagged_users'], data['link_details'], data['reply_details'], fromProfilePic, data.isForwarded)
      if (this.user['_id'] != data['from']) {
        let obj: msgStatusUpdateWeb = {
          from: this.user['_id'],
          type: 'group',
          groupId: data['groupId'],
          msgId: [data['id']],
          status: (this.chatData['convId'] == data['groupId'] && localStorage.getItem('online') == '1' && this.chatData['posMax']) ? 5 : 4,
          tenantId: this.tenantId,
          msgFrom: data['from'],
          doc_id: data['doc_id']
        }
        this.emitCallback('msgStatusUpdateWeb', obj, res => {
          if (res.err == 0) {
          } else {
            console.log(new Date(), res, "err at msgStatusUpdateWeb event");
          }
        })
      }
    } else if (data.groupType == 1 || data.groupType == 10) {
      let payload;
      let name = data.from == this.user['_id'] ? 'You' : data.fromName
      if (typeof data.createdToListsArr != 'undefined') {
        payload = name + ' added ';
        data.createdToListsArr.forEach(created => {
          payload += created.Name + ', '
        });
        payload = payload.substring(0, (payload.length - 2));
      } else {
        payload = name + ' Created Group ' + data.groupName
      }
      this.pushChats(data.groupAvatar != '' ? this.url + '/' + data.groupAvatar : this.groupPic, data.groupName, data.groupId, data.timestamp, 2, data.type, payload, name, data['from'] == this.user['_id'] ? '0' : '1', 0, [], data['id'], data['is_broadcast'])
      let obj = {
        from: this.user['_id'],
        groupType: 10,
        groupName: data.groupName,
        groupId: data.groupId,
        timeStamp: data.timestamp,
        createdBy: data.from
      }
      this.emitCallback('group_callback', obj, data => {
        if (data.err == 0) {
          console.log(new Date(), "group creation socket joined")
          Logger.send('group creation socket joined',data)
        }
      })
    } else if (data.groupType == 12) {
      if (data.from == this.user['_id'] && data.status == 3) {
        this._currentUser.setChatListData({
          isRead: true,
          convId: data.groupId,
          msgId: data.msgId
        })
      }
    } else if (data.groupType == 19) {
      let msg = data.from == this.user['_id'] ? 'You deleted this message for all' : 'This message was deleted for all'
      if (this.chatData['convId'] == data['convId']) {
        this._currentUser.setDeleteMessage({
          from: data.convId,
          msgId: [data.id],
          msg: msg
        })
      }
      this._message.deleteMessage({convId: data['convId'], msgId: [data.id], msg: msg})
      this._currentUser.setChatListData({ isDeleteMsg: true, convId: data['convId'], msgId: [data.id], msg: msg })
    } else if (data.groupType == 22) {
      if (data.from == this.user['_id']) {
        this.pushChats(data.groupAvatar != '' ? this.url + '/' + data.groupAvatar : this.groupPic, data.groupName, data.groupId, data.timestamp, 2, data.type, 'You Joined', 'You', '0', 0, [], data['id'], data['is_broadcast'])
        let obj = {
          from: this.user['_id'],
          groupType: 10,
          groupName: data.groupName,
          groupId: data.groupId,
          timeStamp: data.timestamp,
          createdBy: data.from
        }
        this.emitCallback('group_callback', obj, data => {
          if (data.err == 0) {
            console.log(new Date(), "group creation socket joined")
            Logger.send('group creation socket joined',data)
          }
        })
      } else {
        let payload = data.fromName + ' added ';
        data.createdToListsArr.forEach(created => {
          payload += created.Name + ', '
        });
        payload = payload.substring(0, (payload.length - 2));
        this.swapChats(data.groupId, payload, data.type, data.fromName, '', data.timestamp, '', 0, [], data['id'], data.is_broadcast);
        if (this.chatData['convId'] == data.groupId) {
          this._currentUser.setGrpActions({
            type: 3,
            convId: data.groupId,
            mems: [{
              _id: data.from,
              Name: data.fromName,
              ProfilePic: data.fromPic
            }]
          })
          this.chatData['total'] = this.chatData['total'] + data.createdToListsArr.length;
          this._currentUser.setChatData(this.chatData);
          this.newGroupchat(data.groupId, payload, data['id'], data.timestamp)
        }
      }
    } else if (data.groupType == 25) {
      let payload = data.from == this.user['_id'] ? 'You changed ' : data.fromName + ' changed ';
      payload += data.is_broadcast == 1 ? 'Group to Broadcast Group' : 'Broadcast Group to Group'
      this.swapChats(data.groupId, payload, data.type, data.fromName, '', data.timestamp, '', 0, [], data['id'], data.is_broadcast);
      if (this.chatData['convId'] == data.groupId) {
        this.chatData['is_broadcast'] = data['is_broadcast'];
        this._currentUser.setChatData(this.chatData);
        this.newGroupchat(data.groupId, payload, data['id'], data.timestamp)
      }
    }
  }
  sc_mute_chat(data) {
    // console.log(new Date(), data,'sc_mute_chat')  
  }
  msgAck(data) {

  }
  changeName(data) {
    if (data.err == 0) {
      if (data.from == this.user['_id']) {
        this.user['name'] = data['name'];
        if (this._cookieService.getObject('site-globals') != undefined) {
          this._cookieService.putObject('site-globals', this.user, {
            storeUnencoded: false,
            expires: new Date(new Date().setDate(new Date().getDate() + 365)),
            secure: false
          });
        }
        this.profileChange$.next();
        this._toastr.success('Name Updated Successfully')
      } else {
        this._currentUser.setChatListData({ changeName: true, convId: data['from'], chatName: data['name'] })
        if (this.chatData['convId'] == data['from']) {
          this.chatData['name'] = data['name'];
          this._currentUser.setChatData(this.chatData);
        }
      }
    } else {
      console.log(new Date(), "Error At Changing name", data)
      Logger.send("Error At Changing name",data);
    }
  }
  changeProfileStatus(data) {
    if (data.err == 0) {
      if (data.from == this.user['_id']) {
        this.user['status'] = data['status'];
        if (this._cookieService.getObject('site-globals') != undefined) {
          this._cookieService.putObject('site-globals', this.user, {
            storeUnencoded: false,
            expires: new Date(new Date().setDate(new Date().getDate() + 365)),
            secure: false
          });
        }
        this.profileChange$.next()
        this._toastr.success('Status Updated Successfully')
      }
    } else {
      console.log(new Date(), "Error at changing Profile Status", data)
      Logger.send("Error at changing Profile Status",data);
    }
  }
  uploadImage(data) {
    if (data.err == 0) {
      if (data.from == this.user['_id']) {
        if (data.removePhoto == '') {
          this.user['profilePic'] = data.file;
          this._toastr.success("Profile Pic Added");
        }
        else {
          this.user['profilePic'] = '';
          this._toastr.success("Profile Pic Removed");
        }
        if (this._cookieService.getObject('site-globals') != undefined) {
          this._cookieService.putObject('site-globals', this.user, {
            storeUnencoded: false,
            expires: new Date(new Date().setDate(new Date().getDate() + 365)),
            secure: false
          });
        }
        this.profileChange$.next()
      } else {
        let profilePic = this.userPic;
        if (data.removePhoto == '')
          profilePic = this.url + '/' + data['file']
        this._currentUser.setChatListData({ changePic: true, convId: data['from'], chatIcon: profilePic })
        if (this.chatData['convId'] == data['from']) {
          this.chatData['icon'] = profilePic;
          this._currentUser.setChatData(this.chatData);
        }
      }
    } else {
      console.log(new Date(), "Error at Changing Profile Pic", data)
      Logger.send("Error at Changing Profile Pic",data);
    }
  }
  sc_remove_message_everyone(data) {
    // console.log(new Date(), data, 'sc_remove_message_everyone')
    let from = this.user['_id'] == data['from'] ? data['convId'] : data['from']
    let msg = data.from == this.user['_id'] ? 'You deleted this message' : 'This message was deleted';
    if (this.chatData['convId'] == from) {
      this._currentUser.setDeleteMessage({
        from: from,
        msgId: [data.id],
        msg: msg
      })
    }
    this._message.deleteMessage({convId: from, msgId: [data.msgId], msg: msg})
    this._currentUser.setChatListData({ isDeleteMsg: true, convId: from, msgId: [data.msgId], msg: msg })
  }

  UpdateOnlineStatus(data) {
    // console.log(new Date(), data, "UpdateOnlineStatus")
  }
  audioLiveCalls(data) {
    // console.log(new Date(), data, "audiolivecalls")
  }

  qrdata(data) {
    if (data.random && data.random == this.qrData['random']) {
      if (data._id && data.msisdn) {
        this._http.loginCall(constantApis.qrUserData, 'post', { msisdn: data.msisdn, userId: data._id }).subscribe(response => {
          //let res = JSON.parse(response._body)
          const user = response.user;
          user.tenants = response.tenants
          // DH Key for token starts


          // DH Key for token ends
          user.isEncryption = response.isEncryption
          if (user._id == data._id) {
            data.err = 0;
            data.browser_details = {
              ...this._deviceService.getDeviceInfo(),
              isMobile: this._deviceService.isMobile(),
              isTablet: this._deviceService.isTablet(),
              isDesktopDevice: this._deviceService.isDesktop(),
              loginTime: Date.now(),
              pic: './uploads/default/' + this._deviceService.getDeviceInfo().browser.toLowerCase() + '.png'
            }
            this.qrSocket.emit('qrdataresponse', data);
            if (user.tenants && user.tenants.length < 2) {
              user.activeTenant = user.tenants[0];
            }
            this._currentUser.SetCredentials(user);
            // else
            //   this.qrMultiTenant$.next({ user: user })
          } else {
            data.err = 1;
            this.qrSocket.emit('qrdataresponse', data);
          }
        });
      } else {
        data.err = 1;
        this.qrSocket.emit('qrdataresponse', data);
      }
    } else {
      data.err = 1;
      this.qrSocket.emit('qrdataresponse', data);
    }
  }
  mobileToWebLogout(data) {
    this._currentUser.logout();
    this._router.navigate(['/web']);
  }
  sc_emitAllChatList_phone(data) {
    console.log(new Date(), data, "mobiledata")
    Logger.send("mobiledata",data);
    // let mobiles = ['+917032652120', '+919989018761', '+918897985410', '+919603235703', '+918688985915', '+919966404606', '+919505550726', '+918712998558', '+918121230308', '+918523088073', '+919703636468', '+919618791583']
    // if (!mobiles.includes(this.user['msisdn']) && this.prod) {
    //   if (data.err == 0)
    //     this._currentUser.setChats(data.chats)
    // }
  }

  encryption(token: string, data: any): string {
    let sha256 = CryptoJS.algo.SHA256.create();
    sha256.update(token);
    let saltedpassword = sha256.finalize();
    let password_hash = saltedpassword.toString(CryptoJS.enc.Base64);
    let jsonEncode = JSON.stringify(data);
    let encrypted: string
    try {
      encrypted = CryptoJS.AES.encrypt(jsonEncode, password_hash).toString();
    } catch (e) {
      encrypted = '';
    }
    return encrypted;
  }

  decryption(token: string, data: string): any {
    let sha256 = CryptoJS.algo.SHA256.create();
    sha256.update(token);
    let saltedpassword = sha256.finalize();
    let password_hash = saltedpassword.toString(CryptoJS.enc.Base64);
    let enc: any
    try {
      enc = JSON.parse(CryptoJS.AES.decrypt(data, password_hash).toString(CryptoJS.enc.Utf8));
    } catch (e) {
      enc = {};
    }
    return enc;
  }

}
