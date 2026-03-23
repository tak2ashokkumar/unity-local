import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PDUMonitoringVewData, MonitoringDatacenterService } from '../monitoring-datacenter.service';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';

@Component({
  selector: 'monitoring-datacenter-widget',
  templateUrl: './monitoring-datacenter-widget.component.html',
  styleUrls: ['./monitoring-datacenter-widget.component.scss']
})
export class MonitoringDatacenterWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Input() pdu: PDUMonitoringVewData;
  loading: boolean = true;

  constructor(private pduService: MonitoringDatacenterService,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.start(this.pdu.pduId);
    }, 0);
    this.getPDUGraphs();
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPDUGraphs() {
    from(this.pdu.graphs).pipe(mergeMap(e => this.pduService.getPDUGraphs(this.pdu.pduId, e.graphName)), takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        const key = res.keys().next().value;
        const index = this.pdu.graphs.map(data => data.graphName).indexOf(key);
        this.pdu.graphs[index].graph = res.get(key);
        this.loading = false;
        this.spinner.stop(this.pdu.pduId);
      }, err => {
        this.loading = false;

      });
  }

}
