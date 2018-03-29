import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BroadcastService } from '../broadcast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private broadcastService: BroadcastService,
    private router: Router,
    private auth: AuthService,
  ) {
    this.loginForm = fb.group({
      username: ['', Validators.minLength(2)],
      password: ['', Validators.minLength(2)],
    });
  }

  ngOnInit() {}
  loginSubmit() {
    if (this.loginForm.valid) {
      const data = {
        username: this.username.value,
        password: this.password.value,
      };
      this.auth
        .login(data)
        .toPromise()
        .then(response => {
          // console.log(response);
          localStorage.setItem('id_token', JSON.stringify(response.token));
          this.auth.isLoginSubject.next(true);
          const send = {
            data: data.username,
            type: 'user-joined',
          };
          this.broadcastService.sendBroadcast(send);
          this.router.navigate(['/drawing']);
        })
        .catch(err => {
          const error = JSON.parse(err['_body']);
          this.errorMessage = error.message;
        });
    }
  }
  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }
}
