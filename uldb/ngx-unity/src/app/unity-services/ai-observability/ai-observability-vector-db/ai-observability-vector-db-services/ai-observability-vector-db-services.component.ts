import { Component, OnInit } from '@angular/core';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AiObservabilityVectorDbServicesService, VectorDbModel } from './ai-observability-vector-db-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'ai-observability-vector-db-services',
  templateUrl: './ai-observability-vector-db-services.component.html',
  styleUrls: ['./ai-observability-vector-db-services.component.scss'],
  providers: [AiObservabilityVectorDbServicesService]
})
export class AiObservabilityVectorDbServicesComponent implements OnInit {
  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  viewData: VectorDbModel[] = [];
  count: number;
  isPageSizeAll: boolean = true;

  popOverTypesList: any;
  popOverDBCollectionList: any;
  popOverDBOperationsList: any;

  constructor(private svc: AiObservabilityVectorDbServicesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getVectorDbList();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getVectorDbList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getVectorDbList();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getVectorDbList();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getVectorDbList();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVectorDbList();
  }

  getVectorDbList() {
    this.svc.getVectorDbData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Templates'));
    });
  }

  showExtraTypes(view: VectorDbModel) {
    this.popOverTypesList = view.extraTypes;
  }

  showExtraDBCollectionNames(view: VectorDbModel) {
    this.popOverDBCollectionList = view.extraDbCollectionNames;
  }

  showExtraDBOperationName(view: VectorDbModel) {
    this.popOverDBOperationsList = view.extraDbOperationNames;
  }

  goToDetails(view: VectorDbModel) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.VECTOR_DB_SERVICE, configured: true }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'zbx', 'details'], { relativeTo: this.route });
  }

}