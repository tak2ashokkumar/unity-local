import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ZabbixTriggerRuleCRUDType } from 'src/app/shared/SharedEntityTypes/triggers.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MonitoringTemplates } from '../monitoring-template.service';
import { TriggerCrudService, ZABBIX_TRIGGER_FUNCTIONS, ZABBIX_TRIGGER_OPERATORS, ZabbixTriggerFunction, ZabbixTriggerItemsViewData, ZabbixTriggerOperator } from './trigger-crud.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'trigger-crud',
  templateUrl: './trigger-crud.component.html',
  styleUrls: ['./trigger-crud.component.scss'],
  providers: [TriggerCrudService]
})
export class TriggerCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  templateId: string;
  componentId: string;
  triggerId: string;
  action: 'Add' | 'Edit';

  nonFieldErr: string = '';
  modalRef: BsModalRef;
  formErrors: any;
  validationMessages: any;

  triggerForm: FormGroup;
  triggerFormErrors: any;
  triggerFormValidationMessages: any;

  triggerRulesForm: FormGroup;
  triggerRulesFormErrors: any;
  triggerRulesFormValidationMessages: any;
  zabbixTriggerFunctions: ZabbixTriggerFunction[] = _clone(ZABBIX_TRIGGER_FUNCTIONS);
  zabbixTriggerFunctionUnits: string[] = ['th value'];
  zabbixTriggerOperators: ZabbixTriggerOperator[] = _clone(ZABBIX_TRIGGER_OPERATORS);

  itemSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: false,
    keyToSelect: 'key',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    showCheckAll: false,
    showUncheckAll: true,
    selectionLimit: 10
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All selected',
  };

  items: ZabbixTriggerItemsViewData[] = [];
  constructor(private crudService: TriggerCrudService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService,
    private user: UserInfoService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.triggerId = params.get('triggerId');
      this.action = this.triggerId ? 'Edit' : 'Add';
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.templateId = params.get('id');
      this.componentId = params.get('componentId');
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    setTimeout(() => {
      this.getDropdownData();
    }, 0);
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    setTimeout(() => {
      this.buildTriggerForm();
      this.getDropdownData();
    }, 0);
  }

  template: MonitoringTemplates;
  getDropdownData() {
    this.crudService.getDropdownData(this.templateId, this.componentId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.items) {
        this.items = this.crudService.convertToItemViewData(res.items);
        this.buildTriggerRulesForm();
      } else {
        this.items = [];
        this.notification.error(new Notification('Failed to fetch rule items'));
      }

      if (res.templates) {
        this.template = res.templates.find(t => t.template_id == Number(this.templateId));
      } else {
        this.template = null;
        this.notification.error(new Notification('Failed to fetch rule items'));
      }
      this.buildTriggerForm();
      this.spinner.stop('main');
    })
  }

  buildTriggerForm() {
    this.crudService.createTriggerForm(this.triggerId, this.componentId, this.template).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.triggerForm = form;
      this.triggerFormErrors = this.crudService.resetTriggerFormErrors();
      this.triggerFormValidationMessages = this.crudService.triggerFormValidationMessages;
      // this.subscribeToForm();
    });
  }

  buildTriggerRulesForm(rule?: ZabbixTriggerRuleCRUDType) {
    if (!this.items.length) {
      // this.notification.error(new Notification('Items are not available to add rule.'));
      return;
    }
    this.triggerRulesForm = this.crudService.createTriggerRulesForm(rule);
    this.triggerRulesFormErrors = this.crudService.resetTriggerRulesFormErrors();
    this.triggerRulesFormValidationMessages = this.crudService.triggerRulesFormValidationMessages;
    this.handleItemSubscription();
    this.handleFunctionSubscriptions();
  }

  handleItemSubscription() {
    this.triggerRulesForm.get('item_key').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((item: ZabbixTriggerItemsViewData) => {
      this.zabbixTriggerFunctions = _clone(item.functions);
      // if (item.functions.length) {
      //   this.triggerRulesForm.get('value').clearValidators();
      //   this.triggerRulesForm.get('value').setValidators([Validators.required, NoWhitespaceValidator, item.functions[0].validatorFunction]);
      // }
      if (this.triggerRulesForm.controls.function_value) {
        this.triggerRulesForm.removeControl('function_value');
      }
      if (this.triggerRulesForm.controls.function_unit) {
        this.triggerRulesForm.removeControl('function_unit');
      }
    })
  }

  handleFunctionSubscriptions() {
    this.triggerRulesForm.get('function').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((func: ZabbixTriggerFunction) => {
      const val: string = func.key;
      switch (val) {
        case 'last': this.handleLastFunction(); break;
        case 'nodata': this.handleNoDataFunction(); break;
        case 'trendstl': this.handleAnomalyDetectionFunction(); break;
        case 'in': this.handleInFunction(); break;
        case 'between': this.handleBetweenFunction(); break;
        case 'find': this.handleFindFunction(); break;
        case 'min':
        case 'max':
        case 'sum':
        case 'delta':
        case 'avg':
          this.triggerRulesForm.removeControl('function_in');
          this.triggerRulesForm.removeControl('min_value');
          this.triggerRulesForm.removeControl('max_value');
          this.triggerRulesForm.removeControl('pattern');
          this.zabbixTriggerOperators = _clone(ZABBIX_TRIGGER_OPERATORS);
          if (this.triggerRulesForm.controls.function_value) {
            this.triggerRulesForm.get('function_value').clearValidators();
            this.triggerRulesForm.get('function_value').setValidators([Validators.required, func.validatorFunction]);
            this.triggerRulesForm.get('function_value').updateValueAndValidity();
          } else {
            if (func.validatorFunction) {
              this.triggerRulesForm.addControl('function_value', new FormControl('', [Validators.required, func.validatorFunction]));
            } else {
              this.triggerRulesForm.addControl('function_value', new FormControl('', [Validators.required]));
            }
          }
          this.zabbixTriggerFunctionUnits = func.key == 'nodata' ? ['seconds', 'minutes', 'hours'] : ['seconds', 'minutes', 'hours', 'counts'];
          if (this.triggerRulesForm.controls.function_unit) {
            this.triggerRulesForm.get('function_unit').patchValue('seconds');
            this.triggerRulesForm.get('function_unit').enable();
            this.triggerRulesForm.get('function_unit').updateValueAndValidity();
          } else {
            this.triggerRulesForm.addControl('function_unit', new FormControl('seconds'));
          }
          break;
        default:
          this.triggerRulesForm.removeControl('function_value');
          this.triggerRulesForm.removeControl('function_unit');
          this.triggerRulesForm.removeControl('function_in');
          this.triggerRulesForm.removeControl('min_value');
          this.triggerRulesForm.removeControl('max_value');
          this.triggerRulesForm.removeControl('pattern');
          this.triggerRulesForm.removeControl('detect_period');
          this.triggerRulesForm.removeControl('season');
          this.triggerRulesForm.removeControl('deviation');
          this.zabbixTriggerOperators = _clone(ZABBIX_TRIGGER_OPERATORS);
      }
    })
  }

  handleLastFunction() {
    this.triggerRulesForm.removeControl('function_in');
    this.triggerRulesForm.removeControl('min_value');
    this.triggerRulesForm.removeControl('max_value');
    this.triggerRulesForm.removeControl('pattern');
    this.triggerRulesForm.removeControl('detect_period');
    this.triggerRulesForm.removeControl('season');
    this.triggerRulesForm.removeControl('deviation');
    this.zabbixTriggerOperators = _clone(ZABBIX_TRIGGER_OPERATORS);
    this.zabbixTriggerFunctionUnits = ['counts'];
    if (this.triggerRulesForm.controls.function_value) {
      this.triggerRulesForm.get('function_value').clearValidators();
      this.triggerRulesForm.get('function_value').setValidators([NoWhitespaceValidator, RxwebValidators.digit()]);
    } else {
      this.triggerRulesForm.addControl('function_value', new FormControl('', [NoWhitespaceValidator, RxwebValidators.digit()]));
    }

    if (this.triggerRulesForm.controls.function_unit) {
      this.triggerRulesForm.get('function_unit').clearValidators();
      this.triggerRulesForm.get('function_unit').setValidators([]);
      this.triggerRulesForm.get('function_unit').patchValue(this.zabbixTriggerFunctionUnits[0]);
    } else {
      this.triggerRulesForm.addControl('function_unit', new FormControl(this.zabbixTriggerFunctionUnits[0], []));
    }
    this.triggerRulesForm.get('function_value').updateValueAndValidity();
    this.triggerRulesForm.get('function_unit').updateValueAndValidity();
  }

  handleNoDataFunction() {
    this.triggerRulesForm.removeControl('function_in');
    this.triggerRulesForm.removeControl('min_value');
    this.triggerRulesForm.removeControl('max_value');
    this.triggerRulesForm.removeControl('pattern');
    this.triggerRulesForm.removeControl('detect_period');
    this.triggerRulesForm.removeControl('season');
    this.triggerRulesForm.removeControl('deviation');
    this.zabbixTriggerOperators = _clone(ZABBIX_TRIGGER_OPERATORS);
    this.zabbixTriggerFunctionUnits = ['seconds', 'minutes', 'hours'];
    if (this.triggerRulesForm.controls.function_value) {
      this.triggerRulesForm.get('function_value').clearValidators();
      this.triggerRulesForm.get('function_value').setValidators([NoWhitespaceValidator, RxwebValidators.digit()]);
    } else {
      this.triggerRulesForm.addControl('function_value', new FormControl('', [NoWhitespaceValidator, RxwebValidators.digit()]));
    }

    if (this.triggerRulesForm.controls.function_unit) {
      this.triggerRulesForm.get('function_unit').clearValidators();
      this.triggerRulesForm.get('function_unit').setValidators([]);
      this.triggerRulesForm.get('function_unit').patchValue(this.zabbixTriggerFunctionUnits[0]);
    } else {
      this.triggerRulesForm.addControl('function_unit', new FormControl(this.zabbixTriggerFunctionUnits[0], []));
    }
    this.triggerRulesForm.get('function_value').updateValueAndValidity();
    this.triggerRulesForm.get('function_unit').updateValueAndValidity();
  }

  handleInFunction() {
    this.triggerRulesForm.removeControl('min_value');
    this.triggerRulesForm.removeControl('max_value');
    this.triggerRulesForm.removeControl('pattern');
    this.triggerRulesForm.removeControl('detect_period');
    this.triggerRulesForm.removeControl('season');
    this.triggerRulesForm.removeControl('deviation');
    this.zabbixTriggerOperators = _clone(ZABBIX_TRIGGER_OPERATORS).filter(op => op.key == '=' || op.key == '<>');
    this.zabbixTriggerFunctionUnits = ['counts'];
    if (this.triggerRulesForm.controls.function_value) {
      this.triggerRulesForm.get('function_value').clearValidators();
      this.triggerRulesForm.get('function_value').setValidators([NoWhitespaceValidator, RxwebValidators.digit()]);
    } else {
      this.triggerRulesForm.addControl('function_value', new FormControl('', [NoWhitespaceValidator, RxwebValidators.digit()]));
    }

    if (this.triggerRulesForm.controls.function_unit) {
      this.triggerRulesForm.get('function_unit').clearValidators();
      this.triggerRulesForm.get('function_unit').setValidators([]);
      this.triggerRulesForm.get('function_unit').patchValue(this.zabbixTriggerFunctionUnits[0]);
    } else {
      this.triggerRulesForm.addControl('function_unit', new FormControl(this.zabbixTriggerFunctionUnits[0], []));
    }

    if (this.triggerRulesForm.controls.function_in) {
      this.triggerRulesForm.get('function_in').clearValidators();
      this.triggerRulesForm.get('function_in').setValidators([Validators.required, NoWhitespaceValidator, RxwebValidators.digit()]);
    } else {
      this.triggerRulesForm.addControl('function_in', new FormControl('', [Validators.required, NoWhitespaceValidator, RxwebValidators.digit()]));
    }

    this.triggerRulesForm.get('function_value').updateValueAndValidity();
    this.triggerRulesForm.get('function_unit').updateValueAndValidity();
    this.triggerRulesForm.get('function_in').updateValueAndValidity();
  }

  handleBetweenFunction() {
    this.triggerRulesForm.removeControl('function_in');
    this.triggerRulesForm.removeControl('pattern');
    this.triggerRulesForm.removeControl('detect_period');
    this.triggerRulesForm.removeControl('season');
    this.triggerRulesForm.removeControl('deviation');
    this.zabbixTriggerOperators = _clone(ZABBIX_TRIGGER_OPERATORS).filter(op => op.key == '=' || op.key == '<>');
    this.zabbixTriggerFunctionUnits = ['counts'];

    if (this.triggerRulesForm.controls.function_value) {
      this.triggerRulesForm.get('function_value').clearValidators();
      this.triggerRulesForm.get('function_value').setValidators([NoWhitespaceValidator, RxwebValidators.digit()]);
    } else {
      this.triggerRulesForm.addControl('function_value', new FormControl('', [NoWhitespaceValidator, RxwebValidators.digit()]));
    }

    if (this.triggerRulesForm.controls.function_unit) {
      this.triggerRulesForm.get('function_unit').clearValidators();
      this.triggerRulesForm.get('function_unit').setValidators([]);
      this.triggerRulesForm.get('function_unit').patchValue(this.zabbixTriggerFunctionUnits[0]);
    } else {
      this.triggerRulesForm.addControl('function_unit', new FormControl(this.zabbixTriggerFunctionUnits[0], []));
    }

    if (this.triggerRulesForm.controls.min_value) {
      this.triggerRulesForm.get('min_value').clearValidators();
      this.triggerRulesForm.get('min_value').setValidators([Validators.required, NoWhitespaceValidator, Validators.pattern(/^[.\d]+$/)]);
    } else {
      this.triggerRulesForm.addControl('min_value', new FormControl('', [Validators.required, NoWhitespaceValidator, Validators.pattern(/^[.\d]+$/)]));
    }

    if (this.triggerRulesForm.controls.max_value) {
      this.triggerRulesForm.get('max_value').clearValidators();
      this.triggerRulesForm.get('max_value').setValidators([Validators.required, NoWhitespaceValidator, Validators.pattern(/^[.\d]+$/)]);
    } else {
      this.triggerRulesForm.addControl('max_value', new FormControl('', [Validators.required, NoWhitespaceValidator, Validators.pattern(/^[.\d]+$/)]));
    }

    this.triggerRulesForm.get('function_value').updateValueAndValidity();
    this.triggerRulesForm.get('function_unit').updateValueAndValidity();
    this.triggerRulesForm.get('min_value').updateValueAndValidity();
    this.triggerRulesForm.get('max_value').updateValueAndValidity();
  }

  handleFindFunction() {
    this.triggerRulesForm.removeControl('function_in');
    this.triggerRulesForm.removeControl('min_value');
    this.triggerRulesForm.removeControl('max_value');
    this.triggerRulesForm.removeControl('detect_period');
    this.triggerRulesForm.removeControl('season');
    this.triggerRulesForm.removeControl('deviation');
    this.zabbixTriggerOperators = _clone(ZABBIX_TRIGGER_OPERATORS).filter(op => op.key == '=' || op.key == '<>');
    this.zabbixTriggerFunctionUnits = ['seconds', 'minutes', 'hours', 'counts'];

    if (this.triggerRulesForm.controls.function_value) {
      this.triggerRulesForm.get('function_value').clearValidators();
      this.triggerRulesForm.get('function_value').setValidators([NoWhitespaceValidator, RxwebValidators.digit()]);
    } else {
      this.triggerRulesForm.addControl('function_value', new FormControl('', [NoWhitespaceValidator, RxwebValidators.digit()]));
    }

    if (this.triggerRulesForm.controls.function_unit) {
      this.triggerRulesForm.get('function_unit').clearValidators();
      this.triggerRulesForm.get('function_unit').setValidators([]);
      this.triggerRulesForm.get('function_unit').patchValue(this.zabbixTriggerFunctionUnits[0]);
    } else {
      this.triggerRulesForm.addControl('function_unit', new FormControl(this.zabbixTriggerFunctionUnits[0], []));
    }

    if (this.triggerRulesForm.controls.function_in) {
      this.triggerRulesForm.get('pattern').clearValidators();
      this.triggerRulesForm.get('pattern').setValidators([Validators.required, NoWhitespaceValidator]);
    } else {
      this.triggerRulesForm.addControl('pattern', new FormControl('', [Validators.required, NoWhitespaceValidator]));
    }

    this.triggerRulesForm.get('function_value').updateValueAndValidity();
    this.triggerRulesForm.get('function_unit').updateValueAndValidity();
    this.triggerRulesForm.get('pattern').updateValueAndValidity();
  }

  handleAnomalyDetectionFunction() {
    this.triggerRulesForm.removeControl('function_in');
    this.triggerRulesForm.removeControl('min_value');
    this.triggerRulesForm.removeControl('max_value');
    this.triggerRulesForm.removeControl('pattern');
    this.zabbixTriggerOperators = _clone(ZABBIX_TRIGGER_OPERATORS);
    this.zabbixTriggerFunctionUnits = ['now/h', 'now/d'];
    if (this.triggerRulesForm.controls.function_value) {
      this.triggerRulesForm.get('function_value').clearValidators();
      this.triggerRulesForm.get('function_value').setValidators([NoWhitespaceValidator, RxwebValidators.digit()]);
    } else {
      this.triggerRulesForm.addControl('function_value', new FormControl('', [NoWhitespaceValidator, RxwebValidators.digit()]));
    }

    if (this.triggerRulesForm.controls.function_unit) {
      this.triggerRulesForm.get('function_unit').clearValidators();
      this.triggerRulesForm.get('function_unit').setValidators([]);
      this.triggerRulesForm.get('function_unit').patchValue(this.zabbixTriggerFunctionUnits[0]);
    } else {
      this.triggerRulesForm.addControl('function_unit', new FormControl(this.zabbixTriggerFunctionUnits[0], []));
    }

    if (this.triggerRulesForm.controls.detect_period) {
      this.triggerRulesForm.get('detect_period').clearValidators();
      this.triggerRulesForm.get('detect_period').setValidators([NoWhitespaceValidator, Validators.required, RxwebValidators.alphaNumeric()]);
    } else {
      this.triggerRulesForm.addControl('detect_period', new FormControl('', [NoWhitespaceValidator, Validators.required, RxwebValidators.alphaNumeric()]));
    }

    if (this.triggerRulesForm.controls.season) {
      this.triggerRulesForm.get('season').clearValidators();
      this.triggerRulesForm.get('season').setValidators([Validators.required, NoWhitespaceValidator, RxwebValidators.alphaNumeric()]);
    } else {
      this.triggerRulesForm.addControl('season', new FormControl('', [Validators.required, NoWhitespaceValidator, RxwebValidators.alphaNumeric()]));
    }

    if (this.triggerRulesForm.controls.deviation) {
      this.triggerRulesForm.get('deviation').clearValidators();
      this.triggerRulesForm.get('deviation').setValidators([ NoWhitespaceValidator, RxwebValidators.digit()]);
    } else {
      this.triggerRulesForm.addControl('deviation', new FormControl('', [NoWhitespaceValidator, RxwebValidators.digit()]));
    }

    this.triggerRulesForm.get('function_value').updateValueAndValidity();
    this.triggerRulesForm.get('function_unit').updateValueAndValidity();
    this.triggerRulesForm.get('detect_period').updateValueAndValidity();
    this.triggerRulesForm.get('season').updateValueAndValidity();
    this.triggerRulesForm.get('deviation').updateValueAndValidity();
  }

  confirmTriggerRuleCreate() {
    if (this.triggerRulesForm.invalid) {
      this.triggerRulesFormErrors = this.utilService.validateForm(this.triggerRulesForm, this.triggerRulesFormValidationMessages, this.triggerRulesFormErrors);
      this.triggerRulesForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.triggerRulesFormErrors = this.utilService.validateForm(this.triggerRulesForm, this.triggerRulesFormValidationMessages, this.triggerRulesFormErrors); });
    } else {
      let obj: any = Object.assign({}, this.triggerRulesForm.getRawValue());
      // switch (obj.item_key.valueType) {
      //   case 'int': obj.value = Number(obj.value); break;
      //   case 'float': obj.value = Number(obj.value); break;
      //   case 'string': obj.value = obj.value.toString(); break;
      // }
      const temp: string = `${obj.item_key.key}: ${obj.function.name} ${obj.function_value ? 'for '.concat(obj.function_value).concat(' ').concat(obj.function_unit).concat(' ') : ''}${obj.operator.name} ${obj.value}`;
      this.triggerForm.get('problem_expression').setValue(temp);

      obj.function = obj.function.key;
      obj.item_key = obj.item_key.key;
      obj.operator = obj.operator.key;

      if (this.triggerForm.controls.rules) {
        this.triggerForm.get('rules').patchValue(obj);
        this.triggerForm.get('rules').updateValueAndValidity();
      } else {
        this.triggerForm.addControl('rules', new FormControl(obj))
      }
    }
  }

  confirmTriggerCreate() {
    if (this.triggerForm.invalid) {
      this.triggerFormErrors = this.utilService.validateForm(this.triggerForm, this.triggerFormValidationMessages, this.triggerFormErrors);
      this.triggerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.triggerFormErrors = this.utilService.validateForm(this.triggerForm, this.triggerFormValidationMessages, this.triggerFormErrors); });
    } else {
      this.spinner.start('main');
      if (this.triggerId) {
        this.crudService.updateTrigger(this.triggerId, this.componentId, this.triggerForm.getRawValue(),).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Trigger updated Successfully.'));
          this.router.navigate(['../'], { relativeTo: this.route });
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to update trigger. Please try again later.'));
        });
      } else {
        this.crudService.createTrigger(this.componentId, this.triggerForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Trigger created successfully.'));
          this.router.navigate(['../'], { relativeTo: this.route });
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to create trigger. Please try again later.'));
        });
      }
    }
  }

  switchTriggerState() {
    this.spinner.start('main');
    if (this.triggerForm.controls.disabled.value) {
      this.crudService.enableTrigger(this.triggerId, this.componentId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.triggerForm.get('disabled').patchValue(false);
        this.triggerForm.get('disabled').updateValueAndValidity();
        this.spinner.stop('main');
        this.notification.success(new Notification('Trigger enabled successfully.'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable trigger. Please try again later.'));
      });
    } else {
      this.crudService.disableTrigger(this.triggerId, this.componentId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.triggerForm.get('disabled').patchValue(true);
        this.triggerForm.get('disabled').updateValueAndValidity();
        this.spinner.stop('main');
        this.notification.success(new Notification('Trigger disabled successfully.'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to disable trigger. Please try again later.'));
      });
    }
  }

  goBack() {
    this.router.navigate(['triggers'], { relativeTo: this.route.parent });
  }

}
