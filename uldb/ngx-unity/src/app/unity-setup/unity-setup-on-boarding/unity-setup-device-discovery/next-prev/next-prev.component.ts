import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { UnitySetupDeviceDiscoveryService } from '../unity-setup-device-discovery.service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'next-prev',
  templateUrl: './next-prev.component.html',
  styleUrls: ['./next-prev.component.scss']
})
export class NextPrevComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  next: string;
  prev: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private devDisSvc: UnitySetupDeviceDiscoveryService) {
    this.devDisSvc.nextPrevAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.next = data.nextUrl;
      this.prev = data.prevUrl;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  isNextDisabled() {
    return this.next == null;
  }

  isPrevDisabled() {
    return this.prev == null;
  }

  goNext() {
    if (this.next) {
      this.router.navigate(['..', this.next], { relativeTo: this.route });
    }
  }

  goPrev() {
    if (this.prev) {
      this.router.navigate(['..', this.prev], { relativeTo: this.route });
    }
  }

  gotToDashboard() {
    this.router.navigate(['app-dashboard']);
  }
}
