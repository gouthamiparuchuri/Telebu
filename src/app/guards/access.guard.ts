import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { CurrentUserService } from '../services/currentuser.service';

@Injectable({
  providedIn: 'root'
})
export class AccessGuard implements CanActivate {

  path: ActivatedRouteSnapshot[]; route: ActivatedRouteSnapshot;

  constructor(private userService: CurrentUserService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let user: any = this.userService.currentUser;
    if (user['role'] == "superadmin" || user['role'] == "admin") {
      return true;
    }
    else {
      if (state.url.substr(1, 5) == 'edita' || state.url.substr(1, 5) == 'edits') {
        if (user['privileges'][1].status.edit == true) {
          return true
        } else {
          this.router.navigateByUrl('login');
          return false;
        }
      } else if (state.url.substr(1, 5) == 'addsu') {
        if (user['privileges'][1].status.add == true) {
          return true
        } else {
          this.router.navigateByUrl('login');
          return false;
        }
      } else if (state.url.substr(1, 5) == 'viewu') {
        if (user['privileges'][2].status.view == true) {
          return true
        } else {
          this.router.navigateByUrl('login');
          return false;
        }
      } else if (state.url.substr(1, 5) == 'editu') {
        if (user['privileges'][2].status.edit == true) {
          return true
        } else {
          this.router.navigateByUrl('login');
          return false;
        }
      } else if (state.url.substr(1, 5) == 'addus') {
        if (user['privileges'][2].status.add == true) {
          return true
        } else {
          this.router.navigateByUrl('login');
          return false;
        }
      }
    }
  }

}
