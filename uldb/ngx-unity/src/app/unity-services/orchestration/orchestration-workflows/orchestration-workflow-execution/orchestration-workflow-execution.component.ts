import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { Account, DropdownWithImage, Tag, TemplateOption, WorkflowDetails, WorkflowTask } from '../orchestration-workflow-execution/orchestration-workflow-execution.type';
import { HostType, Hosts, OrchestrationWorkflowExecutionService, TerraFormParams, deviceTypes } from './orchestration-workflow-execution.service';
import { GlobalAdvancedSearchResult } from 'src/app/global-search/global-search.type';
import { isString } from 'lodash';
import { environment } from 'src/environments/environment';
import { CloudNameType } from '../../orchestration-tasks/orchestration-tasks-schedule/orchestration-tasks-type';
import { InputTemplateModel } from '../../orchestration-input-template/orchestration-input-template.service';

@Component({
  selector: 'orchestration-workflow-execution',
  templateUrl: './orchestration-workflow-execution.component.html',
  styleUrls: ['./orchestration-workflow-execution.component.scss'],
  providers: [OrchestrationWorkflowExecutionService]
})
export class OrchestrationWorkflowExecutionComponent implements OnInit, OnDestroy {

  //   private ngUnsubscribe = new Subject();

  //   workflowId: string = '';
  //   nonFieldErr: string = '';
  //   workflow: WorkflowDetails = null;
  //   workflowDetailsData: WorkflowDetailsViewData[] = [];
  //   targetType: string = '';
  //   cloudType: string = '';
  //   accountList: Array<Account> = [];
  //   cloudList: Array<DropdownWithImage> = [];
  //   credentialList: DeviceDiscoveryCredentials[] = [];
  //   ipAddress: string[];
  //   selectedHosts: Hosts[] = [];
  //   datacenterList: Array<DatacenterFast> = [];
  //   hosts: Array<GlobalAdvancedSearchResult> = [];
  //   filteredHosts: Array<GlobalAdvancedSearchResult> = [];
  //   tags: Array<Tag> = [];
  //   deviceTypes = deviceTypes;
  //   dropdownOpen: boolean = false;
  //   private dropdownMenu: HTMLElement | null = null;
  //   searchValue: string = '';
  //   fieldsToFilterOn: string[] = ['name', 'ip_address'];

  //   form: FormGroup;
  //   formErrors: any;
  //   validationMessages: any;

  //   cloudForm: FormGroup;
  //   cloudFormErrors: any;
  //   cloudFormValidationMessages: any;

  //   hostForm: FormGroup;
  //   hostFormErrors: any;
  //   hostFormValidationMessages: any;

  //   localForm: FormGroup;
  //   localFormErrors: any;
  //   localFormValidationMessages: any;

  //   templateOptions: { [key: string]: TemplateOption[] } = {};
  //   tempArr = [];
  //   templateList: any;
  //   parametersList: any;
  //   WorkflowName: string;
  //   inputType: WorkflowTask;

  //   deviceTypeSettings: IMultiSelectSettings = {
  //     isSimpleArray: false,
  //     lableToDisplay: 'displayName',
  //     keyToSelect: 'name',
  //     enableSearch: true,
  //     checkedStyle: 'fontawesome',
  //     buttonClasses: 'btn btn-default btn-block btn-sm',
  //     dynamicTitleMaxItems: 1,
  //     displayAllSelectedText: true,
  //     showCheckAll: true,
  //     showUncheckAll: true,
  //     appendToBody: true
  //   };

  //   constructor(private executionService: OrchestrationWorkflowExecutionService,
  //     private router: Router,
  //     private route: ActivatedRoute,
  //     private notification: AppNotificationService,
  //     private utilService: AppUtilityService,
  //     private spinner: AppSpinnerService,
  //     private element: ElementRef,
  //     private clientSideSearchPipe: ClientSideSearchPipe,
  //     private renderer: Renderer2) {
  //     this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => this.workflowId = params.get('workflowId'));
  //   }

  //   @HostListener('document:click', ['$event'])
  //   onDocumentClick(event: MouseEvent) {
  //     if (!this.dropdownOpen) {
  //       return;
  //     }
  //     const target = event.target as HTMLElement;
  //     const dropdown = document.querySelector('.dropdown-open');
  //     const isClickedInsideDropdown = dropdown && dropdown.contains(target);
  //     if (!isClickedInsideDropdown) {
  //       this.dropdownOpen = false;
  //     }
  //   }

  //   ngOnInit(): void {
  //     this.getWorkfloDetails();
  //     this.getCredentials();
  //   }

  //   ngOnDestroy(): void {
  //     this.dropdownOpen = false;
  //     if (this.dropdownMenu) {
  //       this.renderer.removeChild(document.body, this.dropdownMenu);
  //       this.dropdownMenu = null;
  //     }
  //     this.spinner.stop('main');
  //     this.ngUnsubscribe.next();
  //     this.ngUnsubscribe.complete();
  //   }

  //   onSearched(event: string) {
  //     this.searchValue = event;
  //     this.filteredHosts = [];
  //     this.filteredHosts = this.clientSideSearchPipe.transform(this.hosts, event, this.fieldsToFilterOn);
  //   }

  //   getWorkfloDetails() {
  //     this.spinner.start('main');
  //     this.workflow = null;
  //     this.executionService.getWorkflowDetails(this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //       this.workflow = res;
  //       this.parametersList = res.tasks;
  //       this.workflowDetailsData = this.executionService.converToViewData(res);
  //       if (this.workflow.target_type && this.workflow.target_type == 'Cloud') {
  //         this.getAccounts(this.workflow.cloud_type);
  //         this.buildCloudForm();
  //         this.spinner.stop('main');
  //       } else if (this.workflow.target_type && this.workflow.target_type == 'Local') {
  //         this.buildLocalForm();
  //         this.spinner.stop('main');
  //       } else {
  //         this.getDatacenters();
  //         this.getClouds();
  //         this.getTags();
  //         this.buildHostForm();
  //         this.spinner.stop('main');
  //       }
  //     }, (err: HttpErrorResponse) => {
  //       this.notification.error(new Notification('Failed to get workflow details. Please try again!!'));
  //       this.spinner.stop('main');
  //     });
  //   }

  //   getAccounts(cloudType: string) {
  //     this.accountList = [];
  //     this.executionService.getCloudList(cloudType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //       this.accountList = res;
  //     }, (err: HttpErrorResponse) => {
  //       this.notification.error(new Notification('Failed to get clouds.'));
  //     });
  //   }

  //   getCredentials() {
  //     this.credentialList = [];
  //     this.executionService.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //       this.credentialList = res;
  //     }, (err: HttpErrorResponse) => {
  //       this.notification.error(new Notification('Error while fetching credentials. Please try again!!'));
  //     });
  //   }

