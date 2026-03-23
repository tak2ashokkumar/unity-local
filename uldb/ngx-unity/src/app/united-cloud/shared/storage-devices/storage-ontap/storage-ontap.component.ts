import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { cloneDeep as _clone } from 'lodash-es';
import { DeviceTabData } from '../../device-tab/device-tab.component';
import { ClusterSummaryViewData, StorageOntapService } from './storage-ontap.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'storage-ontap',
  templateUrl: './storage-ontap.component.html',
  styleUrls: ['./storage-ontap.component.scss'],
  providers: [StorageOntapService]
})
export class StorageOntapComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  previousUrl: string = null;
  currentUrl: string = null;
  clusterId: string;
  isDetailsPage: boolean = false;

  device: DeviceTabData = { name: '', deviceType: null };
  summaryData: ClusterSummaryViewData = new ClusterSummaryViewData();;
  constructor(private svc: StorageOntapService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageSvc: StorageService) {
    this.router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = _clone(this.currentUrl);
        this.currentUrl = _clone(event.url);
        let currentURL = event.url.split('/').getLast();
        if (currentURL == 'ontap') {
          this.router.navigate([event.url, 'summary']);
        } else if (currentURL == 'summary') {
          this.isDetailsPage = false;
          this.previousUrl = null;
        } else if (currentURL == 'nodes' || currentURL == 'aggregates' || currentURL == 'svms' || currentURL == 'volumes' || currentURL == 'luns' || currentURL == 'disks' || currentURL == 'shelves' || currentURL == 'snap-mirrors' || currentURL == 'cluster-peers') {
          this.isDetailsPage = false;
          let urlArray = event.url.split('/');
          let purl = urlArray.splice(0, urlArray.length - 1);
          let k = purl.join('/');
          this.previousUrl = `${k}/summary`;
        } else if (currentURL == 'broken') {
          this.isDetailsPage = false;
          let urlArray = event.url.split('/');
          let purl = urlArray.splice(0, urlArray.length - 2);
          let k = purl.join('/');
          this.previousUrl = `${k}/summary`;
        } else if (currentURL == 'details') {
          this.isDetailsPage = true;
          let urlArray = event.url.split('/');
          let purl = urlArray.splice(0, urlArray.length - 1);
          this.previousUrl = purl.join('/');
        } else {
          this.isDetailsPage = true;
          let urlArray = event.url.split('/');
          let purl = urlArray.splice(0, urlArray.length - 1);
          this.previousUrl = purl.join('/');
        }
      }
    });
    this.route.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));
  }

  ngOnInit() {
    this.device = <DeviceTabData>this.storageSvc.getByKey('device', StorageType.SESSIONSTORAGE);
    this.loadUrlState();
    setTimeout(() => {
      this.getClusterSummary();
    })
  }

  ngOnDestroy() {
    this.storageSvc.put('urlState', { previousUrl: this.previousUrl, currentUrl: this.currentUrl }, StorageType.SESSIONSTORAGE);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getClusterSummary() {
    this.spinner.start('nodeCounts');
    this.spinner.start('aggregateCounts');
    this.spinner.start('svmCounts');
    this.spinner.start('volumeCounts');
    this.spinner.start('lunCounts');
    this.svc.getClusterSummary(this.clusterId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryData = this.svc.convertToSummaryViewData(res);
      this.spinner.stop('nodeCounts');
      this.spinner.stop('aggregateCounts');
      this.spinner.stop('svmCounts');
      this.spinner.stop('volumeCounts');
      this.spinner.stop('lunCounts');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('nodeCounts');
      this.spinner.stop('aggregateCounts');
      this.spinner.stop('svmCounts');
      this.spinner.stop('volumeCounts');
      this.spinner.stop('lunCounts');
    })
  }

  loadUrlState() {
    let urlState = this.storageSvc.extractByKey('urlState', StorageType.SESSIONSTORAGE);
    if (urlState) {
      this.previousUrl = urlState.previousUrl;
      this.currentUrl = urlState.currentUrl;
    }
  }

  refreshData(){
    this.getClusterSummary();
  }

  goToStorageList() {
    this.router.navigate(['unitycloud/devices/storagedevices']);
  }

  goBack() {
    if (this.previousUrl) {
      this.router.navigate([this.previousUrl]);
    } else {
      this.router.navigate(['unitycloud/devices/storagedevices']);
    }
  }

  goTo(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
  }
}
