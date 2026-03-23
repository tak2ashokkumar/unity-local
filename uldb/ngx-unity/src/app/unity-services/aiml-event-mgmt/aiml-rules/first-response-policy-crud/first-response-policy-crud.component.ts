import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AIMLSourceData } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { QueryBuilderClassNames, QueryBuilderConfig } from 'src/app/shared/query-builder/query-builder.interfaces';
import { AimlRulesService } from '../aiml-rules.service';
import { FirstResponsePolicy } from '../first-response-policy.type';
import { FirstResponsePolicyCrudService, queryBuilderClassNames, queryBuilderConfig } from './first-response-policy-crud.service';

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
  selector: 'first-response-policy-crud',
  templateUrl: './first-response-policy-crud.component.html',
  styleUrls: ['./first-response-policy-crud.component.scss'],
  providers: [{ provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE], },
  { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    FirstResponsePolicyCrudService, AimlRulesService]
})
export class FirstResponsePolicyCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  policyId: string;
  sources: AIMLSourceData[] = [];
  eventTypes: string[] = [];
  eventCategories: string[] = [];

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';

  tagsAutocompleteItems: string[] = [];

  queryBuilderConfig: QueryBuilderConfig;
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;

  public allowRuleset: boolean = true;
  public allowCollapse: boolean = false;
  public persistValueOnFieldChange: boolean = false;

  constructor(private crudSvc: FirstResponsePolicyCrudService,
    private ruleSvc: AimlRulesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.policyId = params.get('policyId');
    });
  }

  ngOnInit() {
    this.spinner.start('main');
    // this.getDropdownData();
    this.getDropdownFields();
    this.getTags();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  reset() {
    this.form = null;
    this.formErrors = null;
    this.validationMessages = null;
    this.buildForm();
  }

  getDropdownData() {
    this.sources = [];
    this.eventTypes = [];
    this.eventCategories = [];
    let config = queryBuilderConfig;
    this.ruleSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ sources, eventTypes, eventCategories }) => {
        if (sources) {
          this.sources = _clone(sources);
        } else {
          this.sources = [];
          this.notification.error(new Notification("Error while fetching event sources"));
        }
        this.setEventSources(config);

        if (eventTypes) {
          this.eventTypes = _clone(eventTypes);
        } else {
          this.eventTypes = [];
          this.notification.error(new Notification("Error while fetching event types"));
        }
        this.setEventTypes(config);

        if (eventCategories) {
          this.eventCategories = _clone(eventCategories);
        } else {
          this.eventCategories = [];
          this.notification.error(new Notification("Error while fetching event categories"));
        }
        this.setEventCategories(config);
        this.queryBuilderConfig = config;
        setTimeout(() => {
          this.buildForm();
          this.spinner.stop('main');
        }, 100);
      });
  }

  getDropdownFields() {
    this.ruleSvc.getDropdownFields().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.length) {
        this.queryBuilderConfig = this.crudSvc.convert(res);
      }
      this.buildForm();
      this.spinner.stop('main');
    })
  }

  setEventSources(config: any) {
    let sources = [];
    if (this.sources.length) {
      for (var i = 0; i < this.sources.length; i++) {
        let src = this.sources[i].source;
        let obj = { name: src.name, value: src.id };
        sources.push(obj);
      }
      config.fields['Event Source'].options = sources;
      config.fields['Event Source'].defaultValue = sources[0].value;
    } else {
      config.fields['Event Source'].options = [];
      config.fields['Event Source'].defaultValue = null;
    }
  }

  setEventTypes(config: any) {
    let types = [];
    if (this.eventTypes.length) {
      for (var i = 0; i < this.eventTypes.length; i++) {
        let type = this.eventTypes[i];
        let obj = { name: type, value: type };
        types.push(obj);
      }
      config.fields['Event Type'].options = types;
      config.fields['Event Type'].defaultValue = types[0].value;
    } else {
      config.fields['Event Type'].options = [];
      config.fields['Event Type'].defaultValue = null;
    }
  }

  setEventCategories(config: any) {
    let categories = [];
    if (this.eventCategories.length) {
      for (var i = 0; i < this.eventCategories.length; i++) {
        let category = this.eventCategories[i];
        let obj = { name: category, value: category };
        categories.push(obj);
      }
      config.fields['Event Category'].options = categories;
      config.fields['Event Category'].defaultValue = categories[0].value;
    } else {
      config.fields['Event Category'].options = [];
      config.fields['Event Category'].defaultValue = null;
    }
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  enableFilter() {
    this.form.get('filter_enabled').setValue(true);
  }

  disableFilter() {
    this.form.get('filter_enabled').setValue(false);
  }

  buildForm() {
    this.spinner.start('main');
    this.formErrors = this.crudSvc.resetPolicyFormErrors();
    this.validationMessages = this.crudSvc.formValidationMessages;
    this.crudSvc.createPolicyForm(this.policyId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.form = res;
      this.formSubscriptions();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  private setSuppressHour() {
    let hr = this.form.get('next_hr').value ? this.form.get('next_hr').value : 0;
    let min = this.form.get('next_min').value ? this.form.get('next_min').value : 0;
    let suppress_hr = hr + ':' + min;
    this.form.get('suppress_hours').setValue(suppress_hr);
  }

  formSubscriptions() {
    this.form.get('filter_enabled').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      setTimeout(() => {
        this.form.get('filter_rule_meta').setValue(null);
      }, 50);
    });
    this.form.get('next_hr').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      if (val) {
        this.setSuppressHour();
      }
    });
    this.form.get('next_min').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      if (val) {
        this.setSuppressHour();
      }
    });
    this.form.get('suppress_time_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val) {
        this.form.get('next_hr').clearValidators();
        this.form.get('next_min').clearValidators();
        this.form.get('start_datetime').clearValidators();
        this.form.get('end_datetime').clearValidators();
        this.form.removeValidators([Validators.required]);
        if (val == 'next') {
          this.form.get('next_hr').setValidators([Validators.required, NoWhitespaceValidator]);
          this.form.get('next_min').setValidators([Validators.required, NoWhitespaceValidator]);
        }
        if (val == 'custom') {
          this.form.get('start_datetime').setValidators([Validators.required, NoWhitespaceValidator]);
          this.form.get('end_date_status').setValue('on')
        }
        this.form.get('next_hr').updateValueAndValidity();
        this.form.get('next_min').updateValueAndValidity();
        this.form.get('start_datetime').updateValueAndValidity();
        this.form.get('end_datetime').updateValueAndValidity();
        this.form.updateValueAndValidity();
      }
    });
    this.form.get('end_date_status').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'never') {
        this.form.get('end_datetime').clearValidators();
        this.form.get('end_datetime').setValue(null);
        this.form.get('end_datetime').disable();
      }
      if (val == 'on') {
        this.form.get('end_datetime').enable();
        this.form.get('end_datetime').setValidators([Validators.required, NoWhitespaceValidator]);
        this.form.setValidators(this.utilService.dateRangeValidator('start_datetime', 'end_datetime'));
      }
      this.form.get('end_datetime').updateValueAndValidity();
      this.form.updateValueAndValidity();
    });
  }

  handleError(err: any) {
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.filter_rule_meta) {
      this.nonFieldErr = err.filter_rule_meta[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  private setDaterangeError() {
    if (this.form.errors) {
      this.formErrors.fromAfterTo = this.form.errors.fromAfterTo ? 'Start date cannot be after end date' : '';
    }
  }

  onSubmit() {
    if (this.form.controls.filter_enabled.value) {
      this.queryBuilder.submit();
    }
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.setDaterangeError();
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
          this.setDaterangeError();
        });
    } else {
      let obj = <FirstResponsePolicy>Object.assign({}, this.form.getRawValue());
      this.spinner.start('main');
      if (this.policyId) {
        this.crudSvc.editPolicy(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Policy updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createPolicy(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Policy Created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['firstresponsepolicies'], { relativeTo: this.route.parent });
  }
}