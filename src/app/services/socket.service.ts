import { Injectable } from '@angular/core';
import io from 'socket.io-client/dist/socket.io.slim.js';
import { CurrentUserService } from './currentuser.service';
import * as CryptoJS from 'crypto-js';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';
import { constantApis } from '../constant/constantapis';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { constantMessages } from '../constant/app.contantmessages';
import SocketWildcard from 'socketio-wildcard';
import { CookieService } from 'ngx-cookie';
import { DeviceDetectorService } from 'ngx-device-detector';
// import { MessageService } from './message.service';
import { take } from 'rxjs/operators';
// import { SwUpdate } from '@angular/service-worker';
// import { NotificationService } from './notification.service';
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
  url: string = environment.url;
  chatData: any = {};
  prod: boolean = environment.production;
  userPic: string = constantMessages.userPic;
  groupPic: string = constantMessages.groupPic;
  isEncryption: number = 0;
  tenantId: string;
  queuedEmit: { event: string; data: any }[] = []
  unsentMessages: any = {};
  socketInterval: any;
  queuedEmitCallBack: { event: string; data: any }[] = [];
  connection$ = new BehaviorSubject(0) // 0-Connecting, 1-connected, 2-reconnecting, 3-waiting for network 4-reconnected
  withoutAuthEvent: Array<string> = ['getSettings', 'checkVerifyUser', 'userVerify', 'ping', 'pong', 'disconnect', 'connect', 'qrdata', 'qrdataresponse', 'remove_user', 'remove_user_group']
  patch = SocketWildcard(io.Manager);

  constructor(
    // private readonly updates: SwUpdate, 
    // private _message: MessageService, 
    private _currentUser: CurrentUserService, private _http: HttpService, private _toastr: ToastrService, private _router: Router, private _cookieService: CookieService, private _deviceService: DeviceDetectorService, 
    // private _notificationService: NotificationService
    ) {
    this.user = _currentUser.currentUser
    this.tenantId = this.user && this.user['activeTenant'] && this.user['activeTenant']._id || ''
    // _currentUser.getChatData().subscribe(chatData => {
    //   this.chatData = chatData;
    // });
  }
  // public online(): Observable<any> {
  //   return this.online$.asObservable();
  // }
  // public qrMultiTenantData(): Observable<any> {
  //   return this.qrMultiTenant$.asObservable();
  // }
  // public profileChange(): Observable<void> {
  //   return this.profileChange$.asObservable();
  // }

  get connection(): number {
    return this.connection$.value;
  }
  set connection(value) {
    this.connection$.next(value);
  }

  userConnect(): void {
    if (typeof this.socket != 'undefined')
      this.socket.close();
    if (typeof this.user == 'undefined') {
      this.user = this._currentUser.currentUser
      this.tenantId = this.user && this.user['activeTenant'] && this.user['activeTenant']._id || ''
    }
    this.isEncryption = 0;
    if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
      this._currentUser.isOnline = true;
      // this._http.httpCall(constantApis.socketConnect, 'post', {userId: this.user['_id'],tenantId:  this.tenantId}).then(res => {
      //   console.log("success socket api call", res)
      this.isEncryption = this.user['isEncryption'];
      this.socket = io(environment.url + '/user?type=web&userId=' + this.user['_id'] + '&name=' + this.user['name'] + '&tenantId=' + this.tenantId, {
        // 'reconnection delay': 3000,
        // 'reconnection limit': 100,
        // transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],
        // 'secure': true,
        // 'max reconnection attempts': 'Infinity',
        // 'lang': 'th'
        forceNew: false,
        transports: ['websocket'],
        'secure': true,
        reconnection: false
      });
      // console.log(this.socket)
      this.patch(this.socket);
      this.socketInterval = setInterval(() => {
        console.log("socket connection retrying....")
        this.socket.io.connect()
      }, 3000)
      // }).catch(err => {
      //   console.log("err at socket api call", err)
      // })
    } else {
      if (typeof this.qrSocket != 'undefined')
        this.qrSocket.close();
      this.qrSocket = io(environment.url + '/user?type=web&userId=' + this.qrData['random'].replace(' ', ''), {
        'reconnection delay': 3000,
        'reconnection limit': 100,
        transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],
        'secure': true,
        'max reconnection attempts': 'Infinity',
        'lang': 'th'
      });
      this.patch(this.qrSocket);
    }
    // if (typeof this.qrSocket != 'undefined') {
    //   this.qrSocket.on('*', eventData => {
    //     if (eventData.data[0] == 'qrdata')
    //       this.qrdata(eventData.data[1])
    //   })
    //   this.qrSocket.on('connect', () => {
    //     console.log("qrSocket Connected")
    //   });
    //   this.qrSocket.on('disconnect', () => {
    //     console.warn("qrSocket Disconnected")
    //   });
    // }

    if (typeof this.socket != 'undefined') {
      this.socket.on('*', eventData => {
        const event: string = eventData.data[0]
        let data: any = eventData.data[1]
        // let socketTransaction = null;
        // if(event === 'groupOnline' || event === 'sc_change_online_status') {
        //   socketTransaction = null;
        // }else {
        //   socketTransaction = apm?.startTransaction(`SOCKET: ${event}`, 'socket', { managed: true });
        // }
        if (this.isEncryption == 1 && !this.withoutAuthEvent.includes(event))
          data = this.decryption(this.user['token'], data)
        // console.log(event, data)
        if (event == 'mobileToWebLogout')
          this.mobileToWebLogout(data)
        else if (event == 'checkVerifyUser')
          this.checkVerifyUser(data)
        // else if (event == 'sc_typing')
        //   this.typing(data, true)
        // else if (event == 'sc_stop_typing')
        //   this.typing(data, false)
        // else if (event == 'group')
        //   this.group(data)
        // else if (event == 'sc_mute_chat')
        //   this.sc_mute_chat(data)
        // else if (event == 'deleteMsgEveryone')
        //   this.deleteMsgEveryone(data)
        // else if (event == 'UpdateOnlineStatus')
        //   this.UpdateOnlineStatus(data)
        // else if (event == 'sc_emitAllChatList_phone')
        //   this.sc_emitAllChatList_phone(data)
        // else if (event == 'changeName')
        //   this.changeName(data)
        // else if (event == 'changeProfileStatus')
        //   this.changeProfileStatus(data)
        // else if (event == 'uploadImage')
        //   this.uploadImage(data)
        // else if (event == 'sc_change_online_status')
        //   this.sc_change_online_status(data)
        // else if (event == 'liveCall')
        //   this.liveCall(data)
        // else if (event == 'msgAck')
        //   this.msgAck(data)
        else if (event == 'userVerify')
          this.verifyUser(data)
        else if (event == 'unauthenticated' || event == 'exitTenant')
          this.unauthenticated(data)
        // else if (event == 'groupOnline')
        //   this.groupOnline(data)
        // else if (event == 'callStatus')
        //   this.callStatus(data)
        // else if (event == 'suicide')
        //   this.suicide(data)
        // else if (event == 'newMessage')
        //   this.newMessage(data)
        // else if (event == 'clearChat')
        //   this.clearChat(data)
        // else if (event == 'deleteChat')
        //   this.deleteChat(data)
        // else if (event == 'deleteForMe')
        //   this.deleteForMe(data)
        // else if (event == 'starredMessage')
        //   this.starredMessage(data)
        // else if (event == 'archiveMessage')
        //   this.archiveMessage(data)
        // else if (event == 'unarchiveAll')
        //   this.unarchiveAll(data)
        // else if (event == 'sc_new_oneToOneCalling')
        //   this.sc_new_oneToOneCalling(data)
        // else if (event == 'userOnlineStatus')
        //   this.userOnlineStatus(data)
        // else if (event == 'app_viop_addMember')
        //   this.app_viop_addMember(data)
        // else if (event == 'MemberStatus')
        //   this.MemberStatus(data)
        // else if (event == 'sc_new_oneToOneVideoCalling')
        //   this.sc_new_oneToOneVideoCalling(data)
        // else if (event == 'switchToVideo')
        //   this.switchToVideo(data)
        // else if (event == 'switchToVideoAck')
        //   this.switchToVideoAck(data)
        // else if (event == 'joinCall')
        //   this.joinCall(data)
        // socketTransaction?.end()
      })
      this.socket.on('connect', () => {
        console.log("Socket Connected")
        clearInterval(this.socketInterval)
        // this._message.messages = {}
        if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
          // let bob = dh.createDiffieHellman(1024)
          // bob.generateKeys();
          // let publicKey = bob.getPublicKey()
          // console.log(publicKey, "hello")
          console.log('user connected', this.user['_id'], this.user['msisdn'], this.user['name'])
          this.emit('userVerify', { _id: this.user['_id'], mode: 'web', device: 'web', name: this.user['name'], token: this.user['token'], tenantId: this.tenantId })
        }
      });
      this.socket.on('disconnect', () => {
        console.warn("Socket Disconnected")
        this.connection = 2;
        if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
          console.warn('user diconnected', this.user['_id'], this.user['msisdn'])
        }
        this.socket.io.disconnect();
        this.socketInterval = setInterval(() => {
          console.log("socket connection retrying....")
          this.socket.io.connect()
        }, 3000)
      });
    }
  }
  // suicide(data): void {
  //   console.log("suicide")
  //   this.socket.close()
  // }
  // switchToVideo(data): void {
  //   console.log('switch to video', data)
  //   this._currentUser.switchVideo = data.callId;
  // }
  // joinCall(data): void {
  //   console.log(data, "joinCall")
  //   if (typeof data.type != 'undefined') {
  //     if (data.type == 4) {
  //       if (data.status == 1 && this._currentUser.joinCallData.type == 1) {
  //         this._currentUser.callState = 2
  //         this._currentUser.setCalling(2);
  //         (document.getElementById('ringingClip') as HTMLAudioElement).play();
  //       } else if (data.status == 2) {
  //         if (data.from == this.user['_id'])
  //           document.getElementById('videoAnswerClose').click();
  //         (document.getElementById('ringingClip') as HTMLAudioElement)?.pause();
  //       } else if (data.status == 3 || data.status == 5 || data.status == 6) {
  //         (document.getElementById('ringingClip') as HTMLAudioElement)?.pause()
  //         this._currentUser.joinCallRejected = data
  //       }
  //     } else {
  //       this._currentUser.joinCall = data
  //       this.emitCallback('joinCall', {
  //         from: this.user['_id'],
  //         roomId: data.roomId,
  //         type: 4,
  //         status: 1
  //       }, data => {
  //         if (data.err == 1) {
  //           console.log("error at updating status of call joinCall event", data)
  //         }
  //       })
  //     }
  //   }
  // }
  // switchToVideoAck(data): void {
  //   console.log('switch to video ack', data)
  //   this._currentUser.switchVideoAck = data
  // }
  // sc_new_oneToOneVideoCalling(data): void {
  //   console.log("calling**** sc_new_oneToOneVideoCalling", data.callId)
  //   data.callType = 6
  //   if (this._currentUser.callAccess)
  //     this._currentUser.voipCall = data;
  //   this.emitCallback('freeswitch_invite', { callId: data.callId, userId: this.user['_id'], status: 1 }, data => {
  //     if (data.err != 0) {
  //       console.log(data, "err at freeswitch_invite evnt")
  //     }
  //   })
  // }
  // userOnlineStatus(data): void {
  //   if (data.length > 0) {
  //     data.forEach(user => {
  //       this._currentUser.setChatListData({
  //         onlineOffline: true,
  //         convId: user.id,
  //         status: user.status,
  //       })
  //     })
  //   }
  // }
  // MemberStatus(data): void {
  //   console.log(data, "MemberStatus")
  //   this._currentUser.setMemStatus(data)
  // }
  unauthenticated(data): void {
    this._currentUser.logout()
    this.emitCallback('webLogout', { from: this.user['_id'] }, data => {
      if (data.err != 0) {
        console.warn('err at weblogout event', data);
      }
    });
    console.warn(data, "unauthenticated")
  }
  verifyUser(data): void {
    // this._currentUser.os = data.OS;
    // this._currentUser.version = data.version
    if (data.err == 0) {
      console.log("user validated");
      this.connection = this.connection == 0 ? 1 : 4
      // if (this.connection == 1) {
      //   this.emit('sc_change_status', { from: this.user['_id'], status: this._currentUser.isOnline ? 1 : 0 })
      // }
      // if (this._currentUser.chatIds.length > 0)
      //   this.emit('sc_web_chatupdates', { data: this._currentUser.chatIds, status: false })
      // for (const id in this.unsentMessages) {
      //   const msg = this.unsentMessages[id]
      //   if (msg.data.type == '4') {
      //     const message = msg.data.payload
      //     const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
      //     const regexpURL = new RegExp(expression);
      //     message.match(regexpURL).map(url => {
      //       this.emitCallback('sc_get_url_metadata', { url }, data => {
      //         if (data.err == 0) {
      //           msg.data.link_details = {
      //             title: data['metadata'].title,
      //             description: data['metadata'].description,
      //             image: data['metadata'].image && data['metadata'].image != '' ? data['metadata'].image.substring(0, 4) == 'http' ? data['metadata'].image : data['metadata'].url + data['metadata'].image : '',
      //             url: data['metadata'].source
      //           }
      //           this.emitCallback(msg.event, msg.data, data => {
      //           })
      //         } else
      //           console.warn(data, 'err at sc_get_url_metadata event');
      //       });
      //     })
      //   } else {
      //     this.emitCallback(msg.event, msg.data, data => {
      //     })
      //   }
      // }
      // this.queuedEmitCallBack.forEach((msg, index) => {
      //   this.emitCallback(msg.event, msg.data, data => {
      //     this.queuedEmitCallBack.splice(index, 1)
      //   })
      // })
      // this.queuedEmit.forEach(event => {
      //   this.emit(event.event, event.data)
      // })
      this.emitCallback('getUserDetails', { userId: this.user['_id'] }, data => {
        if (data.err == 0) {
          console.log('get web version', data.webVersion);
          if (environment.production && data.webVersion != environment.version) {
            // emit updateWebVersion in production enviroment only
            this.emit('updateWebVersion', { userId: this.user._id, webVersion: environment.version });
          }
          // this._currentUser.groups = data.commonGroups
          // this._currentUser.archiveChats = data.archive
          this._currentUser.currentUser['name'] = data.Name
          this._currentUser.currentUser['status'] = data.Status
          this._currentUser.currentUser['profilePic'] = data.avatar
          this.profileChange$.next();
        } else {
          console.warn('err at getUserDetails event', data);
        }
      });
      this.emitCallback('getSettings', { userid: this.user._id }, res => {
        if (res.errNum == "0") {
          if (environment.production) {
            // show update toast in production enviroment only
            // res.data.web_build_version = next version
            // environment.version = client version
            console.log('#versions', 'CURRENT_VERSION', environment.version, 'LATEST_VERSION', res.data.web_build_version);
            // if (res.data.web_build_version != environment.version) {
            //   this.updates.available.subscribe(event => {
            //     if (res.data.web_isForcable == '1') {
            //       document.getElementById('openVersionUpdateModal').click()
            //     } else {
            //       this._toastr.info('PingWeb update available. Tap on this or refresh to update', 'New Update available', {
            //         disableTimeOut: true,
            //         tapToDismiss: false,
            //       })
            //         .onTap
            //         .pipe(take(1))
            //         .subscribe(() => this.toasterClickedHandler());
            //     }
            //   });

            // }
          }
          // this._currentUser.userSettings = res.data;
          // this._currentUser.callAccess = res.data.appCalling
        } else {
          console.warn('err at getting getSettings', res);
        }
      });

      // let mobiles = ['+917032652120', '+919989018761', '+918897985410', '+919603235703', '+918688985915', '+919966404606', '+919505550726', '+918712998558', '+918121230308', '+918523088073', '+919703636468', '+919618791583']
      // if (!mobiles.includes(this.user['msisdn']) && this.prod) {
      //   console.log(this.user['_id'] )
      //   this.emitCallback('checkWebLoginStatus', { from: this.user['_id'] }, data => {
      //     console.log(data, "checkWebLoginStatus")
      //     if (data.err == 2)
      //       this._router.navigate(['/check']);
      //     else if (data.err == 0) {
      //       console.log("Emit to get data")
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
      // this._router.navigate(['/web']);
      console.warn(data, "error at user validation")
    }
  }
  // toasterClickedHandler(): void {
  //   this.updates.activateUpdate().then(() => document.location.reload());
  // }
  checkVerifyUser(data): void {
    console.warn(data, "verify user failed")
    if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
      // let bob = dh.createDiffieHellman(1024)
      // bob.generateKeys();
      // let publicKey = bob.getPublicKey()
      // console.log(publicKey, "hello")
      console.log('user connected', this.user['_id'], this.user['msisdn'], this.user['name'])
      this.emit('userVerify', { _id: this.user['_id'], mode: 'web', device: 'web', name: this.user['name'], token: this.user['token'], tenantId: this.tenantId })
    }
  }
  // sc_new_oneToOneCalling(data): void {
  //   console.log("calling**** sc_new_oneToOneCalling", data.callId)
  //   if (this._currentUser.callAccess)
  //     this._currentUser.voipCall = data;
  //   setTimeout(() => {
  //     this.emitCallback('freeswitch_invite', { callId: data.callId, userId: this.user['_id'], status: 1 }, res => {
  //       if (res.err != 0) {
  //         console.log(res, "err at freeswitch_invite evnt")
  //       }
  //     })
  //   }, 3000)
  // }
  // starredMessage(data): void {
  //   // console.log(data, "starredMessage")
  //   if (this.requiredKeys(data, ['convId', 'msgId', 'status'], 'starredMessage')) {
  //     const { convId, msgId, status } = data;
  //     if (typeof msgId == 'string')
  //       this.setStarStatus(convId, msgId, status)
  //     else {
  //       convId.forEach((id, index) => {
  //         this.setStarStatus(id, [msgId[index]], status)
  //       });
  //     }
  //   }
  // }
  // setStarStatus(convId, msgId, status): void {
  //   const obj = {
  //     convId,
  //     msgId,
  //     isStar: true,
  //     status
  //   }
  //   if (this.chatData['convId'] == convId)
  //     this._currentUser.setDeleteMessage(obj)
  //   if (typeof this._message.messages[convId] != 'undefined')
  //     this._message.deleteMessage(obj)
  // }
  // clearChat(data): void {
  //   // console.log(data, "clearChat")
  //   if (this.requiredKeys(data, ['convId', 'star_status', 'type'], 'clearChat')) {
  //     const { convId, star_status, type } = data;
  //     const obj = {
  //       convId,
  //       isClear: true,
  //       isStar: star_status == 1
  //     }
  //     if (this.chatData['convId'] == convId)
  //       this._currentUser.setDeleteMessage(obj)
  //     if (typeof this._message.messages[convId] != 'undefined')
  //       delete this._message.messages[convId]
  //     this._currentUser.setChatListData({ isClear: true, convId, isStar: star_status == 1, type })
  //   }
  // }
  // unarchiveAll(data): void {
  //   // console.log(data, "unarchiveAll")
  //   this._currentUser.setChatListData({ unarchiveAll: true })
  // }
  // archiveMessage(data): void {
  //   // console.log(data, "archiveMessage")
  //   if (this.requiredKeys(data, ['convId', 'status', 'type'], 'archiveMessage')) {
  //     const { convId, status, type } = data;
  //     this._currentUser.setChatListData({ isArchive: true, convId, status, type })
  //   }
  // }
  // deleteChat(data): void {
  //   // console.log(data, "deleteChat")
  //   if (this.requiredKeys(data, ['convId'], 'deleteChat')) {
  //     const { convId } = data;
  //     this._currentUser.deleteChats(convId)
  //     if (typeof this._message.messages[convId] != 'undefined')
  //       delete this._message.messages[convId]
  //   }
  // }
  // deleteForMe(data): void {
  //   // console.log(data, "deleteForMe")
  //   if (this.requiredKeys(data, ['convId', 'msgId'], 'deleteForMe')) {
  //     const { convId, msgId } = data;
  //     this._currentUser.setDeleteMessage({
  //       msgId,
  //       msg: 'You deleted this message'
  //     })
  //     this._message.deleteMessage({ convId, msgId, msg: 'You deleted this message' })
  //     this._currentUser.setChatListData({ isDeleteMsg: true, convId, msgId, msg: 'You deleted this message' })
  //   }
  // }
  // newMessage(data): void {
  //   console.log("%c" + new Date() + "****" + JSON.stringify(data) + " newMessage ", "background: yellow; color: green")
  //   if (this.requiredKeys(data, ['doc_id', 'recordId', 'from', 'to', 'timestamp', 'type', 'id'], 'newMessage')) {
  //     const { original_filename, doc_id, contacts, recordId, from, to, toName, fromName, toAvatar, fromAvatar, thumb_url, thumbnail, filesize, timestamp, converseId, type, width, height, payload, is_tag_applied, tagged_users, id, isForwarded, link_details, reply_details } = data;
  //     let convId; let icon; let name; let isMine
  //     if (from == this.user['_id']) {
  //       convId = to
  //       icon = toAvatar
  //       name = toName || 'Anonymous'
  //       isMine = '0'
  //     } else {
  //       convId = from
  //       icon = fromAvatar
  //       name = fromName || 'Anonymous'
  //       isMine = '1'
  //     }
  //     this.pushChats(icon, name, convId, timestamp, converseId ? 3 : 1, type, payload, '', isMine, is_tag_applied, tagged_users, id, 0)
  //     this.newchat(original_filename, contacts, recordId, from, convId, timestamp, doc_id, type, id, thumb_url, thumbnail, filesize, fromName, payload, width, height, is_tag_applied, tagged_users, link_details, reply_details, '', isForwarded)
  //     if (from != this.user['_id']) {
  //       const obj: msgStatusUpdateWeb = {
  //         from: this.user['_id'],
  //         type: 'single',
  //         msgId: [id],
  //         status: (this.chatData['convId'] == from && this._currentUser.isOnline && this._currentUser.posMax) ? 5 : 4,
  //         tenantId: this.tenantId,
  //         msgFrom: from,
  //         doc_id
  //       }
  //       if (typeof converseId != 'undefined')
  //         obj.converseId = from;
  //       if (this.user['_id'] == '5d81c7bc869f607eb1b99c96' || this.user['_id'] == '5f33870e423e0e73c8e50945')
  //         console.log(this.chatData['convId'] == from, " current chat ", this._currentUser.isOnline, " online ", this._currentUser.posMax, " end chat")
  //       this.emitCallback('msgStatusUpdateWeb', obj, res => {
  //         if (res.err == 0) {
  //           console.log('staus update success')
  //         } else {
  //           console.warn(res, "err at msgStatusUpdateWeb event");
  //           apm.captureError("err at msgStatusUpdateWeb event, DATA: " + JSON.stringify(res));
  //         }
  //       })
  //     }
  //   }
  // }
  // callStatus(data) {
  //   console.log(data, "callStatus")
  //   if (this.requiredKeys(data, ['status', 'callId'], 'callStatus')) {
  //     const { status, callId } = data;
  //     if (this._router.url == '/audio') {
  //       this._currentUser.setCallStatus(data)
  //     }
  //     if (status == 3) {
  //       if (localStorage.getItem('calling') != null) {
  //         const calling = JSON.parse(decodeURIComponent(escape(atob(localStorage.getItem('calling')))));
  //         if (calling['callId'] == callId) {
  //           this._currentUser.setChatData({ call: true })
  //           localStorage.removeItem('calling');
  //           this._currentUser.setCalling(0);
  //           setTimeout(() => {
  //             this.chatData['call'] = false;
  //             this._currentUser.setChatData(this.chatData)
  //           }, 1000)
  //         }
  //       }
  //     }
  //   }
  // }
  // groupOnline(data): void {
  //   // console.log(data, "groupOnline")
  //   if (this.requiredKeys(data, ['err', 'groupId', 'onlineCount'], 'groupOnline')) {
  //     const { err, groupId, onlineCount } = data;
  //     if (err == 0 && this.chatData['convId'] == groupId)
  //       this.online$.next({ single: false, count: onlineCount })
  //   }
  // }
  // msgAck(data): void {
  //   console.log(data, "msgAck")
  //   if (['5d81c7bc869f607eb1b99c96', '5d81dbe6869f607eb1b9b117', '5d81df31869f607eb1b9b407', '5d81e49e869f607eb1b9bc7f'].includes(this.user['_id']))
  //     apm.captureError("msgAck, DATA: " + JSON.stringify(data));
  //   if (this.requiredKeys(data, ['from', 'status', 'type', 'msgIds'], 'msgAck')) {
  //     const { from, status, type, msgIds, groupId, to } = data;
  //     if (from == this.user['_id']) {
  //       this._currentUser.setChatListData({
  //         isRead: true,
  //         convId: type == 'group' ? groupId : to
  //       })
  //     } else {
  //       this._currentUser.setChatListData({
  //         readStatus: true,
  //         convId: from,
  //         status,
  //         msgIds
  //       })
  //       if (this.chatData['convId'] == from)
  //         this._currentUser.setMsgStatus(data)
  //       if (typeof this._message.messages[from] != 'undefined')
  //         this._message.msgStatus(data)
  //     }

  //   }
  // }
  // sc_change_online_status(data) {
  //   // console.log(data, "onlinestatus")
  //   // Logger.send('onlinestatus', data)
  //   if (this.requiredKeys(data, ['DateTime', 'Status', '_id'], 'sc_change_online_status')) {
  //     const { DateTime, Status, _id } = data;
  //     if (this.chatData['convId'] == _id) {
  //       this.online$.next({
  //         single: true,
  //         lastSeen: DateTime,
  //         status: Status
  //       })
  //     }
  //     this._currentUser.setChatListData({
  //       onlineOffline: true,
  //       convId: _id,
  //       status: Status
  //     })
  //   }
  // }
  // typing(data, isTyping) {
  //   // console.log(data, isTyping, "sc typing")
  //   if (this.requiredKeys(data, ['type'], 'typing')) {
  //     const { from, type, name, convId } = data;
  //     if (from != this.user['_id']) {
  //       const id = type == 'single' || type == 'support' ? from : convId
  //       if (this.chatData['convId'] == id) {
  //         this.chatData['typing'] = isTyping;
  //         this.chatData['Name'] = name || '';
  //         this._currentUser.setChatData(this.chatData);
  //       }
  //       data.isTyping = true;
  //       data.typing = isTyping
  //       if (data['type'] != 'group')
  //         data.convId = from;
  //       this._currentUser.setChatListData(data);
  //     }
  //   }
  // }

  // group(data) {
  //   console.log("%c" + new Date() + "****" + JSON.stringify(data) + " group ", "background: yellow; color: green")
  //   if (this.requiredKeys(data, ['groupType', 'groupId'], 'group')) {
  //     const { createdToLists, original_filename, contacts, recordId, isForwarded, id, doc_id, fromPic, is_broadcast, status, thumb_url, thumbnail, filesize, is_tag_applied, tagged_users, width, link_details, reply_details, height, msgId, groupType, groupPic, fromAvatar, payload, prev_name, adminName, make_admin_status, createdTo, createdToListsArr, avatar, groupAvatar, from, fromName, groupName, groupId, timestamp, type, removeId, removeName } = data;
  //     if (groupType != 12 && this.user['_id'] != from) {
  //       const obj: msgStatusUpdateWeb = {
  //         from: this.user['_id'],
  //         type: 'group',
  //         groupId,
  //         msgId: [id],
  //         status: (this.chatData['convId'] == groupId && this._currentUser.isOnline && this._currentUser.posMax) ? 5 : 4,
  //         tenantId: this.tenantId,
  //         msgFrom: from,
  //         doc_id
  //       }
  //       this.emitCallback('msgStatusUpdateWeb', obj, res => {
  //         if (res.err == 0) {
  //           console.log('staus update success')
  //         } else {
  //           console.warn(res, "err at msgStatusUpdateWeb event");
  //         }
  //       })
  //     }
  //     const icon = avatar != '' ? avatar : this.groupPic
  //     const name = from == this.user['_id'] ? 'You' : fromName
  //     const isMine = (groupType != 9 || from == this.user['_id']) ? '0' : '1'
  //     if (groupType == 2) {
  //       const payload = name + " changed this group's icon"
  //       const icon = avatar != '' ? this.url + './' + avatar : this.groupPic
  //       this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, 0, [], id, is_broadcast)
  //       this.newGroupchat(groupId, payload, id, timestamp, from);
  //       if (this.chatData['convId'] == groupId) {
  //         this.chatData['icon'] = icon;
  //         this._currentUser.setChatData(this.chatData)
  //       }
  //     } else if (groupType == 4) {
  //       if (removeId == this.user['_id']) {
  //         this._currentUser.deleteChats(groupId);
  //         this._toastr.info(fromName + ' removed you');
  //         this.emit('remove_user_group', { userId: groupId })
  //       } else {
  //         if (this.chatData['convId'] == groupId) {
  //           this._currentUser.setGrpActions({
  //             type: 2,
  //             convId: groupId,
  //             memId: removeId
  //           })
  //           this.chatData['total'] = this.chatData['total'] - 1;
  //           this._currentUser.setChatData(this.chatData);
  //         }
  //         const payload = name + ' removed ' + removeName;
  //         this.newGroupchat(groupId, payload, id, timestamp, from)
  //         this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, 0, [], id, is_broadcast)
  //       }
  //     } else if (groupType == 5) {
  //       const icon = groupAvatar != '' ? groupAvatar : this.groupPic
  //       let payload = name + ' added ';
  //       createdToListsArr.forEach(created => {
  //         payload += created.Name + ', '
  //       });
  //       payload = payload.substring(0, (payload.length - 2));
  //       this.newGroupchat(groupId, payload, id, timestamp, from)
  //       this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, 0, [], id, is_broadcast)
  //       if (this.chatData['convId'] == groupId) {
  //         this._currentUser.setGrpActions({
  //           type: 3,
  //           convId: groupId,
  //           mems: createdToListsArr
  //         })
  //         this.chatData['total'] = this.chatData['total'] + createdToListsArr.length;
  //         this._currentUser.setChatData(this.chatData);
  //       }
  //     } else if (groupType == 6) {
  //       const payload = name + " changed the subject from " + prev_name + ' to ' + groupName;
  //       if (this.chatData['convId'] == groupId) {
  //         this.chatData['name'] = groupName
  //         this._currentUser.setChatData(this.chatData)
  //         this._currentUser.setGrpActions({
  //           type: 4,
  //           convId: groupId,
  //           name: this.chatData['name']
  //         })
  //       }
  //       this.newGroupchat(groupId, payload, id, timestamp, from)
  //       this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, 0, [], id, is_broadcast)
  //     } else if (groupType == 7) {
  //       let payload = createdTo == this.user['_id'] ? 'You' : adminName
  //       if (make_admin_status == 'make_admin')
  //         payload += ' now an admin'
  //       else
  //         payload += ' no longer an admin'
  //       if (this.chatData['convId'] == groupId) {
  //         if (this.user['_id'] == createdTo) {
  //           this.chatData['is_admin'] = make_admin_status == 'make_admin'
  //           this._currentUser.setChatData(this.chatData)
  //         }
  //         this._currentUser.setGrpActions({
  //           type: 5,
  //           convId: groupId,
  //           memId: createdTo,
  //           isAdmin: make_admin_status == 'make_admin'
  //         })
  //       }
  //       this.newGroupchat(groupId, payload, id, timestamp, from)
  //       this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, 0, [], id, is_broadcast)
  //     } else if (groupType == 8) {
  //       const payload = name + ' Left';
  //       if (from == this.user['_id']) {
  //         this._currentUser.deleteChats(groupId);
  //         this._toastr.info(payload);
  //         this.emit('remove_user_group', { userId: groupId })
  //       } else {
  //         this.newGroupchat(groupId, payload, id, timestamp, from);
  //         this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, 0, [], id, is_broadcast)
  //         if (this.chatData['convId'] == groupId) {
  //           this._currentUser.setGrpActions({
  //             type: 6,
  //             convId: groupId,
  //             memId: from
  //           })
  //           this.chatData['total'] = this.chatData['total'] - 1;
  //           this._currentUser.setChatData(this.chatData)
  //         }
  //       }
  //     } else if (groupType == 9) {
  //       const icon = groupPic != '' ? groupPic : this.groupPic
  //       this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, is_tag_applied, tagged_users, id, is_broadcast)
  //       const fromProfilePic = fromAvatar != undefined && fromAvatar != '' ? fromAvatar.substring(fromAvatar.indexOf("./uploads/")) : ''
  //       this.newchat(original_filename, contacts, recordId, from, groupId, timestamp, doc_id, type, id, thumb_url, thumbnail, filesize, fromName, payload, width, height, is_tag_applied, tagged_users, link_details, reply_details, fromProfilePic, isForwarded)
  //     } else if (groupType == 1 || groupType == 10) {
  //       let payload;
  //       const icon = groupAvatar != '' ? (groupAvatar.substring(0, 4) == 'http' ? groupAvatar : this.url + './' + groupAvatar) : this.groupPic
  //       if (typeof createdToListsArr != 'undefined') {
  //         payload = name + ' added ';
  //         createdToListsArr.forEach(created => {
  //           payload += created.Name + ', '
  //         });
  //         payload = payload.substring(0, (payload.length - 2));
  //       } else
  //         payload = name + ' Created Group ' + groupName
  //       this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, 0, [], id, is_broadcast)
  //       const obj = {
  //         from: this.user['_id'],
  //         groupType: 10,
  //         groupName,
  //         groupId,
  //         timeStamp: timestamp,
  //         createdBy: from
  //       }
  //       this._currentUser.groups.push({
  //         avatar: groupAvatar,
  //         name: groupName,
  //         total: 2,
  //         _id: groupId
  //       })
  //       this.emitCallback('group', obj, data => {
  //         if (data.err == 0)
  //           console.log("group creation socket joined")
  //       })
  //     } else if (groupType == 22) {
  //       const icon = groupAvatar != '' ? this.url + './' + groupAvatar : this.groupPic
  //       if (from == this.user['_id']) {
  //         this.pushChats(icon, groupName, groupId, timestamp, 2, type, 'You Joined', 'You', '0', 0, [], id, is_broadcast)
  //         const obj = {
  //           from: this.user['_id'],
  //           groupType: 10,
  //           groupName,
  //           groupId,
  //           timeStamp: timestamp,
  //           createdBy: from
  //         }
  //         this._currentUser.groups.push({
  //           avatar: groupAvatar,
  //           name: groupName,
  //           total: 2,
  //           _id: groupId
  //         })
  //         this.emitCallback('group', obj, data => {
  //           if (data.err == 0) {
  //             console.log("group creation socket joined")
  //           }
  //         })
  //       } else {
  //         let payload
  //         if (createdToLists.length == 1 && createdToLists[0] == from) {
  //           payload = fromName + ' Joined'
  //         } else {
  //           payload = fromName + ' added ';
  //           createdToListsArr.forEach(created => {
  //             payload += created.Name + ', '
  //           });
  //           payload = payload.substring(0, (payload.length - 2));
  //         }
  //         this.newGroupchat(groupId, payload, id, timestamp, from)
  //         this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, 0, [], id, is_broadcast)
  //         if (this.chatData['convId'] == groupId) {
  //           this._currentUser.setGrpActions({
  //             type: 3,
  //             convId: groupId,
  //             mems: [{
  //               _id: from,
  //               Name: fromName,
  //               ProfilePic: fromPic
  //             }]
  //           })
  //           this.chatData['total'] = this.chatData['total'] + createdToLists.length;
  //           this._currentUser.setChatData(this.chatData);
  //         }
  //       }
  //     } else if (groupType == 25) {
  //       let payload = from == this.user['_id'] ? 'You changed ' : fromName + ' changed ';
  //       payload += is_broadcast == 1 ? 'Group to Broadcast Group' : 'Broadcast Group to Group'
  //       this.newGroupchat(groupId, payload, id, timestamp, from)
  //       this.pushChats(icon, groupName, groupId, timestamp, 2, type, payload, name, isMine, 0, [], id, is_broadcast)
  //       if (this.chatData['convId'] == groupId) {
  //         this.chatData['is_broadcast'] = is_broadcast;
  //         this._currentUser.setChatData(this.chatData);
  //       }
  //     }
  //   }
  // }
  // sc_mute_chat(data) {
  //   // console.log(data,'sc_mute_chat')
  // }
  // changeName(data) {
  //   if (this.requiredKeys(data, ['from', 'err', 'name'], 'changeName')) {
  //     const { from, err, name } = data;
  //     if (err == 0) {
  //       if (from == this.user['_id']) {
  //         this.user['name'] = name;
  //         this._currentUser.currentUser['name'] = this.user['name']
  //         this.profileChange$.next();
  //         this._toastr.success('Name Updated Successfully')
  //       } else {
  //         this._currentUser.setChatListData({ changeName: true, convId: from, chatName: name })
  //         if (this.chatData['convId'] == from) {
  //           this.chatData['name'] = name;
  //           this._currentUser.setChatData(this.chatData);
  //         }
  //       }
  //     } else {
  //       console.warn("Error At Changing name", data)
  //       apm.captureError("Error At Changing name, DATA: " + JSON.stringify(data));
  //     }
  //   }
  // }
  // changeProfileStatus(data) {
  //   if (this.requiredKeys(data, ['from', 'err', 'status'], 'changeProfileStatus')) {
  //     const { from, err, status } = data;
  //     if (err == 0) {
  //       if (from == this.user['_id']) {
  //         this.user['status'] = status;
  //         this._currentUser.currentUser['status'] = this.user['status']
  //         this.profileChange$.next()
  //         this._toastr.success('Status Updated Successfully')
  //       }
  //     } else {
  //       console.warn("Error at changing Profile Status", data)
  //       apm.captureError("Error at changing Profile Status, DATA: " + JSON.stringify(data));
  //     }
  //   }
  // }
  // uploadImage(data) {
  //   if (this.requiredKeys(data, ['from', 'err'], 'uploadImage')) {
  //     const { from, err, removePhoto, file } = data;
  //     if (err == 0) {
  //       if (from == this.user['_id']) {
  //         if (removePhoto == '') {
  //           this.user['profilePic'] = file;
  //           this._toastr.success("Profile Pic Added");
  //         }
  //         else {
  //           this.user['profilePic'] = '';
  //           this._toastr.success("Profile Pic Removed");
  //         }
  //         this._currentUser.currentUser['profilePic'] = this.user['profilePic']
  //         this.profileChange$.next()
  //       } else {
  //         let profilePic = this.userPic;
  //         if (removePhoto == '')
  //           profilePic = this.url + '/' + file
  //         this._currentUser.setChatListData({ changePic: true, convId: from, chatIcon: profilePic })
  //         if (this.chatData['convId'] == from) {
  //           this.chatData['icon'] = profilePic;
  //           this._currentUser.setChatData(this.chatData);
  //         }
  //       }
  //     } else {
  //       console.warn("Error at Changing Profile Pic", data)
  //       apm.captureError("Error at Changing Profile Pic, DATA:" + JSON.stringify(data));
  //     }
  //   }
  // }
  // deleteMsgEveryone(data) {
  //   // console.log(data, 'deleteMsgEveryone')
  //   if (this.requiredKeys(data, ['from', 'type', 'id'], 'deleteMsgEveryone')) {
  //     const { from, type, groupId, convId, id } = data;
  //     const frm = type == "group" ? groupId : (this.user['_id'] == from ? convId : from)
  //     const msg = from == this.user['_id'] ? 'You deleted this message for all' : 'This message was deleted for all';
  //     if (this.chatData['convId'] == frm) {
  //       this._currentUser.setDeleteMessage({
  //         from: frm,
  //         msgId: [id],
  //         msg
  //       })
  //     }
  //     this._notificationService.deleteMessage(id);
  //     this._message.deleteMessage({ convId: frm, msgId: [id], msg })
  //     this._currentUser.setChatListData({ isDeleteMsg: true, convId: frm, msgId: [id], msg })
  //   }
  // }
  // app_viop_addMember(data): void {
  //   this._currentUser.voipAddMem = data.callId
  //   this.emitCallback('callStatusAck', { callId: data.callId }, data => {
  //   })
  // }

  // UpdateOnlineStatus(data) {
  //   // console.log(data, "UpdateOnlineStatus")
  // }
  // liveCall(data) {
  //   console.log(data, "livecalls")
  // }

  // qrdata(data) {
  //   const span = apm?.startSpan('FUNCTION: qrdata()', 'function');
  //   // span?.addLabels({ parameters: JSON.stringify(data) })
  //   if (data.random && data.random == this.qrData['random']) {
  //     if (data._id && data.msisdn) {
  //       this._http.httpCall(constantApis.qrUserData, 'post', { msisdn: data.msisdn, userId: data._id }).subscribe(response => {
  //         //let res = JSON.parse(response._body)
  //         const user = response.user;
  //         user.tenants = response.tenants
  //         // DH Key for token starts


  //         // DH Key for token ends
  //         user.isEncryption = response.isEncryption
  //         if (user._id == data._id) {
  //           data.err = 0;
  //           data.browser_details = {
  //             ...this._deviceService.getDeviceInfo(),
  //             isMobile: this._deviceService.isMobile(),
  //             isTablet: this._deviceService.isTablet(),
  //             isDesktopDevice: this._deviceService.isDesktop(),
  //             loginTime: Date.now(),
  //             pic: './uploads/default/' + this._deviceService.getDeviceInfo().browser.toLowerCase() + '.png'
  //           }
  //           this.qrSocket.emit('qrdataresponse', data);
  //           if (user.tenants && user.tenants.length < 2) {
  //             user.activeTenant = user.tenants[0];
  //           }
  //           console.log("#qr event", data);
  //           this._currentUser.SetCredentials(user);
  //           // else
  //           //   this.qrMultiTenant$.next({ user: user })
  //         } else {
  //           data.err = 1;
  //           this.qrSocket.emit('qrdataresponse', data);
  //         }
  //       });
  //     } else {
  //       data.err = 1;
  //       this.qrSocket.emit('qrdataresponse', data);
  //     }
  //   } else {
  //     data.err = 1;
  //     this.qrSocket.emit('qrdataresponse', data);
  //   }
  //   span?.end()
  // }
  mobileToWebLogout(data) {
    this._currentUser.logout();
  }
  // sc_emitAllChatList_phone(data) {
  //   const span = apm?.startSpan('FUNCTION: sc_emitAllChatList_phone()', 'function');
  //   span?.addLabels({ parameters: JSON.stringify(data) })
  //   console.log(data, "mobiledata")
  //   // let mobiles = ['+917032652120', '+919989018761', '+918897985410', '+919603235703', '+918688985915', '+919966404606', '+919505550726', '+918712998558', '+918121230308', '+918523088073', '+919703636468', '+919618791583']
  //   // if (!mobiles.includes(this.user['msisdn']) && this.prod) {
  //   //   if (data.err == 0)
  //   //     this._currentUser.setChats(data.chats)
  //   // }
  //   span?.end()
  // }

  // newchat(original_filename, contacts, _id, from, convId, timestamp, doc_id, type, id, thumb_url, thumbnail, filesize, DisplayName, message, width, height, is_tag_applied, tagged_users, link_details, reply_details, fromProfilePic, isForwarded) {
  //   const obj = {
  //     contacts,
  //     _id,
  //     from,
  //     convId,
  //     timestamp,
  //     doc_id,
  //     type,
  //     id,
  //     thumb_url,
  //     thumbnail,
  //     filesize,
  //     DisplayName,
  //     message,
  //     status: "1",
  //     width,
  //     height,
  //     is_tag_applied,
  //     reply_details,
  //     tagged_users,
  //     link_details,
  //     payloadType: 0,
  //     ProfilePic: fromProfilePic,
  //     isForwarded,
  //     original_filename,
  //     accept: false,
  //     createdAt: new Date().toJSON()
  //   }
  //   if (this.chatData['convId'] == convId)
  //     this._currentUser.setNewChats(obj)
  //   this._message.newChat(obj)
  // }
  // pushChats(icon, name, id, time, chatType, type, payload, memName, isMine, is_tag_applied, tagged_users, msgId, is_broadcast) {
  //   const obj = {
  //     chatIcon: icon,
  //     chatName: name,
  //     _id: id,
  //     timestamp: time,
  //     message_status: "1",
  //     fromMsg: isMine,
  //     chatType,
  //     type,
  //     payload,
  //     new: isMine == "0" ? false : true,
  //     id: msgId,
  //     is_tag_applied,
  //     tagged_users,
  //     is_broadcast,
  //     accept: false
  //   }
  //   if (memName != '')
  //     obj['memName'] = memName
  //   this._currentUser.setChatListData(obj)
  // }
  // newGroupchat(convId, message, id, timestamp, from) {
  //   const obj = {
  //     convId,
  //     message,
  //     payloadType: 1,
  //     from,
  //     id,
  //     timestamp,
  //     createdAt: new Date().toJSON()
  //   }
  //   if (this.chatData['convId'] == convId)
  //     this._currentUser.setNewChats(obj)
  //   this._message.newChat(obj)
  // }

  encryption(token: string, data: any): string {
    const sha256 = CryptoJS.algo.SHA256.create();
    sha256.update(token);
    const saltedpassword = sha256.finalize();
    const password_hash = saltedpassword.toString(CryptoJS.enc.Base64);
    const jsonEncode = JSON.stringify(data);
    let encrypted: string
    try {
      encrypted = CryptoJS.AES.encrypt(jsonEncode, password_hash).toString();
    } catch (e) {
      encrypted = '';
    }
    return encrypted;
  }

  decryption(token: string, data: string): any {
    const sha256 = CryptoJS.algo.SHA256.create();
    sha256.update(token);
    const saltedpassword = sha256.finalize();
    const password_hash = saltedpassword.toString(CryptoJS.enc.Base64);
    let enc: any
    try {
      enc = JSON.parse(CryptoJS.AES.decrypt(data, password_hash).toString(CryptoJS.enc.Utf8));
    } catch (e) {
      enc = {};
    }
    return enc;
  }


  emit(event, data) {
    if (this.user && ['5d81c7bc869f607eb1b99c96', '5d81dbe6869f607eb1b9b117', '5f33870e423e0e73c8e50945'].includes(this.user['_id']))
      console.log("%c" + event + JSON.stringify(data) + "==========", "background: #87CEFA; color: green")
    if (event == 'userVerify' || this.connection == 1 || this.connection == 4) {
      if (this.isEncryption == 1 && !this.withoutAuthEvent.includes(event))
        data = this.encryption(this.user['token'], data)
      this.socket.emit(event, data);
    } else if (['uploadImage', 'changeName', 'changeProfileStatus'].includes(event))
      this._toastr.info('Please try again', event)
    // else if (['sc_stop_typing'].includes(event))
    //   this.queuedEmit.push({ event, data })
  }

  emitCallback(event, data, callback) {
    if (this.user && ['5d81c7bc869f607eb1b99c96', '5d81dbe6869f607eb1b9b117', '5f33870e423e0e73c8e50945'].includes(this.user['_id']))
      console.log("%c" + event + JSON.stringify(data) + "******", "background: #87CEFA; color: green")
    if (event == 'newMessage' || (event == 'group' && data.groupType == 9))
      this.unsentMessages[data.id] = { event, data }
    if (this.connection == 1 || this.connection == 4) {
      let encData;
      if (this.isEncryption == 1 && !this.withoutAuthEvent.includes(event))
        encData = this.encryption(this.user['token'], data)
      else
        encData = data
      this.socket.emit(event, encData, callbackData => {
        if (event == 'newMessage' || (event == 'group' && data.groupType == 9)) {
          if (callbackData.err == 0) {
            delete this.unsentMessages[data.id]
            // if (event == 'newMessage')
            //   this.newMessage(callbackData)
            // else if (event == 'group' && data.groupType == 9)
            //   this.group(callbackData)
          } else
            console.warn(`Error at event ${event}, DATA: ${JSON.stringify(data)}, ${JSON.stringify(callbackData)})}`)
        } else
          callback(callbackData)
      });
    } else {
      if (event == 'sc_get_url_metadata')
        callback({ err: 0, metadata: {} })
      else if (event == 'group' && data.groupType != 9)
        this._toastr.info("Please try again")
      else if (['msgStatusUpdateWeb'].includes(event)) {
        this.queuedEmitCallBack.push({ event, data })
        callback({ err: 0 })
      }
      else if (['getUserContacts'].includes(event)) {
        callback({ err: 1, data: 'socket disconnected' })
        this._toastr.info('Please try again')
      }
    }
  }

  requiredKeys(data, keys, event): boolean {
    let isExist = true
    keys.forEach(key => {
      if (data[key] == undefined)
        isExist = false
    });
    if (!isExist) {
      console.warn(`Error at listen event ${event}, DATA: ${JSON.stringify(data)}, keys ${JSON.stringify(keys)}`)
    }
    return isExist
  }
}
