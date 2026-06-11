import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mtp-administration-user-mgmt',
  templateUrl: './mtp-administration-user-mgmt.component.html',
  styleUrls: ['./mtp-administration-user-mgmt.component.scss']
})
export class MtpAdministrationUserMgmtComponent implements OnInit {

  subscr: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.split('/').pop() == 'usermgmt') {
          this.router.navigate(['users'], { relativeTo: this.route });
        }
      }
    });
  }

  ngOnInit(): void {
  }

  isActive(card: string) {
    if (this.router.url.match('/usermgmt/' + card)) {
      return 'active text-primary border-primary bg-colour shadow-none';
    } else {
      return 'text-muted btn-outline-light'
    }
  }

  goTo(card: string) {
    this.router.navigate([card], { relativeTo: this.route });
  }
}
