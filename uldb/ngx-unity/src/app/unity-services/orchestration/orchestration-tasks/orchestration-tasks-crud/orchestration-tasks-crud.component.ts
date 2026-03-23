import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, DateRange, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { OrchestrationTasksService, playbookTypes, } from '../orchestration-tasks.service';
import { OrchestrationTasksCrudService, cloudTypes, jsonValidator, methods, operators, scriptOutputTypes, scriptParamDataTypes, uniqueParamNameValidator, validateDefaultValue, validateValue } from './orchestration-tasks-crud.service';
import { MetaData, OrchestrationTaskDataType, Playbooks, Repos } from '../orchestration-task.type';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { ConnectionsModel, OrchestrationTaskCrudDataType, inputTemplateType, parameterDataType } from './orchestration-tasks-crud.type';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';


export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
  selector: 'orchestration-tasks-crud',
  templateUrl: './orchestration-tasks-crud.component.html',
  styleUrls: ['./orchestration-tasks-crud.component.scss'],
  providers: [OrchestrationTasksCrudService, OrchestrationTasksService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ]
})
export class OrchestrationTasksCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  taskId: string;
  taskData: any;
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  methods: string[] = methods;
  inputTemplate: inputTemplateType[] = [];
  // attributeList: string[] = []
  attributeList: string[][] = [[]];

  action: 'Create' | 'Update';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  categoryList: string[];
  playbookTypes: string[];
  targetTypes: string[];
  repos: Repos[] = [];
  playbooks: Playbooks[] = [];
  privateCloud: cloudTypes[] = [];
  publicCloud: cloudTypes[] = [];
  paramDataTypes: string[] = scriptParamDataTypes;
  scriptOutputTypes: string[] = scriptOutputTypes;
  operators = operators;
  nonFieldErr: string = '';
  dateRange: DateRange;
  transformedData: FormGroup;
  connectionResult: boolean;
  urlBlockStatus: boolean = false;
  collectorAddr: string;
  callbackUrl: string;

  taskTypes = playbookTypes;
  taskType: string;
  repoId: string;
  metaData: MetaData;
  showParams: boolean = false;
  celeryTaskIds: string[] = [];
  categoryUuid: string;

  credentialList: DeviceDiscoveryCredentials[] = [];
  script: any;
  scriptId: string;
  inputParameter: any;
  cloudType: any;
  cloudAccount: any;
  targetValue: any;
  connectionBaseUrl = '';
  categoryValue: string;
  selectedcategory: string;
  cloudTypeValue: string;
  selectedcloudType: string;
  cloudAccountValue: string;
  selectedcloudAccount: string;
  sourceValue: string;
  selectedSource: string;
  scriptValue: string;
  selectedScript: string;

  scriptOptions = [
    { label: 'Ansible Playbook', icon: 'static/assets/images/external-brand/logos/Anisble.svg' },
    { label: 'Terraform Script', icon: 'static/assets/images/external-brand/logos/Terraform.svg' },
    { label: 'Python Script', icon: 'static/assets/images/external-brand/logos/Python.svg' },
    { label: 'Bash Script', icon: 'static/assets/images/external-brand/logos/Bash.svg' },
    { label: 'Powershell Script', icon: 'static/assets/images/external-brand/logos/PowerShell.svg' },
    { label: 'Rest API', icon: 'static/assets/images/external-brand/logos/Rest_Api.svg' }
  ];

  connections: ConnectionsModel[] = [];
  showRestApiHeaders = false;
  showRestApiInputParameters = false;
  showOutputParameters = false;
  private scriptSubscription: Subscription;
  private sourceSubscription: Subscription;

  constructor(private svc: OrchestrationTasksCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private builder: FormBuilder,
    private storage: StorageService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.taskId = params.get('taskId');
      this.action = this.taskId ? 'Update' : 'Create';
      this.categoryUuid = params.get('categoryId')
    });
  }

  ngOnInit(): void {
    this.getDropdownData();
    if (this.taskId) {
      this.getTaskDataById();
    } else {
      this.buildForm();
    }
    // this.getInputTemplate();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTaskDataById() {
    this.spinner.start('main');
    this.svc.getTaskDataById(this.taskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.taskData = res;
      this.selectedcategory = res.category;
      this.selectedcloudType = res.config?.cloud_type;
      this.selectedcloudAccount = res.config?.cloud_account;
      this.selectedSource = res.source;
      this.selectedScript = res.script;
      this.svc.getCloudAccount(this.selectedcloudType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
        this.cloudAccount = param;
      });
      if (this.selectedSource) {
        this.svc.getScriptWithPlaybookType(this.selectedSource, this.taskData.script_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
          this.script = param;
        });
      }
      setTimeout(() => {
        this.buildForm();
        if (this.taskData?.inputs?.length) {
          this.showRestApiInputParameters = true;
          const inputsArray = new FormArray(
            this.taskData.inputs.map(input => {
              const group = this.svc.getParameterForm(input);
              group.get('param_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => {
                group.get('default_value')?.reset('');
                group.get('template')?.reset('');
                group.get('attribute')?.reset('');
                if (val === 'Input Template') {
                  group.addControl('template', new FormControl('', [Validators.required]));
                  group.addControl('attribute', new FormControl(''));
                  group.removeControl('default_value');
                } else {
                  group.addControl('default_value', new FormControl('', [Validators.required]));
                  group.removeControl('template');
                  group.removeControl('attribute');
                }
              });
              return group;
            })
          );
          this.form.setControl('inputs', inputsArray);
        }
        if (this.taskData.script_type === 'Rest API') {
          this.connectionBaseUrl = this.taskData.config.base_url;
          this.getConnections();
          this.form.get('connection').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(con => {
            const selectedConnection = this.connections.find(conn => conn.uuid === con);
            this.connectionBaseUrl = selectedConnection?.base_url;
          });
        }
        this.form.get('target_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
          if (value == 'Host') {
            this.getCredentials();
            this.form.addControl('cred', new FormControl('local'));
            this.form.addControl('credentials', new FormControl(''));
            this.form.addControl('targets', new FormControl('', []));
            this.getTargets();
            this.form.get('cred').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
              if (val == 'local') {
                this.form.addControl('credentials', new FormControl(''));
                this.form.removeControl('username');
                this.form.removeControl('password');
              } else {
                this.form.removeControl('credentials');
                this.form.addControl('username', new FormControl(''));
                this.form.addControl('password', new FormControl(''));
              }
            });
          } else if (value == 'Cloud') {
            this.form.addControl('cloud_type', new FormControl('', Validators.required))
            this.form.addControl('cloud_account', new FormControl(''))
            this.getcloudAccount();
          } else {
            this.form.removeControl('targets');
            this.form.removeControl('credentials');
            this.form.removeControl('username');
            this.form.removeControl('password');
            this.form.removeControl('cloud_type');
            this.form.removeControl('cloud_account');
          }
        });
        this.form.get('cred')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
          if (val == 'local') {
            this.form.addControl('credentials', new FormControl(''));
            this.form.removeControl('username');
            this.form.removeControl('password');
          } else {
            this.form.removeControl('credentials');
            this.form.addControl('username', new FormControl(''));
            this.form.addControl('password', new FormControl(''));
          }
        });
        this.getTargets();
        this.getCredentials();
        this.getcloudAccount();
        // this.svc.getScriptWithPlaybookType(this.selectedSource, this.taskData.script_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
        //   this.script = param;
        // });
        if (this.taskData?.config?.headers?.length) {
          this.showRestApiHeaders = true;
        }
        if (this.taskData.output_type === 'String') {
          this.form.removeControl('outputs');
        }
        // if (this.taskData?.inputs?.length) {
        //   this.showRestApiInputParameters = true;
        // }
        if (this.taskData?.outputs?.length) {
          this.showOutputParameters = true;
        }
        if (this.taskData && this.taskData.outputs?.length) {
          const outputParamArray = new FormArray([]);

          this.taskData.outputs.forEach((param, index) => {
            const group = new FormGroup({
              param_name: new FormControl(param.param_name)
            });
            outputParamArray.insert(index, group);
          });

          this.form.addControl('outputs', outputParamArray);
        }
        // Common component of search-dropdown (edit scenario handled)
        if (this.selectedcategory && this.categoryList.length > 0) {
          this.categoryValue = this.categoryList.find(category => category === this.selectedcategory);
        }
        if (this.selectedcloudType && this.cloudType.length > 0) {
          this.cloudTypeValue = this.cloudType.find(cloud => cloud.type === this.selectedcloudType);
        }
        if (this.selectedcloudAccount && this.cloudAccount?.length > 0) {
          this.cloudAccountValue = this.cloudAccount.find(cloud => cloud.uuid === this.selectedcloudAccount).account_name;
        }
        if (this.selectedSource && this.repos.length > 0) {
          this.sourceValue = this.repos.find(source => source.uuid === this.selectedSource).name;
        }
        if (this.selectedSource) {
          this.svc.getScriptWithPlaybookType(this.selectedSource, this.taskData.script_type).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
            this.script = param;
            if (this.selectedScript && this.script?.length > 0) {
              this.scriptValue = this.script.find(script => script.uuid === this.selectedScript)?.name;
            }
            this.form.get('script').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
              if (value) {
                this.getInputParameter(value);
              }
            })
          });
        }
        this.spinner.stop('main');
      }, 1000)
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.handleError(err.error);
    });
  }

  getDropdownData() {
    this.categoryList = [];
    this.playbookTypes = [];
    this.targetTypes = [];
    this.repos = [];
    this.playbooks = [];
    this.privateCloud = [];
    this.publicCloud = [];
    this.spinner.start('main');
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.metadata) {
        this.categoryList = res.metadata.category ? res.metadata.category : [];
        this.playbookTypes = res.metadata.types ? res.metadata.types : [];
        // this.targetTypes = res.metadata.target_type ? res.metadata.target_type : [];
        this.repos = res.metadata.source ? res.metadata.source : [];
        this.privateCloud = res.metadata.private_cloud ? res.metadata.private_cloud : [];
        this.publicCloud = res.metadata.public_cloud ? res.metadata.public_cloud : [];
        this.playbooks = res.metadata.source[0].playbooks;
        this.cloudType = res.metadata.cloud;
        this.callbackUrl = res.metadata.callback_url;
        if (this.taskData?.source) {
          this.playbooks = this.repos.filter(repo => repo.uuid == this.taskData.source)[0]?.playbooks || [];
        }
      }
      if (res.templates) {
        this.inputTemplate = res.templates;
      } else {
        this.inputTemplate = [];
        this.notification.error(new Notification('Failed to fetch Input Templates'));
      } if (res.collectors) {
        this.collectors = res.collectors;
      } else {
        this.collectors = [];
        this.notification.error(new Notification('Failed to collectors'));
      }
      this.spinner.stop('main');
    })
    this.getCredentials();
  }

  getCollectors() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    }, err => {
      this.collectors = [];
    });
  }

  getInputTemplate() {
    this.svc.getInputTemplate().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.inputTemplate = res;
    }, err => {
      this.inputTemplate = [];
    });
  }

  getCredentials() {
    this.svc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.credentialList = param;
    }, err => {
      this.notification.error(new Notification('Error while fetching credentials. Please try again!!'));
    });
  }

  getTargets() {
    // if (this.taskData?.config?.targets) {
    //   this.targetValue = this.taskData?.config?.targets;
    // }
    // this.form.get('targets')?.valueChanges.pipe(debounceTime(2000), takeUntil(this.ngUnsubscribe)).subscribe((target: string) => {
    //   if (target && target.trim().length > 0) {
    //     this.svc.getTargets(target).subscribe(response => {
    //       if (response.length > 0) {
    //         this.formErrors.target = '';
    //         this.targetValue = response.filter(value => target === value.ip_address);
    //       } else {
    //         this.targetValue = [];
    //         this.formErrors.targets = 'No host found for the provided target value';
    //       }
    //     });
    //   } else {
    //     this.formErrors.targets = '';
    //     this.targetValue = [];
    //   }
    // });
  }

  searchTargets = (query: string): Observable<any[]> => {
    return this.svc.getTargets(query);
  };

  getScriptWithPlaybook() {
    if (this.sourceSubscription) {
      this.sourceSubscription.unsubscribe();
    }
    this.sourceSubscription = this.form.get('source').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.repoId = value;

      if (this.repoId) {
        this.svc.getScriptWithPlaybookType(this.repoId, this.taskType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
          this.script = param;
          if (this.scriptSubscription) {
            this.scriptSubscription.unsubscribe();
          }
          this.scriptSubscription = this.form.get('script').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((scriptValue: string) => {
            if (scriptValue) {
              this.getInputParameter(scriptValue);
            }
          });
        }, err => {
          this.notification.error(new Notification('Error while fetching Script. Please try again!!'));
        });
      }
    });
  }

  getcloudAccount() {
    this.form.get('cloud_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.svc.getCloudAccount(value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
          this.cloudAccount = param;
        });
      }
    });
  }

  // function to fetch inputs and outputs parameter based on the script
  getInputParameter(scriptId: string) {
    this.svc.getInputParameters(scriptId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.inputParameter = param;

      const hasInputs = this.inputParameter.inputs && this.inputParameter.inputs.length > 0;
      // this.form.get('define_parameter').setValue(hasInputs);
      const parameterArray = this.builder.array([]);

      if (hasInputs) {
        this.showRestApiInputParameters = true;
        for (let inputs of param.inputs) {
          const paramFormGroup = this.svc.getParameterForm(inputs);
          // paramFormGroup.get('param_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type: string) => {
          //   const isVisibleControl = paramFormGroup.get('is_visible');
          //   if (type === 'Input Template') {
          //     isVisibleControl?.disable();
          //   } else {
          //     isVisibleControl?.enable();
          //   }
          // });
          parameterArray.push(paramFormGroup);
        }
      } else {
        // Push one default empty form if no inputs exist
        const defaultInput: parameterDataType = {
          param_name: '',
          param_type: '',
          // is_visible: false,
          default_value: '',
          attribute: '',
          template: ''
        };
        const defaultFormGroup = this.svc.getParameterForm(defaultInput);
        parameterArray.push(defaultFormGroup);
      }

      if (this.form.contains('inputs')) {
        this.form.setControl('inputs', parameterArray);
      } else {
        this.form.addControl('inputs', parameterArray);
      }

      this.formErrors['inputs'] = [];
      for (let i = 0; i < parameterArray.length; i++) {
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        this.manageParameterFormSubscription(parameterArray.at(i) as FormGroup);
      }

      // outputs handling
      if (param.outputs.length > 0) {
        this.showOutputParameters = true;
      }
      const outputArray = this.builder.array([]);
      if (param.outputs.length > 0) {
        for (let output of param.outputs) {
          const outputFormGroup = this.builder.group({
            param_name: [output.param_name]
          });
          outputArray.push(outputFormGroup);
        }
      } else {
        // Add default output
        outputArray.push(this.builder.group({
          param_name: ['', [Validators.required]]
        }));
      }

      if (this.form.contains('outputs')) {
        this.form.setControl('outputs', outputArray);
      } else {
        this.form.addControl('outputs', outputArray);
      }

    }, err => {
      this.notification.error(new Notification('Error while fetching Script Inputs. Please try again!'));
    });
  }

  getCategoryDropdown(event: any) {
    this.form.get('category').setValue(event);
    this.form.get('category').setValidators([Validators.required, NoWhitespaceValidator])
  }

  getScriptDropdown(event: any) {
    this.form.get('script').setValue(event.uuid);
  }

  getSourceDropdown(event: any) {
    this.form.get('source').setValue(event.uuid);
  }

  getCredentialDropdown(event: any) {
    this.form.get('credentials').setValue(event.uuid);
  }

  getCloudTypeDropdown(event: any) {
    this.form.get('cloud_type').setValue(event.type);
  }

  getCloudAccountDropdown(event: any) {
    this.form.get('cloud_account').setValue(event.uuid);
  }

  buildForm() {
    this.form = this.svc.buildForm(this.taskData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    this.taskType = this.form.get('script_type').value;
    this.form.get('script_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((taskType: string) => {
      if (taskType && this.repoId) {
        this.svc.getScriptWithPlaybookType(this.repoId, taskType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
          this.script = param;
        })
      }
      if (taskType !== playbookTypes.RestApi) {
        this.form.addControl('source', new FormControl('', [Validators.required]));
        this.form.addControl('script', new FormControl('', [Validators.required]));
        this.form.get('target_type')?.setValue('');
        this.form.get('target_type')?.enable();
        this.form.get('output_type')?.setValue('');
        this.form.get('output_type')?.enable();
        this.form.get('source')?.setValue('');
        this.form.get('script')?.setValue('');
        this.form.get('cloud_account')?.setValue('');
        this.form.get('cloud_type')?.setValue('');
        this.form.get('targets')?.setValue('');
        this.form.get('cred')?.setValue('local');
        this.form.get('credentials')?.setValue('');
        this.form.get('username')?.setValue('');
        this.form.get('password')?.setValue('');
        this.cloudTypeValue = '';
        this.cloudAccountValue = '';
        this.sourceValue = '';
        this.scriptValue = '';
      }
      this.taskTypeChanges(taskType);
    });

    if (this.taskType == playbookTypes.TerraformScript || this.taskType == playbookTypes.AnsibleBook) {
      // if (this.form.get('define_parameter').value) {
      this.formErrors['inputs'] = [];
      for (let i = 0; i < this.parameterArray.length; i++) {
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        let formGroup = <FormGroup>this.parameterArray.at(i);
        this.manageParameterFormSubscription(formGroup);
        this.onSelectTemplate(i);
      }
      // }
      // this.form.get('define_parameter')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: boolean) => {
      if (this.showRestApiInputParameters === true) {
        const parametersFormArray = this.builder.array([]);
        const parametersFormArrayControl = this.builder.group({
          param_name: ['', [Validators.required, uniqueParamNameValidator]],
          param_type: ['', [Validators.required]],
          // is_visible: [false]
        });
        // parametersFormArrayControl.get('param_type')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
        //   const isVisibleControl = formGroup.get('is_visible');
        //   if (type === 'Input Template') {
        //     isVisibleControl?.disable();
        //   } else {
        //     isVisibleControl?.enable();
        //   }
        // });
        parametersFormArray.push(parametersFormArrayControl);
        this.form.addControl('inputs', parametersFormArray);
        this.formErrors['inputs'] = [];
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        let formGroup = <FormGroup>this.parameterArray.at(0);
        this.manageParameterFormSubscription(formGroup);
        this.onSelectTemplate(0);
      } else {
        this.form.removeControl('inputs');
      }
      // });
    } if (this.taskType == playbookTypes.PythonScript || this.taskType == playbookTypes.BashScript || this.taskType == playbookTypes.PowershellScript) {
      // if (this.form.get('define_parameter').value) {
      this.formErrors['inputs'] = [];
      for (let i = 0; i < this.parameterArray.length; i++) {
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        let formGroup = <FormGroup>this.parameterArray.at(i);
        this.manageParameterFormSubscription(formGroup);
        this.onSelectTemplate(i);
      }
      // }
      // this.form.get('define_parameter')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: boolean) => {
      if (this.showRestApiInputParameters === true) {
        const parametersFormArray = this.builder.array([]);
        const parametersFormArrayControl = this.builder.group({
          param_name: ['', [Validators.required, uniqueParamNameValidator]],
          param_type: ['', [Validators.required]],
          // is_visible: [false],
        });
        // parametersFormArrayControl.get('param_type')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
        //   const isVisibleControl = formGroup.get('is_visible');
        //   if (type === 'Input Template') {
        //     isVisibleControl?.disable();
        //   } else {
        //     isVisibleControl?.enable();
        //   }
        // });
        parametersFormArray.push(parametersFormArrayControl);
        this.form.addControl('inputs', parametersFormArray);
        this.formErrors['inputs'] = [];
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        let formGroup = <FormGroup>this.parameterArray.at(0);
        this.manageParameterFormSubscription(formGroup);
        this.onSelectTemplate(0);
      } else {
        this.form.removeControl('inputs');
      }
      // });
    }
    if (this.taskType == playbookTypes.RestApi) {
      this.form.get('url_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
        if (value == 'private') {
          this.form.addControl('collector', new FormControl('', [Validators.required]));
        } else {
          this.form.removeControl('collector');
        }
      });
      this.form.get('auth').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
        if (value == 'basic') {
          this.form.addControl('username', new FormControl('', [Validators.required]));
          this.form.addControl('password', new FormControl('', [Validators.required, NoWhitespaceValidator]));
          this.form.removeControl('token');
          this.form.removeControl('prefix');
        }
        if (value == 'token') {
          this.form.removeControl('password');
          this.form.removeControl('username');
          this.form.addControl('token', new FormControl('', [Validators.required]));
          this.form.addControl('prefix', new FormControl('', [Validators.required]));
        }
      });
      if (this.form.get('body_type')?.value == 'form' || this.form.get('body_type')?.value == 'json') {
        this.formErrors['inputs'] = [];
        for (let i = 0; i < this.parameterArray.length; i++) {
          this.formErrors.inputs.push(this.svc.getParameterErrors());
          let formGroup = <FormGroup>this.parameterArray.at(i);
          this.manageParameterFormSubscription(formGroup);
          this.onSelectTemplate(i);
        }
      }
      if (this.form.get('request_type').value == 'async') {
        this.formErrors['callback_request_validation'] = [];
        for (var i = 0; i < this.form.get('callback_request_validation').value.length; i++) {
          this.formErrors.callback_request_validation.push(this.svc.getRequestDataErrors());
        }
      }
      this.formErrors['responseData'] = [];
      for (var i = 0; i < this.form.get('responseData').value.length; i++) {
        this.formErrors.responseData.push(this.svc.getResponseDataErrors());
      }
      this.formErrors['headers'] = [];
      for (var i = 0; i < this.form.get('headers')?.value?.length; i++) {
        this.formErrors.headers.push(this.svc.getHeadersErrors());
      }
      this.form.get('body_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
        if (value == 'json' || value == 'form') {
          const parametersFormArray = this.builder.array([]);
          const parametersFormArrayControl = this.builder.group({
            param_name: ['', [Validators.required, uniqueParamNameValidator]],
            param_type: ['', [Validators.required]],
            // is_visible: [false]
          });
          // parametersFormArrayControl.get('param_type')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
          //   const isVisibleControl = formGroup.get('is_visible');
          //   if (type === 'Input Template') {
          //     isVisibleControl?.disable();
          //   } else {
          //     isVisibleControl?.enable();
          //   }
          // });
          parametersFormArray.push(parametersFormArrayControl);
          this.form.addControl('inputs', parametersFormArray);
          this.formErrors['inputs'] = [];
          this.formErrors.inputs.push(this.svc.getParameterErrors());
          let formGroup = <FormGroup>this.bodyDataArray.at(0);
          this.manageParameterFormSubscription(formGroup);
        }
      });
      this.form.get('request_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
        if (value == 'async') {
          // this.form.addControl('callback_url_key', new FormControl('', Validators.required));
          const callbackRequestValidationArray = this.builder.array([]);
          const callbackRequestValidationDataControl = this.builder.group({
            request_type: ['request_body', Validators.required],
            request_operator: ['', Validators.required],
            request_value: ['', Validators.required]
          });
          callbackRequestValidationArray.push(callbackRequestValidationDataControl);
          this.form.addControl('callback_request_validation', callbackRequestValidationArray);
          this.manageCallbackRequestValidationDataFormArray(callbackRequestValidationDataControl);
          this.formErrors['callback_request_validation'] = [];
          this.formErrors.callback_request_validation.push(this.svc.getRequestDataErrors());
        }
        if (value == 'sync') {
          this.form.removeControl('callback_request_validation');
        }
      });
    }
    this.formChangeSubscription(this.taskData);
  }

  taskTypeChanges(taskType) {
    if (taskType == playbookTypes.AnsibleBook || taskType === playbookTypes.PythonScript) {
      this.form.get('target_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
        if (value == 'Host') {
          this.form.addControl('cred', new FormControl('local'));
          this.form.addControl('credentials', new FormControl(''));
          this.form.addControl('targets', new FormControl(''));
          this.getTargets();
          // this.getCredentials();
          this.form.get('cred').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
            if (val == 'local') {
              this.form.addControl('credentials', new FormControl(''));
              this.form.removeControl('username');
              this.form.removeControl('password');
            } else {
              this.form.removeControl('credentials');
              this.form.addControl('username', new FormControl(''));
              this.form.addControl('password', new FormControl(''));
            }
          });
        } else if (value == 'Cloud' && taskType == playbookTypes.AnsibleBook) {
          this.form.addControl('cloud_type', new FormControl('', Validators.required))
          this.form.addControl('cloud_account', new FormControl(''))
          this.getcloudAccount();
        } else {
          this.form.removeControl('targets');
          this.form.removeControl('credentials');
          this.form.removeControl('username');
          this.form.removeControl('password');
          this.form.removeControl('cloud_type');
          this.form.removeControl('cloud_account');
        }
      });
    }
    if (taskType == playbookTypes.TerraformScript) {
      this.form.get('target_type')?.setValue('Cloud');
      this.form.get('target_type')?.disable();
      this.form.addControl('cloud_type', new FormControl('', Validators.required))
      this.form.addControl('cloud_account', new FormControl(''))
      this.getcloudAccount();
    } else {
      this.form.removeControl('cloud_type');
      this.form.removeControl('cloud_account');
    }

    if (taskType == playbookTypes.BashScript || taskType == playbookTypes.PowershellScript) {
      // this.form.get('target_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      // if (value == 'Host') {
      this.form.get('target_type')?.setValue('Host');
      this.form.get('target_type')?.disable();
      // this.getCredentials();
      this.form.addControl('cred', new FormControl('local'));
      this.form.addControl('credentials', new FormControl(''));
      this.form.addControl('targets', new FormControl(''));
      this.getTargets();
      this.form.get('cred').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val == 'local') {
          this.form.addControl('credentials', new FormControl(''));
          this.form.removeControl('username');
          this.form.removeControl('password');
        } else {
          this.form.removeControl('credentials');
          this.form.addControl('username', new FormControl(''));
          this.form.addControl('password', new FormControl(''));
        }
      });
    } else {
      this.form.removeControl('targets');
      this.form.removeControl('credentials');
      this.form.removeControl('username');
      this.form.removeControl('password');
    }
    if (taskType === playbookTypes.PythonScript) {
      this.form.addControl('requirements', new FormControl(''))
    } else {
      this.form.removeControl('requirements');
    }
    if (taskType === playbookTypes.AnsibleBook) {
      this.form.get('output_type').setValue(scriptOutputTypes[0]);
      this.form.get('output_type')?.disable();
      this.form.removeControl('outputs');
      this.form.get('outputs')?.updateValueAndValidity();
    } else if (taskType === playbookTypes.TerraformScript) {
      this.form.get('output_type').setValue(scriptOutputTypes[1]);
      this.form.get('output_type')?.disable();
      this.form.addControl('outputs', this.builder.array([
        this.builder.group({
          'param_name': ['', [Validators.required, NoWhitespaceValidator]]
        })
      ]));
    } else {
      this.form.get('output_type').setValue('');
      this.form.get('output_type')?.enable();
      this.form.get('output_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((outputType: string) => {
        if (outputType === 'JSON' || outputType === 'Key-Value') {
          if (!this.form.contains('outputs')) {
            this.form.addControl('outputs', this.builder.array([
              this.builder.group({
                'param_name': ['']
              })
            ]));
          }
        } else {
          this.form.removeControl('outputs');
        }
      });
    }
  }

  formChangeSubscription(taskData: OrchestrationTaskCrudDataType) {
    this.form.get('script_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.taskType = value;
      this.attributeList = [[]];
      this.form.addControl('output_type', new FormControl('', [Validators.required]));
      if (this.taskType == playbookTypes.AnsibleBook || this.taskType == playbookTypes.TerraformScript) {
        this.form.get('script')?.setValue('');
        this.getScriptWithPlaybook();
        this.form.removeControl('arguments');
        if (this.form.get('inputs')?.value) {
          this.form.removeControl('inputs');
        }
        // this.form.addControl('define_parameter', new FormControl(false));
        const parametersFormArray = this.builder.array([]);
        const parametersFormArrayControl = this.builder.group({
          param_name: ['', [Validators.required, uniqueParamNameValidator]],
          param_type: ['', [Validators.required]],
          // is_visible: [false]
        });
        // parametersFormArrayControl.get('param_type')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
        //   const isVisibleControl = formGroup.get('is_visible');
        //   if (type === 'Input Template') {
        //     isVisibleControl?.disable();
        //   } else {
        //     isVisibleControl?.enable();
        //   }
        // });
        parametersFormArray.push(parametersFormArrayControl);
        this.form.addControl('inputs', parametersFormArray);
        this.formErrors['inputs'] = [];
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        let formGroup = <FormGroup>this.parameterArray.at(0);
        this.manageParameterFormSubscription(formGroup);
        for (let i = 0; i < this.parameterArray.length; i++) {
          let formGroup = <FormGroup>this.parameterArray.at(i);
          this.manageParameterFormSubscription(formGroup);
          this.onSelectTemplate(i);
        }
        this.formErrors['inputs'] = [];
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        this.form.addControl('source', new FormControl('', [Validators.required]));
        this.form.addControl('target_type', new FormControl('', [Validators.required]));
        this.form.addControl('script', new FormControl('', [Validators.required]));
        // this.form.get('define_parameter')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: boolean) => {
        if (this.showRestApiInputParameters === true) {
          const parametersFormArray = this.builder.array([]);
          const parametersFormArrayControl = this.builder.group({
            param_name: ['', [Validators.required, uniqueParamNameValidator]],
            param_type: ['', [Validators.required]],
            // is_visible: [false]
          });
          // parametersFormArrayControl.get('param_type')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
          //   const isVisibleControl = formGroup.get('is_visible');
          //   if (type === 'Input Template') {
          //     isVisibleControl?.disable();
          //   } else {
          //     isVisibleControl?.enable();
          //   }
          // });
          parametersFormArray.push(parametersFormArrayControl);
          this.form.addControl('inputs', parametersFormArray);
          this.formErrors['inputs'] = [];
          this.formErrors.inputs.push(this.svc.getParameterErrors());
          let formGroup = <FormGroup>this.parameterArray.at(0);
          this.manageParameterFormSubscription(formGroup);
          this.onSelectTemplate(0);
        } else {
          this.form.removeControl('inputs');
        }
        // });
      } else if (this.taskType == playbookTypes.PythonScript || this.taskType == playbookTypes.BashScript || this.taskType == playbookTypes.PowershellScript) {
        this.form.get('script')?.setValue('');
        this.getScriptWithPlaybook();
        this.form.get('output_type').setValue('');
        this.form.get('output_type').enable();
        this.form.removeControl('inputs');
        // this.form.addControl('define_parameter', new FormControl(false));
        const parametersFormArray = this.builder.array([]);
        const parametersFormArrayControl = this.builder.group({
          param_name: ['', [Validators.required, uniqueParamNameValidator]],
          param_type: ['', [Validators.required]],
        });
        // parametersFormArrayControl.get('param_type')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
        //   const isVisibleControl = formGroup.get('is_visible');
        //   if (type === 'Input Template') {
        //     isVisibleControl?.disable();
        //   } else {
        //     isVisibleControl?.enable();
        //   }
        // });
        parametersFormArray.push(parametersFormArrayControl);
        this.form.addControl('inputs', parametersFormArray);
        this.formErrors['inputs'] = [];
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        let formGroup = <FormGroup>this.parameterArray.at(0);
        this.manageParameterFormSubscription(formGroup);
        this.onSelectTemplate(0);

        // this.form.get('define_parameter')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: boolean) => {
        if (this.showRestApiInputParameters === true) {
          const parametersFormArray = this.builder.array([]);
          const parametersFormArrayControl = this.builder.group({
            param_name: ['', [Validators.required, uniqueParamNameValidator]],
            param_type: ['', [Validators.required]],
            // is_visible: [false]
          });
          // parametersFormArrayControl.get('param_type')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
          //   const isVisibleControl = formGroup.get('is_visible');
          //   if (type === 'Input Template') {
          //     isVisibleControl?.disable();
          //   } else {
          //     isVisibleControl?.enable();
          //   }
          // });
          parametersFormArray.push(parametersFormArrayControl);
          this.form.addControl('inputs', parametersFormArray);
          this.formErrors['inputs'] = [];
          this.formErrors.inputs.push(this.svc.getParameterErrors());
          let formGroup = <FormGroup>this.parameterArray.at(0);
          this.manageParameterFormSubscription(formGroup);
          this.onSelectTemplate(0);
        } else {
          this.form.removeControl('inputs');
        }
        // });
        this.form.addControl('source', new FormControl('', [Validators.required]));
        this.form.addControl('target_type', new FormControl('', [Validators.required]));
        this.form.addControl('script', new FormControl('', [Validators.required]));
      }
      if (this.taskType == playbookTypes.RestApi) {
        this.form.get('script')?.setValue('');
        this.form.get('output_type').setValue('');
        this.form.get('output_type').enable();
        this.form.removeControl('inputs');
        this.getConnections();
        this.formErrors = this.svc.resetFormErrors();
        const responseDataArray = this.builder.array([]);
        const responseDataControl = this.builder.group({
          response_type: ['response_code', Validators.required],
          response_operator: ['', Validators.required],
          response_value: ['', [Validators.required, validateValue]]
        });
        responseDataArray.push(responseDataControl);
        this.form.addControl('responseData', responseDataArray);
        const headersArray = this.builder.array([]);
        const headersControl = this.builder.group({
          header_name: [''],
          header_value: ['']
        });
        headersArray.push(headersControl);
        this.form.addControl('headers', headersArray);
        this.setResponseDataFormErrors();
        this.setHeadersFormErrors();
        this.manageresponseDataFormArray(responseDataControl);
        this.form.addControl('url_type', new FormControl('public', [Validators.required]));
        this.form.get('url_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
          if (value == 'private') {
            this.form.addControl('collector', new FormControl('', [Validators.required]));
          } else {
            this.form.removeControl('collector');
          }
        });
        this.form.addControl('target_type', new FormControl('', [Validators.required]));
        this.form.addControl('method', new FormControl('GET', [Validators.required]));
        this.form.addControl('url', new FormControl('', [Validators.required]));
        this.form.addControl('connection', new FormControl(''));
        this.form.addControl('verify_ssl', new FormControl(''));
        this.form.addControl('body_type', new FormControl('null', Validators.required));
        if (this.form.get('body_type').value !== null) {
          this.form.get('body_type').setValue(this.form.get('body_type').value);
        }
        this.form.get('body_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
          if (value == 'json' || value == 'form') {
            const parametersFormArray = this.builder.array([]);
            const parametersFormArrayControl = this.builder.group({
              param_name: ['', [Validators.required, uniqueParamNameValidator]],
              param_type: ['', [Validators.required]],
              // is_visible: [false]
            });
            // parametersFormArrayControl.get('param_type')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
            //   const isVisibleControl = formGroup.get('is_visible');
            //   if (type === 'Input Template') {
            //     isVisibleControl?.disable();
            //   } else {
            //     isVisibleControl?.enable();
            //   }
            // });
            parametersFormArray.push(parametersFormArrayControl);
            this.form.addControl('inputs', parametersFormArray);
            this.formErrors['inputs'] = [];
            this.formErrors.inputs.push(this.svc.getParameterErrors());
            let formGroup = <FormGroup>this.bodyDataArray.at(0);
            this.manageParameterFormSubscription(formGroup);
            this.setParamErrors();
          } else {
            this.form.removeControl('inputs');
          }
        });
        // call back req vali form array
        this.form.addControl('request_type', new FormControl('sync', [Validators.required]));
        if (this.form.get('request_type').value === 'async') {
          this.form.get('request_type').setValue(this.form.get('request_type').value);
        }
        this.form.get('request_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
          if (value == 'async') {
            // this.form.addControl('callback_url_key', new FormControl('', Validators.required));
            const callbackRequestValidationArray = this.builder.array([]);
            const callbackRequestValidationDataControl = this.builder.group({
              request_type: ['request_body', Validators.required],
              request_operator: ['', Validators.required],
              request_value: ['', Validators.required]
            });
            callbackRequestValidationArray.push(callbackRequestValidationDataControl);
            this.form.addControl('callback_request_validation', callbackRequestValidationArray);
            this.manageCallbackRequestValidationDataFormArray(callbackRequestValidationDataControl);
            this.formErrors['callback_request_validation'] = [];
            this.formErrors.callback_request_validation.push(this.svc.getRequestDataErrors());
          }
          if (value == 'sync') {
            this.form.removeControl('callback_request_validation');
            // this.form.removeControl('callback_url_key');
          }
        });

        this.form.get('connection').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(con => {
          const selectedConnection = this.connections.find(conn => conn.uuid === con);
          this.connectionBaseUrl = selectedConnection?.base_url;
        });

        if (this.form.get('output_type').value !== '') {
          this.form.get('output_type').setValue(taskData?.output_type);
        }
      }
    });

    this.form.get('script').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      console.log(value, "value")
      // if (this.form.contains('inputs')) {
      //   this.form.removeControl('inputs');
      // }
      this.formErrors['inputs'] = []; // keep clean always

      // if API says don’t show parameters → nothing should be pushed
      if (this.showRestApiInputParameters === false) {
        return;
      }
    })
  }

  getConnections() {
    this.svc.getConnections().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.connections = res.results;
    }, error => {
      this.connections = [];
    })
  }

  addHeadersRestApi() {
    const headersArray = this.builder.array([]);
    const headersControl = this.builder.group({
      header_name: ['', Validators.required],
      header_value: ['', Validators.required]
    });
    headersArray.push(headersControl);
    this.form.setControl('headers', headersArray);
    this.setHeadersFormErrors();
    this.showRestApiHeaders = true;
  }

  get shouldShowDefaultValueHeader(): boolean {
    const inputs = this.form.get('inputs')?.value;
    return Array.isArray(inputs) && inputs.some(input => !!input.param_type);
  }

  addInputParameterTask() {
    const parametersFormArray = this.builder.array([]);
    const parametersFormArrayControl = this.builder.group({
      param_name: ['', [Validators.required, uniqueParamNameValidator]],
      param_type: ['', [Validators.required]],
    });
    parametersFormArray.push(parametersFormArrayControl);
    this.form.setControl('inputs', parametersFormArray);
    let formGroup = <FormGroup>this.parameterArray.at(0);
    this.manageParameterFormSubscription(formGroup);
    this.setParamErrors();
    this.showRestApiInputParameters = true;
  }

  addInputParametersRestApi() {
    if (this.form.get('body_type').value === 'form' || this.form.get('body_type').value === 'json') {
      this.formErrors.body_type = null;
      const parametersFormArray = this.builder.array([]);
      const parametersFormArrayControl = this.builder.group({
        param_name: ['', [Validators.required, uniqueParamNameValidator]],
        param_type: ['', [Validators.required]],
        // is_visible: [false]
      });
      // parametersFormArrayControl.get('param_type')?.valueChanges?.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type) => {
      //   const isVisibleControl = formGroup.get('is_visible');
      //   if (type === 'Input Template') {
      //     isVisibleControl?.disable();
      //   } else {
      //     isVisibleControl?.enable();
      //   }
      // });
      parametersFormArray.push(parametersFormArrayControl);
      this.form.setControl('inputs', parametersFormArray);
      let formGroup = <FormGroup>this.parameterArray.at(0);
      this.manageParameterFormSubscription(formGroup);
      this.setParamErrors();
      this.showRestApiInputParameters = true;
    } else {
      this.form.get('body_type').setErrors({ required: true });
      this.formErrors.body_type = 'Request Body is required to add input parameters';
    }
  }

  addOutputParameters() {
    const outputGroup = this.builder.group({
      param_name: ['', [Validators.required, NoWhitespaceValidator]]
    });
    const outputsFormArray = this.builder.array([]);
    outputsFormArray.push(outputGroup);
    this.form.setControl('outputs', outputsFormArray);
    this.showOutputParameters = true;
  }

  addHeadersData(i: number) {
    let headersFormGroup = <FormGroup>this.headersDataArray.at(i);
    if (headersFormGroup.invalid) {
      this.formErrors.headers[i] = this.utilService.validateForm(headersFormGroup, this.formValidationMessages.headers, this.formErrors.headers[i]);
      headersFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors.headers[i] = this.utilService.validateForm(headersFormGroup, this.formValidationMessages.headers, this.formErrors.headers[i]);
      });
    } else {
      let newParamControl = this.builder.group({
        header_name: ['', Validators.required],
        header_value: ['', Validators.required]
      })
      this.formErrors.headers.push(this.svc.getHeadersErrors());
      this.headersDataArray.push(newParamControl);
    }
  }

  removeHeadersData(i: number) {
    let paramFormControl = this.form.get('headers') as FormArray;
    // if (paramFormControl.length > 1) {
    paramFormControl.removeAt(i);
    this.formErrors.headers.splice(i, 1);
    // }
    if (i === 0 && this.headersDataArray.length === 0) {
      this.showRestApiHeaders = false;
    }
  }

  get outputParameterArray(): FormArray {
    return this.form.get('outputs') as FormArray;
  }

  addOutputParam() {
    this.outputParameterArray.push(
      this.builder.group({
        param_name: ['', [Validators.required, NoWhitespaceValidator]]
      })
    );
  }

  removeOutputParam(index: number): void {
    // if (this.outputParameterArray.length > 1) {
    this.outputParameterArray?.removeAt(index);
    // }
    if (index === 0 && this.outputParameterArray?.length === 0) {
      this.showOutputParameters = false;
    }
  }

  onSelectTemplate(index: number, $event?: any) {
    if (this.taskType == playbookTypes.RestApi) {
      let fg = <FormGroup>this.bodyDataArray.at(index);
      if (fg.get('template')?.value && this.inputTemplate) {
        const templateVal = fg.get('template').value;
        const selectedTemplate = this.inputTemplate.find(template => template.uuid === templateVal);
        this.attributeList[index] = selectedTemplate ? selectedTemplate.attributes : [];
        if (this.attributeList[index] && this.attributeList[index].length > 0) {
          fg.addControl('attribute', new FormControl(''));
        } else {
          fg.removeControl('attribute');
        }
      }
    } else {
      let fg = <FormGroup>this.parameterArray.at(index);
      if (fg.get('template')?.value && this.inputTemplate) {
        const templateVal = fg.get('template').value;
        const selectedTemplate = this.inputTemplate.find(template => template.uuid === templateVal);
        this.attributeList[index] = selectedTemplate ? selectedTemplate.attributes : [];
        if (this.attributeList[index] && this.attributeList[index].length > 0) {
          fg.addControl('attribute', new FormControl(''));
        } else {
          fg.removeControl('attribute');
        }
      }
    }
  }

  manageParameterFormSubscription(fg: FormGroup, i?: number) {
    // if (this.taskType == playbookTypes.PythonScript || this.taskType == playbookTypes.BashScript || this.taskType == playbookTypes.PowershellScript) {
    //   fg.get('param_name')?.disable();
    // }
    fg.get('param_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      fg.get('default_value')?.setValue('');
      if (val == 'Input Template') {
        fg.removeControl('default_value');
        fg.addControl('template', new FormControl('', [Validators.required]));
      } else {
        fg.addControl('default_value', new FormControl('', [validateDefaultValue]));
        fg.removeControl('template');
        fg.removeControl('attribute');
      }
    });
  }

  manageresponseDataFormArray(formGroup: FormGroup) {
    formGroup.get('response_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'response_body') {
        formGroup.removeControl('response_value');
        formGroup.addControl('response_value', new FormControl('', [Validators.required, validateValue]));
      } else if (val == 'json_query') {
        formGroup.addControl('response_key', new FormControl('', [Validators.required]));
        formGroup.removeControl('response_value');
        formGroup.addControl('response_value', new FormControl('', [Validators.required, validateValue]));
      } else {
        formGroup.removeControl('response_value');
        formGroup.addControl('response_value', new FormControl('', [Validators.required, validateValue]));
        formGroup.removeControl('response_key');
      }
    });
  }

  manageCallbackRequestValidationDataFormArray(formGroup: FormGroup) {
    formGroup.get('request_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val == 'request_body') {
        formGroup.removeControl('request_value');
        formGroup.removeControl('request_key');
        formGroup.addControl('request_value', new FormControl('', [Validators.required]));
      } else {
        formGroup.addControl('request_key', new FormControl('', [Validators.required]));
        formGroup.removeControl('request_value');
        formGroup.addControl('request_value', new FormControl('', [Validators.required]));
      }
    });
  }

  get parameterArray(): FormArray {
    return this.form.get('inputs') as FormArray;
  }

  get bodyDataArray(): FormArray {
    if (this.taskType == playbookTypes.RestApi) {
      if (this.form.get('body_type')?.value == 'form' || this.form.get('body_type')?.value == 'json') {
        return this.form.get('inputs') as FormArray;
      }
    }
  }

  get responseDataArray(): FormArray {
    if (this.taskType == playbookTypes.RestApi) {
      return this.form.get('responseData') as FormArray;
    }
  }

  get requestDataArray(): FormArray {
    if (this.taskType == playbookTypes.RestApi && this.form.get('request_type')?.value == 'async') {
      return this.form.get('callback_request_validation') as FormArray;
    }
  }


  get headersDataArray(): FormArray {
    if (this.taskType == playbookTypes.RestApi) {
      return this.form.get('headers') as FormArray;
    }
  }

  addRequestData(i: number) {
    let requestDataFormGroup = <FormGroup>this.requestDataArray.at(i);
    if (requestDataFormGroup.invalid) {
      this.formErrors.callback_request_validation[i] = this.utilService.validateForm(requestDataFormGroup, this.formValidationMessages.callback_request_validation, this.formErrors.callback_request_validation[i]);
      requestDataFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors.callback_request_validation[i] = this.utilService.validateForm(requestDataFormGroup, this.formValidationMessages.callback_request_validation, this.formErrors.callback_request_validation[i]);
      });
    } else {
      let newParamControl = this.builder.group({
        "request_type": ['request_body', Validators.required],
        "request_operator": ['', Validators.required],
        "request_value": ['', Validators.required]
      })
      this.formErrors.callback_request_validation.push(this.svc.getRequestDataErrors());
      this.manageCallbackRequestValidationDataFormArray(newParamControl);
      this.requestDataArray.push(newParamControl);
    }
  }

  addResponseData(i: number) {
    let responseDataFormGroup = <FormGroup>this.responseDataArray.at(i);
    if (responseDataFormGroup.invalid) {
      this.formErrors.responseData[i] = this.utilService.validateForm(responseDataFormGroup, this.formValidationMessages.responseData, this.formErrors.responseData[i]);
      responseDataFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors.responseData[i] = this.utilService.validateForm(responseDataFormGroup, this.formValidationMessages.responseData, this.formErrors.responseData[i]);
      });
    } else {
      let newParamControl = this.builder.group({
        "response_type": ['response_code', Validators.required],
        "response_operator": ['', Validators.required],
        "response_value": ['', [Validators.required, validateValue]]
      })
      this.manageresponseDataFormArray(newParamControl);
      this.formErrors.responseData.push(this.svc.getResponseDataErrors());
      this.responseDataArray.push(newParamControl);
    }
  }

  addParameter(i: number) {
    let parameterFormGroup = <FormGroup>this.parameterArray.at(i);
    if (parameterFormGroup.invalid) {
      this.formErrors.inputs[i] = this.utilService.validateForm(parameterFormGroup, this.formValidationMessages.inputs, this.formErrors.inputs[i]);
      parameterFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors.inputs[i] = this.utilService.validateForm(parameterFormGroup, this.formValidationMessages.inputs, this.formErrors.inputs[i]);
      });
    } else {
      if (this.taskType == playbookTypes.TerraformScript || this.taskType == playbookTypes.AnsibleBook || this.taskType == playbookTypes.RestApi) {
        let newParamControl = this.builder.group({
          "param_name": ['', [Validators.required, uniqueParamNameValidator]],
          "param_type": ['', [Validators.required]],
          // 'is_visible': [false]
        })
        // newParamControl.get('param_type')?.valueChanges.subscribe((type: string) => {
        //   const isVisibleControl = newParamControl.get('is_visible');
        //   if (type === 'Input Template') {
        //     isVisibleControl?.disable();
        //   } else {
        //     isVisibleControl?.enable();
        //   }
        // });
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        this.parameterArray.push(newParamControl);
        this.manageParameterFormSubscription(newParamControl);
      } else {
        let newParamControl = this.builder.group({
          "param_name": ['', [Validators.required, uniqueParamNameValidator]],
          "param_type": ['', [Validators.required]],
          // 'is_visible': [false]
        })
        // newParamControl.get('param_type')?.valueChanges.subscribe((type: string) => {
        //   const isVisibleControl = newParamControl.get('is_visible');
        //   if (type === 'Input Template') {
        //     isVisibleControl?.disable();
        //   } else {
        //     isVisibleControl?.enable();
        //   }
        // });
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        this.parameterArray.push(newParamControl);
        this.manageParameterFormSubscription(newParamControl);
      }
    }
  }

  setParamErrors() {
    if (this.parameterArray.length) {
      for (let i = 0; i < this.parameterArray.length; i++) {
        // if (this.taskType == playbookTypes.AnsibleBook || this.taskType == playbookTypes.TerraformScript || this.taskType === playbookTypes.RestApi) {
        this.formErrors.inputs.push(this.svc.getParameterErrors());
        // }
      }
    }
  }

  setRequestDataFormErrors() {
    if (this.form.get('callback_request_validation')) {
      for (let i = 0; i < this.requestDataArray.length; i++) {
        this.formErrors.callback_request_validation.push(this.svc.getRequestDataErrors());
      }
    }
  }

  setResponseDataFormErrors() {
    if (this.form.get('responseData')) {
      for (let i = 0; i < this.responseDataArray.length; i++) {
        this.formErrors.responseData.push(this.svc.getResponseDataErrors());
      }
    }
  }

  setHeadersFormErrors() {
    if (this.form.get('headers')) {
      this.formErrors['headers'] = [];
      for (let i = 0; i < this.headersDataArray.length; i++) {
        this.formErrors.headers.push(this.svc.getHeadersErrors());
      }
    }
  }

  setbodyDataFormErrors() {
    if (this.form.get('bodyData')) {
      for (let i = 0; i < this.bodyDataArray.length; i++) {
        this.formErrors.bodyData.push(this.svc.getBodyDataErrors());
      }
    }
  }

  removeRequestData(i: number) {
    let paramFormControl = this.form.get('callback_request_validation') as FormArray;
    if (paramFormControl.length > 1) {
      paramFormControl.removeAt(i);
      this.formErrors.callback_request_validation.splice(i, 1);
    }
  }

  removeBodyData(i: number) {
    let paramFormControl = this.form.get('bodyData') as FormArray;
    if (paramFormControl.length > 1) {
      paramFormControl.removeAt(i);
      this.formErrors.bodyData.splice(i, 1);
    }
  }

  removeResponseData(i: number) {
    let paramFormControl = this.form.get('responseData') as FormArray;
    if (paramFormControl.length > 1) {
      paramFormControl.removeAt(i);
      this.formErrors.bodyData.splice(i, 1);
    }
  }

  removeParameter(i: number) {
    let paramFormControl = this.form.get('inputs') as FormArray;
    // if (paramFormControl.length > 1) {
    paramFormControl?.removeAt(i);
    this.formErrors?.inputs?.splice(i, 1);
    this.attributeList?.splice(i, 1)
    // }
    if (i === 0 && this.parameterArray?.length === 0) {
      this.showRestApiInputParameters = false;
    }
  }

  testConnection() {
    const testUrl = this.form.get('url').value;
    const urlType = this.form.get('url_type').value;
    if (urlType == 'private') {
      this.collectorAddr = this.form.get('collector').value;
    } else {
      this.collectorAddr = "";
    }
    if (testUrl) {
      this.svc.testConnection(testUrl, urlType, this.collectorAddr, this.connectionBaseUrl).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.connectionResult = data;
        this.spinner.stop('main');
        this.urlBlockStatus = true;
        if (this.connectionResult == true) {
          this.notification.success(new Notification('The given Url is working successfully.'));
        }
        if (this.connectionResult == false) {
          this.notification.error(new Notification('The given Url is Not working properly.'));
        }
      }, (err: HttpErrorResponse) => {
        this.urlBlockStatus = true;
        this.connectionResult = false;
        this.notification.error(new Notification('The given Url is Not working properly.'));
      });
    }
  }

  confirmTaskCreate() {
    console.log(this.form, "form")
    console.log(this.formErrors, "form errors")
    let obj = <any>Object.assign({}, this.form.getRawValue());
    if (this.taskType == playbookTypes.AnsibleBook || this.taskType == playbookTypes.TerraformScript) {
      this.form.removeControl('auth');
      this.form.removeControl('body');
      this.form.removeControl('bodyData');
      this.form.removeControl('method');
      this.form.removeControl('request_type');
      this.form.removeControl('responseData');
      this.form.removeControl('url');
      this.form.removeControl('url_type');
      this.form.removeControl('collector');
      // this.form.removeControl('callback_url_key');
      this.form.removeControl('callback_request_validation');
      if (this.taskType == playbookTypes.AnsibleBook) {
        this.form.removeControl('outputs');
      }
      if (!this.showRestApiInputParameters) {
        this.removeParameter(0);
      }
      if (!this.showOutputParameters) {
        this.removeOutputParam(0);
      }
    }
    if (this.taskType == playbookTypes.PythonScript || this.taskType == playbookTypes.BashScript || this.taskType == playbookTypes.PowershellScript) {
      this.form.removeControl('auth');
      this.form.removeControl('body');
      this.form.removeControl('bodyData');
      this.form.removeControl('method');
      this.form.removeControl('request_type');
      this.form.removeControl('responseData');
      this.form.removeControl('url');
      this.form.removeControl('url_type');
      this.form.removeControl('collector');
      // this.form.removeControl('callback_url_key');
      this.form.removeControl('callback_request_validation');
      this.form.removeControl('headers');
      //For Output and Output Type
      if (this.form.get('output_type')?.value === 'String') {
        this.form.removeControl('outputs');
      }
      if (!this.showRestApiInputParameters) {
        this.removeParameter(0);
      }
      if (!this.showOutputParameters) {
        this.removeOutputParam(0);
      }
    }
    if (obj.script_type == this.taskTypes.RestApi) {
      this.form.removeControl('source');
      this.form.removeControl('playbook');
      this.form.removeControl('arguments');
      this.form.removeControl('cloud');
      this.form.removeControl('script');
      this.form.get('target_type')?.setValue('Local');
    }
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.spinner.start('main');
      let obj = <any>Object.assign({}, this.form.getRawValue());
      if (this.showRestApiInputParameters) {
        obj.inputs.forEach(ele => {
          if (ele.param_type === 'List' || ele.param_type === 'Dictionary') {
            try {
              ele.default_value = typeof ele.default_value === 'string' ? JSON.parse(ele.default_value) : ele.default_value;
            } catch (e) {
              console.warn('Invalid JSON in param', ele.default_value);
            }
          }
        });
      }
      if (obj.script_type == this.taskTypes.AnsibleBook || obj.script_type == this.taskTypes.TerraformScript || obj.script_type == this.taskTypes.BashScript || obj.script_type == this.taskTypes.PythonScript || obj.script_type == this.taskTypes.PowershellScript) {
        // Build `config` based on Target Type
        if (obj.target_type === 'Local') {
          if (obj.script_type === this.taskTypes.PythonScript) {
            obj.config = {
              requirements: obj.requirements || '',
            };
          } else {
            obj.config = {}; // No other config for non-python local
          }

          // Remove unnecessary fields
          delete obj.targets;
          delete obj.credentials;
          delete obj.username;
          delete obj.password;
          delete obj.requirements;
          delete obj.cloud_type;
          delete obj.cloud_account;
          delete obj.cred;

        } else if (obj.target_type === 'Host') {
          obj.config = {
            targets: obj.targets || [],
          };

          if (obj.cred === 'local') {
            obj.config.cred = 'local';
            obj.config.credentials = obj.credentials;
          } else if (obj.cred === 'my_cred') {
            obj.config.cred = 'my_cred';
            obj.config.username = obj.username;
            obj.config.password = obj.password;
          }

          if (obj.script_type === this.taskTypes.PythonScript) {
            obj.config.requirements = obj.requirements || '';
          }

          delete obj.targets;
          delete obj.credentials;
          delete obj.username;
          delete obj.password;
          delete obj.requirements;
          delete obj.cred;

        } else if (obj.target_type === 'Cloud') {
          obj.config = {
            cloud_type: obj.cloud_type,
            cloud_account: obj.cloud_account,
          };

          delete obj.cloud_type;
          delete obj.cloud_account;
        }

        if (this.showRestApiInputParameters) {
          obj.inputs.forEach(ele => {
            if (ele.param_type == 'Number') {
              ele.default_value = Number(ele.default_value);
            }
            if (ele.param_type == 'Boolean') {
              ele.default_value = Boolean(ele.default_value);
            }
          });
        }
      }
      if (obj.script_type == this.taskTypes.RestApi) {
        delete obj.source
        delete obj.playbook
        delete obj.arguments
        delete obj.cloud
        if (obj.body_type == 'form' || obj.body_type == 'json') {
          obj.body = obj.bodyData
          delete obj.bodyData;
        }
        if (obj.auth == 'token') {
          obj.auth = {
            token: {
              prefix: obj.prefix,
              token: obj.token
            }
          };
          delete obj.prefix;
          delete obj.token;
        }
        if (obj.auth == 'basic') {
          obj.auth = {
            basic: {
              username: obj.username,
              password: obj.password,
            }
          };
          delete obj.password;
          delete obj.username;
        }
        if (obj.auth == 'null') {
          obj.auth = null;
        }
        if (obj.body == 'null') {
          obj.body = null;
        }
        obj.responseData.forEach(ele => {
          if (ele.response_type == 'response_code') {
            ele.response_value = Number(ele.response_value);
          }
        });
        obj.response_validation = obj.responseData;
        delete obj.responseData;
        obj.config = {
          body_type: obj.body_type,
          url_type: obj.url_type,
          collector: obj.collector,
          method: obj.method,
          url: obj.url,
          auth: obj.auth,
          response_validation: obj.response_validation,
          request_type: obj.request_type,
          verify_ssl: obj.verify_ssl,
          connection: obj.connection,
          base_url: this.connectionBaseUrl
        }
        if (obj.request_type == 'async') {
          // obj.config.callback_url_key = obj.callback_url_key;
          obj.config.callback_request_validation = obj.callback_request_validation;
        }
        if (this.showRestApiHeaders) {
          obj.config.headers = obj.headers;
        }
        delete obj.url_type;
        delete obj.collector;
        delete obj.method;
        delete obj.url;
        delete obj.auth;
        delete obj.body_type;
        delete obj.response_validation;
        delete obj.request_type;
        // delete obj.callback_url_key;
        delete obj.callback_request_validation;
        delete obj.headers;
        delete obj.connection;
        delete obj.verify_ssl;
        delete obj.base_url;
      }
      if (this.taskId) {
        this.svc.updateTask(this.taskId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.celeryTaskIds = this.storage.getByKey('celeryTaskId', StorageType.SESSIONSTORAGE);
          if (!this.celeryTaskIds) {
            this.celeryTaskIds = [];
          }
          this.celeryTaskIds.push(data.task_id);
          this.storage.put('celeryTaskId', this.celeryTaskIds, StorageType.SESSIONSTORAGE);
          this.spinner.stop('main');
          this.notification.success(new Notification('Task update In Progress...'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.svc.createTask(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.celeryTaskIds = this.storage.getByKey('celeryTaskId', StorageType.SESSIONSTORAGE);
          if (!this.celeryTaskIds) {
            this.celeryTaskIds = [];
          }
          this.celeryTaskIds.push(data.task_id);
          this.storage.put('celeryTaskId', this.celeryTaskIds, StorageType.SESSIONSTORAGE);
          this.spinner.stop('main');
          this.notification.success(new Notification('Task creation In Progress...'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    // this.formErrors = this.svc.resetFormErrors();
    this.spinner.stop('main');
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err.detail) {
      this.nonFieldErr = err.detail;
    }
    else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.notification.error(new Notification('Something went wrong!! Please try again.'));
    this.spinner.stop('main');
  }

  goBack() {
    if (this.taskId && this.categoryUuid) {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    } else if (this.taskId && !this.categoryUuid) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }
}
