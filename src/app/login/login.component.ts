import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { constantApis } from '../constant/constantapis';
import { CurrentUserService } from '../services/currentuser.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { constantMessages } from '../constant/app.contantmessages';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any = {
    PhNumber: '',
    CountryCode: '+91'
  };
  otpEntered: string = '';
  userDetails: any = {};
  loginScreen: boolean = true;
  otpScreen: boolean = false;
  nameScreen: boolean = false;
  url: string = environment.url;
  tenants: Array<any> = [];
  loggedInUser: any = {};
  title: string = constantMessages.title;
  userPic: string = constantMessages.userPic;
  constructor(private _http: HttpService, private _currentUser: CurrentUserService, private _toastr: ToastrService, private _router: Router) { }

  ngOnInit(): void {
    let user: any = this._currentUser.currentUser
    if (typeof user != 'undefined' && typeof user['_id'] != 'undefined')
      this._router.navigate(['/chat']);
  }

  sendOTP(): void {
    let mobiles = ['+919573396538', '+918790608029']
    if (environment.isAllow || mobiles.includes('+91' + this.user['PhNumber'])) {
      this._http.loginCall(constantApis.sendOtp, 'post', this.user).subscribe(response => {
        if (response['errNum'] == 0) {
          this.userDetails = response;
          // this.loginScreen = false;
          // this.otpScreen = true;
          // this._toastr.success('OTP sent to your Mobile Number');
          this._http.loginCall(constantApis.updateName, 'post', { Name: this.userDetails['Name'], _id: this.userDetails['_id'] })
            .subscribe(response2 => {
              this.loggedInUser = response2.user;
              this.tenants = this.loggedInUser['tenants'];
              if (this.tenants.length < 2) {
                this.loggedInUser['activeTenant'] = this.tenants[0];
                this.loggedInUser['staySign'] = true;
                this._currentUser.SetCredentials(this.loggedInUser);
              } else {
                document.getElementById("openModal").click();
              }
              this._toastr.success('Name Updated');
            }, err => {
              console.log(new Date(), "err at updateName", err)
            })
        } else {
          this._toastr.info(response['message'])
        }
      }, err => {
        this._toastr.error("Please Check Your Mobile Number")
        console.log(new Date(), "err at sendOTP", err)
      })
    } else {
      this._toastr.error("Not Authorized To Login")
    }
  }

  verifyOtp(): void {
    if (this.otpEntered == this.userDetails['code']) {
      this.otpScreen = false;
      this.nameScreen = true;
      this._toastr.success('OTP verification success');
    }
  }

  updateName(): void {
    this._http.loginCall(constantApis.updateName, 'post', { Name: this.userDetails['Name'], _id: this.userDetails['_id'] })
      .subscribe(response => {
        this.loggedInUser = response.user;
        this.tenants = this.loggedInUser['tenants'];
        if (this.tenants.length < 2) {
          this.loggedInUser['activeTenant'] = this.tenants[0];
          this._currentUser.SetCredentials(this.loggedInUser);
        } else {
          document.getElementById("openModal").click();
        }
        this._toastr.success('Name Updated');
      }, err => {
        console.log(new Date(), "err at updateName", err)
      })
  }

  selectTenant(tenant: any): void {
    this.loggedInUser['activeTenant'] = tenant;
    this.loggedInUser['staySign'] = true;
    this._currentUser.SetCredentials(this.loggedInUser);
  }

}
