import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class CurrentUserService {
  currentUser: any = {};
  signedIn: boolean = true;

  constructor(private _cookieService: CookieService, private _router: Router) {
    this.currentUser = _cookieService.getObject('site-globals');
  }

  public SetCredentials(user: any): void {
    let authdata = user['token'];
    this.currentUser = {
      name: user['Name'],
      profilePic: user['ProfilePic'],
      token: user['token'],
      msisdn: user['msisdn'],
      _id: user['_id'],
      status: user['Status'],
      tenants: user['tenants'],
      isEncryption: user['isEncryption'],
      activeTenant: user['activeTenant']
    };
    localStorage.setItem('authorization', authdata);
    localStorage.setItem('online', "1");
    if (this.signedIn) {
      this._cookieService.putObject('site-globals', this.currentUser, {
        storeUnencoded: false,
        expires: new Date(new Date().setDate(new Date().getDate() + 365)),
        secure: false
      });
    }
    this._router.navigate(['/chat']);
  };

  public logout(): void {
    this._cookieService.remove('site-globals');
    localStorage.removeItem('authorization');
    this.currentUser = undefined;
  }
}
