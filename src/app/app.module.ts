import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DeviceDetectorService } from 'ngx-device-detector';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { RecentChatsComponent } from './recent-chats/recent-chats.component';
import { ChatHistoryComponent } from './chat-history/chat-history.component';
import { ChatInfoComponent } from './chat-info/chat-info.component';
import { ContactsComponent } from './contacts/contacts.component';
import { MemberComponent } from './member/member.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    RecentChatsComponent,
    ChatHistoryComponent,
    ChatInfoComponent,
    ContactsComponent,
    MemberComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({ preventDuplicates: true}),
    CookieModule.forRoot(),
    ReactiveFormsModule 
  ],
  providers: [
    AuthGuard,
    {
      provide: DeviceDetectorService
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
