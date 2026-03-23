import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ZabbixTriggerScriptFormdata, ZabbixTriggerScriptsService } from './zabbix-trigger-scripts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ZabbixTriggerScriptViewdata } from '../zabbix-trigger-scripts/zabbix-trigger-scripts.service';
import { Subject, from } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'zabbix-trigger-scripts',
  templateUrl: './zabbix-trigger-scripts.component.html',
  styleUrls: ['./zabbix-trigger-scripts.component.scss'],
  providers: [ZabbixTriggerScriptsService],
})

export class ZabbixTriggerScriptsComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  @ViewChild('scriptCRUD') scriptCRUD: ElementRef;
  @ViewChild('scriptView') scriptView: ElementRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  @Output() toggleModal: EventEmitter<string> = new EventEmitter<string>();
  private ngUnsubscribe = new Subject();
  action: 'Add' | 'Edit';
  fileToUpload: File;
  selectedview: ZabbixTriggerScriptViewdata;
  viewData: ZabbixTriggerScriptViewdata[] = [];
  currentCriteria: SearchCriteria;
  nonFieldErr: string = '';
  device: DeviceTabData;
  selectedFileIndex: number;
  confirmScriptDeleteModalRef: BsModalRef;
  selectedScript: ZabbixTriggerScriptViewdata;
  fileSelected: boolean = false;

  scriptModelRef: BsModalRef;
  scriptForm: FormGroup;
  scriptFormErrors: any;
  scriptFormValidationMessages: any;
  filterForm: FormGroup;

  constructor(private triggerScriptService: ZabbixTriggerScriptsService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private refreshService: DataRefreshBtnService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.nonFieldErr = '';
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getScripts();
    this.buildFilterForm();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main')
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getScripts();
    this.buildFilterForm();
  }

  refreshData() {
    this.spinner.start('main');
    this.getScripts();
    this.buildFilterForm();
  }

  getScripts() {
    this.triggerScriptService.getScripts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.triggerScriptService.convertToViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get scripts'));
    });
  }

  buildFilterForm() {
    this.filterForm = this.triggerScriptService.buildFilterForm();
  }

  onDateChanged() {
    this.filterForm.get('startDate').setValue(this.filterForm.getRawValue()['dateRange'][0].format('YYYY-MM-DD'));
    this.filterForm.get('endDate').setValue(this.filterForm.getRawValue()['dateRange'][1].format('YYYY-MM-DD'));
  }

  filterScripts() {
    this.triggerScriptService.filterScripts(this.filterForm.getRawValue()).subscribe(res => {
      this.viewData = this.triggerScriptService.convertToViewData(res);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to filter scripts'));
    });
  }

  fetchScriptContent(view: ZabbixTriggerScriptViewdata) {
    this.triggerScriptService.fetchScriptContent(view).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (content: string) => {
        view.content = content;
      },
      (error: any) => {
        console.error('Failed to fetch script content:', error);
      }
    );
  }

  buildForm() {
    this.scriptForm = this.triggerScriptService.buildForm(this.selectedview);
    this.scriptFormErrors = this.triggerScriptService.resetFormErrors();
    this.scriptFormValidationMessages = this.triggerScriptService.formValidationMessages;
    this.scriptForm.get('device_category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'Virtual Machines' || val == 'Hypervisors' || val == 'Bare Metal Servers') {
        this.scriptForm.addControl('os', new FormControl('', [Validators.required]));
      } else {
        this.scriptForm.removeControl('os');
      }
    });
  }

  addFile() {
    this.selectedview = null;
    this.nonFieldErr = '';
    this.action = 'Add';
    this.buildForm();
    this.scriptModelRef = this.modalService.show(this.scriptCRUD, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  editFile(index: number) {
    this.selectedview = this.viewData[index];
    this.nonFieldErr = '';
    this.action = 'Edit';
    this.buildForm();
    this.scriptModelRef = this.modalService.show(this.scriptCRUD, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  viewFile(index: number) {
    this.selectedScript = this.viewData[index];
    this.selectedScript.content = '';
    this.fetchScriptContent(this.selectedScript);
    this.scriptModelRef = this.modalService.show(this.scriptView, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  closeAddModal() {
    this.selectedScript = null;
    this.toggleModal.emit();
    this.scriptModelRef.hide();
  }

  deleteFile(index: number) {
    this.selectedview = this.viewData[index];
    this.confirmScriptDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  scriptFile(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
  }

  selectFile(index: number) {
    this.selectedFileIndex = index;
    this.fileSelected = true;
  }

  handleError(err: any) {
    this.scriptFormErrors = this.triggerScriptService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.scriptForm.controls) {
          this.scriptFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.scriptModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onScriptSubmit() {
    if (this.scriptForm.invalid) {
      this.scriptFormErrors = this.utilService.validateForm(this.scriptForm, this.scriptFormValidationMessages, this.scriptFormErrors);
      this.scriptForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.scriptFormErrors = this.utilService.validateForm(this.scriptForm, this.scriptFormValidationMessages, this.scriptFormErrors);
        });
    } else {
      let obj = <ZabbixTriggerScriptFormdata>Object.assign({}, this.scriptForm.getRawValue());
      this.spinner.start('main');
      if (this.action == 'Edit') {
        this.updateScript(obj);
      } else {
        this.addScript(obj);
      }
    }
  }

  private updateScript(obj: ZabbixTriggerScriptFormdata) {
    if (this.fileToUpload) {
      this.spinner.start('main');
      this.triggerScriptService.updateScript(this.selectedview.uuid, obj, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.scriptModelRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('Script Updated Successfully.'));
        this.onCrud.emit(CRUDActionTypes.UPDATE);
        this.getScripts();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
        this.spinner.stop('main');
        this.notification.error(new Notification('Script not Updated'));
      });
    } else {
      this.spinner.start('main');
      this.triggerScriptService.updateScript(this.selectedview.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.scriptModelRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('Script Updated Successfully.'));
        this.onCrud.emit(CRUDActionTypes.UPDATE);
        this.getScripts();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
        this.spinner.stop('main');
        this.notification.error(new Notification('Script not Updated'));
      });
    }
  }

  private addScript(obj: ZabbixTriggerScriptFormdata) {
    this.spinner.start('main');
    this.triggerScriptService.addScript(obj, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.scriptModelRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('Script Created Successfully.'));
      this.onCrud.emit(CRUDActionTypes.ADD);
      this.getScripts();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
      this.spinner.stop('main');
      this.notification.error(new Notification('Script not Created'));
    });
  }

  confirmScriptDelete() {
    this.confirmScriptDeleteModalRef.hide();
    this.spinner.start('main');
    this.triggerScriptService.deletescript(this.selectedview.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Script deleted successfully.'));
      this.getScripts();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification(' Script has more than one reference so it can not be deleted!! Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}