import { Component, OnInit, OnDestroy, Renderer2, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import {
  CatalogOrdersModel,
  CatalogOrdersViewModel,
  OrderAccountModel,
  OrderInputsModel,
  OrderTemplatesModel,
  ServiceCatalogProvisioniningOrdersCrudService,
  Option,
  AtLeastOneInputHasValue,
  NewOrders,
} from './service-catalog-provisionining-orders-crud.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Hosts } from 'src/app/unity-services/orchestration/orchestration-tasks/orchestration-tasks-schedule/orchestration-tasks-schedule.service';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { deviceTypes } from 'src/app/unity-services/orchestration/orchestration-tasks/orchestration-task-execute/orchestration-task-execute.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { NewOrdersType } from '../../service-catalog-orders/service-catalog-orders.type';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'service-catalog-provisioning-orders-crud',
  templateUrl: './service-catalog-provisioning-orders-crud.component.html',
  styleUrls: ['./service-catalog-provisioning-orders-crud.component.scss']
})
export class ServiceCatalogProvisioningOrdersCrudComponent implements OnInit, OnDestroy {

  catalogId: string;
  orderId: string;
  private ngUnsubscribe = new Subject();
  viewData: CatalogOrdersViewModel;
  ordersForm: FormGroup;
  ordersFormErrors: any;
  ordersFormValidationMessages: any;
  account: OrderAccountModel;
  templates: OrderTemplatesModel[];
  inputs: OrderInputsModel[];
  accountOptions: Option[] = [];
  templateOptions: Option[][] = [];
  selectedAccount: any;
  selectedTemplates: any;
  tempArr = [];
  originalPrice: number;
  newOrders: NewOrdersType;

  imageList = [];
  metaData: any; // need to change 

  searchValue: string = '';
  dropdownOpenImage: boolean = false;
  dropdownOpenModel: boolean = false;
  filteredImage: any;
  selectedHosts: any; //change the type
  selectedModel: any;
  fieldsToFilterOn: string[] = ['name'];
  fieldsToFilterOnHost: string[] = ['name', 'ip_address'];
  image: any;
  private dropdownMenu: HTMLElement | null = null;
  model: any;
  filteredModel: any;
  selectedHostsOperational: Hosts[] = [];

  cloudAccountNames: string[];
  hosts: any[] = [];
  tags: any[] = [];
  dc: any[] = [];
  allClouds: any[] = [];
  hostfilter: Hosts[] = [];
  ipAddress: string[];
  deviceTypes = deviceTypes;
  cloudWithIMg: any[] = [];
  filteredHosts: Array<any> = [];
  credentialList: DeviceDiscoveryCredentials[] = [];
  dropdownOpen: boolean = false;

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

  constructor(
    private svc: ServiceCatalogProvisioniningOrdersCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private fb: FormBuilder,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private renderer: Renderer2,
    private element: ElementRef,
    private utilService: AppUtilityService
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.catalogId = params.get('catalogId');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.orderId = params.get('orderId');
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdownImage = document.querySelector('.dropdown-open-image');
    const dropdownModel = document.querySelector('.dropdown-open-model');
    const dropdown = document.querySelector('.dropdown-open');

    const isClickedInsideImageDropdown = dropdownImage && dropdownImage.contains(target);
    const isClickedInsideModelDropdown = dropdownModel && dropdownModel.contains(target);
    const isClickedInsideDropdown = dropdown && dropdown.contains(target);

    if (!isClickedInsideDropdown) {
      this.dropdownOpen = false;
    }

    if (!isClickedInsideImageDropdown && !isClickedInsideModelDropdown) {
      this.dropdownOpenImage = false;
      this.dropdownOpenModel = false;
    }
  }

  ngOnInit(): void {
    if (this.orderId) {
      this.getOrderDetails();
    } else {
      this.getVariables();
    }
  }

  ngOnDestroy() {
    this.dropdownOpenImage = false;
    if (this.dropdownMenu) {
      this.renderer.removeChild(document.body, this.dropdownMenu);
      this.dropdownMenu = null;
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string, type: 'image' | 'model') {
    this.searchValue = event;
    if (type === 'image') {
      this.filteredImage = this.clientSideSearchPipe.transform(this.image, event, this.fieldsToFilterOn);
    } else {
      this.filteredModel = this.clientSideSearchPipe.transform(this.model, event, this.fieldsToFilterOn);
    }
  }

  get templatesFormArray(): FormArray {
    return this.ordersForm.get('templates') as FormArray;
  }

  get inputsFormArray(): FormArray {
    return this.ordersForm.get('inputs') as FormArray;
  }

  getTemplateOptions(index: number): Option[] {
    return this.templateOptions[index] || [];
  }

  getOrderDetails() {
    this.svc.getOrderDetails(this.orderId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.newOrders = res;
      this.getVariables();
    })
  }

