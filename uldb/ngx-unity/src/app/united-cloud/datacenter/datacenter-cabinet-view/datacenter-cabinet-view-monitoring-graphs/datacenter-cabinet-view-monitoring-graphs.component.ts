import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { DatacenterCabinetUnitDevice, DatacenterCabinetViewMonitoringGraph } from '../datacenter-cabinet-viewdata.type';
import { Subject } from 'rxjs';

@Component({
  selector: 'datacenter-cabinet-view-monitoring-graphs',
  templateUrl: './datacenter-cabinet-view-monitoring-graphs.component.html',
  styleUrls: ['./datacenter-cabinet-view-monitoring-graphs.component.scss'],
})
export class DatacenterCabinetViewMonitoringGraphsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isCabinetGraphs: boolean;
  @Input() device: DatacenterCabinetUnitDevice;
  @Input() graphDetails: DatacenterCabinetViewMonitoringGraph;

  graphData: DatacenterCabinetViewMonitoringGraph = new DatacenterCabinetViewMonitoringGraph();
  spinner: boolean = true;
  private ngUnsubscribe = new Subject();

  constructor() { }

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges() {
    this.graphData = new DatacenterCabinetViewMonitoringGraph();
    this.spinner = true;
    if (this.isCabinetGraphs) {
      this.graphData = this.device.graphs[0];
    } else {
      this.graphData = this.graphDetails;
    }
  }
}
