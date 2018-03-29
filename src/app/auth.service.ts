import { Response } from '@angular/http';
import { HttpService } from './http.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import * as jwt_decode from 'jwt-decode';

const TOKEN_NAME = 'id_token';
// Rxjs
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthService {
  isLoginSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpService) {}

  getToken(): string {
    return localStorage.getItem(TOKEN_NAME);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_NAME, token);
  }

  getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  getUsername(token) {
    if (!token) token = this.getToken();
    if (!token) return true;
    const decoded = jwt_decode(token);
    if (decoded.exp === undefined) return null;
    return decoded.user.username;
  }

  isTokenExpired(token?: string): boolean {
    if (!token) token = this.getToken();
    if (!token) return true;

    const date = this.getTokenExpirationDate(token);
    if (date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
  }

  login(data): Observable<any> {
    return this.http
      .post('/api/login', data)
      .map((res: Response) => res.json())
      .catch(this.handleError);
  }

  /**
   * Log out the user then tell all the subscribers about the new status
   */
  logOut(): void {
    localStorage.removeItem('id_token');
    this.isLoginSubject.next(false);
  }

  /**
   *
   * @returns {Observable<T>}
   */
  isLoggedIn(): Observable<boolean> {
    return this.isLoginSubject.asObservable();
  }

  /**
   *  decodeToken
   *
   *  decodes the id_token in the localStorage and stores the user information
   *  in the userInfo attribute
   */
  decodeToken() {
    const token = localStorage.getItem('id_token');
    // this.userInfo = this.jwtHelper.decodeToken(token).UserInfo;
  }

  /**
   * if we have token the user is loggedIn
   * @returns {boolean}
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_NAME);
  }

  private handleError(error: any) {
    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : 'Server Error';
    return Observable.throw(error);
  }
}