  getAccountDropdownOptions() {
    this.svc.getAccountDropdownOptions(this.account.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
      this.accountOptions = options;
      // this.accountOptions.push({label: this.account.label, value: ''});
      // this.ordersForm.get('account.options').setValue({ label: this.account.label, value: '' });
      this.checkTemplateDependencies();
    });
  }

  checkTemplateDependencies() {
    this.templates.forEach((template, index) => {
      if (template.dependency_name === this.account.name) {
        const accountControl = this.ordersForm.get('account.options');

        accountControl?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedAccount: string) => {
          this.svc.getTemplateDropdownOptions(template.uuid, selectedAccount).pipe(takeUntil(this.ngUnsubscribe)).subscribe(dependentOptions => {
            this.templateOptions[index] = Array.isArray(dependentOptions) ? dependentOptions : [];
          });
        });
      }
    });
  }

  getTemplateDropdownOptions() {
    this.templates.forEach((template, index) => {
      if (!template.dependency_name) {
        this.svc.getTemplateDropdownOptions(template.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
          this.templateOptions[index] = Array.isArray(options) ? options : [];
        });
      }

      const templateControl = (this.ordersForm.get('templates') as FormArray).at(index).get('selectedOption');
      templateControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedValue: string) => {
        const dependentTemplate = this.templates.find(t => t.dependency_name === template.name);

        if (dependentTemplate) {
          this.svc.getTemplateDropdownOptions(dependentTemplate.uuid, this.selectedAccount, selectedValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe((dependentOptions) => {
            const dependentIndex = this.templates.findIndex(t => t.uuid === dependentTemplate.uuid);
            this.templateOptions[dependentIndex] = Array.isArray(dependentOptions) ? dependentOptions : [];
          });
        }
      });
    });
  }

  editTemplateDropdown() {
    if (this.orderId) {
      this.templates.forEach((template, index) => {
        if (!template.dependency_name) {
          this.svc.getTemplateDropdownOptions(template.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(options => {
            this.templateOptions[index] = Array.isArray(options) ? options : [];
          });
        }

        const templateControl = (this.ordersForm.get('templates') as FormArray).at(index).get('selectedOption');
        templateControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedValue: string) => {
          const dependentTemplate = this.templates.find(t => t.dependency_name === template.name);

          if (dependentTemplate) {
            this.svc.getTemplateDropdownOptions(dependentTemplate.uuid, this.newOrders?.account_id, selectedValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe((dependentOptions) => {
              const dependentIndex = this.templates.findIndex(t => t.uuid === dependentTemplate.uuid);
              this.templateOptions[dependentIndex] = Array.isArray(dependentOptions) ? dependentOptions : [];
            });
          }
        });
      });
    }
  }

  getVariables() {
    this.svc.getVariables(this.catalogId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: CatalogOrdersModel) => {
      this.viewData = this.svc.convertToViewdata(res);
      this.originalPrice = this.viewData.price;
      this.account = res.account;
      this.templates = res.templates;
      this.inputs = res.inputs;
      this.ordersForm = this.svc.buildForm(this.templates, this.inputs, this.viewData, this.newOrders, this.orderId);
      this.ordersFormErrors = this.svc.resetFormErrors();
      this.ordersFormValidationMessages = this.svc.formValidationMessages;

      if (this.orderId) {
        if (this.viewData.category == 'Operational') {
          if (this.newOrders?.host) {
            this.ordersForm.get('host').setValue(this.newOrders.host);
          }
          this.getCredentials();
          this.getTemplateDropdownOptions();
          this.ordersForm.get('ip').valueChanges.pipe(debounceTime(2000), takeUntil(this.ngUnsubscribe)).subscribe((ip: string) => {
            if (ip && ip.trim().length > 0) {
              this.svc.getIpAddress(ip).subscribe(response => {
                // this.ipAddress = response;
                if (response.length > 0) {
                  this.ordersFormErrors.ip = '';
                  this.ipAddress = response;
                } else {
                  this.ipAddress = [];
                  this.ordersFormErrors.ip = 'No host found for the provided IP address';
                }
              });
            } else {
              this.ordersFormErrors.ip = '';
              this.ipAddress = [];
            }
          });
          if (this.newOrders?.ip_address.length > 0) {
            const uniqueIps = this.getUniqueIpAddresses(this.newOrders.ip_address);
            const ipList = uniqueIps.join(', ');
            this.ordersForm.get('ip').setValue(ipList);
          }
          if (this.newOrders?.cred_type === 'local') {
            this.ordersForm.addControl('credentials', new FormControl(this.newOrders?.credentials, Validators.required));
            this.ordersForm.removeControl('username');
            this.ordersForm.removeControl('password');
          } else {
            this.ordersForm.removeControl('credentials');
            this.ordersForm.addControl('username', new FormControl(this.newOrders?.username, Validators.required));
            this.ordersForm.addControl('password', new FormControl(this.newOrders?.password, Validators.required));
          }
          this.ordersForm.get('cred_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
            if (val == 'local') {
              this.ordersForm.addControl('credentials', new FormControl('', Validators.required));
              this.ordersForm.removeControl('username');
              this.ordersForm.removeControl('password');
            } else {
              this.ordersForm.removeControl('credentials');
              this.ordersForm.addControl('username', new FormControl('', Validators.required));
              this.ordersForm.addControl('password', new FormControl('', Validators.required));
            }
          });
          this.updateHandleHostTypeChange();
          this.ordersForm.get('host_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
            this.handleHostTypeChange(val);
          });

          this.ordersForm.get('host').setValue(this.newOrders?.host);
          for (let i = 0; i < this.newOrders?.host.length; i++) {
            this.toggleSelectionHost(this.newOrders?.host[i]);
          }
        } else {
          this.getAccountDropdownOptions();
          // this.editTemplateDropdown();

          if (this.viewData.isPrivateCloud) {
            this.svc.getImages(this.newOrders?.account_id, this.viewData.cloudType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
              this.image = data;
              this.filteredImage = data;

              if (this.newOrders?.vm_image) {
                const vmImage = this.image.find(img => img.uuid === this.newOrders.vm_image);
                this.ordersForm.addControl('image', new FormControl(vmImage.uuid, Validators.required));
                this.toggleSelection('image', vmImage)

                this.svc.getResourceModel(this.newOrders?.cloud_type, vmImage.min_vcpu, vmImage.min_memory).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
                  this.model = data;
                  this.filteredModel = data;
                  const resourcePlan = this.model.find(resource => resource.uuid === this.newOrders.resource_plan);
                  this.ordersForm.addControl('resource_model', new FormControl(this.newOrders?.resource_plan, Validators.required));
                  this.toggleSelection('model', resourcePlan);

                  // if (this.newOrders?.vm_image === this.image.uuid) {
                  //   this.ordersForm.get('image').setValue(this.image.name);
                  // }
                  this.ordersForm.get('account.options').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedAccount => {
                    this.svc.getImages(selectedAccount, this.viewData.cloudType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
                      this.image = data;
                      this.filteredImage = data;
                    });
                  });

                  this.ordersForm.get('image').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(image => {
                    const matchingImage = this.image.find(img => img.uuid === image);
                    if (matchingImage) {
                      this.svc.getResourceModel(this.viewData.cloudType, matchingImage.min_vcpu, matchingImage.min_memory).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
                        this.model = data;
                        this.filteredModel = data;
                      });
                    }
                  });
                });
              } else {
                this.ordersForm.addControl('image', new FormControl('', Validators.required));
                this.ordersForm.get('account.options').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedAccount => {
                  this.svc.getImages(selectedAccount, this.viewData.cloudType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
                    this.image = data;
                    this.filteredImage = data;
                  });
                });

                this.ordersForm.get('image').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(image => {
                  this.ordersForm.addControl('resource_model', new FormControl('', Validators.required));
                  const matchingImage = this.image.find(img => img.uuid === image);
                  if (matchingImage) {
                    this.svc.getResourceModel(this.viewData.cloudType, matchingImage.min_vcpu, matchingImage.min_memory).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
                      this.model = data;
                      this.filteredModel = data;
                    });
                  }
                });
                // });
              }
            });
          }
          else {
            this.getCredentials();
            if (this.ordersForm.value.cred_type) { //changed valuuechanges of cred_type to this
              if (this.ordersForm.value.cred_type == 'local') {
                this.ordersForm.addControl('credentials', new FormControl(this.newOrders?.credentials, Validators.required));
                this.ordersForm.removeControl('username');
                this.ordersForm.removeControl('password');
              } else {
                this.ordersForm.removeControl('credentials');
                this.ordersForm.addControl('username', new FormControl('', Validators.required));
                this.ordersForm.addControl('password', new FormControl('', Validators.required));
              }
            }
          }

          this.ordersForm.get('account.options').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedAccount => {
            this.selectedAccount = selectedAccount;
            this.getTemplateDropdownOptions();
          });

          this.templatesFormArray.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedTemplates => {
            this.selectedTemplates = selectedTemplates;
          });

          if (this.templates && this.templates.length > 0) {
            this.templates.forEach((template, index) => {
              this.ordersFormErrors.templates = this.ordersFormErrors.templates || {};
              this.ordersFormValidationMessages.templates = this.ordersFormValidationMessages.templates || {};
              this.ordersFormErrors.templates[template.label] = '';
              this.ordersFormValidationMessages.templates[template.label] = {
                required: `${template.name} selection is required`
              };
            });
          }
        }
      } else {
        if (this.viewData.category == 'Operational') {
          this.getCredentials();
          this.getTemplateDropdownOptions();
          this.ordersForm.get('ip').valueChanges.pipe(debounceTime(2000), takeUntil(this.ngUnsubscribe)).subscribe((ip: string) => {
            if (ip && ip.trim().length > 0) {
              this.svc.getIpAddress(ip).subscribe(response => {
                // this.ipAddress = response;
                if (response.length > 0) {
                  this.ordersFormErrors.ip = '';
                  this.ipAddress = response;
                } else {
                  this.ipAddress = [];
                  this.ordersFormErrors.ip = 'No host found for the provided IP address';
                }
              });
            } else {
              this.ordersFormErrors.ip = '';
              this.ipAddress = [];
            }
          });
          this.ordersForm.get('cred_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
            if (val == 'local') {
              this.ordersForm.addControl('credentials', new FormControl('', Validators.required));
              this.ordersForm.removeControl('username');
              this.ordersForm.removeControl('password');
            } else {
              this.ordersForm.removeControl('credentials');
              this.ordersForm.addControl('username', new FormControl('', Validators.required));
              this.ordersForm.addControl('password', new FormControl('', Validators.required));
            }
          });

          this.ordersForm.get('host_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
            this.handleHostTypeChange(val);
          });
        } else {
          this.getAccountDropdownOptions();
          // this.getTemplateDropdownOptions();

          if (this.viewData.isPrivateCloud) {
            this.ordersForm.addControl('image', new FormControl('', Validators.required));
            this.ordersForm.addControl('resource_model', new FormControl('', Validators.required));
            this.ordersForm.get('account.options').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedAccount => {
              this.svc.getImages(selectedAccount, this.viewData.cloudType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
                this.image = data;
                this.filteredImage = data;
              });
            });
            this.ordersForm.get('image').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(image => {
              if (image) {
                const matchingImage = this.image.find(img => img.uuid === image);
                if (matchingImage) {
                  this.svc.getResourceModel(this.viewData.cloudType, matchingImage.min_vcpu, matchingImage.min_memory).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
                    this.model = data;
                    this.filteredModel = data;
                  });
                }
              }
            });
            // })
          } else {
            this.getCredentials();
            this.ordersForm.get('cred_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
              if (val == 'local') {
                this.ordersForm.addControl('credentials', new FormControl('', Validators.required));
                this.ordersForm.removeControl('username');
                this.ordersForm.removeControl('password');
              } else {
                this.ordersForm.removeControl('credentials');
                this.ordersForm.addControl('username', new FormControl('', Validators.required));
                this.ordersForm.addControl('password', new FormControl('', Validators.required));
              }
            });
          }

          this.ordersForm.get('account.options').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedAccount => {
            this.selectedAccount = selectedAccount;
            this.getTemplateDropdownOptions();
          });

          this.templatesFormArray.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selectedTemplates => {
            this.selectedTemplates = selectedTemplates;
          });

          if (this.templates && this.templates.length > 0) {
            this.templates.forEach((template, index) => {
              this.ordersFormErrors.templates = this.ordersFormErrors.templates || {};
              this.ordersFormValidationMessages.templates = this.ordersFormValidationMessages.templates || {};
              this.ordersFormErrors.templates[template.label] = '';
              this.ordersFormValidationMessages.templates[template.label] = {
                required: `${template.name} selection is required`
              };
            });
          }
        }
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  getUniqueIpAddresses(ipArray: any[]): string[] {
    const uniqueIps = new Set(ipArray.map(ipObj => ipObj.ip_address));
    return Array.from(uniqueIps);
  }

  onResourceModelChange(selectedModel: any): void {
    this.viewData.price = this.originalPrice + selectedModel.unit_vice_cost;
    this.ordersForm.get('resource_model').setValue(selectedModel.resource_name);
  }

  private checkTemplateValidation() {
    const templatesFormArray = this.ordersForm.get('templates') as FormArray;

    templatesFormArray.controls.forEach((control, index) => {
      const template = this.templates[index];
      const selectedOption = control.get('selectedOption');

      if (selectedOption?.invalid) {
        this.ordersFormErrors.templates[template.label] = this.ordersFormValidationMessages.templates[template.label].required;
      } else {
        this.ordersFormErrors.templates[template.label] = '';
      }
      selectedOption.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        if (selectedOption.valid) {
          this.ordersFormErrors.templates[template.label] = '';
        }
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

  handleHostTypeChange(val: string) {
    this.resetHosts();
    switch (val) {
      case 'datacenter':
        this.getDc();
        this.ordersForm.addControl('datacenter', new FormControl('', Validators.required));
        this.ordersForm.addControl('device_category', new FormControl('', Validators.required));
        this.ordersForm.removeControl('cloud');
        this.ordersForm.removeControl('account_name');
        this.ordersForm.removeControl('tag');
        this.ordersForm.removeControl('device_type');
        this.ordersForm.get('datacenter').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dc => {
          const deviceCategory = this.ordersForm.get('device_category').value;
          this.resetHosts();
          if (dc && deviceCategory) {
            this.loadHosts(dc, deviceCategory);
          }
        });
        this.ordersForm.get('device_category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceCategory => {
          const dc = this.ordersForm.get('datacenter').value;
          this.resetHosts();
          if (dc && deviceCategory) {
            this.loadHosts(dc, deviceCategory);
          }
        });
        break;

      case 'cloud':
        this.getCloudWIthImg();
        this.ordersForm.addControl('cloud', new FormControl('', Validators.required));
        this.ordersForm.addControl('account_name', new FormControl('', Validators.required));
        this.ordersForm.removeControl('datacenter');
        this.ordersForm.removeControl('device_category');
        this.ordersForm.removeControl('tag');
        this.ordersForm.removeControl('device_type');
        this.ordersForm.get('cloud').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cloudType => {
          this.resetHosts();
          this.updateAccountNames(cloudType);
        });
        this.ordersForm.get('account_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(pc => {
          const cloudType = this.ordersForm.get('cloud').value.toLowerCase();
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
        this.ordersForm.addControl('tag', new FormControl('', Validators.required));
        this.ordersForm.removeControl('account_name');
        this.ordersForm.removeControl('datacenter');
        this.ordersForm.removeControl('device_category');
        this.ordersForm.removeControl('cloud');
        this.ordersForm.removeControl('device_type');
        this.ordersForm.get('tag').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(tag => {
          this.resetHosts();
          if (tag) {
            this.loadHosts(null, null, tag);
          }
        });
        break;

      case 'device_type':
        this.ordersForm.addControl('device_type', new FormControl([], Validators.required));
        this.ordersForm.removeControl('account_name');
        this.ordersForm.removeControl('datacenter');
        this.ordersForm.removeControl('device_category');
        this.ordersForm.removeControl('cloud');
        this.ordersForm.removeControl('tag');
        this.ordersForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceType => {
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

  updateHandleHostTypeChange() {
    this.resetHosts();
    if (this.orderId) {
      if (this.newOrders?.host_meta?.host_type === 'datacenter') {
        this.getDc();
        this.loadHosts(this.newOrders?.host_meta?.datacenter, this.newOrders?.host_meta?.device_category);
        this.ordersForm.addControl('datacenter', new FormControl(this.newOrders?.host_meta?.datacenter, Validators.required));
        this.ordersForm.addControl('device_category', new FormControl(this.newOrders?.host_meta?.device_category, Validators.required));
        this.ordersForm.removeControl('cloud');
        this.ordersForm.removeControl('account_name');
        this.ordersForm.removeControl('tag');
        this.ordersForm.removeControl('device_type');
        this.ordersForm.get('datacenter').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dc => {
          const deviceCategory = this.ordersForm.get('device_category').value;
          this.resetHosts();
          if (dc && deviceCategory) {
            this.loadHosts(dc, deviceCategory);
          }
        });
        this.ordersForm.get('device_category').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceCategory => {
          const dc = this.ordersForm.get('datacenter').value;
          this.resetHosts();
          if (dc && deviceCategory) {
            this.loadHosts(dc, deviceCategory);
          }
        });
      }
      if (this.newOrders?.host_meta?.host_type === 'cloud') {
        this.getCloudWIthImg();
        this.loadHosts(null, null, null, this.newOrders?.host_meta?.cloud, this.newOrders?.host_meta?.account_name);
        this.updateAccountNames(this.newOrders?.host_meta?.cloud);
        this.ordersForm.addControl('cloud', new FormControl(this.newOrders?.host_meta?.cloud, Validators.required));
        this.ordersForm.addControl('account_name', new FormControl(this.newOrders?.host_meta?.account_name, Validators.required));
        this.ordersForm.removeControl('datacenter');
        this.ordersForm.removeControl('device_category');
        this.ordersForm.removeControl('tag');
        this.ordersForm.removeControl('device_type');
        this.ordersForm.get('cloud').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cloudType => {
          this.resetHosts();
          this.updateAccountNames(cloudType);
        });
        this.ordersForm.get('account_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(pc => {
          const cloudType = this.ordersForm.get('cloud').value.toLowerCase();
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
      }
      if (this.newOrders?.host_meta?.host_type === 'tag') {
        this.getTags();
        this.loadHosts(null, null, this.newOrders?.host_meta?.tag);
        this.ordersForm.addControl('tag', new FormControl(this.newOrders?.host_meta?.tag, Validators.required));
        this.ordersForm.removeControl('account_name');
        this.ordersForm.removeControl('datacenter');
        this.ordersForm.removeControl('device_category');
        this.ordersForm.removeControl('cloud');
        this.ordersForm.removeControl('device_type');
        this.ordersForm.get('tag').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(tag => {
          this.resetHosts();
          if (tag) {
            this.loadHosts(null, null, tag);
          }
        });
      }
      if (this.newOrders?.host_meta?.host_type === 'device_type') {
        this.loadHosts(null, null, null, this.newOrders?.host_meta?.device_type);
        this.ordersForm.addControl('device_type', new FormControl(this.newOrders?.host_meta?.device_type, Validators.required));
        this.ordersForm.removeControl('account_name');
        this.ordersForm.removeControl('datacenter');
        this.ordersForm.removeControl('device_category');
        this.ordersForm.removeControl('cloud');
        this.ordersForm.removeControl('tag');
        this.ordersForm.get('device_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(deviceType => {
          this.resetHosts();
          if (deviceType) {
            this.loadHosts(null, null, null, deviceType);
          }
        });
      }
    }
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
      this.cloudWithIMg = [...res.public_cloud, ...res.private_cloud];
    }, err => {
      this.notification.error(new Notification('Failed to fetch Cloud. Please try again later.'));
    });
  }

  resetHosts() {
    this.selectedHostsOperational = [];
    this.ordersForm.get('host').reset();
  }

  loadHosts(dc?: string, subType?: string, tag?: string, deviceType?: string, publicCloud?: string, privateCloud?: string) {
    this.selectedHostsOperational = [];
    this.ordersForm.get('host').reset();
    this.hosts = [];
    this.filteredHosts = [];
    this.svc.getHost(tag, deviceType, dc, subType, publicCloud, privateCloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
      this.hosts = response;
      this.filteredHosts = response;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load hosts. Please try again later!!'));
    });
  }

  updateAccountNames(cloudType: string) {
    this.svc.getAllCloud(cloudType).pipe(takeUntil(this.ngUnsubscribe)).subscribe(accounts => {
      this.cloudAccountNames = accounts;
    }, err => {
      this.notification.error(new Notification('Failed to fetch Cloud. Please try again later.'));
    });
  }

  goBack() {
    if (this.orderId) {
      this.router.navigate(['../../../../../', 'orders'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../../'], { relativeTo: this.route });
    }
  }

  onCheckout() {
    this.getPayload('Ordered'); // Generate the payload
    if (this.ordersForm.invalid) {
      this.ordersFormErrors = this.utilService.validateForm(this.ordersForm, this.ordersFormValidationMessages, this.ordersFormErrors);
      this.checkTemplateValidation();
      if (this.ordersForm.errors && this.ordersForm.errors.atLeastOneRequired) {
        this.ordersFormErrors.host = 'IP Address or Host is required';
        this.ordersFormErrors.ip = 'IP Address or Host is required';
      }
      this.ordersForm.valueChanges
        .subscribe((data: any) => {
          this.ordersFormErrors = this.utilService.validateForm(this.ordersForm, this.ordersFormValidationMessages, this.ordersFormErrors);
          if (this.ordersForm.errors && this.ordersForm.errors.atLeastOneRequired) {
            this.ordersFormErrors.host = 'IP Address or Host is required';
            this.ordersFormErrors.ip = 'IP Address or Host is required';
          }
        });
      return;
    } else {
      if (this.orderId) {
        this.spinner.start('main');
        const payload = this.getPayload('Ordered'); // Get the payload here
        this.svc.editOrder(this.orderId, payload).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.goBack();
            this.notification.success(new Notification('Order updated successfully'));
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.spinner.stop('main');
            this.notification.error(new Notification('Order update failed'));
          });
      } else {
        this.spinner.start('main');
        const payload = this.getPayload('Ordered'); // Get the payload here
        this.svc.createOrder(this.catalogId, payload).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.goBack();
            this.notification.success(new Notification('Order created successfully'));
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.spinner.stop('main');
            this.notification.error(new Notification('Order creation failed'));
          });
      }
    }
  }

  toggleDraftModeValidation(draftMode: boolean) {
    if (draftMode) {
      this.ordersForm.get('credentials')?.clearValidators();
      this.ordersForm.get('cred_type')?.clearValidators();
      this.ordersForm.get('account.options')?.clearValidators();
      this.ordersForm.get('ip')?.clearValidators();
      this.ordersForm.get('host')?.clearValidators();
      this.ordersForm.get('image')?.clearValidators();
      this.ordersForm.get('resource_model')?.clearValidators();
      this.ordersForm.clearValidators();
      const templatesArray = this.ordersForm.get('templates') as FormArray;
      templatesArray.controls.forEach((control: AbstractControl) => {
        control.get('selectedOption')?.clearValidators();
        control.get('selectedOption')?.updateValueAndValidity();
      });
    } else {
      this.ordersForm.get('credentials')?.setValidators([Validators.required]);
      this.ordersForm.get('cred_type')?.setValidators([Validators.required]);
      this.ordersForm.get('account.options')?.setValidators([Validators.required]);
      this.ordersForm.get('ip')?.setValidators([Validators.required]);
      this.ordersForm.get('host')?.setValidators([Validators.required]);
      this.ordersForm.get('image')?.setValidators([Validators.required]);
      this.ordersForm.get('resource_model')?.setValidators([Validators.required]);
      const templatesArray = this.ordersForm.get('templates') as FormArray;
      templatesArray.controls.forEach((control: AbstractControl) => {
        control.get('selectedOption')?.setValidators([Validators.required]);
        control.get('selectedOption')?.updateValueAndValidity();
      });
      if (this.viewData?.category === 'Operational') {
        this.ordersForm.setValidators(AtLeastOneInputHasValue(['ip', 'host']));
      }
    }

    this.ordersForm.get('credentials')?.updateValueAndValidity();
    this.ordersForm.get('cred_type')?.updateValueAndValidity();
    this.ordersForm.get('account.options')?.updateValueAndValidity();
    this.ordersForm.get('ip')?.updateValueAndValidity();
    this.ordersForm.get('host')?.updateValueAndValidity();
    this.ordersForm.get('image')?.updateValueAndValidity();
    this.ordersForm.get('resource_model')?.updateValueAndValidity();
    this.ordersForm.updateValueAndValidity();
  }


  saveAsDraft() {
    this.toggleDraftModeValidation(true);
    this.getPayload('Draft');
    if (this.ordersForm.invalid) {
      this.ordersFormErrors = this.utilService.validateForm(this.ordersForm, this.ordersFormValidationMessages, this.ordersFormErrors);
      this.checkTemplateValidation();
      this.ordersForm.valueChanges
        .subscribe((data: any) => {
          this.ordersFormErrors = this.utilService.validateForm(this.ordersForm, this.ordersFormValidationMessages, this.ordersFormErrors);
        });
      return;
    } else {
      if (this.orderId) {
        this.spinner.start('main');
        const payload = this.getPayload('Draft');
        this.svc.editOrder(this.orderId, payload).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.router.navigate(['../../../../../', 'orders'], { relativeTo: this.route });
            this.notification.success(new Notification('Order updated successfully'));
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.spinner.stop('main');
            this.notification.error(new Notification('Order update failed'));
          });
      } else {
        this.spinner.start('main');
        const payload = this.getPayload('Draft');
        this.svc.createOrder(this.catalogId, payload).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.router.navigate(['../../../../', 'orders'], { relativeTo: this.route });
            this.notification.success(new Notification('Order saved as draft successfully'));
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.spinner.stop('main');
            this.notification.error(new Notification('Order saved as draft failed'));
          });
      }
    }
    this.toggleDraftModeValidation(false);
  }

  getPayload(orderType: string) {
    this.templates.forEach(val => {
      this.ordersForm.value.templates.forEach(el => {
        if (val.uuid === el.uuid) {
          val['default_value'] = el.selectedOption;
        }
      });
    });

    let payload: any = {
      price: this.viewData.price,
      templates: this.templates,
      inputs: this.ordersForm.value.inputs,
      order_type: orderType,
    }
    if (this.viewData.category == 'Provisioning') {
      payload.cloud_type = this.viewData.cloudType,
        payload.account = {
          uuid: this.viewData.account.uuid,
          name: this.viewData.account.name,
          label: this.viewData.account.label,
          default_value: this.ordersForm.value.account.options,
        }
      if (this.viewData.isPrivateCloud) {
        payload.vm_image = this.selectedHosts?.uuid || '';
        payload.resource_plan = this.selectedModel?.uuid || '';
      } else {
        payload.credentials = this.ordersForm.value.credentials,
          payload.cred_type = this.ordersForm.value.cred_type,
          payload.username = this.ordersForm.value.username,
          payload.password = this.ordersForm.value.password
      }
    } else {
      const hostMeta = {
        host_type: this.ordersForm.value.host_type,
        datacenter: this.ordersForm.value.datacenter,
        device_category: this.ordersForm.value.device_category,
        cloud: this.ordersForm.value.cloud,
        account_name: this.ordersForm.value.account_name,
        tag: this.ordersForm.value.tag,
        device_type: this.ordersForm.value.device_type
      };
      payload.ip_address = this.ipAddress,
        payload.host = this.selectedHostsOperational,
        payload.credentials = this.ordersForm.value.credentials,
        payload.cred_type = this.ordersForm.value.cred_type,
        payload.username = this.ordersForm.value.username,
        payload.password = this.ordersForm.value.password,
        payload.host_meta = hostMeta;
    }

    return payload;

  }

  toggleDropdown(event: Event, type: 'image' | 'model') {
    event.stopPropagation();
    if (type === 'image') {
      if (this.dropdownOpenModel) {
        this.dropdownOpenModel = false;
      }
      this.dropdownOpenImage = !this.dropdownOpenImage;
    } else if (type === 'model') {
      if (this.dropdownOpenImage) {
        this.dropdownOpenImage = false;
      }
      this.dropdownOpenModel = !this.dropdownOpenModel;
    }

    this.appendToBody();
  }

  getSelectedText(type: 'image' | 'model'): string {
    if (type === 'image') {
      return this.selectedHosts ? this.selectedHosts.name : 'Select Image';
    } else {
      return this.selectedModel ? this.selectedModel.resource_name : 'Select Resource Model';
    }
  }

  isSelected(item: any, type: 'image' | 'model'): boolean {
    return type === 'image' ? this.selectedHosts === item : this.selectedModel === item;
  }

  toggleSelection(type: 'image' | 'model', item: any, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (!item) return;

    if (type === 'image') {
      this.selectedHosts = item;
      this.ordersForm.get('image').setValue(this.selectedHosts.uuid);
      this.dropdownOpenImage = false;
    } else {
      this.selectedModel = item;
      this.ordersForm.get('resource_model').setValue(this.selectedModel.uuid);
      this.dropdownOpenModel = false;
    }
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

  toggleDropdownHost(event: Event) {
    this.dropdownOpen = !this.dropdownOpen;
    event.stopPropagation();
    this.appendToBody();
  }

  isSelectedHost(host: Hosts): boolean {
    return this.selectedHostsOperational.some(
      selectedHost => selectedHost.name == host.name && selectedHost.ip_address == host.ip_address
    );
  }

  toggleSelectionHost(host: Hosts, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (!host) {
      return;
    }
    const hostIndex = this.selectedHostsOperational.findIndex(
      selectedHost => selectedHost.name == host.name && selectedHost.ip_address == host.ip_address
    );
    if (hostIndex != -1) {
      this.selectedHostsOperational.splice(hostIndex, 1);
    } else {
      this.selectedHostsOperational.push(host);
    }
    this.ordersForm.get('host').setValue(this.selectedHostsOperational.length > 0 ? this.selectedHostsOperational : null);
  }

  onSearchedHost(event: string) {
    this.searchValue = event;
    this.filteredHosts = [];
    this.filteredHosts = this.clientSideSearchPipe.transform(this.hosts, event, this.fieldsToFilterOnHost);
  }

  getSelectedHostsText(): string {
    if (this.selectedHostsOperational.length == 0) {
      return 'Select Hosts';
    } else if (this.selectedHostsOperational.length == 1) {
      return this.selectedHostsOperational[0].name;
    } else {
      return `${this.selectedHostsOperational.length} selected`;
    }
  }
}


