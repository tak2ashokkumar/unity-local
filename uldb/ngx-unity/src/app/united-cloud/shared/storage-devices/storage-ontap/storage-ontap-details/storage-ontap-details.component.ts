import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageOntapDetailsService, StorageOntapEntityDetails } from './storage-ontap-details.service';
import { Subject, from } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { OntapMonitoringItem } from '../storage-ontap.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'storage-ontap-details',
  templateUrl: './storage-ontap-details.component.html',
  styleUrls: ['./storage-ontap-details.component.scss'],
  providers: [StorageOntapDetailsService]
})
export class StorageOntapDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  entity: string;

  constructor(private svc: StorageOntapDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,
    private storageSvc: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    let entity = <{ name: string }>this.storageSvc.getByKey('ontap-entity', StorageType.SESSIONSTORAGE);
    this.entity = entity.name;
    this.getItems()
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getItems();
  }

  items: StorageOntapEntityDetails[] = [];
  getItems() {
    this.svc.getItems(this.clusterId, this.entity).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.items = this.svc.convertToViewData(res);
      this.getGraphs();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  getGraphs() {
    from(this.items).pipe(
      mergeMap(i => this.svc.getGraph(this.clusterId, i.itemId).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          let value = res.get(key);
          let index = this.items.findIndex(it => it.itemId == key);
          if (value && index != -1) {
            this.items[index].graph = value[key];
          }
        }
      )
  }
}
