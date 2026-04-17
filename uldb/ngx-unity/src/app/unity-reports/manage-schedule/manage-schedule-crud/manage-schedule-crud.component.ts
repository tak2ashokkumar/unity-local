import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  DateTimeAdapter,
  MomentDateTimeAdapter,
  OWL_DATE_TIME_FORMATS,
  OWL_DATE_TIME_LOCALE,
} from '@busacca/ng-pick-datetime';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import {
  ManageReportScheduleCRUDType,
  ManageScheduleCrudService,
  ScheduleFormErrors,
  ScheduleValidationMessages,
} from './manage-schedule-crud.service';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'MMM DD, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

/**
 * Coordinates the Manage Schedule Crud screen state, template bindings, and user actions.
 */
@Component({
  selector: 'manage-schedule-crud',
  templateUrl: './manage-schedule-crud.component.html',
  styleUrls: ['./manage-schedule-crud.component.scss'],
  providers: [
    ManageScheduleCrudService,
    {
      provide: DateTimeAdapter,
      useClass: MomentDateTimeAdapter,
      deps: [OWL_DATE_TIME_LOCALE],
    },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageScheduleCrudComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private scheduleFormValueChangesBound = false;

  /**
   * Holds the reactive form used by the schedule create/edit workflow.
   */
  scheduleForm: FormGroup;

  /**
   * Stores validation errors displayed by the schedule form template.
   */
  scheduleFormErrors: ScheduleFormErrors;

  /**
   * Defines validation message text used by schedule form validation helpers.
   */
  scheduleValidationMessages: ScheduleValidationMessages;

  /**
   * Stores the active schedule identifier from the current route.
   */
  scheduleId: string;

  /**
   * Stores the currently selected report feature name.
   */
  feature: string;

  /**
   * Stores whether the current form is creating or editing an entity.
   */
  action: 'Edit' | 'Create';

  /**
   * Stores today's date in the display format required by the schedule form.
   */
  readonly formattedToday = moment().format('DD/MM/YYYY');

  /**
   * Stores organization users used by the recipient selector.
   */
  orgUsers: UnitySetupUser[] = [];

  /**
   * Indicates whether recipient options are available.
   */
  hasOrganizationUsers = false;

  /**
   * Stores reports available for the selected feature.
   */
  reports: ManageReportScheduleCRUDType[] = [];

  /**
   * Configures the recipient multiselect behavior.
   */
  readonly emailSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    keyToSelect: 'email',
    lableToDisplay: 'email',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private reportSvc: ManageScheduleCrudService,
    private notificationService: AppNotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: ParamMap) => {
        this.scheduleId = params.get('scheduleId');
        this.feature = params.get('feature');
        this.cdr.markForCheck();
      });
  }

  /**
   * Initializes Manage Schedule Crud Component data and subscriptions.
   *
   * @returns Nothing.
   */
  ngOnInit(): void {
    this.action = this.scheduleId && this.feature ? 'Edit' : 'Create';
    this.getReports();
    this.getUsers();
  }

  /**
   * Releases Manage Schedule Crud Component subscriptions and pending UI work.
   *
   * @returns Nothing.
   */
  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggles repeat interval controls based on the repeat checkbox.
   *
   * @returns Nothing.
   */
  toggleRepeats(): void {
    const isRepeatsChecked = !!this.scheduleForm.get('is_repeats').value;
    this.resetRepeatControls();
    this.setRepeatControlsEnabled(isRepeatsChecked);
  }

  /**
   * Toggles end-condition controls for the selected recurrence option.
   *
   * @param selection - Selected end-condition type.
   * @returns Nothing.
   */
  toggleFields(selection: string): void {
    const occursControl = this.scheduleForm.get('occurs');
    const endsControl = this.scheduleForm.get('ends');

    if (selection === '' || selection === 'never') {
      occursControl.setValue('');
      occursControl.disable();
      endsControl.setValue('');
      endsControl.disable();
      return;
    }

    if (selection === 'after') {
      occursControl.enable();
      occursControl.setValue('');
      endsControl.setValue('');
      endsControl.disable();
      return;
    }

    if (selection === 'ends') {
      occursControl.setValue('');
      occursControl.disable();
      endsControl.enable();
    }
  }

  /**
   * Loads organization users for the recipient selector.
   *
   * @returns Nothing.
   */
  getUsers(): void {
    this.reportSvc
      .getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (users) => {
          this.orgUsers = users;
          this.hasOrganizationUsers = users.length > 0;
          this.cdr.markForCheck();
        },
        () => {
          this.notificationService.error(
            new Notification('Error while fetching users. Please try again')
          );
          this.cdr.markForCheck();
        }
      );
  }

  /**
   * Loads reports for the selected feature and initializes the form.
   *
   * @returns Nothing.
   */
  getReports(): void {
    this.spinner.start('main');
    this.reportSvc
      .getReports(this.feature)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      )
      .subscribe(
        (reports) => {
          this.reports = reports;
          this.buildForm();
        },
        () => {
          this.notificationService.error(
            new Notification('Error while fetching report. Please try again')
          );
        }
      );
  }

  /**
   * Builds the reactive form for create or edit mode.
   *
   * @returns Nothing.
   */
  buildForm(): void {
    this.scheduleFormErrors = this.reportSvc.resetScheduleFormErrors();
    this.scheduleValidationMessages = this.reportSvc.scheduleFormMessages;
    this.reportSvc
      .createScheduleForm(this.scheduleId, this.formattedToday)
      .pipe(takeUntil(this.destroy$))
      .subscribe((form) => {
        this.scheduleForm = form;
        this.scheduleFormValueChangesBound = false;
        this.configureFormForAction();
        this.cdr.markForCheck();
      });
  }

  /**
   * Handles schedule create/update submission.
   *
   * @returns Nothing.
   */
  onSubmit(): void {
    this.spinner.start('main');

    if (this.scheduleForm.invalid) {
      this.validateScheduleForm();
      this.bindScheduleFormValidation();
      this.spinner.stop('main');
      this.cdr.markForCheck();
      return;
    }

    const formValue = this.scheduleForm.getRawValue();
    const data = this.reportSvc.getScheduleTypeFromFormdata(formValue);

    if (formValue.uuid && this.scheduleId) {
      this.updateSchedule(data);
      return;
    }

    this.createSchedule(data);
  }

  /**
   * Navigates back to the schedule listing route.
   *
   * @returns Nothing.
   */
  goToSchedule(): void {
    if (this.scheduleId) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
      return;
    }

    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  /**
   * Returns a stable identity for report options rendered by ngFor.
   *
   * @param _index - Index of the item rendered by ngFor.
   * @param report - Report option rendered by ngFor.
   * @returns A stable identity value for Angular change detection.
   */
  trackByReport(_index: number, report: ManageReportScheduleCRUDType): string {
    return report.uuid || `${report.report_name}`;
  }

  private configureFormForAction(): void {
    if (this.action === 'Edit') {
      const reportControl = this.scheduleForm.get('report_name');
      const report = reportControl.value;

      reportControl.setValue(report);
      reportControl.disable();
      this.configureEditEndCondition();
      return;
    }

    this.toggleFields('');
  }

  private configureEditEndCondition(): void {
    const endsControl = this.scheduleForm.get('ends');
    const occursControl = this.scheduleForm.get('occurs');
    const radioOptionsControl = this.scheduleForm.get('radioOptions');

    if (endsControl.value == null && occursControl.value === '') {
      radioOptionsControl.patchValue('never');
      this.toggleFields('never');
      return;
    }

    if (endsControl.value == null && occursControl.value !== '') {
      radioOptionsControl.patchValue('occur');
      endsControl.setValue('');
      endsControl.disable();
      return;
    }

    radioOptionsControl.patchValue('endsby');
    occursControl.setValue('');
    occursControl.disable();
  }

  private validateScheduleForm(): void {
    this.scheduleFormErrors = this.utilService.validateForm(
      this.scheduleForm,
      this.scheduleValidationMessages,
      this.scheduleFormErrors
    );
  }

  private bindScheduleFormValidation(): void {
    if (this.scheduleFormValueChangesBound) {
      return;
    }

    this.scheduleFormValueChangesBound = true;
    this.scheduleForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateScheduleForm();
        this.cdr.markForCheck();
      });
  }

  private createSchedule(data: ManageReportScheduleCRUDType): void {
    this.reportSvc
      .addSchedule(data)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      )
      .subscribe(
        () => {
          this.notificationService.success(
            new Notification('Schedule Created Successfully.')
          );
          this.goToSchedule();
        },
        () => {
          this.notificationService.error(
            new Notification('Error while creating schedule. Please try again')
          );
        }
      );
  }

  private updateSchedule(data: ManageReportScheduleCRUDType): void {
    this.reportSvc
      .editSchedule(data)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.stopSpinnerAndMarkForCheck())
      )
      .subscribe(
        () => {
          this.notificationService.success(
            new Notification('Schedule Updated Successfully.')
          );
          this.goToSchedule();
        },
        () => {
          this.notificationService.error(
            new Notification('Error while updating schedule. Please try again')
          );
        }
      );
  }

  private resetRepeatControls(): void {
    ['repeats_hr', 'repeats_mn', 'repeats_until'].forEach((controlName) => {
      this.scheduleForm.get(controlName).setValue('');
    });
  }

  private setRepeatControlsEnabled(isEnabled: boolean): void {
    ['repeats_hr', 'repeats_mn', 'repeats_until'].forEach((controlName) => {
      const control = this.scheduleForm.get(controlName);

      if (isEnabled) {
        control.enable();
      } else {
        control.disable();
      }
    });
  }

  private stopSpinnerAndMarkForCheck(): void {
    this.spinner.stop('main');
    this.cdr.markForCheck();
  }
}