  //   buildCloudForm() {
  //     this.cloudForm = this.executionService.buildCloudForm(this.workflow);
  //     this.cloudFormErrors = this.executionService.resetCloudFormErrors();
  //     this.cloudFormValidationMessages = this.executionService.cloudFormValidationMessages;
  //     this.templateList = this.workflow.templates;
  //     this.WorkflowName = this.workflow.workflow_name;
  //     if (this.workflow.templates && this.workflow.templates.length > 0) {
  //       this.workflow.templates.forEach((template, index) => {
  //         this.cloudFormErrors.templates = this.cloudFormErrors.templates || {};
  //         this.cloudFormValidationMessages.templates = this.cloudFormValidationMessages.templates || {};
  //         this.cloudFormErrors.templates[template.label] = '';
  //         this.cloudFormValidationMessages.templates[template.label] = {};
  //         this.cloudFormValidationMessages.templates[template.label]['required'] = `${template.name} selection is required`;
  //         if (!template.dependency_name) {
  //           this.executionService.getTemplateOption(template.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
  //             this.templateOptions[template.label] = options;
  //           });
  //         }
  //         const templateControl = (this.cloudForm.get('templates') as FormArray).at(index).get('value');
  //         templateControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedValue: string) => {
  //           let row = { dep: template.dependency_name, val: selectedValue };
  //           this.tempArr.push(row);
  //           const dependentTemplate = this.templateList.filter(t => t.dependency_name === template.name);
  //           dependentTemplate.forEach((dependentTemplate, index) => {
  //             const accountId = this.tempArr.find(val => val.dep == '');
  //             if (dependentTemplate) {
  //               this.executionService.getTemplateOptionWithDep(dependentTemplate.uuid, selectedValue, accountId.val).pipe(takeUntil(this.ngUnsubscribe)).subscribe((dependentOptions: TemplateOption[]) => {
  //                 this.templateOptions[dependentTemplate.label] = dependentOptions;
  //                 const templatesArray = this.cloudForm.get('templates') as FormArray;
  //                 for (let i = 0; i < templatesArray.length; i++) {
  //                   const templateGroup = templatesArray.at(i) as FormGroup;
  //                   const templateLabel = templateGroup.get('label')?.value;
  //                   if (templateLabel === dependentTemplate.label) {
  //                     (this.cloudForm.get('templates') as FormArray).at(i).enable();
  //                   }
  //                 }
  //               });
  //             }
  //           });
  //         });
  //       });
  //     }
  //     this.cloudForm.get('cloud_cred').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
  //       if (val == 'local') {
  //         this.cloudForm.addControl('cloud_credentials', new FormControl('', Validators.required));
  //         this.cloudForm.removeControl('cloud_username');
  //         this.cloudForm.removeControl('cloud_password');
  //       } else {
  //         this.cloudForm.removeControl('cloud_credentials');
  //         this.cloudForm.addControl('cloud_username', new FormControl('', Validators.required));
  //         this.cloudForm.addControl('cloud_password', new FormControl('', Validators.required));
  //       }
  //     });
  //     this.cloudForm.get('cred').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
  //       if (val == 'local') {
  //         this.cloudForm.addControl('credentials', new FormControl('', Validators.required));
  //         this.cloudForm.removeControl('username');
  //         this.cloudForm.removeControl('password');
  //       } else {
  //         this.cloudForm.removeControl('credentials');
  //         this.cloudForm.addControl('username', new FormControl('', Validators.required));
  //         this.cloudForm.addControl('password', new FormControl('', Validators.required));
  //       }
  //     });
  //   }

  //   buildLocalForm() {
  //     this.localForm = this.executionService.buildLocalForm(this.workflow);
  //     this.localFormErrors = this.executionService.resetLocalFormErrors();
  //     this.localFormValidationMessages = this.executionService.localFormValidationMessages;
  //     this.templateList = this.workflow.templates;
  //     this.WorkflowName = this.workflow.workflow_name;
  //     if (this.workflow.templates && this.workflow.templates.length > 0) {
  //       this.workflow.templates.forEach((template, index) => {
  //         this.localFormErrors.templates = this.localFormErrors.templates || {};
  //         this.localFormValidationMessages.templates = this.localFormValidationMessages.templates || {};
  //         this.localFormErrors.templates[template.label] = '';
  //         this.localFormValidationMessages.templates[template.label] = {};
  //         this.localFormValidationMessages.templates[template.label]['required'] = `${template.name} selection is required`;
  //         if (!template.dependency_name) {
  //           this.executionService.getTemplateOption(template.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
  //             this.templateOptions[template.label] = options;
  //           });
  //         }
  //         const templateControl = (this.localForm.get('templates') as FormArray).at(index).get('value');
  //         templateControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedValue: string) => {
  //           let row = { dep: template.dependency_name, val: selectedValue };
  //           this.tempArr.push(row);
  //           const dependentTemplate = this.templateList.filter(t => t.dependency_name === template.name);
  //           dependentTemplate.forEach((dependentTemplate, index) => {
  //             const accountId = this.tempArr.find(val => val.dep == '');
  //             if (dependentTemplate) {
  //               this.executionService.getTemplateOptionWithDep(dependentTemplate.uuid, selectedValue, accountId.val).pipe(takeUntil(this.ngUnsubscribe)).subscribe((dependentOptions: TemplateOption[]) => {
  //                 this.templateOptions[dependentTemplate.label] = dependentOptions;
  //                 const templatesArray = this.localForm.get('templates') as FormArray;
  //                 for (let i = 0; i < templatesArray.length; i++) {
  //                   const templateGroup = templatesArray.at(i) as FormGroup;
  //                   const templateLabel = templateGroup.get('label')?.value;
  //                   if (templateLabel === dependentTemplate.label) {
  //                     (this.localForm.get('templates') as FormArray).at(i).enable();
  //                   }
  //                 }
  //               });
  //             }
  //           });
  //         });
  //       });
  //     }
  //   }

  //   getDatacenters() {
  //     this.datacenterList = [];
  //     this.executionService.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //       this.datacenterList = res;
  //     }, (err: HttpErrorResponse) => {
  //       this.notification.error(new Notification('Failed to get Datacenters. Please try again!!'));
  //     });
  //   }

  //   getClouds() {
  //     this.cloudList = [];
  //     this.executionService.getClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //       this.cloudList = [...res.public_cloud, ...res.private_cloud];
  //     }, (err: HttpErrorResponse) => {
  //       this.notification.error(new Notification('Failed to get clouds. Please try again later!!'));
  //     });
  //   }

