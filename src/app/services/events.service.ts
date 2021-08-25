import { Injectable } from '@angular/core';
import { getGroupContacts, getUserContacts } from '../types/pingchat';
import { SocketService } from './socket.service';
@Injectable({
  providedIn: 'root'
})

export class EventsService {

  constructor(private _socket: SocketService) { }
  //ping chat events
  getUserContacts(data: getUserContacts): Promise<any> {
    return new Promise((resolve, reject) => {
      this._socket.emitCallback('getUserContacts', data, contacts => {
        if (contacts.err == 0) {
          resolve(contacts);
        } else {
          console.log(new Date(), contacts, 'err at getUserContacts event');
        }
      });
    });
  }
  getGroupContacts(obj: getGroupContacts): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log("2")
      this._socket.emitCallback('getGroupContacts', obj, data => {
        if (data.err == 0) {
          resolve(data);
        } else {
          console.log(new Date(), data, 'err at getGroupContacts event');
        }
      });
    });
  }
  
}
