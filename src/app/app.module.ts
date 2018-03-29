import { XHRBackend, RequestOptions, HttpModule } from '@angular/http';
import { HttpService } from './http.service';
import { BrowserModule } from '@angular/platform-browser';
import { CanvasWhiteboardModule } from 'ng2-canvas-whiteboard';
import { NgModule, InjectionToken } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DrawingComponent } from './drawing/drawing.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { CanvasComponent } from './canvas/canvas.component';
import { WebsocketService } from './websocket.service';
import { BroadcastService } from './broadcast.service';
import { AuthGuard } from './auth.guard';
import { JwtHelperService } from '@auth0/angular-jwt';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'drawing',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'drawing',
    component: DrawingComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [AppComponent, LoginComponent, DrawingComponent, CanvasComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), ReactiveFormsModule, HttpModule, CanvasWhiteboardModule],
  providers: [
    {
      provide: HttpService,
      useFactory: HttpService.useFactory,
      deps: [XHRBackend, RequestOptions],
    },
    AuthService,
    WebsocketService,
    BroadcastService,
    AuthGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