  //   getTags() {
  //     this.tags = [];
  //     this.executionService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //       this.tags = res;
  //     }, (err: HttpErrorResponse) => {
  //       this.notification.error(new Notification('Failed to get tags. Please try again later!!'));
  //     });
  //   }

  //   buildHostForm() {
  //     this.hostForm = this.executionService.buildHostForm(this.workflow);
  //     this.hostFormErrors = this.executionService.resetHostFormErrors();
  //     this.hostFormValidationMessages = this.executionService.hostFormValidationMessages;
  //     this.templateList = this.workflow.templates;
  //     this.WorkflowName = this.workflow.workflow_name;
  //     if (this.workflow.templates && this.workflow.templates.length > 0) {
  //       this.workflow.templates.forEach((template, index) => {
  //         this.hostFormErrors.templates = this.hostFormErrors.templates || {};
  //         this.hostFormValidationMessages.templates = this.hostFormValidationMessages.templates || {};
  //         this.hostFormErrors.templates[template.label] = '';
  //         this.hostFormValidationMessages.templates[template.label] = {};
  //         this.hostFormValidationMessages.templates[template.label]['required'] = `${template.name} selection is required`;
  //         if (!template.dependency_name) {
  //           this.executionService.getTemplateOption(template.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
  //             this.templateOptions[template.label] = options;
  //           });
  //         }
  //         const templateControl = (this.hostForm.get('templates') as FormArray).at(index).get('value');
  //         templateControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedValue: string) => {
  //           let row = { dep: template.dependency_name, val: selectedValue };
  //           this.tempArr.push(row);
  //           const dependentTemplate = this.templateList.filter(t => t.dependency_name === template.name);
  //           dependentTemplate.forEach((dependentTemplate, index) => {
  //             const accountId = this.tempArr.find(val => val.dep == '');
  //             if (dependentTemplate) {
  //               this.executionService.getTemplateOptionWithDep(dependentTemplate.uuid, selectedValue, accountId.val).pipe(takeUntil(this.ngUnsubscribe)).subscribe((dependentOptions: TemplateOption[]) => {
  //                 this.templateOptions[dependentTemplate.label] = dependentOptions;
  //                 const templatesArray = this.cloudForm.get('templates') as FormArray;
  //                 for (let i = 0; i < templatesArray.length; i++) {
  //                   const templateGroup = templatesArray.at(i) as FormGroup;
  //                   const templateLabel = templateGroup.get('label')?.value;
  //                   if (templateLabel === dependentTemplate.label) {
  //                     (this.cloudForm.get('templates') as FormArray).at(i).enable();
  //                   }
  //                 }
  //               });
  //             }
  //           });
  //         });
  //       });
  //     }
  //     this.manageHostForm();
  //   }

  //   onTemplateHostChange(event: Event, templateKey: string): void {
  //     const selectedValue = (event.target as HTMLSelectElement).value;
  //     const selectedLabel = (event.target as HTMLSelectElement).options[(event.target as HTMLSelectElement).selectedIndex].text;
  //     const template = this.workflow.templates.find(t => t.label === templateKey);
  //     this.workflowDetailsData.forEach(data => {
  //       if (data.inputs?.length > 0) {
  //         const inputs = data.taskForm.get('inputs') as FormArray;
  //         inputs.controls.forEach((inputGroup: FormGroup) => {
  //           const templateField = inputGroup.get('template')?.value;
  //           if (templateField === template.uuid) {
  //             inputGroup.get('default_value')?.setValue(selectedValue);
  //             inputGroup.get('template_name')?.setValue(selectedLabel);
  //           }
  //         });
  //       }
  //     });
  //   }


  //   manageHostForm() {
  //     this.hostForm.get('ip').valueChanges.pipe(debounceTime(2000), takeUntil(this.ngUnsubscribe)).subscribe((ip: string) => {
  //       if (ip && ip.trim().length > 0) {
  //         this.executionService.getIpAddress(ip).subscribe(response => {
  //           if (response.length > 0) {
  //             this.hostFormErrors.ip = '';
  //             this.ipAddress = response;
  //           } else {
  //             this.ipAddress = [];
  //             this.hostFormErrors.ip = 'No host found for the provided IP address';
  //           }
  //         });
  //       } else {
  //         this.hostFormErrors.ip = '';
  //         this.ipAddress = [];
  //       }
  //     });
  //     this.hostForm.get('cred').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
  //       if (val == 'local') {
  //         this.hostForm.addControl('credentials', new FormControl('', Validators.required));
  //         this.hostForm.removeControl('username');
  //         this.hostForm.removeControl('password');
  //       } else {
  //         this.hostForm.removeControl('credentials');
  //         this.hostForm.addControl('username', new FormControl('', Validators.required));
  //         this.hostForm.addControl('password', new FormControl('', Validators.required));
  //       }
  //     });
  //     this.hostForm.get('host_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
  //       switch (val) {
  //         case 'datacenter':
  //           this.hostForm.addControl('datacenter', new FormControl(''));
  //           this.hostForm.addControl('device_category', new FormControl(''));
  //           this.hostForm.removeControl('cloud');
  //           this.hostForm.removeControl('account_name');
  //           this.hostForm.removeControl('tag');
  //           this.hostForm.removeControl('device_type');
  //           this.hostForm.get('datacenter').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dc => {
  //             const deviceCategory = this.hostForm.get('device_category').value;
  //             if (dc && deviceCategory) {
  //               this.loadHosts(dc, deviceCategory);
  //             }
  //           });
  //           this.hostForm.get('device_category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceCategory => {
  //             const dc = this.hostForm.get('datacenter').value;
  //             if (dc && deviceCategory) {
  //               this.loadHosts(dc, deviceCategory);
  //             }
  //           });
  //           break;

  //         case 'cloud':
  //           this.hostForm.addControl('cloud', new FormControl(''));
  //           this.hostForm.addControl('account_name', new FormControl(''));
  //           this.hostForm.removeControl('datacenter');
  //           this.hostForm.removeControl('device_category');
  //           this.hostForm.removeControl('tag');
  //           this.hostForm.removeControl('device_type');
  //           this.hostForm.get('cloud').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cloudType => {
  //             this.getAccounts(cloudType);
  //           });
  //           this.hostForm.get('account_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(pc => {
  //             const cloudType = this.hostForm.get('cloud').value.toLowerCase();
  //             if (pc) {
  //               const publicCloudTypes = ['azure', 'aws', 'gcp', 'oci'];
  //               if (publicCloudTypes.includes(cloudType)) {
  //                 this.loadHosts(null, null, null, cloudType, pc);
  //               } else {
  //                 this.loadHosts(null, null, null, null, null, pc);
  //               }
  //             }
  //           });
  //           break;

