import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AdvancedDeviceDiscoveryService } from '../advanced-device-discovery.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'advanced-discovery-next-prev',
  templateUrl: './advanced-discovery-next-prev.component.html',
  styleUrls: ['./advanced-discovery-next-prev.component.scss']
})
export class AdvancedDiscoveryNextPrevComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  next: string;
  prev: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private devDisSvc: AdvancedDeviceDiscoveryService) {
    this.devDisSvc.advNextPrevAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
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
