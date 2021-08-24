import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { CurrentUserService } from 'src/app/services/currentuser.service';

@Injectable(
  //providedIn: 'root'
)
export class AuthGuard implements CanActivate {
  path: ActivatedRouteSnapshot[];
  route: ActivatedRouteSnapshot;
  constructor(private currentUser: CurrentUserService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (typeof this.currentUser.currentUser != 'undefined') {
      return true;
    } else {
      this.router.navigateByUrl('login');
      return false;
    }
  }
}