  //         case 'tag':
  //           this.hostForm.addControl('tag', new FormControl(''));
  //           this.hostForm.removeControl('account_name');
  //           this.hostForm.removeControl('datacenter');
  //           this.hostForm.removeControl('device_category');
  //           this.hostForm.removeControl('cloud');
  //           this.hostForm.removeControl('device_type');
  //           this.hostForm.get('tag').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(tag => {
  //             if (tag) {
  //               this.loadHosts(null, null, tag);
  //             }
  //           });
  //           break;

  //         case 'device_type':
  //           this.hostForm.addControl('device_type', new FormControl([]));
  //           this.hostForm.removeControl('account_name');
  //           this.hostForm.removeControl('datacenter');
  //           this.hostForm.removeControl('device_category');
  //           this.hostForm.removeControl('cloud');
  //           this.hostForm.removeControl('tag');
  //           this.hostForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceType => {
  //             if (deviceType) {
  //               this.loadHosts(null, null, null, deviceType);
  //             }
  //           });
  //           break;

  //         default:
  //           break;
  //       }
  //     });
  //   }

  //   loadHosts(dc?: string, subType?: string, tag?: string, deviceType?: string, publicCloud?: string, privateCloud?: string) {
  //     this.selectedHosts = [];
  //     this.hostForm.get('host').reset();
  //     this.hosts = [];
  //     this.filteredHosts = [];
  //     this.executionService.getHost(tag, deviceType, dc, subType, publicCloud, privateCloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
  //       this.hosts = response;
  //       this.filteredHosts = response;
  //     }, (err: HttpErrorResponse) => {
  //       this.notification.error(new Notification('Failed to load hosts. Please try again later!!'));
  //     });
  //   }

  //   handleError(err: any) {
  //     if (this.workflowDetailsData.length) {
  //       this.workflowDetailsData.forEach(data => {
  //         data.taskFormErrors = this.executionService.resetTaskFormErrors();
  //         if (data.taskForm && data.inputs.length) {
  //           data.inputs.forEach(input => {
  //             if (input.param_type === 'Input template') {
  //               data.taskFormErrors.inputs[input.param_name] = '';
  //               data.taskValidationMessages.inputs[input.param_name] = {};
  //               data.taskValidationMessages.inputs[input.param_name]['required'] = `${input.param_name} is required`;
  //             } else {
  //               data.taskFormErrors.inputs[input.param_name] = '';
  //               data.taskValidationMessages.inputs[input.param_name] = {};
  //               data.taskValidationMessages.inputs[input.param_name]['required'] = `${input.param_name} is required`;
  //               data.taskFormErrors.inputs[input.param_name + '_default_value'] = '';
  //               data.taskValidationMessages.inputs[input.param_name + '_default_value'] = {};
  //               data.taskValidationMessages.inputs[input.param_name + '_default_value']['required'] = `${input.param_name} is required`;
  //             }
  //           });
  //         }
  //       });
  //     }
  //     if (err.non_field_errors) {
  //       this.nonFieldErr = err.non_field_errors[0];
  //     } else if (err) {
  //       for (const field in err) {
  //         if (this.cloudForm && field in this.cloudForm.controls) {
  //           this.cloudFormErrors[field] = err[field][0];
  //         }
  //         if (this.hostForm && field in this.hostForm.controls) {
  //           this.hostFormErrors[field] = err[field][0];
  //         }
  //         this.workflowDetailsData.forEach(data => {
  //           if (field in data.taskForm.controls) {
  //             this.formErrors[field] = err[field][0];
  //           }
  //         });
  //       }
  //     } else {
  //       this.goBack();
  //       this.notification.error(new Notification('Something went wrong!! Please try again.'));
  //     }
  //     this.spinner.stop('main');
  //   }

  //   onSubmit() {
  //     let obj = Object.assign({});
  //     if (this.workflow.target_type && this.workflow.target_type == 'Cloud') {
  //       let isValid: boolean = true;
  //       if (this.workflowDetailsData.length) {
  //         this.workflowDetailsData.forEach(data => {
  //           if (data.taskForm.invalid) {
  //             isValid = false;
  //             data.taskFormErrors = this.utilService.validateForm(data.taskForm, data.taskValidationMessages, data.taskFormErrors);
  //             data.taskForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => { data.taskFormErrors = this.utilService.validateForm(data.taskForm, data.taskFormValidationMessages, data.taskFormErrors); });
  //             return;
  //           }
  //         });
  //       }
  //       if (this.cloudForm.invalid) {
  //         this.cloudFormErrors = this.utilService.validateForm(this.cloudForm, this.cloudFormValidationMessages, this.cloudFormErrors);
  //         this.cloudForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => { this.cloudFormErrors = this.utilService.validateForm(this.cloudForm, this.cloudFormValidationMessages, this.cloudFormErrors); });
  //         return;
  //       } else if (!isValid) {
  //         return;
  //       } else {
  //         obj = Object.assign({}, this.cloudForm.getRawValue());
  //       }
  //     } else if (this.workflow.target_type && this.workflow.target_type == 'Local') {
  //       let isValid: boolean = true;
  //       if (this.workflowDetailsData.length) {
  //         this.workflowDetailsData.forEach(data => {
  //           if (data.taskForm.invalid) {
  //             isValid = false;
  //             data.taskFormErrors = this.utilService.validateForm(data.taskForm, data.taskValidationMessages, data.taskFormErrors);
  //             data.taskForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => { data.taskFormErrors = this.utilService.validateForm(data.taskForm, data.taskFormValidationMessages, data.taskFormErrors); });
  //             return;
  //           }
  //         });
  //       }
  //       if (this.localForm.invalid) {
  //         this.localFormErrors = this.utilService.validateForm(this.localForm, this.localFormValidationMessages, this.localFormErrors);
  //         this.localForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => { this.localFormErrors = this.utilService.validateForm(this.localForm, this.localFormValidationMessages, this.localFormErrors); });
  //         return;
  //       } else if (!isValid) {
  //         return;
  //       } else {
  //         obj = Object.assign({}, this.localForm.getRawValue());
  //       }
  //     } else {
  //       let isValid: boolean = true;
  //       if (this.workflowDetailsData.length) {
  //         this.workflowDetailsData.forEach(data => {
  //           if (data.taskForm.invalid) {
  //             isValid = false;
  //             data.taskFormErrors = this.utilService.validateForm(data.taskForm, data.taskValidationMessages, data.taskFormErrors);
  //             data.taskForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => { data.taskFormErrors = this.utilService.validateForm(data.taskForm, data.taskFormValidationMessages, data.taskFormErrors); });
  //             return;
  //           }
  //         });
  //       }
  //       if (this.hostForm.invalid) {
  //         this.hostFormErrors = this.utilService.validateForm(this.hostForm, this.hostFormValidationMessages, this.hostFormErrors);
  //         if (this.hostForm.errors && this.hostForm.errors.atLeastOneRequired) {
  //           this.hostFormErrors.host = 'IP Address or Host is required';
  //           this.hostFormErrors.ip = 'IP Address or Host is required';
  //         }
  //         this.hostForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
  //           this.hostFormErrors = this.utilService.validateForm(this.hostForm, this.hostFormValidationMessages, this.hostFormErrors);
  //           if (this.hostForm.errors && this.hostForm.errors.atLeastOneRequired) {
  //             this.hostFormErrors.host = 'IP Address or Host is required';
  //             this.hostFormErrors.ip = 'IP Address or Host is required';
  //           }
  //         });
  //         return;
  //       } else if (!isValid) {
  //         return;
  //       } else {
  //         const { cred, credentials, username, password, parameters } = this.hostForm.getRawValue();
  //         obj = Object.assign({ cred, credentials, username, password, parameters, ip_address: this.ipAddress, host: this.selectedHosts });
  //       }
  //     }
  //     obj['tasks'] = [];
  //     if (this.workflowDetailsData.length) {
  //       this.workflowDetailsData.forEach(data => {
  //         let taskObj = Object.assign({}, data.taskForm.getRawValue());
  //         taskObj.inputs = [];
  //         const inputs = data.taskForm.get('inputs') as FormArray;
  //         if (inputs) {
  //           inputs.controls.forEach(inputControl => {
  //             let inputObj = {
  //               param_name: inputControl?.get('param_name')?.value || '',
  //               param_type: inputControl?.get('param_type')?.value || 'String',
  //               default_value: inputControl?.get('default_value')?.value || '',
  //               attribute: inputControl?.get('attribute')?.value || '',
  //               template: inputControl?.get('template')?.value || '',
  //               template_name: inputControl?.get('template_name')?.value || ''
  //             };
  //             taskObj.inputs.push(inputObj);
  //           });
  //         }
  //         obj.tasks.push(taskObj);
  //       });
  //     }
  //     this.spinner.start('main');
  //     this.executionService.executeTask(obj, this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //       this.spinner.stop('main');
  //       this.notification.success(new Notification('Execution details submitted succesfuly.'));
  //       this.goBack();
  //     }, (err: HttpErrorResponse) => {
  //       this.spinner.stop('main');
  //       this.handleError(err.error);
  //     });
  //   }

