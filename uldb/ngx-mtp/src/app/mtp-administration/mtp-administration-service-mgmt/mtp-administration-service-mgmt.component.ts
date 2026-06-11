import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mtp-administration-service-mgmt',
  templateUrl: './mtp-administration-service-mgmt.component.html',
  styleUrls: ['./mtp-administration-service-mgmt.component.scss']
})
export class MtpAdministrationServiceMgmtComponent implements OnInit {
  subscr: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.split('/').pop() == 'servicemgmt') {
          this.router.navigate(['sla'], { relativeTo: this.route });
        }
      }
    });
  }

  isActive(card: string) {
    if (this.router.url.match('/servicemgmt/' + card)) {
      return 'active text-primary border-primary bg-lb shadow-none';
    } else {
      return 'text-muted btn-outline-light'
    }
  }

  goTo(card: string) {
    this.router.navigate([card], { relativeTo: this.route });
  }

  ngOnInit(): void {
  }

}
