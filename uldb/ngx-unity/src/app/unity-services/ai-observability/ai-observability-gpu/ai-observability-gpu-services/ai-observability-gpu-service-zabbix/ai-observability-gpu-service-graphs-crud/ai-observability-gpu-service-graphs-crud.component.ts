import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FormGroup } from '@angular/forms';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';
import { ZabbixMonitoringGraphCRUDViewdata } from 'src/app/united-cloud/shared/zabbix-graph-crud/zabbix-graph-crud.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AiObservabilityGpuServiceGraphsCrudService, GpuGraphCRUDViewdata } from './ai-observability-gpu-service-graphs-crud.service';

@Component({
  selector: 'ai-observability-gpu-service-graphs-crud',
  templateUrl: './ai-observability-gpu-service-graphs-crud.component.html',
  styleUrls: ['./ai-observability-gpu-service-graphs-crud.component.scss'],
  providers: [AiObservabilityGpuServiceGraphsCrudService]
})
export class AiObservabilityGpuServiceGraphsCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  pcId: string;
  deviceId: string;
  device: DeviceTabData;
  currentCriteria: SearchCriteria;

  count: number;
  isPageSizeAll: boolean = true;
  viewData: GpuGraphCRUDViewdata[] = [];

  graphItems: any;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';

  @ViewChild('graphFormRef') graphFormRef: ElementRef;
  graphModelRef: BsModalRef;
  graphForm: FormGroup;
  graphFormErrors: any;
  graphFormValidationMessages: any;

  // @ViewChild('confirmdelete') confirmdelete: ElementRef;
  // confirmGraphDeleteModalRef: BsModalRef;

  itemSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    showCheckAll: false,
    showUncheckAll: true,
    selectionLimit: 10
  };

  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  popOverList: any;

  constructor(private graphService: AiObservabilityGpuServiceGraphsCrudService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storage: StorageService,
    private modalService: BsModalService,
    private refreshService: DataRefreshBtnService,
    private utilService: AppUtilityService,
    private clientSideSearchPipe: ClientSideSearchPipe) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('Id'));
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      // this.spinner.start('main');
      this.device = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
      this.device.uuid = this.deviceId ? this.deviceId : this.pcId;
      this.getGraphItems();
      this.getGraphList();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getGraphList();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getGraphList();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getGraphList();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getGraphList();
  }

  getGraphList() {
    this.graphService.getGraphList(this.device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.graphService.convertGraphsToViewData(res.results);
      // this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  refreshData(pageNo?: number) {
    // this.spinner.start('main');
    this.getGraphList();
  }

  getGraphItems() {
    this.graphService.getGraphItems(this.device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphItems = res.map(name => ({
        label: name,
        value: name
      }));
    }, (err: HttpErrorResponse) => {
    });
  }

  buildAddEditForm() {
    this.graphForm = this.graphService.createGraphForm();
    this.graphFormErrors = this.graphService.resetGraphFormErrors();
    this.graphFormValidationMessages = this.graphService.graphFormValidationMessages;
    this.graphModelRef = this.modalService.show(this.graphFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.graphFormErrors = this.graphService.resetGraphFormErrors();
    if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.graphForm.controls) {
          this.graphFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.graphModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  confirmCreate() {
    this.graphForm.get('service_uuid').setValue(this.device.uuid);
    if (this.graphForm.invalid) {
      this.graphFormErrors = this.utilService.validateForm(this.graphForm, this.graphFormValidationMessages, this.graphFormErrors);
      this.graphForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.graphFormErrors = this.utilService.validateForm(this.graphForm, this.graphFormValidationMessages, this.graphFormErrors); });
    } else {
      // this.spinner.start('main');
      this.graphService.createGraph(this.device, this.graphForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.graphModelRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('Graph Created successfully.'));
        this.refreshData();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  addGraph() {
    this.action = 'Add';
    this.buildAddEditForm();
  }

  showExtraItems(view: GpuGraphCRUDViewdata) {
    this.popOverList = view.extraItems;
  }

}