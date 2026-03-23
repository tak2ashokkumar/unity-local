import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UsmAnomalyDetectionService, anomalyDetectionColumnMapping, anomalyDetectionViewData } from './usm-anomaly-detection.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'usm-anomaly-detection',
  templateUrl: './usm-anomaly-detection.component.html',
  styleUrls: ['./usm-anomaly-detection.component.scss'],
  providers: [UsmAnomalyDetectionService]
})
export class UsmAnomalyDetectionComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  count: number = 0;
  viewData: any[] = [];
  tableColumns: TableColumnMapping[] = anomalyDetectionColumnMapping;
  columnForm: FormGroup;
  columnsSelected: TableColumnMapping[] = [];
  seletedTriggerId: string;
  anomalyDetectionView: anomalyDetectionViewData;

  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    selectAsObject: true,
    selectionLimit: 10,
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  constructor(private svc: UsmAnomalyDetectionService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private storageService: StorageService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    setTimeout(() => {
      // this.columnsSelected = this.tableColumns.filter(col => col.default);
      this.getAnomalyDetections();
      // this.buildColumnForm();
    }, 0);
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    // this.columnsSelected = this.tableColumns.filter(col => col.default);
    // this.buildColumnForm();
    this.getAnomalyDetections();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAnomalyDetections();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAnomalyDetections();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getAnomalyDetections();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAnomalyDetections();
  }

  getAnomalyDetections() {
    this.svc.getAnomalyDetections(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Anomaly Detections.'));
    })
  }

  buildColumnForm() {
    this.columnForm = this.svc.buildColumnSelectionForm(this.columnsSelected);
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }

  switchTriggerStatus(view: anomalyDetectionViewData) {
    this.spinner.start('main');
    if (view.isTriggerDisabled) {
      this.svc.enableTrigger(view, view.triggerId.toString()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        // this.spinner.stop('main');
        this.notification.success(new Notification('Trigger enabled successfully.'));
        this.getAnomalyDetections();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable trigger. Please try again later.'));
      });
    } else {
      this.svc.disableTrigger(view, view.triggerId.toString()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        // this.spinner.stop('main');
        this.notification.success(new Notification('Trigger disabled successfully.'));
        this.getAnomalyDetections();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to disable trigger. Please try again later.'));
      });
    }
  }

  deleteTrigger(view: anomalyDetectionViewData) {
    if (!view.triggerCanDelete) {
      return;
    }
    this.anomalyDetectionView = view;
    this.seletedTriggerId = view.triggerId.toString();
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.svc.deleteTrigger(this.anomalyDetectionView, this.seletedTriggerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      // this.spinner.stop('main');
      this.notification.success(new Notification('Trigger deleted successfully.'));
      this.getAnomalyDetections();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Trigger. Please try again later.'));
    })
  }

  goToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(view: anomalyDetectionViewData) {
    this.storageService.put('device', { name: view.deviceName, deviceType: view.deviceType, uuid: view.deviceId }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.triggerId, 'edit'], { relativeTo: this.route });
  }

}
