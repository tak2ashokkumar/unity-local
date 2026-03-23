import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AIMLSourceData } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { QueryBuilderComponent } from 'src/app/shared/query-builder/query-builder.component';
import { QueryBuilderClassNames, QueryBuilderConfig, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';
import { AimlRulesService } from '../aiml-rules.service';
import { AIMLCorrelationRule } from '../aiml-rules.type';
import { AimlCorrelationRuleCrudService, correlatorOptions, correlatorWeights, queryBuilderClassNames, queryBuilderConfig } from './aiml-correlation-rule-crud.service';

@Component({
  selector: 'aiml-correlation-rule-crud',
  templateUrl: './aiml-correlation-rule-crud.component.html',
  styleUrls: ['./aiml-correlation-rule-crud.component.scss'],
  providers: [AimlCorrelationRuleCrudService, AimlRulesService]
})
export class AimlCorrelationRuleCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  ruleId: string;
  isView: boolean;

  sources: AIMLSourceData[] = [];
  eventTypes: string[] = [];
  eventCategories: string[] = [];

  formErrors: any;
  validationMessages: any;
  form: FormGroup;
  nonFieldErr: string = '';

  tagsAutocompleteItems: string[] = [];
  maxPriority: number;

  correlators = correlatorOptions;
  specificity: number;
  currentRuleSetValue: RuleSet;

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

  correlatorSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'option',
    keyToSelect: 'values',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  queryBuilderConfig: QueryBuilderConfig;
  queryBuilderClassNames: QueryBuilderClassNames = queryBuilderClassNames;
  @ViewChild('queryBuilder') queryBuilder: QueryBuilderComponent;

  public allowRuleset: boolean = true;
  public allowCollapse: boolean = false;
  public persistValueOnFieldChange: boolean = false;
  constructor(private crudSvc: AimlCorrelationRuleCrudService,
    private ruleSvc: AimlRulesService,
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

  ngOnInit() {
    this.spinner.start('main');
    // this.getDropdownData();
    this.getDropdownFields();
    this.getTags();
    this.getMaxPriority();
  }

  ngOnDestroy() {
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
    });
  }

  onTagInputChange(newValue: any) {
    this.form.get('description').setValue(this.crudSvc.basicRulesetToSQL(this.form.get('filter_rule_meta').value));
    this.specificity = this.crudSvc.calculateSpecificity(this.form.get('filter_rule_meta').value);
    this.form.get('specificity').setValue(this.specificity);
  }

  formSubscriptions() {
    this.currentRuleSetValue = this.form.get('filter_rule_meta').value;
    this.form.get('filter_enabled').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: boolean) => {
      if (val) {
        // this.form.get('filter_rule_meta').setValue(null);
        if (this.currentRuleSetValue) {
          this.form.get('filter_rule_meta').setValue(this.currentRuleSetValue);
          this.form.get('description').setValue(this.crudSvc.basicRulesetToSQL(this.currentRuleSetValue));
          this.specificity = this.crudSvc.calculateSpecificity(this.currentRuleSetValue);
          this.form.get('specificity').setValue(this.specificity);
          if (this.form.get('correlators').value.length > 0) {
            let totalWeight = 0;
            for (const correlator of this.form.get('correlators').value) {
              if (correlatorWeights.hasOwnProperty(correlator)) {
                totalWeight += correlatorWeights[correlator];
              }
            }
            this.form.get('specificity').setValue(this.specificity * totalWeight + this.specificity);
          } else {
            this.specificity = this.crudSvc.calculateSpecificity(this.form.get('filter_rule_meta')?.value);
            this.form.get('specificity').setValue(this.specificity);
          }
        }
        this.form.get('filter_rule_meta').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
          this.currentRuleSetValue = val;
          this.form.get('description').setValue(this.crudSvc.basicRulesetToSQL(val));
          this.specificity = this.crudSvc.calculateSpecificity(val);
          this.form.get('specificity').setValue(this.specificity);
          if (this.form.get('correlators').value.length > 0) {
            let totalWeight = 0;
            for (const correlator of this.form.get('correlators').value) {
              if (correlatorWeights.hasOwnProperty(correlator)) {
                totalWeight += correlatorWeights[correlator];
              }
            }
            this.form.get('specificity').setValue(this.specificity * totalWeight + this.specificity);
          } else {
            this.specificity = this.crudSvc.calculateSpecificity(this.form.get('filter_rule_meta')?.value);
            this.form.get('specificity').setValue(this.specificity);
          }
        });
      } else {
        this.specificity = 10;
        this.form.get('specificity').setValue(this.specificity);
        if (this.form.get('correlators').value.length > 0) {
          let totalWeight = 0;
          for (const correlator of this.form.get('correlators').value) {
            if (correlatorWeights.hasOwnProperty(correlator)) {
              totalWeight += correlatorWeights[correlator];
            }
          }
          this.form.get('specificity').setValue(this.specificity * totalWeight + this.specificity);
        } else {
          this.specificity = 10;
          this.form.get('specificity').setValue(this.specificity);
        }
      }
    });
    if (this.form.get('filter_enabled').value) {
      this.currentRuleSetValue = this.form.get('filter_rule_meta').value;
      this.form.get('filter_rule_meta').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
        this.currentRuleSetValue = val;
        this.form.get('description').setValue(this.crudSvc.basicRulesetToSQL(val));
        this.specificity = this.crudSvc.calculateSpecificity(val);
        this.form.get('specificity').setValue(this.specificity);
        if (this.form.get('correlators').value.length > 0) {
          let totalWeight = 0;
          for (const correlator of this.form.get('correlators').value) {
            if (correlatorWeights.hasOwnProperty(correlator)) {
              totalWeight += correlatorWeights[correlator];
            }
          }
          this.form.get('specificity').setValue(this.specificity * totalWeight + this.specificity);
        } else {
          this.specificity = this.crudSvc.calculateSpecificity(this.form.get('filter_rule_meta')?.value);
          this.form.get('specificity').setValue(this.specificity);
        }
      });
    }

    // this.form.get('filter_rule_meta').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: RuleSet) => {
    //   this.form.get('description').setValue(this.crudSvc.basicRulesetToSQL(val));
    //   this.specificity = this.crudSvc.calculateSpecificity(val);
    //   this.form.get('specificity').setValue(this.specificity);
    //   if (this.form.get('correlators').value.length > 0) {
    //     let totalWeight = 0;
    //     for (const correlator of this.form.get('correlators').value) {
    //       if (correlatorWeights.hasOwnProperty(correlator)) {
    //         totalWeight += correlatorWeights[correlator];
    //       }
    //     }
    //     this.form.get('specificity').setValue(this.specificity * totalWeight + this.specificity);
    //   } else {
    //     this.specificity = this.crudSvc.calculateSpecificity(this.form.get('filter_rule_meta')?.value);
    //     this.form.get('specificity').setValue(this.specificity);
    //   }
    // });

    this.form.get('correlators').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val.length > 0) {
        let totalWeight = 0;
        for (const correlator of val) {
          if (correlatorWeights.hasOwnProperty(correlator)) {
            totalWeight += correlatorWeights[correlator];
          }
        }
        this.form.get('specificity').setValue(this.specificity * totalWeight + this.specificity);
      } else {
        this.specificity = this.crudSvc.calculateSpecificity(this.form.get('filter_rule_meta')?.value);
        this.form.get('specificity').setValue(this.specificity);
      }
      const isTextualSimilaritySelected = val.includes('textual-similarity');
      if (isTextualSimilaritySelected) {
        this.form.addControl('similarity_rate', new FormControl('', [Validators.required, NoWhitespaceValidator]));
      } else {
        this.form.removeControl('similarity_rate');
      }
    });
  }

  enableFilter() {
    this.form.get('filter_enabled').setValue(true);
  }

  disableFilter() {
    this.form.get('filter_enabled').setValue(false);
  }

  handleError(err: any) {
    // if (err.non_field_errors) {
    //   this.nonFieldErr = err.non_field_errors[0];
    // } else if (err.filter_rule_meta) {
    //   this.nonFieldErr = err.filter_rule_meta[0];
    // } else if (err) {
    //   for (const field in err) {
    //     if (field in this.form.controls) {
    //       this.formErrors[field] = err[field][0];
    //     }
    //   }
    // }
    // console.log(typeof err);
    if (err.nonFieldError) {
      this.notification.error(new Notification(`${err.nonFieldError} with Name: ${err.conflicting_rule.name}, Priority: ${err.conflicting_rule.priority} and Specificity: ${err.conflicting_rule.specificity}. Please modify the Priority accordingly.`));
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    }
    else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        });
    } else {
      if (this.form.get('filter_enabled').value) {
        this.queryBuilder.submit();
      }
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

  getMaxPriority() {
    this.crudSvc.getMaxPriority().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.maxPriority = res.max_priority;
    })
  }
}
