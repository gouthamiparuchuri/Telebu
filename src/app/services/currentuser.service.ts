import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
// import { IUserSettings, reply } from '../interfaces/common';
@Injectable({
  providedIn: 'root'
})

export class CurrentUserService {
  // showVideoCall: boolean = false;
  currentUser: any = {};
  // chatIds: Array<string> = [];
  signedIn: boolean = true;
  isOnline: boolean;
  // os: string;
  // callAccess$ = new BehaviorSubject(false)
  // posMax: boolean = true;
  // version: string;
  // calling: any;
  // isAudioMute$ = new BehaviorSubject(false);
  // isVideoMute$ = new BehaviorSubject(false);
  // archiveChats: { single: string[]; group: string[] } = { single: [], group: [] };
  // private _voipCall$: Subject<any> = new Subject<any>();
  // private _joinCall$: Subject<any> = new Subject<any>();
  // private _switchVideo$: Subject<any> = new Subject<any>();
  // private _switchVideoAck$: Subject<any> = new Subject<any>();
  // private _voipAddMem$: Subject<any> = new Subject<any>();
  // private _chatListData$: Subject<any> = new Subject<any>();
  // private _chatData$: Subject<any> = new Subject<any>();
  // private _newChats$: Subject<any> = new Subject<any>();
  // private _msgStatus$: Subject<any> = new Subject<any>();
  // private _memStatus$: Subject<any> = new Subject<any>();
  // private _msgDelete$: Subject<any> = new Subject<any>();
  // private _callStatus$: Subject<any> = new Subject<any>();
  // private _grpActions$: Subject<any> = new Subject<any>();
  // private _mediaReply$: Subject<reply> = new Subject<reply>();
  private _authState$: Subject<any>;
  // private _isCalling$: Subject<number> = new Subject<number>();
  // private _userSettings$ = new BehaviorSubject<IUserSettings>(null);
  // private _starStatus$: Subject<any> = new Subject<any>();
  // private _joinCallRejected$: Subject<any> = new Subject<any>();
  // callState: number; // 1-dialing 2-ringing
  // joinCallData: any;
  // groups: object[] = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
  constructor(private _cookieService: CookieService) {
    const user: any = this.currentUser = _cookieService.getObject('site-globals');
    this._authState$ = new BehaviorSubject(this.currentUser)
  }
  // get isAudioMute(): boolean {
  //   return this.isAudioMute$.value;
  // }
  // set isAudioMute(value) {
  //   this.isAudioMute$.next(value);
  // }
  // get isVideoMute(): boolean {
  //   return this.isVideoMute$.value;
  // }
  // set isVideoMute(value) {
  //   this.isVideoMute$.next(value);
  // }
  // public get userSettings$(): Observable<IUserSettings> {
  //   return this._userSettings$.asObservable();
  // }

  // public get userSettings(): IUserSettings {
  //   return this._userSettings$.value;
  // }

  // public set userSettings(v: IUserSettings) {
  //   this._userSettings$.next(v);
  // }

  onAuthStateChange(): Observable<any> {
    return this._authState$.asObservable();
  }

  // get callAccess(): boolean {
  //   return this.callAccess$.value;
  // }
  // set callAccess(value) {
  //   this.callAccess$.next(value);
  // }

  public SetCredentials(user: any): void {
    const authdata = user['token'];
    this.currentUser = {
      name: user['Name'],
      profilePic: user['ProfilePic'],
      token: user['token'],
      msisdn: user['msisdn'],
      _id: user['_id'],
      status: user['Status'],
      tenants: user['tenants'],
      isEncryption: user['isEncryption'],
      activeTenant: user['activeTenant'],
      isLogging: user.isLogging
    };
    if (this.signedIn) {
      this._cookieService.putObject('site-globals', this.currentUser, {
        storeUnencoded: false,
        expires: new Date(new Date().setDate(new Date().getDate() + 365)),
        secure: false
      });
    }
    this._authState$.next(this.currentUser)
  };

  // public setChatData(chatData: any): void {
  //   this._chatData$.next(chatData);
  // }
  // public getChatData(): Observable<any> {
  //   return this._chatData$.asObservable();
  // }

  // public setNewChats(chats: any): void {
  //   this._newChats$.next(chats);
  // }
  // public getNewChats(): Observable<any> {
  //   return this._newChats$.asObservable();
  // }

  // public setMemStatus(mem: any): void {
  //   this._memStatus$.next(mem);
  // }
  // public getMemStatus(): Observable<any> {
  //   return this._memStatus$.asObservable();
  // }

  // public setCalling(call: number): void {
  //   this._isCalling$.next(call);
  // }
  // public getCalling(): Observable<number> {
  //   return this._isCalling$.asObservable();
  // }

  // get voipCall(): Observable<any> {
  //   return this._voipCall$.asObservable();
  // }
  // set voipCall(call: Observable<any>) {
  //   this._voipCall$.next(call);
  // }

  // get joinCall(): Observable<any> {
  //   return this._joinCall$.asObservable();
  // }
  // set joinCall(call: Observable<any>) {
  //   this._joinCall$.next(call);
  // }

  // get joinCallRejected(): Observable<any> {
  //   return this._joinCallRejected$.asObservable();
  // }
  // set joinCallRejected(call: Observable<any>) {
  //   this._joinCallRejected$.next(call);
  // }

  // get switchVideo(): Observable<any> {
  //   return this._switchVideo$.asObservable();
  // }
  // set switchVideo(call: Observable<any>) {
  //   this._switchVideo$.next(call);
  // }

  // get switchVideoAck(): Observable<any> {
  //   return this._switchVideoAck$.asObservable();
  // }
  // set switchVideoAck(call: Observable<any>) {
  //   this._switchVideoAck$.next(call);
  // }

  // get voipAddMem(): Observable<any> {
  //   return this._voipAddMem$.asObservable();
  // }
  // set voipAddMem(call: Observable<any>) {
  //   this._voipAddMem$.next(call);
  // }

  // public deleteChats(convId: string): void {
  //   this._chatListData$.next({
  //     isDelete: true,
  //     convId
  //   })
  // }

  // public setChatListData(data: any): void {
  //   this._chatListData$.next(data);
  // }
  // public getChatListData(): Observable<any> {
  //   return this._chatListData$.asObservable();
  // }

  // public setMsgStatus(data: any): void {
  //   this._msgStatus$.next(data);
  // }
  // public getMsgStatus(): Observable<any> {
  //   return this._msgStatus$.asObservable();
  // }

  // public setCallStatus(data: any): void {
  //   this._callStatus$.next(data);
  // }
  // public getCallStatus(): Observable<any> {
  //   return this._callStatus$.asObservable();
  // }

  // public setDeleteMessage(data: any): void {
  //   this._msgDelete$.next(data);
  // }
  // public getDeleteMessage(): Observable<any> {
  //   return this._msgDelete$.asObservable();
  // }

  // public setGrpActions(data: any): void {
  //   this._grpActions$.next(data);
  // }
  // public getGrpActions(): Observable<any> {
  //   return this._grpActions$.asObservable();
  // }

  // public setMediaReply(data: reply): void {
  //   this._mediaReply$.next(data);
  // }
  // public getMediaReply(): Observable<reply> {
  //   return this._mediaReply$.asObservable();
  // }

  // public setStarStatus(data: any): void {
  //   this._starStatus$.next(data);
  // }
  // public getStarStatus(): Observable<any> {
  //   return this._starStatus$.asObservable();
  // }

  public logout(): void {
    this._cookieService.remove('site-globals');
    localStorage.removeItem('calling');
    location.reload()
  }
}
