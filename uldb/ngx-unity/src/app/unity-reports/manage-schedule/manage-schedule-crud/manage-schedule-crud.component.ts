import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import * as moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { ManageReportScheduleCRUDType, ManageScheduleCrudService, ReportScheduleIntervals } from './manage-schedule-crud.service';

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
  selector: 'manage-schedule-crud',
  templateUrl: './manage-schedule-crud.component.html',
  styleUrls: ['./manage-schedule-crud.component.scss'],
  providers: [ManageScheduleCrudService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }]
})
export class ManageScheduleCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;

  scheduleForm: FormGroup;
  scheduleFormErrors: any;
  scheduleValidationMessages: any;
  nonFieldErr: string = '';
  scheduleId: string;
  feature: string;
  action: 'Edit' | 'Create';
  todayDate: Date;

  orgUsers: UnitySetupUser[] = [];
  reports: ManageReportScheduleCRUDType[] = [];
  reportScheduleIntervals = ReportScheduleIntervals;


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
  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private reportSvc: ManageScheduleCrudService,
    private notificationService: AppNotificationService,
    public user: UserInfoService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      //On edit only
      this.scheduleId = params.get('scheduleId');
      //On create and edit
      this.feature = params.get('feature');
    });
  }

  ngOnInit(): void {
    if (this.scheduleId && this.feature) {
      this.action = 'Edit';
    } else if (this.feature && !this.scheduleId) {
      this.action = 'Create';
    }
    this.getReports();
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }

  getFormattedDate(): string {
    const today = moment();
    return today.format('DD/MM/YYYY');
  }

  toggleRepeats() {
    const isRepeatsChecked = this.scheduleForm.get('is_repeats').value;

    if (isRepeatsChecked) {
      this.scheduleForm.get('repeats_hr').setValue('');
      this.scheduleForm.get('repeats_mn').setValue('');
      this.scheduleForm.get('repeats_until').setValue('');
      this.scheduleForm.get('repeats_hr').enable();
      this.scheduleForm.get('repeats_mn').enable();
      this.scheduleForm.get('repeats_until').enable();
    } else {
      this.scheduleForm.get('repeats_hr').setValue('');
      this.scheduleForm.get('repeats_hr').setValue('');
      this.scheduleForm.get('repeats_mn').setValue('');
      this.scheduleForm.get('repeats_until').setValue('');
      this.scheduleForm.get('repeats_hr').disable();
      this.scheduleForm.get('repeats_mn').disable();
      this.scheduleForm.get('repeats_until').disable();
    }
  }

  toggleFields(selection: string) {
    if (selection === '') {
      this.scheduleForm.get('occurs').disable();
      this.scheduleForm.get('ends').disable();
    }
    if (selection === 'never') {
      this.scheduleForm.get('occurs').setValue('');
      this.scheduleForm.get('occurs').disable();
      this.scheduleForm.get('ends').setValue('');
      this.scheduleForm.get('ends').disable();
    } else if (selection === 'after') {
      this.scheduleForm.get('occurs').enable();
      this.scheduleForm.get('occurs').setValue('');
      this.scheduleForm.get('ends').setValue('');
      this.scheduleForm.get('ends').disable();
    } else if (selection === 'ends') {
      this.scheduleForm.get('occurs').setValue('');
      this.scheduleForm.get('occurs').disable();
      this.scheduleForm.get('ends').enable();
    }
  }

  getUsers() {
    this.reportSvc.getUsers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.orgUsers = res;
    }, err => {
      this.notificationService.error(new Notification('Error while fetching users. Please try again'));
    });
  }


  getReports() {
    this.spinner.start('main');
    this.reportSvc.getReports(this.feature).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.reports = res;
      this.buildForm();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while fetching report. Please try again'));
    });
  }

  buildForm() {
    this.nonFieldErr = '';
    this.scheduleFormErrors = this.reportSvc.resetScheduleFormErrors();
    this.scheduleValidationMessages = this.reportSvc.scheduleFormMessages;
    this.reportSvc.createScheduleForm(this.scheduleId, this.getFormattedDate()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.scheduleForm = form;
      if (this.action == 'Edit') {
        const report = this.scheduleForm.get('report_name').value;
        this.scheduleForm.get('report_name').setValue(report);
        this.scheduleForm.get('report_name').disable();

        if (this.scheduleForm.get('ends').value == null && this.scheduleForm.get('occurs').value === '') {
          this.scheduleForm.get('radioOptions').patchValue('never');
          this.toggleFields('never')

        }
        else if (this.scheduleForm.get('ends').value == null && this.scheduleForm.get('occurs').value !== '') {
          this.scheduleForm.get('radioOptions').patchValue('occur');
          this.scheduleForm.get('ends').setValue('');
          this.scheduleForm.get('ends').disable();

        }
        else {
          this.scheduleForm.get('radioOptions').patchValue('endsby');
          this.scheduleForm.get('occurs').setValue('');
          this.scheduleForm.get('occurs').disable();
        }
      }
      if (this.action == 'Create') {
        this.toggleFields('')
      }
    });
  }



  onSubmit() {
    this.spinner.start('main');
    if (this.scheduleForm.invalid) {
      this.scheduleFormErrors = this.utilService.validateForm(this.scheduleForm, this.scheduleValidationMessages, this.scheduleFormErrors);
      this.scheduleForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.scheduleFormErrors = this.utilService.validateForm(this.scheduleForm, this.scheduleValidationMessages, this.scheduleFormErrors); });
      this.spinner.stop('main');
    } else {
      let obj = this.scheduleForm.getRawValue();
      const data = this.reportSvc.getScheduleTypeFromFormdata(obj);
      if (obj.uuid && this.scheduleId) {
        this.reportSvc.editSchedule(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Schedule Updated Successfully.'));
          this.goToSchedule();
        }, err => {
          this.spinner.stop('main');
          this.notificationService.error(new Notification('Error while updating schedule. Please try again'));
        });
      } else {
        this.reportSvc.addSchedule(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Schedule Created Successfully.'));
          this.goToSchedule();
        }, err => {
          this.spinner.stop('main');
          this.notificationService.error(new Notification('Error while creating schedule. Please try again'));
        });
      }
    }
  }

  goToSchedule() {
    if (this.scheduleId) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }
}
