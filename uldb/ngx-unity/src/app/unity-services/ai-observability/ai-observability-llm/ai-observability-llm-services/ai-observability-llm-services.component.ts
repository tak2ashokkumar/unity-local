import { Component, OnInit } from '@angular/core';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AiObservabilityLlmServicesService, LLMModel } from './ai-observability-llm-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'ai-observability-llm-services',
  templateUrl: './ai-observability-llm-services.component.html',
  styleUrls: ['./ai-observability-llm-services.component.scss'],
  providers: [AiObservabilityLlmServicesService]
})
export class AiObservabilityLlmServicesComponent implements OnInit {
  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  viewData: LLMModel[] = [];
  count: number;
  isPageSizeAll: boolean = true;

  popOverList: any;

  constructor(private svc: AiObservabilityLlmServicesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getLLMList();
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
    this.getLLMList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getLLMList();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getLLMList();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getLLMList();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getLLMList();
  }

  getLLMList() {
    this.svc.getLLMData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, () => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get LLM Data'));
    });
  }

  showExtraTypes(view: LLMModel) {
    this.popOverList = view.extraTypes;
  }

  goToDetails(view: LLMModel) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.LLM_SERVICE, configured: true }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'zbx', 'details'], { relativeTo: this.route });
  }

}