  //   toggleDropdown(event: Event) {
  //     this.dropdownOpen = !this.dropdownOpen;
  //     event.stopPropagation();
  //     this.appendToBody();
  //   }

  //   private appendToBody() {
  //     setTimeout(() => {
  //       this.dropdownMenu = this.element.nativeElement.querySelector('.dropdown-menu');
  //       if (this.dropdownMenu) {
  //         const parent = this.renderer.parentNode(this.dropdownMenu);
  //         if (parent) {
  //           this.renderer.removeChild(parent, this.dropdownMenu);
  //           this.renderer.appendChild(document.body, this.dropdownMenu);
  //           const eTarget = parent as HTMLElement;
  //           const eOffset = eTarget.getBoundingClientRect();
  //           const dropdownTop = eOffset.bottom + window.scrollY;
  //           this.renderer.setStyle(this.dropdownMenu, 'width', eOffset.width + 'px');
  //           this.renderer.setStyle(this.dropdownMenu, 'display', 'block');
  //           this.renderer.setStyle(this.dropdownMenu, 'top', dropdownTop + 'px');
  //           this.renderer.setStyle(this.dropdownMenu, 'left', eOffset.left + window.scrollX + 'px');
  //           const footer = document.getElementsByTagName('footer')[0];
  //           const dropdownBottom = this.dropdownMenu.getBoundingClientRect().bottom;
  //           if (footer && footer.getBoundingClientRect().top < dropdownBottom) {
  //             const appRoot = document.getElementsByTagName('app-root')[0];
  //             const buffer = dropdownBottom - footer.getBoundingClientRect().top + 10 + document.body.getBoundingClientRect().height;
  //             this.renderer.setStyle(appRoot, 'min-height', `${buffer}px`);
  //           }
  //         }
  //       }
  //     }, 50);
  //   }

  //   isSelected(host: Hosts): boolean {
  //     return this.selectedHosts.some(
  //       selectedHost => selectedHost.name == host.name && selectedHost.ip_address == host.ip_address
  //     );
  //   }

  //   toggleSelection(host: Hosts, event: MouseEvent) {
  //     event.stopPropagation();
  //     if (!host) {
  //       return;
  //     }
  //     const hostIndex = this.selectedHosts.findIndex(
  //       selectedHost => selectedHost.name == host.name && selectedHost.ip_address == host.ip_address
  //     );
  //     if (hostIndex != -1) {
  //       this.selectedHosts.splice(hostIndex, 1);
  //     } else {
  //       this.selectedHosts.push(host);
  //     }
  //     this.hostForm.get('host').setValue(this.selectedHosts.length > 0 ? this.selectedHosts : null);
  //   }

  //   getSelectedHostsText(): string {
  //     if (this.selectedHosts.length == 0) {
  //       return 'Select Hosts';
  //     } else if (this.selectedHosts.length == 1) {
  //       return this.selectedHosts[0].name;
  //     } else {
  //       return `${this.selectedHosts.length} selected`;
  //     }
  //   }

  //   getFormControlType(data: WorkflowDetailsViewData, key: string): string {
  //     if (data.inputs && data.inputs.length) {
  //       const input = data.inputs.find(input => input.param_name === key);
  //       return input ? input.type || 'text' : 'text';
  //     } else {
  //       return 'text';
  //     }
  //   }

  //   goBack() {
  //     this.router.navigate(['../../'], { relativeTo: this.route });
  //   }
  // }


  private ngUnsubscribe = new Subject();

  cloudForm: FormGroup;
  cloudFormErrors: any;
  cloudFormValidationMessages: any;

  hostForm: FormGroup;
  hostFormErrors: any;
  hostFormValidationMessages: any;

  LocalForm: FormGroup;
  LocalFormErrors: any;
  LocalFormValidationMessages: any;

  host: string[]
  deviceType: string[];
  hosts: any[] = [];
  cloudAccountNames: string[]

  credentialList: DeviceDiscoveryCredentials[] = [];
  uuid: string;
  searchValue: string = '';
  fieldsToFilterOn: string[] = ['name', 'ip_address'];

