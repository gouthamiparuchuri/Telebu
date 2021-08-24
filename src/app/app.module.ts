import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { RecentChatsComponent } from './recent-chats/recent-chats.component';
import { ChatHistoryComponent } from './chat-history/chat-history.component';
import { ChatInfoComponent } from './chat-info/chat-info.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    RecentChatsComponent,
    ChatHistoryComponent,
    ChatInfoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
