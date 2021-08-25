import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { CurrentUserService } from './currentuser.service';
import * as CryptoJS from 'crypto-js';
import { Subject, Observable } from 'rxjs';
import { HttpService } from './http.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { constantMessages } from '../constant/app.contantmessages';
const patch = require('socketio-wildcard')(io.Manager);
import { CookieService } from 'ngx-cookie';
import { DeviceDetectorService } from 'ngx-device-detector';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  qrMultiTenant$: Subject<any> = new Subject<any>();
  socket: any;
  user: any = {};
  url: string = '';
  isEncryption: number = 0;
  isValidated: boolean = false;
  tenantId: string;
  isDisconnected: boolean = false;
  withoutAuthEvent: Array<string> = ['getSettings', 'checkVerifyUser', 'verifyGuest', 'verifyUser', 'ping', 'pong', 'disconnect', 'connect', 'qrdata', 'qrdataresponse', 'remove_user', 'remove_user_group']

  constructor(private _currentUser: CurrentUserService, private _http: HttpService, private _toastr: ToastrService, private _router: Router, private _cookieService: CookieService, private _deviceService: DeviceDetectorService) {
    this.user = _currentUser.currentUser
    this.tenantId = this.user && this.user['activeTenant'] && this.user['activeTenant']._id || ''
    this.url = environment.url;
  }
  userConnect(): void {
    if (typeof this.socket != 'undefined')
      this.socket.close();
    if (typeof this.user == 'undefined') {
      this.user = this._currentUser.currentUser
      this.tenantId = this.user && this.user['activeTenant'] && this.user['activeTenant']._id || ''
    }
    this.isEncryption = 0;
    this.user = this._currentUser.currentUser
    if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
      // this._http.loginCall(constantApis.socketConnect, 'post', {userId: this.user['_id'],tenantId:  this.tenantId}).then(res => {
      //   console.log(new Date(), "success socket api call", res)
      this.isEncryption = this.user['isEncryption'];
      this.socket = io(this.url + '/user?type=web&userId=' + this.user['_id'] + '&name=' + this.user['name'] + '&tenantId=' + this.tenantId, {
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
    }
    if (typeof this.socket != 'undefined') {
      this.socket.on('*', eventData => {
        console.log(eventData, "mmm")
        let event: string = eventData.data[0]
        let data: any = eventData.data[1]
        if (this.isEncryption == 1 && !this.withoutAuthEvent.includes(event))
          data = this.decryption(this.user['token'], data)
        if (event == 'mobileToWebLogout')
          this.mobileToWebLogout(data)
        else if (event == 'checkVerifyUser')
          this.checkVerifyUser(data)
        else if (event == 'verifyUser')
          this.verifyUser(data)
        else if (event == 'unauthenticated' || event == 'exitTenant')
          this.unauthenticated(data)
      })
      this.socket.on('verifyUser', data=> {console.log('ppp')})
      this.socket.on('connect', () => {
        console.log(new Date(), "Socket Connected")
        if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
          // let bob = dh.createDiffieHellman(1024)
          // bob.generateKeys();
          // let publicKey = bob.getPublicKey()
          // console.log(new Date(), publicKey, "hello")
          console.log(new Date(), 'user connected', this.user['_id'], this.user['msisdn'], this.user['name'])
          let verifyObj = { _id: this.user['_id'], mode: 'web', device: 'web', name: this.user['name'], token: this.user['token'] }
          let event = 'verifyGuest'
          if (this.tenantId != '') {
            event = 'verifyUser';
            verifyObj['tenantId'] = this.tenantId
          }
          console.log(verifyObj)
          this.emit(event, verifyObj)
        }
      });
      this.socket.on('disconnect', () => {
        console.log(new Date(), "Socket Disconnected")
        this.isDisconnected = true;
        this.isValidated = false;
        if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
          console.log(new Date(), 'user diconnected', this.user['_id'], this.user['msisdn'])
        }
      });
    }
  }

  unauthenticated(data): void {
    this._currentUser.logout()
    this.emitCallback('webLogout', { from: this.user['_id'] }, data => {
      if (data.err != 0) {
        console.log(new Date(), 'err at weblogout event', data);
      }
    });
    this._router.navigate(['/login']);
    console.log(new Date(), data, "unauthenticated")
  }
  verifyUser(data): void {
    if (data.err == 0) {
      this.isValidated = true;
      console.log(new Date(), "user validated");
    } else {
      this._currentUser.logout()
      this._router.navigate(['/login']);
      console.log(new Date(), data, "error at user validation")
    }
  }
  checkVerifyUser(data): void {
    console.log(new Date(), data, "verify user failed")
    if (typeof this.user != 'undefined' && typeof this.user['_id'] != 'undefined') {
      // let bob = dh.createDiffieHellman(1024)
      // bob.generateKeys();
      // let publicKey = bob.getPublicKey()
      // console.log(new Date(), publicKey, "hello")
      console.log(new Date(), 'user connected', this.user['_id'], this.user['msisdn'], this.user['name'])
      const { _id, msisdn, name } = this.user;
      this.emit('verifyUser', { _id: this.user['_id'], mode: 'web', device: 'web', name: this.user['name'], token: this.user['token'], tenantId: this.tenantId })
    }
  }

  emit(event, data) {
    if (typeof this._currentUser.currentUser != 'undefined') {
      if (event == 'verifyUser' || event == 'verifyGuest' || this.isValidated) {
        if (this.isEncryption == 1 && !this.withoutAuthEvent.includes(event))
          data = this.encryption(this.user['token'], data)
          console.log(event, "l")
        this.socket.emit(event, data);
      }
    } else {
      this._router.navigate(['/login']);
    }
  }

  emitCallback(event, data, callback) {
    if (typeof this._currentUser.currentUser != 'undefined') {
      if (this.isValidated) {
        if (this.isEncryption == 1 && !this.withoutAuthEvent.includes(event))
          data = this.encryption(this.user['token'], data)
          console.log("3")
        this.socket.emit(event, data, callbackData => {
          callback(callbackData)
        });
      }
    } else {
      this._router.navigate(['/login']);
    }
  }


  mobileToWebLogout(data) {
    this._currentUser.logout();
    this._router.navigate(['/login']);
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