  accountNames: string[] = [];
  filteredAllClouds: CloudNameType[] = [];
  cloud: string;
  playbookType: string;
  parametersList: any;
  targetType: string;
  taskName: string;
  viewData: InputTemplateModel;
  InputTemplateOption: any;
  templateId: any;
  templateOptions: { [key: string]: TemplateOption[] } = {};
  templateList: any;
  cloudAccount: string;
  cloudAccountData: any;
  cloudImage: string;
  requiredCred: boolean;

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
  nonFieldErr: string = '';
  paramListIsObjFlag: boolean = false;
  repoId: string;
  private dropdownMenu: HTMLElement | null = null;
  tempArr = [];
  categoryUuid: string;
  targets = [];
  credentials: string;
  username: string;

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

  constructor(private taskExecuteSvc: OrchestrationWorkflowExecutionService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private router: Router,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private renderer: Renderer2,
    private element: ElementRef,
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.uuid = params.get('workflowId');
      // this.targetType = params.get('targetType')?.toLowerCase();
      // if (this.targetType === 'cloud') {
      //   this.buildCloudForm();
      // } else if (this.targetType === 'host') {
      //   this.buildHostForm();
      // } else {
      //   this.buildLocalForm();
      // }
      this.repoId = params.get('repoId');
      this.categoryUuid = params.get('categoryId')
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
    this.getParameterDetails();
    this.getCredentials();
    this.getAllCloud();
    // this.getInputTemplateOption();
  }

