import { Component, OnDestroy, OnInit } from '@angular/core';
import { NetworkControllersCiscoMerakiService } from './network-controllers-cisco-meraki.service';
import { RoundedTabDataType } from 'src/app/shared/unity-rounded-tab/unity-rounded-tab.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'network-controllers-cisco-meraki',
  templateUrl: './network-controllers-cisco-meraki.component.html',
  styleUrls: ['./network-controllers-cisco-meraki.component.scss'],
  providers: [NetworkControllersCiscoMerakiService]
})
export class NetworkControllersCiscoMerakiComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;

  tabItems: RoundedTabDataType[] = [
    { name: 'Organization', url: 'meraki-organizations' },
    { name: 'Devices', url: 'meraki-devices' }
  ];

  view = 'organizations';
  constructor(private router: Router,
    private route: ActivatedRoute,
    private merakiSvc: NetworkControllersCiscoMerakiService) {
    // this.subscr = this.router.events.subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     const url = event.url.split('/').pop() == 'meraki-organizations' ? 'organizations' : 'devices';
    //     this.view = url;
    //   }
    // });
    this.merakiSvc.organizationOrDeviceDataAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
