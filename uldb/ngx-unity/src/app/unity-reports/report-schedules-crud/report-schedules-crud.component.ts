import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ReportScheduleIntervals, ReportSchedulesCrudService } from './report-schedules-crud.service';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'MMM DD, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
}

@Component({
  selector: 'report-schedules-crud',
  templateUrl: './report-schedules-crud.component.html',
  styleUrls: ['./report-schedules-crud.component.scss'],
  providers: [{ provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
  { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }]
})
export class ReportSchedulesCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  reportScheduleIntervals = ReportScheduleIntervals;

  @ViewChild('template') elementView: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  @ViewChild('successtemplate') successtemplate: ElementRef;
  successModalRef: BsModalRef;

  orgUsers: UnitySetupUser[] = [];

  scheduleForm: FormGroup;
  scheduleFormErrors: any;
  scheduleValidationMessages: any;
  nonFieldErr: string = '';
  scheduleId: string;
  action: 'Edit' | 'Add';

  emailSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    keyToSelect: 'email',
    lableToDisplay: 'email',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  constructor(private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private router: Router,
    private reportSvc: ReportSchedulesCrudService,
    private notificationService: AppNotificationService,
    public user: UserInfoService) {
    this.reportSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(obj => {
      this.action = obj.uuid ? 'Edit' : 'Add';
      this.modalRef = null;
      this.buildForm(obj.uuid, obj.data);
    });
    this.reportSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(scheduleId => {
      this.scheduleId = scheduleId;
      this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit(): void {
    this.getUsers();
  }
  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUsers() {
    this.reportSvc.getUsers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.orgUsers = res;
    });
  }

  buildForm(uuid: string, obj: any) {
    this.nonFieldErr = '';
    this.scheduleFormErrors = this.reportSvc.resetScheduleFormErrors();
    this.scheduleValidationMessages = this.reportSvc.scheduleFormMessages;
    this.reportSvc.createScheduleForm(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.scheduleForm = form;
      if (obj) {
        this.scheduleForm.setControl('report_meta', new FormControl(obj));
      }
      this.scheduleForm.get('frequency').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val) {
          this.scheduleForm.addControl('scheduled_time', new FormControl('', [Validators.required]));
          if (val == this.reportScheduleIntervals.WEEKLY) {
            this.scheduleForm.addControl('scheduled_day', new FormControl('Sunday'));
          } else {
            this.scheduleForm.removeControl('scheduled_day');
          }
        } else {
          this.scheduleForm.removeControl('scheduled_time');
        }
      });
      this.modalRef = this.modalService.show(this.elementView, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  onSubmit() {
    if (this.scheduleForm.invalid) {
      this.scheduleFormErrors = this.utilService.validateForm(this.scheduleForm, this.scheduleValidationMessages, this.scheduleFormErrors);
      this.scheduleForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.scheduleFormErrors = this.utilService.validateForm(this.scheduleForm, this.scheduleValidationMessages, this.scheduleFormErrors); });
    } else {
      let obj = this.scheduleForm.getRawValue();
      if (obj.uuid) {
        this.reportSvc.editSchedule(obj.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.modalRef.hide();
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Schedule Updated Successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        });
      } else {
        this.reportSvc.addSchedule(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.modalRef.hide();
          this.successModalRef = this.modalService.show(this.successtemplate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Schedule Created Successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        });
      }
    }
  }

  confirmDelete() {
    this.reportSvc.confirmDelete(this.scheduleId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDeleteModalRef.hide();
      this.notificationService.success(new Notification('Schedule deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.notificationService.error(new Notification('Schedule could not be deleted!!'));
    });
  }

  goToSchedule() {
    this.successModalRef.hide();
    this.router.navigateByUrl('reports/schedules');
  }
}