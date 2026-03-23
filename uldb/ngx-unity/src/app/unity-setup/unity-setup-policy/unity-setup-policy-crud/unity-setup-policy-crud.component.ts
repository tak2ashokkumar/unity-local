import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CloudTypeUnified, UnitySetupPolicyItem } from '../unity-setup-policy.type';
import { atLeastOneFieldRequiredValidator, commaSeparatedValidator, POLICY_TYPE_LIST, PolicyType, regexSyntaxValidator, ScopeIdentifierListViewData, UnitySetupPolicyCrudService } from './unity-setup-policy-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { cloneDeep as _clone } from 'lodash-es';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PublicCloudFast } from 'src/app/shared/SharedEntityTypes/public-cloud.type';
import { TicketMgmtList } from 'src/app/shared/SharedEntityTypes/ticket-mgmt-list.type';
import { UserGroupType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Account } from 'src/app/unity-services/orchestration/orchestration-workflows/orchestration-workflow-execution/orchestration-workflow-execution.type';

@Component({
  selector: 'unity-setup-policy-crud',
  templateUrl: './unity-setup-policy-crud.component.html',
  styleUrls: ['./unity-setup-policy-crud.component.scss'],
  providers: [UnitySetupPolicyCrudService]
})
export class UnitySetupPolicyCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  nonFieldErr: string = '';
  policyTypeErr: string = '';
  actionMessage: 'Create' | 'Update';
  policyId: string;
  policyTypeList = POLICY_TYPE_LIST;
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  cloudTypeList: CloudTypeUnified[] = [];
  cloudList: CloudTypeUnified[] = [];
  scopeIdentifierList: ScopeIdentifierListViewData[] = [];
  ticketManagementList: TicketMgmtList[] = []
  ItsmList: string[] = [];
  filteredItsmInstances: TicketMgmtList[] = []
  approvalWorkflows: any[] = []
  workflowVariable: any[] = []
  userGroups: UserGroupType[] = [];
  userList: string[] = [];
  policyData: any;
  selectedWorkflow: string;
  workflowValue: any;

  userGroupsSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'uuid',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  userGroupTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Uncheck all',
    checked: 'Group',
    checkedPlural: 'Groups',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select User Groups',
    allSelected: 'All Groups',
  };


  userListSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  userTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Uncheck all',
    checked: 'User',
    checkedPlural: 'Users',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select Users',
    allSelected: 'All Users',
  };




  constructor(private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private policyCrudService: UnitySetupPolicyCrudService, private utilityService: AppUtilityService,
    private notification: AppNotificationService, private builder: FormBuilder) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => this.policyId = params.get('policyId'));
  }

  ngOnInit(): void {
    if (this.policyId) {
      this.actionMessage = 'Update';
      this.getPolicyData();
    } else {
      this.actionMessage = 'Create';
      this.getDropdownData();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  getPolicyData() {
    this.spinner.start('main');
    this.policyCrudService.getPolicyData(this.policyId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.policyData = res;
      this.selectedWorkflow = res.config?.approval_workflow
      this.getDropdownData()
      this.getPolicyListDetails(this.policyData)
      this.buildForm(this.policyData);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get policy.'));
    });
  }



  getPolicyListDetails(data: any) {
    if (this.policyData.scope === 'Cloud') {
      this.getCloudTypes(data.policy_type);
      if (this.cloudTypeList) this.scopeIdentifierList = this.getScopeIdentifier(this.policyData.cloud_type);
    }

    if (data?.policy_type == PolicyType.PROVISIONAL_APPROVAL) {
      this.spinner.start('main');
      this.policyCrudService.getTicketManagementList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.ticketManagementList = res;
        this.ItsmList = this.policyCrudService.getUniqueItsmTypes(res);
        this.filteredItsmInstances = this.filterItsmByType(data.config.itsm_type);
        // this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        // this.spinner.stop('main');
        this.notification.error(new Notification('Failed to get ITSM list.'));
      });

      this.policyCrudService.getApprovalWorkflows(data.config.itsm_type, data.config.itsm_instance).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.approvalWorkflows = res.result;
        if (this.selectedWorkflow && this.approvalWorkflows.length > 0) {
          this.workflowValue = this.approvalWorkflows.find(wf => wf.sys_id == this.selectedWorkflow);
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to get Approval Workflows.Try Later!'));
      });
    }
  }


  getDropdownData() {
    this.spinner.start('main');
    this.userGroups = [];
    this.userList = [];
    this.policyCrudService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ userGroups, userList }) => {
      if (userGroups) {
        this.userGroups = _clone(userGroups);
      } else {
        this.userGroups = [];
        this.notification.error(new Notification("Error while fetching User Groups"));
      }

      if (userList) {
        this.userList = _clone(userList);
      } else {
        this.userList = [];
        this.notification.error(new Notification("Error while fetching User List"));
      }
      if (!this.policyId) {
        this.buildForm(null);
      }
      this.spinner.stop('main');
    });
  }


  buildForm(data: UnitySetupPolicyItem) {
    this.form = this.policyCrudService.buildForm(data);
    this.formErrors = this.policyCrudService.resetFormErrors();
    if (this.parameterMapping) {
      this.formErrors.config.parameter_mapping.push(this.policyCrudService.getParamaterMappingErros());
    }
    this.validationMessages = this.policyCrudService.formValidationMessages;
    this.manageForm();
  }


  get parameterMapping(): FormArray {
    return this.form.get('parameter_mapping') as FormArray;
  }

  handleScopeCloudType(policyType: string) {
    this.form.get('scope')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(scope => {
      if (scope === 'Cloud') {
        this.getCloudTypes(policyType);
        this.form.addControl('cloud_type', new FormControl('', Validators.required));
        this.form.addControl('scope_id', new FormControl({ value: '', disabled: true }, Validators.required));
        this.handleCloudTypeSubscription()

      } else {
        if (this.form.contains('cloud_type')) {
          this.form.removeControl('scope_id')
          this.form.removeControl('cloud_type')
        }
      }
    });

    this.handleCloudTypeSubscription()

  }

  handleCloudTypeSubscription() {
    this.form.get('cloud_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cloudType => {
      const scopeControl = this.form.get('scope_id');
      if (cloudType) {
        scopeControl?.setValue('');
        this.scopeIdentifierList = this.getScopeIdentifier(cloudType);
        scopeControl?.enable();
      } else {
        scopeControl?.disable();
        scopeControl?.reset();
      }
    });
  }


  manageForm() {
    // Centralized config creation based on policy_type
    this.form.get('policy_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(policyType => {
      if (!this.form.get('scope')?.enabled) {
        this.form.get('scope').enable()
      }
      this.form.removeControl('config');

      switch (policyType) {
        case PolicyType.PROVISIONAL_APPROVAL:
          this.handleScopeCloudType(policyType);
          this.getTicketManagementList();
          this.createProvisionalApprovalConfig();
          break;

        case PolicyType.RESOURCE_QUOTA:
          this.handleScopeCloudType(policyType);
          this.form.addControl('config', this.builder.group({
            max_vms: [''],
            max_cpus: [''],
            max_memory: [''],
            max_storage: ['']
          }, { validators: atLeastOneFieldRequiredValidator(['max_vms', 'max_cpus', 'max_memory', 'max_storage']) }));
          break;

        case PolicyType.NAMING:
          this.handleScopeCloudType(policyType);
          this.form.addControl('config', this.builder.group({
            naming_pattern: ['', [Validators.required, regexSyntaxValidator()]],
            case_sensitivity: [true, [Validators.required]]
          }));
          break;

        case PolicyType.TAGGING:
          this.handleScopeCloudType(policyType);
          this.form.addControl('config', this.builder.group({
            required_tags: this.builder.array([
              this.builder.group({
                tag_name: ['', Validators.required],
                allowed_values: ['', commaSeparatedValidator()],
                required: [true]
              })
            ])
          }));
          this.formErrors.config.required_tags = [this.policyCrudService.getTagsErros()];
          break;

        default:
          // You may optionally handle unrecognized types here
          break;
      }
    });

    if (this.policyId) this.handleScopeCloudType(this.form.get('policy_type').value)


    // ✳️ Handle EDIT flow for Provisional Approval
    if (this.form.get('config.itsm_type')) {
      this.attachProvisionalApprovalListeners();
    }
  }

  createProvisionalApprovalConfig() {
    this.form.addControl('config', this.builder.group({
      itsm_type: ['', Validators.required],
      itsm_instance: [{ value: '', disabled: true }, Validators.required],
      approval_workflow: ['', Validators.required]
    }));

    this.attachProvisionalApprovalListeners();
  }

  attachProvisionalApprovalListeners() {
    const configGroup = this.form.get('config') as FormGroup;

    configGroup.get('itsm_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
      configGroup.get('itsm_instance')?.setValue('', { emitEvent: false });
      configGroup.get('approval_workflow')?.setValue('');
      if (configGroup.contains('parameter_mapping')) (configGroup.get('parameter_mapping') as FormArray).clear();
      this.filteredItsmInstances = this.filterItsmByType(type);
      configGroup.get('itsm_instance')?.enable({ emitEvent: false });
    });

    configGroup.get('itsm_instance')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(instance => {
      if (instance) {
        configGroup.get('approval_workflow')?.setValue('');
        if (configGroup.contains('parameter_mapping')) (configGroup.get('parameter_mapping') as FormArray).clear();
        this.getApprovalWorkflows(configGroup.get('itsm_type')?.value, instance);
      }
    });

    configGroup.get('approval_workflow')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(workflow => {
      if (workflow && workflow.length) {
        const itsmType = configGroup.get('itsm_type')?.value;
        const itsmInstance = configGroup.get('itsm_instance')?.value;

        this.spinner.start('main');
        this.policyCrudService.getWorkflowVariable(itsmInstance, workflow, itsmType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          const variables = res.result.map(item => item.name);
          this.workflowVariable = variables;

          if (!configGroup.contains('parameter_mapping')) {
            configGroup.addControl('parameter_mapping', this.builder.array([]));
          }

          const mappingArray = configGroup.get('parameter_mapping') as FormArray;
          mappingArray.clear();

          variables.forEach(variable => {
            mappingArray.push(this.builder.group({
              workflow_attribute: [variable, Validators.required],
              unityone_attribute: ['', Validators.required]
            }));
          });

          this.formErrors.config.parameter_mapping = [];
          for (let i = 0; i < variables.length; i++) {
            this.formErrors.config.parameter_mapping.push(this.policyCrudService.getParamaterMappingErros());
          }

          this.spinner.stop('main');
        }, () => {
          (configGroup.get('parameter_mapping') as FormArray)?.clear();
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to get Workflow Variables.'));
        });
      }
    });
  }

  get hasParameterMapping(): boolean {
    const paramArray = this.form.get('config.parameter_mapping');
    return paramArray instanceof FormArray && paramArray.length > 0;
  }

  get hasRequiredTags(): boolean {
    const tagsArray = this.form.get('config.required_tags');
    return tagsArray instanceof FormArray && tagsArray.length > 0;
  }

  get tags(): FormArray {
    return this.form.get('config.required_tags') as FormArray;
  }
  addRequiredTag(i: number): void {
    let editFormGroup = <FormGroup>this.tags.at(i);
    if (editFormGroup.invalid) {
      this.formErrors.config.required_tags[i] = this.utilityService.validateForm(editFormGroup, this.validationMessages.config.required_tags, this.formErrors.config.required_tags[i]);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors.config.required_tags[i] = this.utilityService.validateForm(editFormGroup, this.validationMessages.config.required_tags, this.formErrors.config.required_tags[i]);
      });
    } else {

      const tag = this.builder.group({
        tag_name: ['', Validators.required],
        allowed_values: [''],
        required: [true]
      });

      (this.form.get('config.required_tags') as FormArray).push(tag);
      this.formErrors.config.required_tags.push(this.policyCrudService.getTagsErros());

    }

  }

  removeRequiredTag(index: number): void {
    this.tags.removeAt(index);
    this.formErrors.config.required_tags.splice(index, 1);
  }


  getTicketManagementList() {
    this.spinner.start('main');
    this.policyCrudService.getTicketManagementList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ticketManagementList = res;
      this.ItsmList = this.policyCrudService.getUniqueItsmTypes(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get policy.'));
    });
  }

  getScopeIdentifier(cloudType: string): ScopeIdentifierListViewData[] {
    return this.cloudTypeList
      .filter(account => account.type === cloudType)
      .map(account => ({
        id: account.id,
        account_name: account.name
      }));
  }

  filterItsmByType(selectedType: string) {
    return this.ticketManagementList.filter(instance => instance.type === selectedType);
  }



  getApprovalWorkflowTypeDropdown(event: any) {
    this.form.get('config.approval_workflow').setValue(event.sys_id);
  }

  getApprovalWorkflows(itsmType: string, instanceId: any) {
    this.spinner.start('main');
    this.policyCrudService.getApprovalWorkflows(itsmType, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.approvalWorkflows = res.result;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Approval Workflows.Try Later!'));
    });
  }


  getWorkflowVariable(itsmInstance: string, workflow: string, instanceId) {
    this.spinner.start('main');
    this.policyCrudService.getWorkflowVariable(itsmInstance, workflow, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.workflowVariable = res.result.map(item => item.name);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Workflows Variables.Try Later!'));
    });
  }


  getCloudTypes(policyType: string) {
    this.spinner.start('main');
    this.policyCrudService.getCloudTypes(policyType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      const transformedList = this.transformCloudList(res);  // Unified shape: id, name, type
      this.cloudList = this.getUniqueByCloudType(transformedList);  // De-duplicated or grouped
      this.cloudTypeList = transformedList; // Store full unified list
      if (this.policyId) this.scopeIdentifierList = this.getScopeIdentifier(this.policyData.cloud_type);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Cloud types.'));
    });
  }

  transformCloudList(data: PrivateCLoudFast[] | Account[]): { id: number, name: string, type: string }[] {
    return data.map(item => {
      if ('platform_type' in item) {
        // PrivateCloud
        return {
          id: item.id,
          name: item.name,
          type: item.platform_type
        };
      } else {
        // PublicCloud
        return {
          id: item.id,
          name: item.account_name,
          type: item.cloud_type
        };
      }
    });
  }


  private getUniqueByCloudType(list: any[]): any[] {
    const seen = new Set();
    return list.filter(item => {
      if (!seen.has(item.type)) {
        seen.add(item.type);
        return true;
      }
      return false;
    });
  }

  get isProvisionalApproval(): boolean {
    return this.form.get('policy_type')?.value === 'Provisional Approval';
  }

  goBack() {
    if (this.policyId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  handleError(err: any) {
    this.formErrors = this.policyCrudService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.policy_type) {
      this.policyTypeErr = err.policy_type;
    }
    else if (err) {
      for (const field in err) {
        if (field in this.form) {
          this.form[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }


  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilityService.validateForm(this.form, this.validationMessages, this.formErrors);
      if (this.form.controls.config.errors && this.form.controls.config.errors.atLeastOneRequired) {
        this.formErrors.config.atLeastOneRequired = 'At least one field in Resource Quota must be filled';
      }
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.formErrors = this.utilityService.validateForm(this.form, this.validationMessages, this.formErrors);
        if (this.form.controls.config.errors && this.form.controls.config.errors.atLeastOneRequired) {
          this.formErrors.config.atLeastOneRequired = 'At least one field in Resource Quota must be filled';

        }
      });
    } else {
      this.spinner.start('main');
      let obj = this.policyCrudService.transformInput(Object.assign({}, this.form.getRawValue()));
      if (this.policyId) {
        this.policyCrudService.updatePolicy(obj, this.policyId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Policy was updated successfuly.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.policyCrudService.createPolicy(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Policy was created successfuly.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }



}
