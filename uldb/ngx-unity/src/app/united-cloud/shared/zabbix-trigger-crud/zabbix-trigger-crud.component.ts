import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { ZabbixTriggerScriptViewdata } from '../zabbix-trigger-scripts/zabbix-trigger-scripts.service';
import { ZABBIX_TRIGGER_FUNCTIONS, ZABBIX_TRIGGER_OPERATORS, ZabbixTriggerCrudService, ZabbixTriggerFunction, ZabbixTriggerItemsViewData, ZabbixTriggerOperator } from './zabbix-trigger-crud.service';
import { ZabbixTriggerRuleCRUDType } from './zabbix-trigger-crud.type';
import { cloneDeep as _clone } from 'lodash-es';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'zabbix-trigger-crud',
  templateUrl: './zabbix-trigger-crud.component.html',
  styleUrls: ['./zabbix-trigger-crud.component.scss'],
  providers: [ZabbixTriggerCrudService]
})
export class ZabbixTriggerCrudComponent implements OnInit, OnDestroy {
  @ViewChild('credentialCRUD') credentialCRUD: ElementRef;
  @Output() toggleModal: EventEmitter<string> = new EventEmitter<string>();
  private ngUnsubscribe = new Subject();
  action: 'Add' | 'Edit';
  items: ZabbixTriggerItemsViewData[] = [];
  scripts: ZabbixTriggerScriptViewdata[] = [];
  credentials: DeviceDiscoveryCredentials[] = [];
  device: DeviceTabData;
  triggerId: string;
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
  zabbixTriggerFunctions: ZabbixTriggerFunction[] = ZABBIX_TRIGGER_FUNCTIONS;
  zabbixTriggerFunctionUnits: string[] = ['th value'];
  zabbixTriggerOperators: ZabbixTriggerOperator[] = ZABBIX_TRIGGER_OPERATORS;

  itemSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: false,
    keyToSelect: 'key',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
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
    allSelected: 'All Selected',
  };

  constructor(private crudService: ZabbixTriggerCrudService,
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
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('deviceid'));
    setTimeout(() => {
      this.buildTriggerForm();
      this.getDropdownData();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.device.uuid = params.get('deviceid'));
    setTimeout(() => {
      this.buildTriggerForm();
      this.getDropdownData();
    }, 0);
  }

  getDropdownData() {
    this.crudService.getDropdownData(this.device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.graphItems) {
        this.items = this.crudService.convertToItemViewData(res.graphItems);
        this.buildTriggerRulesForm();
      } else {
        this.items = [];
        this.notification.error(new Notification('Failed to fetch rule items'));
      }

      if (res.scripts) {
        this.scripts = res.scripts;
      } else {
        this.scripts = [];
        this.notification.error(new Notification('Failed to fetch scripts'));
      }

      if (res.credentials) {
        this.credentials = res.credentials;
      } else {
        this.credentials = [];
        this.notification.error(new Notification('Failed to fetch credentails'));
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.items = [];
      this.scripts = [];
      this.credentials = [];
      this.notification.error(new Notification('Failed to fetch dropdown data'));
      this.spinner.stop('main');
    })
  }

  buildTriggerForm() {
    this.crudService.createTriggerForm(this.device, this.triggerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.triggerForm = form;
      this.triggerFormErrors = this.crudService.resetTriggerFormErrors();
      this.triggerFormValidationMessages = this.crudService.triggerFormValidationMessages;
      this.subscribeToForm();
    });
  }

  subscribeToForm() {
    if (this.user.isAIMLEnabled && this.triggerForm.controls.auto_remediation) {
      if (this.triggerForm.get('auto_remediation').value) {
        this.triggerForm.get('script').setValidators([Validators.required]);
        this.triggerForm.get('credential').setValidators([Validators.required]);
      }

      this.triggerForm.get('auto_remediation').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        if (val) {
          this.triggerForm.get('script').setValidators([Validators.required]);
          this.triggerForm.get('script').enable();
          this.triggerForm.get('credential').setValidators([Validators.required]);
          this.triggerForm.get('script').enable();
        } else {
          this.triggerForm.get('script').setValue('');
          this.triggerForm.get('script').removeValidators([Validators.required]);
          this.triggerForm.get('script').disable();
          this.triggerForm.get('credential').setValue('');
          this.triggerForm.get('credential').removeValidators([Validators.required]);
          this.triggerForm.get('credential').disable();
        }
      })

      this.triggerForm.get('script').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        if (val == 'view_all_scripts') {
          this.router.navigate(['scripts'], { relativeTo: this.route });
        } else {
          if (val) {
            this.triggerForm.get('credential').setValidators([Validators.required]);
            this.triggerForm.get('credential').enable();
          } else {
            this.triggerForm.get('credential').setValue('');
            this.triggerForm.get('credential').removeValidators([Validators.required]);
            this.triggerForm.get('credential').disable();
          }
        }
      })
    }
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
      this.triggerRulesForm.get('detect_period').setValidators([Validators.required, NoWhitespaceValidator, RxwebValidators.alphaNumeric()]);
    } else {
      this.triggerRulesForm.addControl('detect_period', new FormControl('', [Validators.required, NoWhitespaceValidator, RxwebValidators.alphaNumeric()]));
    }

    if (this.triggerRulesForm.controls.season) {
      this.triggerRulesForm.get('season').clearValidators();
      this.triggerRulesForm.get('season').setValidators([Validators.required, NoWhitespaceValidator, RxwebValidators.alphaNumeric()]);
    } else {
      this.triggerRulesForm.addControl('season', new FormControl('', [Validators.required, NoWhitespaceValidator, RxwebValidators.alphaNumeric()]));
    }

    if (this.triggerRulesForm.controls.deviation) {
      this.triggerRulesForm.get('deviation').clearValidators();
      this.triggerRulesForm.get('deviation').setValidators([NoWhitespaceValidator, RxwebValidators.digit()]);
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
      const temp: string = `${obj.item_key.name}: ${obj.function.name} ${obj.function_value ? 'for '.concat(obj.function_value).concat(' ').concat(obj.function_unit).concat(' ') : ''}${obj.operator.name} ${obj.value}`;
      this.triggerForm.get('problem_expression').setValue(temp);

      obj.function = obj.function.key;
      obj.item_key = obj.item_key.key;
      obj.operator = obj.operator.key;
      obj.default = 'last';
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
        this.crudService.updateTrigger(this.device, this.triggerForm.getRawValue(), this.triggerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Trigger updated Successfully.'));
          this.router.navigate(['../'], { relativeTo: this.route });
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createTrigger(this.device, this.triggerForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Trigger created successfully.'));
          this.router.navigate(['../'], { relativeTo: this.route });
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  switchTriggerState() {
    this.spinner.start('main');
    if (this.triggerForm.controls.disabled.value) {
      this.crudService.enableTrigger(this.device, this.triggerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.triggerForm.get('disabled').patchValue(false);
        this.triggerForm.get('disabled').updateValueAndValidity();
        this.spinner.stop('main');
        this.notification.success(new Notification('Trigger enabled successfully.'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable trigger. Please try again later.'));
      });
    } else {
      this.crudService.disableTrigger(this.device, this.triggerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
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

  handleError(err: any) {
    this.triggerFormErrors = this.crudService.resetTriggerFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.triggerForm.controls) {
          this.triggerFormErrors[field] = err[field][0];
        }
      }
    } else {
      // this.switchModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

}