  ngOnDestroy() {
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

  getCredentials() {
    this.taskExecuteSvc.getCredentials().pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.credentialList = param;
    }, err => {
      this.notification.error(new Notification('Error while fetching credentials. Please try again!!'));
    });
  }

  getAllCloud() {
    this.taskExecuteSvc.getAllCloud().pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.allClouds = param;
      this.filteredAllClouds = param.filter(cloud => cloud.cloud_type?.toLowerCase() == this.cloud?.toLowerCase());
      this.filteredAllClouds.forEach(d => {
        this.accountNames.push(d.account_name);
      });
    });
  }

  getInputTemplateData() {
    this.taskExecuteSvc.getTemplateData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = data;
    });
  }

  getCloudAccount(accountId: string, selectedUuid: string) {
    this.taskExecuteSvc.getCloudAccountOption(accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
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

  getParameterDetails() {
    this.spinner.start('main');
    this.taskExecuteSvc.getTaskParamsById(this.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
      if (param.target_type === 'Cloud') {
        this.buildCloudForm(param);
      } else if (param.target_type === 'Host') {
        this.buildHostForm(param);
      } else {
        this.buildLocalForm(param);
      }
    }, err => {
      this.notification.error(new Notification('Error while fetching workflow inputs. Please try again!!'));
    });
  }


  buildCloudForm(param: any) {
    // this.taskExecuteSvc.getTaskParamsById(this.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
    this.parametersList = Array.isArray(param.inputs) ? param.inputs : [];
    this.templateList = param.templates;
    this.paramListIsObjFlag = JSON.stringify(param.inputs) === '{}' ? true : false;
    this.targetType = param.target_type?.toLowerCase();
    this.taskName = param.workflow_name;
    this.cloud = param.cloud_type;
    this.playbookType = param.playbook_type;
    this.requiredCred = param.required_credentials;
    this.cloudImage = `${environment.assetsUrl + param.cloud_image}`;
    this.getCloudAccount(param.cloud_template, param.cloud_account);
    this.cloudAccount = param.cloud_account;
    this.cloudForm = this.taskExecuteSvc.buildCloudForm(param, this.uuid);
    this.cloudFormErrors = this.taskExecuteSvc.resetFormErrors();
    this.cloudFormValidationMessages = this.taskExecuteSvc.formValidationMessages;
    if (this.requiredCred) {
      if (param.cred === 'local') {
        this.cloudForm.addControl('credentials', new FormControl(param.credentials, Validators.required));
      } else {
        this.cloudForm.addControl('username', new FormControl(param.username, Validators.required));
        this.cloudForm.addControl('password', new FormControl('', Validators.required));
      }
    }
    this.initializeTemplateOptions(this.cloudForm);
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

    if (this.requiredCred) {
      this.cloudForm.get('cred').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
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
    }
    this.spinner.stop('main');
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
        this.taskExecuteSvc.getTemplateOption(templateId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
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
      this.taskExecuteSvc.getTemplateOptionWithDependent(templateId, queryParams).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
        this.templateOptions[label] = options;

        const formArray = form.get('inputs') as FormArray;
        const controlGroup = formArray.at(index) as FormGroup;
        controlGroup.get('default_value')?.enable();
      });
    }
  }

  // onTemplateCloudChange(event: Event, templateKey: string): void {
  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   const selectedLabel = (event.target as HTMLSelectElement).options[(event.target as HTMLSelectElement).selectedIndex].text;
  //   const template = this.templateList.find(t => t.label === templateKey);
  //   if (template) {
  //     const inputsArray = this.cloudForm.get('inputs') as FormArray;
  //     inputsArray.controls.forEach((inputControl: FormGroup) => {
  //       if (inputControl.get('template')?.value === template.uuid) {
  //         inputControl.get('template_name')?.setValue(selectedLabel);
  //         inputControl.get('default_value')?.setValue(selectedValue);
  //       }
  //     });
  //   }
  // }

  // getPlaceHolder(paramKey: string) {
  //   let paramObj = this.parametersList.find((i: TerraFormParams) => i.param_name == paramKey);
  //   return paramObj?.placeholder ? paramObj.placeholder : 'Enter Value';
  // }

  getTags() {
    this.taskExecuteSvc.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(tags => {
      this.tags = tags;
    }, err => {
      this.notification.error(new Notification('Failed to fetch Tags. Please try again later.'));
    });
  }

  getDc() {
    this.taskExecuteSvc.getDc().pipe(takeUntil(this.ngUnsubscribe)).subscribe(dc => {
      this.dc = dc;
    }, err => {
      this.notification.error(new Notification('Failed to fetch DataCenters. Please try again later.'));
    });
  }

  getCloudWIthImg() {
    this.taskExecuteSvc.getCloudWithImg().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cloudWithIMg = res.cloud;
    }, err => {
      this.notification.error(new Notification('Failed to fetch Cloud. Please try again later.'));
    });
  }

  buildHostForm(param: any) {
    // this.taskExecuteSvc.getTaskParamsById(this.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
    this.parametersList = Array.isArray(param.inputs) ? param.inputs : [];
    this.paramListIsObjFlag = JSON.stringify(param.inputs) === '{}' ? true : false;
    this.targetType = param.target_type.toLowerCase();
    this.templateList = param.templates;
    this.taskName = param.workflow_name;
    this.cloud = param.cloud_type;
    this.playbookType = param.playbook_type;
    this.targets = param.targets;
    this.hostForm = this.taskExecuteSvc.buildHostForm(param, this.uuid);
    this.hostFormErrors = this.taskExecuteSvc.resetHostFormErrors();
    this.hostFormValidationMessages = this.taskExecuteSvc.hostFormValidationMessages;
    this.initializeTemplateOptions(this.hostForm);
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

  handleHostTypeChange(val: string) {
    this.resetHosts();
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
          this.resetHosts();
          if (dc && deviceCategory) {
            this.loadHosts(dc, deviceCategory);
          }
        });
        this.hostForm.get('device_category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceCategory => {
          const dc = this.hostForm.get('datacenter').value;
          this.resetHosts();
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
          this.resetHosts();
          this.updateAccountNames(cloudType);
        });
        this.hostForm.get('account_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(pc => {
          const cloudType = this.hostForm.get('cloud').value.toLowerCase();
          this.resetHosts();
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
          this.resetHosts();
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
          this.resetHosts();
          if (deviceType) {
            this.loadHosts(null, null, null, deviceType);
          }
        });
        break;

      default:
        break;
    }
  }

  resetHosts() {
    this.selectedHosts = [];
    this.hostForm.get('host').reset();
  }

  loadHosts(dc?: string, subType?: string, tag?: string, deviceType?: string, publicCloud?: string, privateCloud?: string) {
    this.selectedHosts = [];
    this.hostForm.get('host').reset();
    this.hosts = [];
    this.filteredHosts = [];
    // this.hostForm.get('ip').valueChanges.pipe(debounceTime(2000), takeUntil(this.ngUnsubscribe)).subscribe((ip: string) => {
    //   if (ip && ip.trim().length > 0) {
    //     this.taskExecuteSvc.getHost(ip, tag, deviceType, dc, subType, publicCloud, privateCloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
    //       // this.ipAddress = response;
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
    // this.taskExecuteSvc.getHost(tag, deviceType, dc, subType, publicCloud, privateCloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
    //   this.hosts = response;
    //   this.filteredHosts = response;
    // }, (err: HttpErrorResponse) => {
    //   this.notification.error(new Notification('Failed to load hosts. Please try again later!!'));
    // });
  }

  // searchTargets = (query: string): Observable<any[]> => {
  //   return this.taskExecuteSvc.getHost(query);
  // };

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
        const cloudType = this.hostForm.get('cloud')?.value;
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

    return this.taskExecuteSvc.getHost(query, tag, deviceType, dc, deviceCategory, publicCloud, privateCloud).pipe(catchError(err => {
      this.notification.error(new Notification('Failed to fetch targets. Please try again later.'));
      return of([]);
    })
    );
  };

  updateAccountNames(cloudType: string) {
    this.taskExecuteSvc.getAllCloud(cloudType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(accounts => {
      this.cloudAccountNames = accounts;
    }, err => {
      this.notification.error(new Notification('Failed to fetch Cloud. Please try again later.'));
    });
  }

  onSubmit() {
    if (this.cloudForm.invalid) {
      this.cloudFormErrors = this.utilService.validateForm(this.cloudForm, this.cloudFormValidationMessages, this.cloudFormErrors);
      this.cloudForm.valueChanges
        .subscribe((data: any) => { this.cloudFormErrors = this.utilService.validateForm(this.cloudForm, this.cloudFormValidationMessages, this.cloudFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      const rawValues = this.cloudForm.getRawValue();
      const inputsArray = (Array.isArray(rawValues.inputs) ? rawValues.inputs : Object.values(rawValues.inputs))
        .map((input: any) => {
          return {
            param_name: input.param_name || '',
            param_type: input.param_type || '',
            default_value: input.default_value || '',
            attribute: input.attribute || '',
            template: input.template || '',
            template_name: input.template_name || ''
          };
        });
      const obj = { ...rawValues, inputs: inputsArray };
      this.taskExecuteSvc.submitExecution(this.uuid, obj).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          // this.router.navigate(['../../../'], { relativeTo: this.route });
          this.goBack();
          this.notification.success(new Notification('Workflow execution started successfully'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          // this.router.navigate(['../../../'], { relativeTo: this.route });
          this.spinner.stop('main');
          this.notification.error(new Notification('Workflow execution failed'));
        });
    }
  }

  onSubmitHost() {
    if (this.hostForm.invalid) {
      this.hostFormErrors = this.utilService.validateForm(this.hostForm, this.hostFormValidationMessages, this.hostFormErrors);
      // if (this.hostForm.errors && this.hostForm.errors.atLeastOneRequired) {
      //   this.hostFormErrors.host = 'IP Address or Host is required';
      //   this.hostFormErrors.ip = 'IP Address or Host is required';
      // }
      this.hostForm.valueChanges
        .subscribe((data: any) => {
          this.hostFormErrors = this.utilService.validateForm(this.hostForm, this.hostFormValidationMessages, this.hostFormErrors);
          // if (this.hostForm.errors && this.hostForm.errors.atLeastOneRequired) {
          //   this.hostFormErrors.host = 'IP Address or Host is required';
          //   this.hostFormErrors.ip = 'IP Address or Host is required';
          // }
        });
      return;
    } else {
      this.spinner.start('main');
      const rawValues = this.hostForm.getRawValue();
      // const inputsArray = Object.keys(rawValues.inputs).map(key => {
      const inputsArray = (Array.isArray(rawValues.inputs) ? rawValues.inputs : Object.values(rawValues.inputs))
        .map((input: any) => {
          return {
            param_name: input.param_name ? input.param_name : '',
            param_type: input.param_type ? input.param_type : '',
            default_value: input.default_value ? input.default_value : '',
            attribute: input.attribute ? input.attribute : '',
            template: input.template ? input.template : '',
            template_name: input.template_name ? input.template_name : ''
          };
        });
      const { cred, credentials, username, password, targets } = this.hostForm.getRawValue();
      let obj = <HostType>Object.assign({ cred, credentials, username, password, inputs: inputsArray, targets });
      this.taskExecuteSvc.submitExecution(this.uuid, obj).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          // this.router.navigate(['../../../'], { relativeTo: this.route });
          this.goBack();
          this.notification.success(new Notification('Workflow execution started successfully'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
          this.spinner.stop('main');
          // this.router.navigate(['../../../'], { relativeTo: this.route });
          this.notification.error(new Notification('Workflow execution failed'));
        });
    }
  }

  buildLocalForm(param: any) {
    // this.taskExecuteSvc.getTaskParamsById(this.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
    this.parametersList = Array.isArray(param.inputs) ? param.inputs : [];
    this.templateList = param.templates;
    this.paramListIsObjFlag = JSON.stringify(param.inputs) === '{}' ? true : false;
    this.targetType = param.target_type?.toLowerCase();
    this.taskName = param.workflow_name;
    this.cloud = param.cloud_type;
    this.playbookType = param.playbook_type;
    this.LocalForm = this.taskExecuteSvc.buildLocalForm(param, this.uuid);
    this.LocalFormErrors = this.taskExecuteSvc.resetLocalFormErrors();
    this.LocalFormValidationMessages = this.taskExecuteSvc.formValidationMessagesLocal;
    this.initializeTemplateOptions(this.LocalForm);
    // if (param.playbook_type == 'Ansible Playbook' || param.playbook_type == 'Terraform Script') {
    JSON.stringify(param.inputs) !== '{}' ? (param.inputs as TerraFormParams[]).forEach((p, i) => {
      // if (p.param_type === 'Input template') {
      //   this.LocalFormErrors.inputs[p.param_name] = '';
      //   this.LocalFormValidationMessages.inputs[p.param_name] = {};
      //   this.LocalFormValidationMessages.inputs[p.param_name]['required'] = `${p.param_name} is required`;
      // } else {
      //   this.LocalFormErrors.inputs[p.param_name] = '';
      //   this.LocalFormValidationMessages.inputs[p.param_name] = {};
      //   this.LocalFormErrors.inputs[p.param_name + '_default_value'] = '';
      //   this.LocalFormValidationMessages.inputs[p.param_name + '_default_value'] = {};
      //   this.LocalFormValidationMessages.inputs[p.param_name + '_default_value']['required'] = `${p.param_name} is required`;
      // }
      if (!this.LocalFormErrors.inputs[i]) {
        this.LocalFormErrors.inputs[i] = {};
        this.LocalFormValidationMessages.inputs[i] = {};
      }
      this.LocalFormErrors.inputs[i]['default_value'] = '';
      this.LocalFormValidationMessages.inputs[i]['default_value'] = {
        required: `${p.param_name} is required`,
      };
    }) : '';
    // if (param.templates && param.templates.length > 0) {
    //   param.templates.forEach((template, index) => {
    //     this.LocalFormErrors.templates = this.LocalFormErrors.templates || {};
    //     this.LocalFormValidationMessages.templates = this.LocalFormValidationMessages.templates || {};
    //     this.LocalFormErrors.templates[template.label] = '';
    //     this.LocalFormValidationMessages.templates[template.label] = {
    //       required: `${template.name} selection is required`
    //     };
    //     if (!template.dependency_name) {
    //       this.taskExecuteSvc.getTemplateOption(template.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
    //         this.templateOptions[template.label] = options;
    //       });
    //     }
    //     const templateControl = (this.LocalForm.get('templates') as FormArray).at(index).get('value');
    //     templateControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedValue: string) => {
    //       let row = { dep: template.dependency_name, val: selectedValue };
    //       this.tempArr.push(row);
    //       const dependentTemplate = this.templateList.filter(t => t.dependency_name === template.name);
    //       dependentTemplate.forEach((dependentTemplate, index) => {
    //         const accountId = this.tempArr.find(val => val.dep == '');
    //         if (dependentTemplate) {
    //           this.taskExecuteSvc.getTemplateOptionWithDep(dependentTemplate.uuid, selectedValue, accountId.val).pipe(takeUntil(this.ngUnsubscribe)).subscribe((dependentOptions: TemplateOption[]) => {
    //             this.templateOptions[dependentTemplate.label] = dependentOptions;
    //             const templatesArray = this.LocalForm.get('templates') as FormArray;
    //             for (let i = 0; i < templatesArray.length; i++) {
    //               const templateGroup = templatesArray.at(i) as FormGroup;
    //               const templateLabel = templateGroup.get('label')?.value;
    //               if (templateLabel === dependentTemplate.label) {
    //                 (this.LocalForm.get('templates') as FormArray).at(i).enable();
    //               }
    //             }
    //           });
    //         }
    //       });
    //     });
    //   });
    // }
    this.spinner.stop('main');
  }

  onTemplateLocalChange(event: Event, templateKey: string): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedLabel = (event.target as HTMLSelectElement).options[(event.target as HTMLSelectElement).selectedIndex].text;
    const template = this.templateList.find(t => t.label === templateKey);
    if (template) {
      const inputsArray = this.LocalForm.get('inputs') as FormArray;
      inputsArray.controls.forEach((inputControl: FormGroup) => {
        if (inputControl.get('template')?.value === template.uuid) {
          inputControl.get('template_name')?.setValue(selectedLabel);
          inputControl.get('default_value')?.setValue(selectedValue);
        }
      });
    }
  }

  onSubmitLocal() {
    if (this.LocalForm.invalid) {
      this.LocalFormErrors = this.utilService.validateForm(this.LocalForm, this.LocalFormValidationMessages, this.LocalFormErrors);
      this.LocalForm.valueChanges
        .subscribe((data: any) => { this.LocalFormErrors = this.utilService.validateForm(this.LocalForm, this.LocalFormValidationMessages, this.LocalFormErrors); });
      return;
    } else {
      this.spinner.start('main');
      const rawValues = this.LocalForm.getRawValue();
      const inputsArray = (Array.isArray(rawValues.inputs) ? rawValues.inputs : Object.values(rawValues.inputs))
        .map((input: any) => {
          return {
            param_name: input.param_name || '',
            param_type: input.param_type || '',
            default_value: input.default_value || '',
            attribute: input.attribute || '',
            template: input.template || '',
            template_name: input.template_name || ''
          };
        });
      const obj = { ...rawValues, inputs: inputsArray };
      this.taskExecuteSvc.submitExecution(this.uuid, obj).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          // this.router.navigate(['../../../'], { relativeTo: this.route });
          this.goBack();
          this.notification.success(new Notification('Workflow execution started successfully'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          // this.router.navigate(['../../../'], { relativeTo: this.route });
          this.spinner.stop('main');
          this.notification.error(new Notification('Workflow execution failed'));
        });
    }
  }

  handleError(err: any) {
    this.hostFormErrors = this.taskExecuteSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.hostForm.controls) {
          this.hostFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  // goBack() {
  //   if (this.router.url.includes('history')) {
  //     this.router.navigate([`../../../../../../integration/${this.repoId}/details/history`], { relativeTo: this.route });
  //   } else if (this.categoryUuid) {
  //     this.router.navigate(['../../../../'], { relativeTo: this.route });
  //   } else {
  //     this.router.navigate(['../../../'], { relativeTo: this.route });
  //   }
  // }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
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

  toggleSelection(host: Hosts, event: MouseEvent) {
    event.stopPropagation();
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
}
