import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MtpAimlCorrelationRulesCrudService, queryBuilderClassNames, queryBuilderConfig } from './mtp-aiml-correlation-rules-crud.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { QueryBuilderClassNames, QueryBuilderConfig, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppLevelService } from 'src/app/app-level.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AIMLCorrelationRule } from 'src/app/shared/SharedEntityTypes/aiml-rules.type';

@Component({
  selector: 'mtp-aiml-correlation-rules-crud',
  templateUrl: './mtp-aiml-correlation-rules-crud.component.html',
  styleUrls: ['./mtp-aiml-correlation-rules-crud.component.scss'],
  providers: [MtpAimlCorrelationRulesCrudService]
})
export class MtpAimlCorrelationRulesCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  ruleId: string;
  isView: boolean = false;

  formErrors: any;
  validationMessages: any;
  form: FormGroup;
  nonFieldErr: string = '';

  tagsAutocompleteItems: string[] = [];

  valueFieldSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  queryBuilderConfig: QueryBuilderConfig = queryBuilderConfig;
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;

  public allowRuleset: boolean = true;
  public allowCollapse: boolean = false;
  public persistValueOnFieldChange: boolean = false;
  constructor(private crudSvc: MtpAimlCorrelationRulesCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.ruleId = params.get('ruleId');
    });
  }

  ngOnInit(): void {
    this.getTags();
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  reset() {
    this.formErrors = null;
    this.validationMessages = null;
    this.form = null;
    this.buildForm();
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  buildForm() {
    this.formErrors = this.crudSvc.resetRuleFormErrors();
    this.validationMessages = this.crudSvc.ruleFormValidationMessages;
    this.spinner.start('main');
    this.crudSvc.createRuleForm(this.ruleId, this.isView).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.form = res;
      setTimeout(() => {
        if (!this.form.contains('uuid')) {
          this.form.get('filter_rule_meta').setValue(null);
        }
      }, 50);
      this.formSubscriptions();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  formSubscriptions() {
    this.form.get('filter_rule_meta').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
      this.form.get('description').setValue(this.crudSvc.basicRulesetToSQL(val));
    });

    this.form.get('correlator').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'textual-similarity') {
        this.form.addControl('similarity_rate', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else {
        this.form.removeControl('similarity_rate');
      }
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

  onSubmit() {
    this.queryBuilder.submit();
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        });
    } else {
      let obj = <AIMLCorrelationRule>Object.assign({}, this.form.getRawValue());
      this.spinner.start('main');
      if (this.ruleId) {
        this.crudSvc.editRule(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Rule updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createRule(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Rule Created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    this.router.navigate(['correlationrules'], { relativeTo: this.route.parent });
  }
}
