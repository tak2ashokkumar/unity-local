import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { HostType, OrchestrationTasksScheduleService, TemplateOption, TerraFormParams } from './orchestration-tasks-schedule.service';
import { Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { scheduleType } from './orchestration-tasks-type';
import { catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { CloudNameType } from '../orchestration-task-execute/orchestration-task-execute.type';
import { Hosts, deviceTypes } from '../orchestration-task-execute/orchestration-task-execute.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'orchestration-tasks-schedule',
  templateUrl: './orchestration-tasks-schedule.component.html',
  styleUrls: ['./orchestration-tasks-schedule.component.scss'],
  providers: [OrchestrationTasksScheduleService]
})
export class OrchestrationTasksScheduleComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  taskId: string;
  scheduleData: scheduleType;
  nonFieldErr: string = '';
  activeForm: string;
  hostOrCloud: string;

  cloudForm: FormGroup;
  cloudFormErrors: any;
  cloudFormValidationMessages: any;

  hostForm: FormGroup;
  hostFormErrors: any;
  hostFormValidationMessages: any;

  host: string[]
  deviceType: string[];
  hosts: any[] = [];
  cloudAccountNames: string[]

  credentialList: DeviceDiscoveryCredentials[] = [];
  searchValue: string = '';
  fieldsToFilterOn: string[] = ['name', 'ip_address'];

  accountNames: string[] = [];
  filteredAllClouds: CloudNameType[] = [];
  cloud: string;
  playbookType: string;
  parametersList: any;
  targetType: string;
  templateList: any;
  taskName: string;
  templateId: any;
  templateOptions: { [key: string]: TemplateOption[] } = {};
  tempArr = [];

  tags: any[] = [];
  dc: any[] = [];
  allClouds: any[] = [];
  hostfilter: Hosts[] = [];
  ipAddress: string[];
  deviceTypes = deviceTypes;
  cloudWithIMg: any[] = [];
  filteredHosts: Array<any> = [];

  selectedHosts: Hosts[] = [];
  dropdownOpen: boolean = false;
  paramListIsObjFlag: boolean = false;
  repoId: string;
  private dropdownMenu: HTMLElement | null = null;
  categoryId: string;

  cloudAccount: string;
  cloudAccountData: any;
  cloudImage: string;

  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'displayName',
    keyToSelect: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  constructor(private svc: OrchestrationTasksScheduleService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private scheduleSvc: UnityScheduleService,
    private utilService: AppUtilityService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private renderer: Renderer2,
    private element: ElementRef,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.taskId = params.get('taskId');
      this.targetType = params.get('targetType')?.toLowerCase();
      this.categoryId = params.get('categoryId')
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.dropdownOpen) {
      return;
    }
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.dropdown-open');
    const isClickedInsideDropdown = dropdown && dropdown.contains(target);
    if (!isClickedInsideDropdown) {
      this.dropdownOpen = false;
    }
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.buildScheduleForm();
    this.getTaskParamsById();
    this.getCredentials();
    this.getAllCloud();
    // this.getScheduleData();
  }

  ngOnDestroy(): void {
    this.dropdownOpen = false;
    if (this.dropdownMenu) {
      this.renderer.removeChild(document.body, this.dropdownMenu);
      this.dropdownMenu = null;
    }
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.searchValue = event;
    this.filteredHosts = [];
    this.filteredHosts = this.clientSideSearchPipe.transform(this.hosts, event, this.fieldsToFilterOn);
  }

  getTaskParamsById() {
    this.svc.getTaskParamsById(this.taskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.hostOrCloud = data.target_type
      this.activeForm = data.target_type;
      this.manageActiveForm(this.activeForm);
      this.scheduleSvc.addOrEdit(null);
      this.getScheduleData();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Schedule data'));
    });
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'Cloud':
        this.activeForm = formName;
        break;
      case 'Host':
        this.activeForm = formName;
        break;
      case 'scheduleForm':
        if (this.targetType == 'cloud' || this.targetType == 'local') {
          if (!this.cloudForm) {
            this.notification.warning(new Notification('Please fill in the Cloud parameters and move to Schedule'));
            return;
          }
          if (this.cloudForm.valid) {
            this.activeForm = formName;
            this.buildScheduleForm();
          } else {
            this.onSubmitCloudForm();
          }
        } else {
          if (!this.hostForm) {
            this.notification.warning(new Notification('Please fill in the Host parameters and move to Schedule'));
            return;
          }
          if (this.hostForm.valid) {
            this.activeForm = formName;
            this.buildScheduleForm();
          } else {
            this.onSubmitHostForm();
          }
        }
        break;
      default:
        this.activeForm = 'Cloud';
      // this.buildCredentialsForm();
      // if (this.instanceId) {
      //   this.buildFilterForm();
      // }
    }
    this.spinner.stop('main');
  }

  buildCloudForm() {
    this.spinner.start('main');
    this.svc.getTaskParamsById(this.taskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.parametersList = Array.isArray(param.inputs) ? param.inputs : [];
      // this.parametersList = param.inputs;
      this.templateList = param.templates;
      this.paramListIsObjFlag = JSON.stringify(param.inputs) === '{}' ? true : false;
      this.targetType = param.target_type?.toLowerCase();
      this.taskName = param.task_name;
      this.cloud = param.cloud_type;
      this.playbookType = param.playbook_type;
      this.cloudImage = `${environment.assetsUrl + param.cloud_image}`;
      this.getCloudAccount(param.cloud_template, param.cloud_account);
      this.cloudAccount = param.cloud_account;
      this.cloudForm = this.svc.buildCloudForm(param, this.taskId);
      this.cloudFormErrors = this.svc.resetFormErrors();
      this.cloudFormValidationMessages = this.svc.formValidationMessages;
      this.initializeTemplateOptions(this.cloudForm);
      // if (param.playbook_type == 'Ansible Playbook' || param.playbook_type == 'Terraform Script') {
      JSON.stringify(param.inputs) !== '{}' ? (param.inputs as TerraFormParams[]).forEach((p, i) => {
        if (!this.cloudFormErrors.inputs[i]) {
          this.cloudFormErrors.inputs[i] = {};
          this.cloudFormValidationMessages.inputs[i] = {};
        }
        this.cloudFormErrors.inputs[i]['default_value'] = '';
        this.cloudFormValidationMessages.inputs[i]['default_value'] = {
          required: `${p.param_name} is required`,
        };
      }) : '';
      // }
      //  else if (param.playbook_type == 'Bash Script' || param.playbook_type == 'Python Script' || param.playbook_type == 'Powershell Script') {
      //   this.cloudFormErrors.parameters['arguments'] = '';
      //   this.cloudFormValidationMessages.parameters['arguments'] = { 'required': 'Arguments are required' };
      // }
      // if (param.templates && param.templates.length > 0) {
      //   param.templates.forEach((template, index) => {
      //     this.cloudFormErrors.templates = this.cloudFormErrors.templates || {};
      //     this.cloudFormValidationMessages.templates = this.cloudFormValidationMessages.templates || {};
      //     this.cloudFormErrors.templates[template.label] = '';
      //     this.cloudFormValidationMessages.templates[template.label] = {
      //       required: `${template.name} selection is required`
      //     };
      //     if (!template.dependency_name) {
      //       this.svc.getTemplateOption(template.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
      //         this.templateOptions[template.label] = options;
      //       });
      //     }
      //     const templateControl = (this.cloudForm.get('templates') as FormArray).at(index).get('value');
      //     templateControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedValue: string) => {
      //       let row = { dep: template.dependency_name, val: selectedValue };
      //       this.tempArr.push(row);
      //       const dependentTemplate = this.templateList.filter(t => t.dependency_name === template.name);
      //       dependentTemplate.forEach((dependentTemplate, index) => {
      //         const accountId = this.tempArr.find(val => val.dep == '');
      //         if (dependentTemplate) {
      //           this.svc.getTemplateOptionWithDep(dependentTemplate.uuid, selectedValue, accountId.val).pipe(takeUntil(this.ngUnsubscribe)).subscribe((dependentOptions: TemplateOption[]) => {
      //             this.templateOptions[dependentTemplate.label] = dependentOptions;
      //             const templatesArray = this.cloudForm.get('templates') as FormArray;
      //             for (let i = 0; i < templatesArray.length; i++) {
      //               const templateGroup = templatesArray.at(i) as FormGroup;
      //               const templateLabel = templateGroup.get('label')?.value;
      //               if (templateLabel === dependentTemplate.label) {
      //                 (this.cloudForm.get('templates') as FormArray).at(i).enable();
      //               }
      //             }
      //           });
      //         }
      //       });
      //       // }
      //     });
      //   });
      // }
      // this.spinner.stop('main');
      // this.cloudForm.get('cred').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      //   if (val == 'local') {
      //     this.cloudForm.addControl('credentials', new FormControl('', Validators.required));
      //     this.cloudForm.removeControl('username');
      //     this.cloudForm.removeControl('password');
      //   } else {
      //     this.cloudForm.removeControl('credentials');
      //     this.cloudForm.addControl('username', new FormControl('', Validators.required));
      //     this.cloudForm.addControl('password', new FormControl('', Validators.required));
      //   }
      // });
    }, err => {
      this.notification.error(new Notification('Error while fetching task parameters. Please try again!!'));
      this.spinner.stop('main');
    });
  }

  initializeTemplateOptions(form: FormGroup) {
    const inputs = this.parametersList;
    const formArray = form.get('inputs') as FormArray;

    inputs.forEach((input, index) => {
      if (input.param_type !== 'Input Template') return;

      const templateId = input.template;
      const label = input.label;
      const controlGroup = formArray.at(index) as FormGroup;

      if (!input.filters || Object.keys(input.filters).length === 0) {
        // No filters: call simple API
        this.svc.getTemplateOption(templateId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
          this.templateOptions[label] = options;
        });
      } else {
        // Has filters
        const queryParams: any = {};
        const expectedFilterKeys = Object.keys(input.filters);
        controlGroup.get('default_value')?.disable();

        Object.entries(input.filters).forEach(([filterKey, filterTemplateName]) => {
          if (filterTemplateName === 'CLOUD_ACCOUNT' && this.targetType === 'cloud') {
            // Special case for cloud_account
            if (this.cloudAccount) {
              queryParams[filterKey] = this.cloudAccount;
              this.tryFetchOptionsWhenReady(templateId, label, queryParams, index, form, expectedFilterKeys);
            }

            form.get('cloud_account')?.valueChanges.pipe(debounceTime(300), takeUntil(this.ngUnsubscribe)).subscribe(accountId => {
              queryParams[filterKey] = accountId;
              this.tryFetchOptionsWhenReady(templateId, label, queryParams, index, form, expectedFilterKeys);
            });
          } else {
            // Normal dependency from another input
            const matchingInput = inputs.find(p => p.template_name === filterTemplateName || p.param_name === filterTemplateName);
            if (matchingInput) {
              const matchedIndex = inputs.indexOf(matchingInput);
              const matchedControl = formArray.at(matchedIndex)?.get('default_value');

              // Listen to value changes
              matchedControl?.valueChanges.pipe(debounceTime(300), takeUntil(this.ngUnsubscribe)).subscribe(selectedValue => {
                queryParams[filterKey] = selectedValue;
                this.tryFetchOptionsWhenReady(templateId, label, queryParams, index, form, expectedFilterKeys);
              });

              // Check if initial value is already present
              const initialVal = matchedControl?.value;
              if (initialVal) {
                queryParams[filterKey] = initialVal;
                this.tryFetchOptionsWhenReady(templateId, label, queryParams, index, form, expectedFilterKeys);
              }
            }
          }
        });
      }
    });
  }

  private tryFetchOptionsWhenReady(templateId: string, label: string, queryParams: any, index: number, form: FormGroup, expectedFilterKeys: string[]) {
    const allFiltersHaveValues = expectedFilterKeys.every(
      key => queryParams.hasOwnProperty(key) &&
        queryParams[key] !== null &&
        queryParams[key] !== undefined &&
        queryParams[key] !== ''
    );

    if (allFiltersHaveValues) {
      this.svc.getTemplateOptionWithDependent(templateId, queryParams).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
        this.templateOptions[label] = options;

        const formArray = form.get('inputs') as FormArray;
        const controlGroup = formArray.at(index) as FormGroup;
        controlGroup.get('default_value')?.enable();
      });
    }
  }

  getCloudAccount(accountId: string, selectedUuid: string) {
    this.svc.getCloudAccountOption(accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.cloudAccountData = param;
      if (selectedUuid) {
        this.cloudForm.get('cloud_account')?.setValue(selectedUuid);
        // if (matched) {
        //   this.cloudAccount = matched;
        // }
      }
    });
  }

  formatParamName(name: string): string {
    if (!name) return '';
    return name.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  getPlaceHolder(paramKey: string) {
    let paramObj = this.parametersList.find((i: TerraFormParams) => i.param_name == paramKey);
    return paramObj?.placeholder ? paramObj.placeholder : 'Enter Value';
  }

  getTags() {
    this.svc.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(tags => {
      this.tags = tags;
    }, err => {
      this.notification.error(new Notification('Failed to fetch Tags. Please try again later.'));
    });
  }

  getDc() {
    this.svc.getDc().pipe(takeUntil(this.ngUnsubscribe)).subscribe(dc => {
      this.dc = dc;
    }, err => {
      this.notification.error(new Notification('Failed to fetch DataCenters. Please try again later.'));
    });
  }

  getCloudWIthImg() {
    this.svc.getCloudWithImg().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cloudWithIMg = res.cloud;
    }, err => {
      this.notification.error(new Notification('Failed to fetch Cloud. Please try again later.'));
    });
  }

  buildHostForm() {
    this.spinner.start('main');
    this.svc.getTaskParamsById(this.taskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.parametersList = Array.isArray(param.inputs) ? param.inputs : [];
      this.paramListIsObjFlag = JSON.stringify(param.inputs) === '{}' ? true : false;
      this.targetType = param.target_type.toLowerCase();
      this.templateList = param.templates;
      this.taskName = param.task_name;
      this.cloud = param.cloud_type;
      this.playbookType = param.playbook_type;
      this.hostForm = this.svc.buildHostForm(param, this.taskId);
      this.hostFormErrors = this.svc.resetHostFormErrors();
      this.hostFormValidationMessages = this.svc.hostFormValidationMessages;
      this.initializeTemplateOptions(this.hostForm);
      // if (param.playbook_type == 'Ansible Playbook' || param.playbook_type == 'Terraform Script') {
      JSON.stringify(param.inputs) !== '{}' ? (param.inputs as TerraFormParams[]).forEach((p, i) => {
        if (!this.hostFormErrors.inputs[i]) {
          this.hostFormErrors.inputs[i] = {};
          this.hostFormValidationMessages.inputs[i] = {};
        }
        this.hostFormErrors.inputs[i]['default_value'] = '';
        this.hostFormValidationMessages.inputs[i]['default_value'] = {
          required: `${p.param_name} is required`,
        };
      }) : '';
      // if (param.templates && param.templates.length > 0) {
      //   param.templates.forEach((template, index) => {

      //     this.hostFormErrors.templates = this.hostFormErrors.templates || {};
      //     this.hostFormValidationMessages.templates = this.hostFormValidationMessages.templates || {};
      //     this.hostFormErrors.templates[template.label] = '';
      //     this.hostFormValidationMessages.templates[template.label] = {
      //       required: `${template.name} selection is required`
      //     };
      //     if (!template.dependency_name) {
      //       this.svc.getTemplateOption(template.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
      //         this.templateOptions[template.label] = options;
      //       });
      //     }
      //     const templateControl = (this.hostForm.get('templates') as FormArray).at(index).get('value');
      //     templateControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedValue: string) => {
      //       let row = { dep: template.dependency_name, val: selectedValue };
      //       this.tempArr.push(row);
      //       const dependentTemplate = this.templateList.filter(t => t.dependency_name === template.name);
      //       dependentTemplate.forEach((dependentTemplate, index) => {
      //         const accountId = this.tempArr.find(val => val.dep == '');
      //         if (dependentTemplate) {
      //           this.svc.getTemplateOptionWithDep(dependentTemplate.uuid, selectedValue, accountId.val).pipe(takeUntil(this.ngUnsubscribe)).subscribe((dependentOptions: TemplateOption[]) => {
      //             this.templateOptions[dependentTemplate.label] = dependentOptions;
      //             const templatesArray = this.hostForm.get('templates') as FormArray;
      //             for (let i = 0; i < templatesArray.length; i++) {
      //               const templateGroup = templatesArray.at(i) as FormGroup;
      //               const templateLabel = templateGroup.get('label')?.value;
      //               if (templateLabel === dependentTemplate.label) {
      //                 (this.hostForm.get('templates') as FormArray).at(i).enable();
      //               }
      //             }
      //           });
      //         }
      //       });
      //     });
      //   });
      // }
      // this.hostForm.get('ip').valueChanges.pipe(debounceTime(2000), takeUntil(this.ngUnsubscribe)).subscribe((ip: string) => {
      //   if (ip && ip.trim().length > 0) {
      //     this.svc.getIpAddress(ip).subscribe(response => {
      //       if (response.length > 0) {
      //         this.hostFormErrors.ip = '';
      //         this.ipAddress = response;
      //       } else {
      //         this.ipAddress = [];
      //         this.hostFormErrors.ip = 'No host found for the provided IP address';
      //       }
      //     });
      //   } else {
      //     this.hostFormErrors.ip = '';
      //     this.ipAddress = [];
      //   }
      // });
      this.hostForm.get('cred').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val == 'local') {
          this.hostForm.addControl('credentials', new FormControl('', Validators.required));
          this.hostForm.removeControl('username');
          this.hostForm.removeControl('password');
        } else {
          this.hostForm.removeControl('credentials');
          this.hostForm.addControl('username', new FormControl('', Validators.required));
          this.hostForm.addControl('password', new FormControl('', Validators.required));
        }
      });

      this.hostForm.get('host_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.handleHostTypeChange(val);
      });
      this.spinner.stop('main');
    });
  }

  handleHostTypeChange(val: string) {
    // this.resetHosts();
    switch (val) {
      case 'datacenter':
        this.getDc();
        this.hostForm.addControl('datacenter', new FormControl('', Validators.required));
        this.hostForm.addControl('device_category', new FormControl('', Validators.required));
        this.hostForm.removeControl('cloud');
        this.hostForm.removeControl('account_name');
        this.hostForm.removeControl('tag');
        this.hostForm.removeControl('device_type');
        this.hostForm.get('datacenter').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dc => {
          const deviceCategory = this.hostForm.get('device_category').value;
          // this.resetHosts();
          if (dc && deviceCategory) {
            this.loadHosts(dc, deviceCategory);
          }
        });
        this.hostForm.get('device_category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceCategory => {
          const dc = this.hostForm.get('datacenter').value;
          // this.resetHosts();
          if (dc && deviceCategory) {
            this.loadHosts(dc, deviceCategory);
          }
        });
        break;

      case 'cloud':
        this.getCloudWIthImg();
        this.hostForm.addControl('cloud', new FormControl('', Validators.required));
        this.hostForm.addControl('account_name', new FormControl('', Validators.required));
        this.hostForm.removeControl('datacenter');
        this.hostForm.removeControl('device_category');
        this.hostForm.removeControl('tag');
        this.hostForm.removeControl('device_type');
        this.hostForm.get('cloud').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cloudType => {
          // this.resetHosts();
          this.updateAccountNames(cloudType);
        });
        this.hostForm.get('account_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(pc => {
          const cloudType = this.hostForm.get('cloud').value.toLowerCase();
          // this.resetHosts();
          if (pc) {
            const publicCloudTypes = ['azure', 'aws', 'gcp', 'oci'];
            if (publicCloudTypes.includes(cloudType)) {
              this.loadHosts(null, null, null, cloudType, pc);
            } else {
              this.loadHosts(null, null, null, null, null, pc);
            }
          }
        });
        break;

      case 'tag':
        this.getTags();
        this.hostForm.addControl('tag', new FormControl('', Validators.required));
        this.hostForm.removeControl('account_name');
        this.hostForm.removeControl('datacenter');
        this.hostForm.removeControl('device_category');
        this.hostForm.removeControl('cloud');
        this.hostForm.removeControl('device_type');
        this.hostForm.get('tag').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(tag => {
          // this.resetHosts();
          if (tag) {
            this.loadHosts(null, null, tag);
          }
        });
        break;

      case 'device_type':
        this.hostForm.addControl('device_type', new FormControl([], Validators.required));
        this.hostForm.removeControl('account_name');
        this.hostForm.removeControl('datacenter');
        this.hostForm.removeControl('device_category');
        this.hostForm.removeControl('cloud');
        this.hostForm.removeControl('tag');
        this.hostForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceType => {
          // this.resetHosts();
          if (deviceType) {
            this.loadHosts(null, null, null, deviceType);
          }
        });
        break;

      default:
        break;
    }
  }

  // resetHosts() {
  //   this.selectedHosts = [];
  //   this.hostForm.get('host').reset();
  // }

  loadHosts(dc?: string, subType?: string, tag?: string, deviceType?: string, publicCloud?: string, privateCloud?: string) {
    this.selectedHosts = [];
    // this.hostForm.get('host').reset();
    this.hosts = [];
    this.filteredHosts = [];
    // this.svc.getHost(tag, deviceType, dc, subType, publicCloud, privateCloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
    //   this.hosts = response;
    //   this.filteredHosts = response;
    // }, (err: HttpErrorResponse) => {
    //   this.notification.error(new Notification('Failed to load hosts. Please try again later!!'));
    // });
  }

  searchTargets = (query: string): Observable<any[]> => {
    const hostType = this.hostForm.get('host_type')?.value;

    let dc = null;
    let deviceCategory = null;
    let tag = null;
    let deviceType = null;
    let publicCloud = null;
    let privateCloud = null;

    switch (hostType) {
      case 'datacenter':
        dc = this.hostForm.get('datacenter')?.value;
        deviceCategory = this.hostForm.get('device_category')?.value;
        break;

      case 'cloud':
        const cloudType = this.hostForm.get('cloud')?.value?.toLowerCase();
        const account = this.hostForm.get('account_name')?.value;
        if (['aws', 'azure', 'gcp', 'oci'].includes(cloudType)) {
          publicCloud = account;
        } else {
          privateCloud = account;
        }
        break;

      case 'tag':
        tag = this.hostForm.get('tag')?.value;
        break;

      case 'device_type':
        deviceType = this.hostForm.get('device_type')?.value;
        break;
    }

    return this.svc.getHost(query, tag, deviceType, dc, deviceCategory, publicCloud, privateCloud).pipe(catchError(err => {
      this.notification.error(new Notification('Failed to fetch targets. Please try again later.'));
      return of([]);
    })
    );
  };


  updateAccountNames(cloudType: string) {
    this.svc.getAllCloud(cloudType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(accounts => {
      this.cloudAccountNames = accounts;
    }, err => {
      this.notification.error(new Notification('Failed to fetch Cloud. Please try again later.'));
    });
  }

  getAllCloud() {
    this.svc.getAllCloud().pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.allClouds = param;
      this.filteredAllClouds = param.filter(cloud => cloud.cloud_type?.toLowerCase() == this.cloud?.toLowerCase());
      this.filteredAllClouds.forEach(d => {
        this.accountNames.push(d.account_name);
      });
    });
  }

  getCredentials() {
    this.svc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.credentialList = param;
    }, err => {
      this.notification.error(new Notification('Error while fetching credentials. Please try again!!'));
    });
  }

  onSubmitCloudForm() {
    if (this.cloudForm.invalid) {
      this.cloudFormErrors = this.utilService.validateForm(this.cloudForm, this.cloudFormValidationMessages, this.cloudFormErrors);
      this.cloudForm.valueChanges
        .subscribe((data: any) => { this.cloudFormErrors = this.utilService.validateForm(this.cloudForm, this.cloudFormValidationMessages, this.cloudFormErrors); });
      return;
    } else {
      this.manageActiveForm('scheduleForm');
    }
  }


  onSubmitHostForm() {
    if (this.hostForm.invalid) {
      this.hostFormErrors = this.utilService.validateForm(this.hostForm, this.hostFormValidationMessages, this.hostFormErrors);
      this.hostForm.valueChanges
        .subscribe((data: any) => {
          this.hostFormErrors = this.utilService.validateForm(this.hostForm, this.hostFormValidationMessages, this.hostFormErrors);
        });
      return;
    } else {
      this.manageActiveForm('scheduleForm');
    }
  }

  onTemplateHostChange(event: Event, templateKey: string): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedLabel = (event.target as HTMLSelectElement).options[(event.target as HTMLSelectElement).selectedIndex].text;
    const template = this.templateList.find(t => t.label === templateKey);

    if (template) {
      const inputsArray = this.hostForm.get('inputs') as FormArray;
      inputsArray.controls.forEach((inputControl: FormGroup) => {
        if (inputControl.get('template')?.value === template.uuid) {
          inputControl.get('template_name')?.setValue(selectedLabel);
          inputControl.get('default_value')?.setValue(selectedValue);
        }
      });
    }
  }

  onTemplateCloudChange(event: Event, templateKey: string): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedLabel = (event.target as HTMLSelectElement).options[(event.target as HTMLSelectElement).selectedIndex].text;
    const template = this.templateList.find(t => t.label === templateKey);
    if (template) {
      const inputsArray = this.cloudForm.get('inputs') as FormArray;
      inputsArray.controls.forEach((inputControl: FormGroup) => {
        if (inputControl.get('template')?.value === template.uuid) {
          inputControl.get('template_name')?.setValue(selectedLabel);
          inputControl.get('default_value')?.setValue(selectedValue);
        }
      });
    }
  }

  getScheduleData() {
    if (this.targetType == 'cloud' || this.targetType == 'local') {
      this.buildCloudForm();
    } else {
      this.buildHostForm();
    }
    setTimeout(() => {
      this.spinner.start('main');
      this.svc.getScheduleData(this.taskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.scheduleData = data;
        this.scheduleSvc.addOrEdit(null);
        if (this.scheduleData?.schedule_meta) {
          if (this.targetType == 'cloud' || this.targetType == 'local') {
            this.cloudForm.get('cloud_account').setValue(data?.cloud_account);
            // if (data.credentials) {
            //   this.cloudForm.get('cred').setValue('local');
            //   this.cloudForm.get('credentials').setValue(data.credentials);
            // } else {
            //   this.cloudForm.get('cred').setValue('my_cred');
            //   this.cloudForm.get('username').setValue(data.schedule_meta.username);
            //   this.cloudForm.get('password').setValue(data.schedule_meta.password);
            // }
            // if (data.schedule_meta.templates) {
            //   data.schedule_meta.templates.forEach(template => {
            //     const templateArray = (this.cloudForm.get('templates') as FormArray).controls;
            //     const matchedControl = templateArray.find(group =>
            //       (group.get('label') as FormControl).value === template.label
            //     );
            //     if (matchedControl) {
            //       (matchedControl.get('value') as FormControl).setValue(template.value);
            //     }
            //   });
            // }
            if (data.inputs) {
              this.cloudForm.removeControl('inputs');
              this.cloudForm.addControl('inputs', new FormArray([]));
              JSON.stringify(data.inputs) !== '{}' ? (data.inputs as TerraFormParams[]).forEach(p => {
                if (p.param_type === 'Input Template') {
                  const inputGroup = this.builder.group({
                    template_name: new FormControl({ value: p.template_name, disabled: true }),
                    attribute: new FormControl({ value: p.attribute, disabled: true }),
                    param_type: new FormControl({ value: p.param_type, disabled: false }),
                    default_value: new FormControl({ value: p.default_value, disabled: false }),
                    template: new FormControl({ value: p.template, disabled: false }),
                    param_name: new FormControl({ value: p.param_name, disabled: false }),
                    label: new FormControl(p.label),
                    filters: new FormControl(p.filters)
                  });
                  (this.cloudForm.get('inputs') as FormArray).push(inputGroup);
                } else {
                  const defaultValueGroup = this.builder.group({
                    default_value: new FormControl(p.default_value, [Validators.required]),
                    param_name: new FormControl(p.param_name),
                    param_type: new FormControl(p.param_type),
                  });
                  (this.cloudForm.get('inputs') as FormArray).push(defaultValueGroup);
                }
              }) : '';
            }
            this.initializeTemplateOptions(this.cloudForm);
          } else {
            // this.hostForm.get('ip')?.setValue(data.schedule_meta.ip);
            this.hostForm?.get('targets')?.setValue(data.targets);
            // this.hostForm.get('host_type')?.setValue(data.schedule_meta.host_type);
            // switch (data.schedule_meta.host_type) {
            //   case 'datacenter': {
            //     this.hostForm.get('datacenter').setValue(data.schedule_meta.datacenter);
            //     this.hostForm.get('device_category').setValue(data.schedule_meta.device_category);
            //     break;
            //   }
            //   case 'cloud': {
            //     this.hostForm.get('cloud').setValue(data.schedule_meta.cloud);
            //     this.hostForm.get('account_name').setValue(data.schedule_meta.account_name);
            //     break;
            //   }
            //   case 'tag': {
            //     this.hostForm.get('tag').setValue(data.schedule_meta.tag);
            //     break;
            //   }
            //   case 'device_type': {
            //     this.hostForm.get('device_type').setValue(data.schedule_meta.device_type);
            //     break;
            //   }
            //   default: {
            //     //statements; 
            //     break;
            //   }
            // }
            // if (data.schedule_meta.templates) {
            //   data.schedule_meta.templates.forEach(template => {
            //     const templateArray = (this.hostForm.get('templates') as FormArray).controls;
            //     const matchedControl = templateArray.find(group =>
            //       (group.get('label') as FormControl).value === template.label
            //     );
            //     if (matchedControl) {
            //       (matchedControl.get('value') as FormControl).setValue(template.value);
            //     }
            //   });
            // }
            if (data.inputs) {
              this.hostForm.removeControl('inputs');
              this.hostForm.addControl('inputs', new FormArray([]));
              JSON.stringify(data.inputs) !== '{}' ? (data.inputs as TerraFormParams[]).forEach(p => {
                if (p.param_type === 'Input Template') {
                  const inputGroup = this.builder.group({
                    template_name: new FormControl({ value: p.template_name, disabled: true }),
                    attribute: new FormControl({ value: p.attribute, disabled: true }),
                    param_type: new FormControl({ value: p.param_type, disabled: false }),
                    default_value: new FormControl({ value: p.default_value, disabled: false }),
                    template: new FormControl({ value: p.template, disabled: false }),
                    param_name: new FormControl({ value: p.param_name, disabled: false }),
                    label: new FormControl(p.label),
                    filters: new FormControl(p.filters)
                  });
                  (this.hostForm.get('inputs') as FormArray).push(inputGroup);
                } else {
                  const defaultValueGroup = this.builder.group({
                    default_value: new FormControl(p.default_value, [Validators.required]),
                    param_name: new FormControl(p.param_name),
                    param_type: new FormControl(p.param_type),
                  });
                  (this.hostForm.get('inputs') as FormArray).push(defaultValueGroup);
                }
              }) : '';
            }
            if (data.cred == 'local') {
              this.hostForm.get('cred').setValue('local');
              this.hostForm.get('credentials').setValue(data.credentials);
            } else {
              this.hostForm.get('cred').setValue('my_cred');
              this.hostForm.get('username').setValue(data.username);
              this.hostForm.get('password').setValue(data.password);
            }
            // this.hostForm.get('host').setValue(data.host);
            // for (let i = 0; i < data.host.length; i++) {
            //   this.toggleSelection(data.host[i]);
            // }
            this.initializeTemplateOptions(this.hostForm);
          }
        }
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to get Schedule data'));
      });
    }, 100)
  }

  buildScheduleForm() {
    if (this.scheduleData?.schedule_meta) {
      this.scheduleSvc.addOrEdit(this.scheduleData.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  onSubmitScheduleForm() {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.saveInstance();
    }
  }

  saveInstance() {
    this.spinner.start('main');
    if (this.targetType == 'cloud' || this.targetType == 'local') {
      const rawValues = this.cloudForm.getRawValue();
      const inputsArray = (Array.isArray(rawValues.inputs) ? rawValues.inputs : Object.values(rawValues.inputs))
        .map((input: any) => {
          // const paramName = input.param_name || input.label;
          // const paramType = this.parametersList.find(p => p.param_name === paramName)?.param_type;
          return {
            param_name: input.param_name || '',
            param_type: input.param_type || '',
            default_value: input.default_value || '',
            attribute: input.attribute || '',
            template: input.template || '',
            template_name: input.template_name || '',
            filters: input.filters || {},
            label: input.label
          };
        });
      const cloudFormValue = this.cloudForm.getRawValue();
      cloudFormValue.inputs = inputsArray;

      let obj = Object.assign({}, cloudFormValue, this.scheduleSvc.getFormValue());
      this.svc.saveInstance(obj, this.taskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Schedule updated successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      })
    } else {
      const rawValues = this.hostForm.getRawValue();
      const inputsArray = (Array.isArray(rawValues.inputs) ? rawValues.inputs : Object.values(rawValues.inputs))
        .map((input: any) => {
          // const input = rawValues.inputs[key];
          // const paramType = this.parametersList.find(p => p.param_name === key)?.param_type;
          return {
            param_name: input.param_name ? input.param_name : '',
            param_type: input.param_type ? input.param_type : '',
            default_value: input.default_value ? input.default_value : '',
            attribute: input.attribute ? input.attribute : '',
            template: input.template ? input.template : '',
            template_name: input.template_name ? input.template_name : '',
            filters: input.filters ? input.filters : {},
            label: input.label
          };
        });
      const hostFormValue = this.hostForm.getRawValue();
      hostFormValue.inputs = inputsArray;

      let obj = Object.assign({}, hostFormValue, this.scheduleSvc.getFormValue());
      this.svc.saveInstance(obj, this.taskId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('Schedule updated successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      })
    }

  }

  handleError(err: any) {
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        this.scheduleSvc.handleError(err);
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  toggleDropdown(event: Event) {
    this.dropdownOpen = !this.dropdownOpen;
    event.stopPropagation();
    this.appendToBody();
  }

  private appendToBody() {
    setTimeout(() => {
      this.dropdownMenu = this.element.nativeElement.querySelector('.dropdown-menu');
      if (this.dropdownMenu) {
        const parent = this.renderer.parentNode(this.dropdownMenu);
        if (parent) {
          this.renderer.removeChild(parent, this.dropdownMenu);
          this.renderer.appendChild(document.body, this.dropdownMenu);
          const eTarget = parent as HTMLElement;
          const eOffset = eTarget.getBoundingClientRect();
          const dropdownTop = eOffset.bottom + window.scrollY;
          this.renderer.setStyle(this.dropdownMenu, 'width', eOffset.width + 'px');
          this.renderer.setStyle(this.dropdownMenu, 'display', 'block');
          this.renderer.setStyle(this.dropdownMenu, 'top', dropdownTop + 'px');
          this.renderer.setStyle(this.dropdownMenu, 'left', eOffset.left + window.scrollX + 'px');
          const footer = document.getElementsByTagName('footer')[0];
          const dropdownBottom = this.dropdownMenu.getBoundingClientRect().bottom;
          if (footer && footer.getBoundingClientRect().top < dropdownBottom) {
            const appRoot = document.getElementsByTagName('app-root')[0];
            const buffer = dropdownBottom - footer.getBoundingClientRect().top + 10 + document.body.getBoundingClientRect().height;
            this.renderer.setStyle(appRoot, 'min-height', `${buffer}px`);
          }
        }
      }
    }, 50);
  }

  isSelected(host: Hosts): boolean {
    return this.selectedHosts.some(
      selectedHost => selectedHost.name == host.name && selectedHost.ip_address == host.ip_address
    );
  }

  toggleSelection(host: Hosts, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (!host) {
      return;
    }
    const hostIndex = this.selectedHosts.findIndex(
      selectedHost => selectedHost.name == host.name && selectedHost.ip_address == host.ip_address
    );
    if (hostIndex != -1) {
      this.selectedHosts.splice(hostIndex, 1);
    } else {
      this.selectedHosts.push(host);
    }
    this.hostForm.get('host').setValue(this.selectedHosts.length > 0 ? this.selectedHosts : null);
  }

  getSelectedHostsText(): string {
    if (this.selectedHosts.length == 0) {
      return 'Select Hosts';
    } else if (this.selectedHosts.length == 1) {
      return this.selectedHosts[0].name;
    } else {
      return `${this.selectedHosts.length} selected`;
    }
  }

  goBack() {
    if (this.categoryId) {
      this.router.navigate(['../../../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    }
  }

}
