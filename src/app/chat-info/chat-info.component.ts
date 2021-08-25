import { Component, OnInit } from '@angular/core';
import { EventsService } from '../services/events.service';

@Component({
  selector: 'app-chat-info',
  templateUrl: './chat-info.component.html',
  styleUrls: ['./chat-info.component.css']
})
export class ChatInfoComponent implements OnInit {
  grpMems: any;

  constructor(private _events: EventsService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this._events.getGroupContacts({from:"5d81c7bc869f607eb1b99c96",groupId:"60d31cc26df2924466121f48",page:0}).then(data => {
        this.grpMems = data.members
      })
    }, 10000);
      
  }

}
