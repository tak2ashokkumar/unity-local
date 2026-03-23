import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'datacenter-cabinet-view-device-status',
  templateUrl: './datacenter-cabinet-view-device-status.component.html',
  styleUrls: ['./datacenter-cabinet-view-device-status.component.scss']
})
export class DatacenterCabinetViewDeviceStatusComponent implements OnInit, OnChanges, OnDestroy {
  @Input() status: string;
  @Input() units: string;

  private ngUnsubscribe = new Subject();
  badgeClass: string = 'badge-danger';
  showStatus: boolean = false;
  constructor() { }

  ngOnInit() {
    this.statusChecker(this.status);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.status && !changes.status.isFirstChange()) {
      this.statusChecker(this.status);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  statusChecker(status: string) {
    this.showStatus = status == 'Up' || status == 'Down' || status == 'Unknown' ? true : false;
    if (this.showStatus) {
      this.badgeClass = status == 'Up' ? 'badge-success' : status == 'Down' ? 'badge-danger' : 'badge-dark';
    } else {
      this.badgeClass = 'badge-warning';
    }
  }

  manageDeviceStatus() {
    // power off and on for device to be handled here.
    // future requirement.
  }
}
