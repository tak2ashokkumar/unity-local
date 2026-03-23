import { Component, OnInit, OnDestroy } from '@angular/core';
import { MonitoringDatacenterService, PDUMonitoringVewData } from './monitoring-datacenter.service';
import { from, Subject } from 'rxjs';
import { takeUntil, mergeMap } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';

@Component({
  selector: 'monitoring-datacenter',
  templateUrl: './monitoring-datacenter.component.html',
  styleUrls: ['./monitoring-datacenter.component.scss'],
  providers: [MonitoringDatacenterService],
})
export class MonitoringDatacenterComponent implements OnInit, OnDestroy {
  pdus: PDUMonitoringVewData[] = [];
  private ngUnsubscribe = new Subject();

  constructor(private pduService: MonitoringDatacenterService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.getPDUs();
  }
  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.getPDUs();
  }

  getPDUs() {
    this.spinner.start('main');
    this.pduService.getDatacenterPDUs().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.pdus = this.pduService.convertToViewData(res.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }
}
