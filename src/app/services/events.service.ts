import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { ToastrService } from 'ngx-toastr';
import {
  newCall, getGroupContacts, getCallMembers, singleRedial,
  getUserContacts, group, getMediaByType, uploadImage,
  callDetails, NonScheduleCallUsers, getNonGroupContacts,
  deleteMsgEveryone, sc_typing, msgStatusUpdateWeb
} from '../interfaces/eventsObj';
import { newMessage, starredMessage, archiveMessage } from '../interfaces/common';
import * as ss from './socket.io-stream';
import { Logger, Apm as apm } from 'src/app/utils/logger';


@Injectable({
  providedIn: 'root'
})

export class EventsService {

  constructor(private _socket: SocketService, private _toastr: ToastrService) { }
  //chat events
  group(obj: group): Promise<any> {
    const span = apm.startSpan('group callback','socket-event');
    span?.addLabels({input:JSON.stringify(obj)});
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('group', obj, data => {
        span?.addLabels({output:JSON.stringify(data)});
        if (data.err == 0) {
          span?.addLabels({output:JSON.stringify(data)});
          resolve(data);
        } else {
          reject(data.msg)
          console.log(new Date(), data, 'err at group event');
          Logger.send('err at group event',data);
          apm.captureError(new Error('err at group event, data:'));
        }
        span.end();
      });
    });
  }
  sc_get_url_metadata(obj: { url: string }): Promise<any> {
    const span = apm.startSpan('sc_get_url_metadata()','socket-event');
    span?.addLabels({input:JSON.stringify(obj)});
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('sc_get_url_metadata', obj, data => {
        if (data.err == 0) {
          span?.addLabels({output:JSON.stringify(data)});
          resolve(data);
        } else {
          resolve({ metadata: {} });
          console.log(new Date(), data, 'err at sc_get_url_metadata event');
          apm.captureError(new Error('err at sc_get_url_metadata event'))
        }
        span.end();
      });
    });
  }
  deleteChat(obj: { from: string; convId: string; type: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('deleteChat', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at deleteChat');
        }
      });
    });
  }
  clearChat(obj: { from: string; convId: string; type: string, star_status: number }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('clearChat', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at clearChat');
          Logger.send('err at clearChat', data);
        }
      });
    });
  }
  groupsUnread(from: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('groupsUnread', { from }, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at groupsUnread');
          Logger.send('err at groupsUnread',data);
        }
      });
    });
  }
  unarchiveAll(from: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('unarchiveAll', { from }, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at unarchiveAll');
          Logger.send('err at unarchiveAll',data);
        }
      });
    });
  }
  archiveMessage(obj: archiveMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('archiveMessage', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at archiveMessage');
          Logger.send('err at archiveMessage',data);
        }
      });
    });
  }
  getUserContacts(data: getUserContacts): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getUserContacts', data, contacts => {
        if (contacts.err == 0) {
          resolve(contacts);
        } else {
          console.log(new Date(), contacts, 'err at getUserContacts event');
          Logger.send('err at getUserContacts event',contacts);
        }
      });
    });
  }
  fileUpload(obj: { file?: File; fileName: string; type: number; buffer?: string; convId?: string; chatType?: number }): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const stream = ss.createStream();
        const streamObj = obj.type == 1 ? { size: obj.file.size, ImageName: obj.fileName, type: obj.file.type } : { ImageName: obj.fileName };
        ss(this._socket.socket).emit('fileUpload', stream, streamObj);
        if (obj.type == 1) {
          ss.createBlobReadStream(obj.file).pipe(stream);
        }
        else {
          fetch(obj.buffer)
            .then(res => res.blob())
            .then(blob => {
              ss.createBlobReadStream(new File([blob], obj.fileName, blob)).pipe(stream);
            });
        }
        stream.on('finish', () => {
          console.log('File upload finished');
          Logger.send('File upload finished');
          resolve({ convId: obj.convId, chatType: obj.chatType });
        });
      } catch (err) {
        console.log(err);
      }
    });
  }
  getGroupContacts(obj: getGroupContacts): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getGroupContacts', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at getGroupContacts event');
          Logger.send('err at getGroupContacts event',data);
        }
      });
    });
  }
  getMediaByType(obj: getMediaByType): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getMediaByType', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at getMediaByType event');
          Logger.send('err at getMediaByType event',data);
        }
      });
    });
  }
  getGroupInfo(obj: { from: string; groupId: string; }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getGroupInfo', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at GroupInfo');
          Logger.send('err at GroupInfo',data);
        }
      });
    });
  }
  getUserLastSeen(obj: { from: string; to: string; converseId?: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getUserLastSeen', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at getUserLastSeen');
          Logger.send('err at getUserLastSeen',data);
        }
      });
    });
  }
  updateDelivery(obj: { from: string; tenantId: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('updateDelivery', obj, data => {
        if (data != null && data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at updateDelivery event', data);
          Logger.send('err at updateDelivery',data);
        }
      });
    });
  }
  webLogout(obj: { from: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('webLogout', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at weblogout event', data);
          Logger.send('err at weblogout event',data);
        }
      });
    });
  }
  resetGroupLink(obj: { from: string; groupId: string; }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('resetGroupLink', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at resetGroupLink event', data);
          Logger.send('err at resetGroupLink event',data);
        }
      });
    });
  }
  unstarAll(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('unstarAll', { from: userId }, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at unstarAll event', data);
          Logger.send('err at unstarAll event',data);
        }
      });
    });
  }
  getUserDetails(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getUserDetails', { userId }, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at getUserDetails event', data);
          Logger.send('err at getUserDetails event',data);
        }
      });
    });
  }
  getStarredMsgs(from: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getStarredMsgs', { from }, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at getStarredMsgs event', data);
          Logger.send('err at getStarredMsgs event',data);
        }
      });
    });
  }
  starredMessage(obj: starredMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('starredMessage', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at starredMessage event', data);
          Logger.send('err at starredMessage event',data);
        }
      });
    });
  }
  deleteMsgEveryone(obj: deleteMsgEveryone): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('deleteMsgEveryone', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at deleteMsgEveryone event', data);
          Logger.send('err at deleteMsgEveryone event',data);
        }
      });
    });
  }
  makeRead(obj: { from: string; convId: string; type: string; }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('makeRead', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at makeRead event', data);
          Logger.send('err at makeRead event',data);
        }
      });
    });
  }
  msgStatusUpdateWeb(obj: msgStatusUpdateWeb): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('msgStatusUpdateWeb', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at msgStatusUpdateWeb event', data);
          Logger.send('err at msgStatusUpdateWeb event',data);
        }
      });
    });
  }
  deleteForMe(obj: { from: string, recordId: string[], type: string, msgId: string[] }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('deleteForMe', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at deleteForMe event', data);
          Logger.send('err at deleteForMe event',data);
        }
      });
    });
  }
  newMessage(obj: newMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('newMessage', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          reject(data.msg)
          console.log(new Date(), 'err at newMessage event', data);
          Logger.send('err at newMessage event',data);
        }
      });
    });
  }



  //pstn and voip call events
  
  getCallMembers(obj: getCallMembers): Promise<any> {
    return new Promise((resolve, reject) => {
      let event = obj.callType == 3 ? 'app_getCallMembers' : 'getCallMembers'
      delete obj.callType;
      this._socket.emitCallback(event, obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(`${new Date()} Error At ${event} event ${data}`);
          Logger.send('err at getCallMembers event',data);
        }
      });
    });
  }
  newCall(data: newCall): Promise<any> {
    return new Promise((resolve, reject) => {
      let event = data.callType == 3 ? 'app_newCall' : 'newCall'
      delete data.callType;
      this._socket.emitCallback(event, data, res => {
        if (res.err == 0) {
          resolve(res);
        } else {
          console.log(`${new Date()} ${res} err at ${event} event`);
          Logger.send('err at newCall event',data);
          this._toastr.error(res.message);
        }
      });
    });
  }
  singleMuteUnmute(obj: { callId: string; phNumber: string; isMute: number; CallUUID?: string; ReportId?: string; callType?: number; }): Promise<any> {
    return new Promise((resolve, reject) => {
      let event = obj.callType == 3 ? 'app_sinlgeMuteUnMute' : 'sinlgeMuteUnMute'
      delete obj.callType;
      this._socket.emitCallback(event, obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(`${new Date()} ${data} err at ${event}`);
          Logger.send('err at singleMuteUnmute event',data);
        }
      });
    });
  }
  singleHangUp(obj: { callId: string; phNumber: string; CallUUID?: string; ReportId?: string; callType?: number; }): Promise<any> {
    return new Promise((resolve, reject) => {
      let event = obj.callType == 3 ? 'app_singleHangUp' : 'singleHangUp'
      delete obj.callType;
      this._socket.emitCallback(event, obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(`${new Date()} ${data} err at ${event}`);
          Logger.send('err at singleHangUp event',data);
        }
      });
    });
  }
  singleRedial(obj: singleRedial): Promise<any> {
    return new Promise((resolve, reject) => {
      let event = obj.callType == 3 ? 'app_singleReDial' : 'singleReDial'
      delete obj.callType;
      this._socket.emitCallback(event, obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(`${new Date()} ${data} err at ${event}`)
          Logger.send('err at singleRedial event',data);
        }
      });
    });
  }
  addGrpCallMembers(obj: { callId: string; users: Array<string>; CallUUID: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('addGrpCallMembers', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at addGrpCallMembers event', data);
          Logger.send('err at addGrpCallMembers event',data);
        }
      });
    });
  }
  getScheduleCallUsers(obj: { from: string; scheduleId: string; }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getScheduleCallUsers', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at getschedulecallusers event', data);
          Logger.send('err at addGrpCallMembers event',data);
        }
      });
    });
  }
  NonScheduleCallUsers(obj: NonScheduleCallUsers): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('NonScheduleCallUsers', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at nonschedulecallusers event', data);
          Logger.send('err at nonschedulecallusers event',data);
        }
      });
    });
  }
  getNonGroupContacts(obj: getNonGroupContacts): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getNonGroupContacts', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at getnongroupcontacts event', data);
          Logger.send('err at getnongroupcontacts event',data);
        }
      });
    });
  }
  scheduleCall(obj: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('scheduleCall', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at schedule call event', data);
          Logger.send('err at scheduleCall event',data);
        }
      });
    });
  }
  getGroupList(obj: { from: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getGroupList', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at getting group details');
          Logger.send('err at getGroupList event',data);
        }
      });
    });
  }
  callList(obj: { from: string; skip: any; limit: number; search: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('callList', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at calllist event', data);
          Logger.send('err at callList event',data);
        }
      });
    });
  }
  scheduleCallList(obj: { from: string; skip: any; limit: number; search: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('scheduleCallList', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at schedulecalllist event', data);
          Logger.send('err at scheduleCallList event',data);
        }
      });
    });
  }
  getHostScheduleList(obj: { from: string; skip: any; limit: number; search: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getHostScheduleList', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at getHostScheduleList event', data);
          Logger.send('err at getHostScheduleList event',data);
        }
      });
    });
  }
  deleteSchedule(obj: { from: string; scheduleId: string; }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('deleteSchedule', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          this._toastr.info('Error At deleting schedule');
          Logger.send('err at deleteSchedule event',data);
        }
      });
    });
  }
  saveUserResponse(obj: { from: string; scheduleId: string; response: number; }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('saveUserResponse', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          this._toastr.info('Error At updating your status');
          Logger.send('err at saveUserResponse event',data);
        }
      });
    });
  }
  callDetails(object: callDetails): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('callDetails', object, data => {
        if (data != null && data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at call details event', data);
          Logger.send('err at callDetails event',data);
        }
      });
    });
  }
  callsHistory(callId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('callsHistory', { callId }, data => {
        if (data != null && data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at callsHistory event', data);
          Logger.send('err at callsHistory event',data);
        }
      });
    });
  }
  getCallsHistoryOfGroup(obj: { callId: string, skip: number, limit: number }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getCallsHistoryOfGroup', obj, data => {
        if (data != null && data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at getCallsHistoryOfGroup event', data);
          Logger.send('err at getCallsHistoryOfGroup event',data);
        }
      });
    });
  }
  
  sc_oneToOneCalling(obj: { from: string; to: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('sc_oneToOneCalling', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), 'err at sc_oneToOneCalling event', data);
          Logger.send('err at sc_oneToOneCalling event',data);
        }
      });
    });
  }

  reDialAll(obj: { callId: string; CallUUID?: string, callType?: number }): Promise<any> {
    return new Promise((resolve, reject) => {
      let event = obj.callType == 3 ? 'app_reDialAll' : 'reDialAll'
      delete obj.callType;
      this._socket.emitCallback(event, obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(`${new Date()} err at ${event} event ${data}`);
          Logger.send('err at reDialAll event',data);
        }
      });
    });
  }
  multipleMuteUnMute(obj: { callId: string; isMute: number; CallUUID?: string; callType?: number}): Promise<any> {
    return new Promise((resolve, reject) => {
      let event = obj.callType == 3 ? 'app_multipleMuteUnMute' : 'multipleMuteUnMute'
      delete obj.callType;
      this._socket.emitCallback(event, obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(`${new Date()} err at ${event} event ${data}`);
          Logger.send('err at multipleMuteUnMute event',data);
        }
      });
    });
  }
  hangUpAll(obj: { callId: string; CallUUID?: string; callType?: number }): Promise<any> {
    return new Promise((resolve, reject) => {
      let event = obj.callType == 3 ? 'app_hangUpAll' : 'hangUpAll'
      delete obj.callType;
      this._socket.emitCallback(event, obj, data => {
        resolve(data);
      });
    });
  }
  
  uploadImage(obj: uploadImage): void {
    this._socket.emit('uploadImage', obj);
  }
  changeName(obj: { from: string, name: string }): void {
    this._socket.emit('changeName', obj);
  }
  changeProfileStatus(obj: { from: string, status: string }): void {
    this._socket.emit('changeProfileStatus', obj);
  }
  groupOnline(obj: { groupId: string }): void {
    this._socket.emit('groupOnline', obj);
  }
  sc_web_chatupdates(chatIds: string[]): void {
    this._socket.emit('sc_web_chatupdates', { data: chatIds });
  }
  sc_typing(obj: sc_typing): void {
    this._socket.emit('sc_typing', obj);
  }
  sc_stop_typing(obj: sc_typing): void {
    this._socket.emit('sc_stop_typing', obj);
  }
  sc_change_status(obj: { from: string; status: number; }): void {
    this._socket.emit('sc_change_status', obj);
  }
}
