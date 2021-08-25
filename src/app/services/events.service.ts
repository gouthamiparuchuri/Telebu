import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { ToastrService } from 'ngx-toastr';
// import * as ss from './socket.io-stream';
import { getGroupContacts, getUserContacts } from '../types/pingchat';

@Injectable({
  providedIn: 'root'
})

export class EventsService {
  unsentFiles: any;
  constructor(private _socket: SocketService, private _toastr: ToastrService) {
  }
  //ping chat events

  getUserContacts(data: getUserContacts): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getUserContacts', data, contacts => {
        if (contacts.err == 0) {
          resolve(contacts);
        } else {
          console.warn(contacts, 'err at getUserContacts event');
        }
      });
    });
  }

  getGroupContacts(obj: getGroupContacts): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getGroupContacts', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.warn(data, 'err at getGroupContacts event');
        }
      });
    });
  }
  // group(obj: group): Promise<any> {      
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('group', obj, data => {
  //       if (data.err == 0) {          
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at group event');          
  //         reject(data.msg)
  //       }

  //     });
  //   })
  // }
  // sc_get_url_metadata(obj: { url: string }): Promise<any> {      
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('sc_get_url_metadata', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         resolve({ metadata: {} });
  //         console.warn(data, 'err at sc_get_url_metadata event');          
  //       }        
  //     });
  //   });
  // }
  // getLastMsg(obj: { from: string; type: string; convId: string }): Promise<any> {      
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getLastMsg', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at getLastMsg event');          
  //       }        
  //     });
  //   });
  // }
  // deleteChat(obj: { from: string; convId: string; type: string }): Promise<any> {  
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('deleteChat', obj, data => {
  //       if (data.err == 0) {          
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at deleteChat');          
  //       }
  //     });
  //   });

  // }
  // clearChat(obj: { from: string; convId: string; type: string; star_status: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('clearChat', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at clearChat');
  //       }
  //     });
  //   });
  // }
  // groupsUnread(obj: { from: string; groups: string[] }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('groupsUnread', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at groupsUnread');
  //       }
  //     });
  //   });
  // }
  // unarchiveAll(from: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('unarchiveAll', { from }, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at unarchiveAll');
  //       }
  //     });
  //   });
  // }
  // getArchivedChats(from: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getArchivedChats', { from }, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at getArchivedChats');
  //       }
  //     });
  //   });
  // }
  // archiveMessage(obj: archiveMessage): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('archiveMessage', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at archiveMessage');
  //       }
  //     });
  //   });
  // }
  
  // fileUpload(obj: { file?: File; fileName: string; type: number; buffer?: string; chatType?: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const stream = ss.createStream();
  //       const streamObj = obj.type == 1 ? { size: obj.file.size, ImageName: obj.fileName, type: obj.file.type } : { ImageName: obj.fileName };
  //       ss(this._socket.socket).emit('fileUpload', stream, streamObj);
  //       if (obj.type == 1)
  //         ss.createBlobReadStream(obj.file).pipe(stream);
  //       else {
  //         fetch(obj.buffer)
  //           .then(res => res.blob())
  //           .then(blob => {
  //             ss.createBlobReadStream(new File([blob], obj.fileName, blob)).pipe(stream);
  //           });
  //       }
  //       stream.on('finish', () => {
  //         console.log('File upload finished');
  //         resolve({ chatType: obj.chatType });
  //       });
  //     } catch (err) {
  //       console.warn(err);
  //     }
  //   });
  // }
  
  // getPhoneContacts(obj: { from: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getPhoneContacts', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at getPhoneContacts event');
  //       }
  //     });
  //   });
  // }
  // getMediaByType(obj: getMediaByType): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getMediaByType', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at getMediaByType event');
  //       }
  //     });
  //   });
  // }
  // getGroupInfo(obj: { from: string; groupId: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getGroupInfo', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at GroupInfo');
  //       }
  //     });
  //   });
  // }
  // getUserLastSeen(obj: { from: string; to: string; converseId?: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getUserLastSeen', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(data, 'err at getUserLastSeen');
  //       }
  //     });
  //   });
  // }
  // updateDelivery(obj: { from: string; tenantId: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('updateDelivery', obj, data => {
  //       if (data != null && data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at updateDelivery event', data);
  //       }
  //     });
  //   });
  // }
  // webLogout(obj: { from: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('webLogout', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at weblogout event', data);
  //       }
  //     });
  //   });
  // }
  // resetGroupLink(obj: { from: string; groupId: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('resetGroupLink', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at resetGroupLink event', data);
  //       }
  //     });
  //   });
  // }
  // unstarAll(userId: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('unstarAll', { from: userId }, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at unstarAll event', data);
  //       }
  //     });
  //   });
  // }
  // getUserDetails(userId: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getUserDetails', { userId }, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at getUserDetails event', data);
  //       }
  //     });
  //   });
  // }
  // getStarredMsgs(from: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getStarredMsgs', { from }, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at getStarredMsgs event', data);
  //       }
  //     });
  //   });
  // }
  // starredMessage(obj: starredMessage): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('starredMessage', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at starredMessage event', data);
  //       }
  //     });
  //   });
  // }
  // deleteMsgEveryone(obj: deleteMsgEveryone): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('deleteMsgEveryone', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at deleteMsgEveryone event', data);
  //       }
  //     });
  //   });
  // }
  // makeRead(obj: { from: string; convId: string; type: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('makeRead', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at makeRead event', data);
  //       }
  //     });
  //   });
  // }
  // msgStatusUpdateWeb(obj: msgStatusUpdateWeb): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('msgStatusUpdateWeb', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at msgStatusUpdateWeb event', data);
  //       }
  //     });
  //   });
  // }
  // deleteForMe(obj: { from: string; recordId: string[]; type: string; msgId: number[] }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('deleteForMe', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at deleteForMe event', data);
  //       }
  //     });
  //   });
  // }
  // newMessage(obj: newMessage): void {
  //   this._socket.emitCallback('newMessage', obj, data => {
  //   });
  // }
  // getGroupList(obj: { from: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getGroupList', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at getting group details');
  //       }
  //     });
  //   });
  // }
  // getSettings(obj: { userid: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getSettings', obj, data => {
  //       if (data.errNum == "0") {
  //         resolve(data);
  //       } else {
  //         console.warn('err at getting getSettings', data);
  //         reject()
  //       }
  //     });
  //   });
  // }
  // getNonGroupContacts(obj: getNonGroupContacts): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getNonGroupContacts', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at getnongroupcontacts event', data);
  //       }
  //     });
  //   });
  // }

  // //pstn and voip call events

  // getCallMembers(obj: getCallMembers): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = obj.callType == 2 ? 'getCallMembers' : 'app_getCallMembers'
  //     this._socket.emitCallback(event, obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`Error At ${event} event ${JSON.stringify(data)}`);
  //       }
  //     });
  //   });
  // }
  // newCall(data: newCall): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = data.cType == 3 ? 'app_newCall' : 'newCall'
  //     delete data.cType;
  //     this._socket.emitCallback(event, data, res => {
  //       if (res.err == 0) {
  //         resolve(res);
  //       } else {
  //         console.warn(`${res} err at ${event} event`);
  //         this._toastr.error(res.message);
  //       }
  //     });
  //   });
  // }
  // singleMuteUnmute(obj: { callId: string; phNumber: string; isMute: number; CallUUID?: string; ReportId?: string; callType?: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = obj.callType == 3 ? 'app_sinlgeMuteUnMute' : 'sinlgeMuteUnMute'
  //     delete obj.callType;
  //     this._socket.emitCallback(event, obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`${JSON.stringify(data)} err at ${event}`);
  //       }
  //     });
  //   });
  // }
  // singleHangUp(obj: { callId: string; phNumber: string; CallUUID?: string; ReportId?: string; callType?: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = obj.callType == 3 ? 'app_singleHangUp' : 'singleHangUp'
  //     delete obj.callType;
  //     this._socket.emitCallback(event, obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`${JSON.stringify(data)} err at ${event}`);
  //       }
  //     });
  //   });
  // }
  // app_viop_addMember(obj: { ALegUUID: string; from: string; ConferenceName: string; members: string[]; }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('app_viop_addMember', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`${JSON.stringify(data)} err at App_viop_addMember`);
  //       }
  //     });
  //   });
  // }
  // switchToVideo(obj: { from: string; callId: string; }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('switchToVideo', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`${JSON.stringify(data)} err at switchToVideo`);
  //       }
  //     });
  //   });
  // }
  // switchToVideoAck(obj: { from: string; callId: string; status: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('switchToVideoAck', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`${JSON.stringify(data)} err at switchToVideoAck`);
  //       }
  //     });
  //   });
  // }
  // singleRedial(obj: singleRedial): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = obj.callType == 3 ? 'app_singleReDial' : 'singleReDial'
  //     delete obj.callType;
  //     this._socket.emitCallback(event, obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`${JSON.stringify(data)} err at ${event}`)
  //       }
  //     });
  //   });
  // }
  // addGrpCallMembers(obj: { callId: string; users: Array<string>; CallUUID: string; phNumber: string; callType: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = obj.callType == 3 ? 'app_addGrpCallMembers' : 'addGrpCallMembers'
  //     delete obj.callType;
  //     this._socket.emitCallback(event, obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`err at ${event} event, ${JSON.stringify(data)}`);
  //       }
  //     });
  //   });
  // }

  // getScheduleCallUsers(obj: { from: string; scheduleId: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getScheduleCallUsers', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at getschedulecallusers event', data);
  //       }
  //     });
  //   });
  // }
  // NonScheduleCallUsers(obj: NonScheduleCallUsers): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('NonScheduleCallUsers', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at nonschedulecallusers event', data);
  //       }
  //     });
  //   });
  // }
  // scheduleCall(obj: IscheduleCall): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let event = obj.payCall ? 'scheduleCall' : 'app_scheduleCall'
  //     delete obj.payCall;
  //     this._socket.emitCallback(event, obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(new Date(), 'err at', event, { request: obj, repsonse: data });
  //       }
  //     });
  //   });
  // }
  // getHostScheduleList(obj: { from: string; skip: any; limit: number; search: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getHostScheduleList', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at getHostScheduleList event', data);
  //       }
  //     });
  //   });
  // }
  // deleteSchedule(obj: { from: string; scheduleId: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('deleteSchedule', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         this._toastr.info('Error At deleting schedule');
  //       }
  //     });
  //   });
  // }
  // app_saveALegUUID(obj: { callId: string, aLegUUID: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('app_saveALegUUID', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         this._toastr.info('Error At deleting schedule');
  //       }
  //     });
  //   });
  // }
  // saveUserResponse(obj: { from: string; scheduleId: string; response: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('saveUserResponse', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         this._toastr.info('Error At updating your status');
  //       }
  //     });
  //   });
  // }
  // callDetails(object: callDetails): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('callDetails', object, data => {
  //       resolve(data);
  //       if (data != null && data.err == 1) {
  //         console.warn('err at call details event', data);
  //       }
  //     });
  //   });
  // }
  // app_memberHandRaise(object: { callId: string, ReportId: string, CallUUID: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('app_memberHandRaise', object, data => {
  //       if (data != null && data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at call details event', data);
  //       }
  //     });
  //   });
  // }
  // callsHistory(callId: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('callsHistory', { callId }, data => {
  //       if (data != null && data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at callsHistory event', data);
  //       }
  //     });
  //   });
  // }
  // getCallsHistoryOfGroup(obj: { callId: string; skip: number; limit: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('getCallsHistoryOfGroup', obj, data => {
  //       if (data != null && data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at getCallsHistoryOfGroup event', data);
  //       }
  //     });
  //   });
  // }

  // sc_new_oneToOneCalling(obj: { from: string; to: string; callType: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = obj.callType == 4 ? 'sc_new_oneToOneCalling' : 'sc_new_oneToOneVideoCalling'
  //     this._socket.emitCallback(event, obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`err at ${event} event ${JSON.stringify(data)}`);
  //       }
  //     });
  //   });
  // }
  // freeswitch_invite(obj: { callId: string; userId: string, status: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('freeswitch_invite', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn('err at freeswitch_invite event', data);
  //       }
  //     });
  //   });
  // }

  // reDialAll(obj: { callId: string; CallUUID?: string; callType?: number, phNumber?: string }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = obj.callType == 3 ? 'app_reDialAll' : 'reDialAll'
  //     delete obj.callType;
  //     this._socket.emitCallback(event, obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`err at ${event} event ${JSON.stringify(data)}`);
  //       }
  //     });
  //   });
  // }
  // multipleMuteUnMute(obj: { callId: string; isMute: number; CallUUID?: string; callType?: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = obj.callType == 3 ? 'app_multipleMuteUnMute' : 'multipleMuteUnMute'
  //     delete obj.callType;
  //     this._socket.emitCallback(event, obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`err at ${event} event ${JSON.stringify(data)}`);
  //       }
  //     });
  //   });
  // }
  // hangUpAll(obj: { callId: string; CallUUID?: string; callType?: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const event = obj.callType == 3 ? 'app_hangUpAll' : 'hangUpAll'
  //     delete obj.callType;
  //     this._socket.emitCallback(event, obj, data => {
  //       resolve(data);
  //     });
  //   });
  // }

  // callStatusAck(callId: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('callStatusAck', { callId }, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`err at callStatusAck event ${JSON.stringify(data)}`);
  //       }
  //     });
  //   });
  // }

  // joinCall(obj: { callId?: string, from: string, to?: string, type: number, groupId?: string, users?: string[], roomId?: string, status?: number }): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._socket.emitCallback('joinCall', obj, data => {
  //       if (data.err == 0) {
  //         resolve(data);
  //       } else {
  //         console.warn(`err at joinCall event ${JSON.stringify(data)}`);
  //       }
  //     });
  //   });
  // }

  // uploadImage(obj: uploadImage): void {
  //   this._socket.emit('uploadImage', obj);
  // }
  // changeName(obj: { from: string; name: string }): void {
  //   this._socket.emit('changeName', obj);
  // }
  // changeProfileStatus(obj: { from: string; status: string }): void {
  //   this._socket.emit('changeProfileStatus', obj);
  // }
  // groupOnline(obj: { groupId: string }): void {
  //   this._socket.emit('groupOnline', obj);
  // }
  // sc_web_chatupdates(obj: { data: string[]; status: boolean }): void {
  //   this._socket.emit('sc_web_chatupdates', obj);
  // }
  // sc_typing(obj: sc_typing): void {
  //   this._socket.emit('sc_typing', obj);
  // }
  // sc_stop_typing(obj: sc_typing): void {
  //   this._socket.emit('sc_stop_typing', obj);
  // }
  // sc_change_status(obj: { from: string; status: number }): void {
  //   this._socket.emit('sc_change_status', obj);
  // }

}
