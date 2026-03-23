import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { OntapItemTriggersViewdata, StorageOntapTriggersService } from './storage-ontap-triggers.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'storage-ontap-triggers',
  templateUrl: './storage-ontap-triggers.component.html',
  styleUrls: ['./storage-ontap-triggers.component.scss'],
  providers: [StorageOntapTriggersService]
})
export class StorageOntapTriggersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  itemId: string;
  item: { name: string, type: string, state: string };
  currentCriteria: SearchCriteria;

  count: number;
  viewData: OntapItemTriggersViewdata[] = [];
  constructor(private svc: StorageOntapTriggersService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageSvc: StorageService,
    private refreshService: DataRefreshBtnService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.HUNDRED };
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.itemId = params.get('id'));
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    let item = <{ name: string, type: string, state: string }>this.storageSvc.getByKey('ontap-entity', StorageType.SESSIONSTORAGE);
    this.item = item;
    this.spinner.start('main');
    this.getTriggers();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getTriggers();
  }

  getTriggers() {
    this.svc.getTriggers(this.clusterId, this.item.name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.count = res.length;
      this.viewData = this.svc.convertToViewdata(res);
    }, err => {
      this.spinner.stop('main');
      // this.notification.error(new Notification('Error while fetching events'))
    });
  }

}
