import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'green-it-subscribe',
  templateUrl: './green-it-subscribe.component.html',
  styleUrls: ['./green-it-subscribe.component.scss']
})
export class GreenItSubscribeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void { }

  goToHome() {
    this.router.navigate(['home']);
  }

}
