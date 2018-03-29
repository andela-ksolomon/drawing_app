import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DrawingComponent implements OnInit {
  constructor(private auth: AuthService, private route: Router) {}
  ngOnInit() {}
  logout() {
    this.auth.logOut();
    this.route.navigate(['/login']);
  }
}
