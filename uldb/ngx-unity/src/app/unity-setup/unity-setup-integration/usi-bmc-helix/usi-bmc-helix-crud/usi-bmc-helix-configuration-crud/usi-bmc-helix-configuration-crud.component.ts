import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { from, of, Subject, Subscription } from 'rxjs';
import { debounceTime, filter, mergeMap, takeUntil } from 'rxjs/operators';
import { AWSAccountType, AwsResourceDetailsType } from 'src/app/shared/SharedEntityTypes/aws.type';
import { AzureManageAccountsType, AzureResourceDetailsType } from 'src/app/shared/SharedEntityTypes/azure.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { BMCHelixDataset, BMCHelixInstance, BMCHelixInstanceAttributeMapping, BMCHelixInstanceRelationshipType, BMCHelixInstanceUnityOneDeviceType, BMCHelixRelationshipType, BMCHelixResourceType } from '../../usi-bmc-helix.type';
import { BMCHelixRelationshipTypeViewData, UNITY_DEVICE_TYPE_LIST, UsiBmcHelixConfigurationCrudService } from './usi-bmc-helix-configuration-crud.service';

@Component({
  selector: 'usi-bmc-helix-configuration-crud',
  templateUrl: './usi-bmc-helix-configuration-crud.component.html',
  styleUrls: ['./usi-bmc-helix-configuration-crud.component.scss'],
  providers: [UsiBmcHelixConfigurationCrudService]
})
export class UsiBmcHelixConfigurationCrudComponent implements OnInit, OnChanges, OnDestroy {
  private ngUnsubscribe = new Subject();
  @Input() activeForm: string;
  @Input() instanceData: BMCHelixInstance;
  @Output('onSubmit') onSubmit = new EventEmitter();
  instanceId: string;
  subscr: Subscription;

  configurationForm: FormGroup;
  configurationFormErrors: any;
  configurationFormValidationMessages: any;
  showForm: boolean = false;
  activeResourceTypeIndex: number = 0;
  activeRelationShipMappingIndex: number = 0;
  nonFieldErr: string = '';

  bmcHelixDatasets: BMCHelixDataset[] = [];
  deviceTypes: BMCHelixInstanceUnityOneDeviceType[] = UNITY_DEVICE_TYPE_LIST;
  bmcHelixResources: BMCHelixResourceType[] = [];
  awsAccounts: AWSAccountType[] = [];
  awsResources: AwsResourceDetailsType[] = [];
  awsResourceMapping: AwsResourceDetailsType[][] = [];
  azureAccounts: AzureManageAccountsType[] = [];
  azureResources: AzureResourceDetailsType[] = [];
  azureResourceMapping: AzureResourceDetailsType[][] = [];
  resourceTypeNames: string[] = [];
  bmcHelixRelationshipTypesByName = new BMCHelixRelationshipTypeViewData();
  bmcHelixRelationshipTypesByOrder = new BMCHelixRelationshipTypeViewData();

  removeButton: FormArray;
  resourceTypesLength: number = 0;
  onAttrubuteAdd: boolean = false;
  sectionOpenStates: boolean[] = [false];
  constructor(private svc: UsiBmcHelixConfigurationCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private builder: FormBuilder,) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.instanceId = params.get('id');
    });
  }

  ngOnInit(): void {
    // this.spinner.start('main');
    this.getUnityAttributesByDeviceType();
    this.getAwsAccounts();
    this.getAzureAccounts();

    /*
    * loads only for edit, as we get instanceId from route.
    */
    if (this.instanceId) {
      this.getBMCHelixDropdownData(this.instanceId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.activeForm?.firstChange) {
      if (this.activeForm == 'configurationForm') {
        if (this.instanceId) {
          if (!this.configurationForm) {
            this.spinner.start('main');
          }
        } else {
          /*
          * LOADS ONLY FOR `CREATE`.
          * Assumption --> this.instanceData has data before coming here.
          * In `CREATE`, `instanceData` will have data after submitting integration form.
          * Functionality --> get CMDB dropdown data, as instanceId is available in instanceData.
          */
          this.spinner.start('main');
          this.getBMCHelixDropdownData(this.instanceData.uuid);
        }
        this.showForm = true;
      } else {
        this.showForm = false;
        this.nonFieldErr = '';
        this.configurationForm = null;
        this.configurationFormErrors = this.svc.resetConfigurationFormErrors();
        this.configurationFormValidationMessages = this.svc.configurationFormValidationMessages;
        this.spinner.stop('main');
      }
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUnityAttributesByDeviceType() {
    from(this.deviceTypes).pipe(
      mergeMap((dt) => this.svc.getUnityAttributesByDeviceType(dt)),
      mergeMap((dt) => this.svc.getChildDeviceTypesByDeviceType(dt)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  getAwsAccounts() {
    this.svc.getAwsAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.awsAccounts = data;
      this.getAwsServiceAndResourceDetails(this.awsAccounts);
    }, (err: HttpErrorResponse) => {
      this.awsAccounts = [];
      this.notification.error(new Notification("Failed to Load Aws Account Details"));
    });
  }

  getAwsServiceAndResourceDetails(accounts: AWSAccountType[]) {
    this.svc.getAwsServiceAndResourceDetails(accounts).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.awsResources = data;
    }, (err: HttpErrorResponse) => {
      this.awsResources = [];
      this.notification.error(new Notification("Failed to Load Aws Services and Resources Details"));
    });
  }

  getAzureAccounts() {
    this.svc.getAzureAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.azureAccounts = data;
      this.getAzureServiceAndResourceDetails(this.azureAccounts);
    }, (err: HttpErrorResponse) => {
      this.azureAccounts = [];
      this.notification.error(new Notification("Failed to Load Azure Account Details"));
    });
  }

  getAzureServiceAndResourceDetails(accounts: AzureManageAccountsType[]) {
    this.svc.getAzureServiceAndResourceDetails(accounts).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.azureResources = data;
    }, (err: HttpErrorResponse) => {
      this.azureResources = [];
      this.notification.error(new Notification("Failed to Load Azure Services and Resources  Details"));
    })
  }

  getBMCHelixDropdownData(instanceId: string) {
    this.bmcHelixDatasets = [];
    this.bmcHelixResources = [];
    this.svc.getBMCHelixDropdownData(instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ datasets, resources }) => {
      if (datasets) {
        this.bmcHelixDatasets = _clone(datasets);
      } else {
        this.bmcHelixDatasets = [];
      }
      if (resources) {
        this.bmcHelixResources = _clone(resources);
      } else {
        this.bmcHelixResources = [];
      }

      if (!this.bmcHelixResources.length) {

      }
      if (this.instanceId) {
        /*
        * LOADS ONLY FOR `EDIT` case.
        * Assumption is that 
        * after fetching Resources, next is to fetch BMC Helix attrs for selcted BMCHelix resources.
        */
        if (this.instanceData?.config_resources) {
          this.loadFormData();
        } else {
          this.buildForm();
        }
      } else {
        /*
        * LOADS ONLY FOR `CREATE` case.
        * In `CREATE`, `instanceData` will have data after submitting integration form.
        * To make sure form is built only after `bmcHelixDatasets` & `bmcHelixResources` are loaded, building form here.
        */
        this.buildForm();
      }
    });
  }

  loadFormData() {
    if (this.instanceData?.config_resources?.resource_types) {
      /*
      * loads only for edit, as we have CMDB resources(config_resources) only in edit.
      * In Edit, if CMDB is enabled, have to load dropdown data for pre selected resources such as
      *       1. AWS resource(Services) data if `AWS Resource` is selected in `UnityOne Device Type`
      *       2. Azure resource(Services) data if `Azure Resource` is selected in `UnityOne Device Type`
      *       3. BMCHelix Attrs for each selected BMCHelix resource in all Resource Types mappings.
      * Its good to load this data before building form.
      */
      this.instanceData?.config_resources?.resource_types?.map((rst, resourceTypeIndex) => {
        if (rst.relationship_types && rst.relationship_types.length) {
          rst.relationship_types.map((rstRM) => {
            this.getBMCHelixAttributesByResource(rstRM.resource_type.name, false);
          })
        }
        const isLast = resourceTypeIndex === this.instanceData?.config_resources?.resource_types?.length - 1;
        this.getBMCHelixAttributesByResource(rst.resource_type.name, isLast);
      })
    }
  }

  getBMCHelixAttributesByResource(resourceTypeName: string, isLast?: boolean) {
    /*
    * LOADS FOR BOTH `CREATE` and `EDIT`,
    * for `CREATE`, loads on user selection/change of BMCHelix Resource 
    * for `EDIT`, loads
    *    1. before building the form, to load all BMCHelix Attrs for each selected BMCHelix resource in all Resource Types mappings
    *    2. on user selection/change of BMCHelix Resource
    */
    let instanceId = this.instanceId ? this.instanceId : (this.instanceData ? this.instanceData.uuid : null);
    let idx = this.bmcHelixResources.findIndex((r: BMCHelixResourceType) => r.name == resourceTypeName);
    if (idx != -1) {
      if (this.bmcHelixResources[idx].attrs && this.bmcHelixResources[idx].attrs.length) {
        isLast ? this.buildForm() : null;
      } else {
        this.svc.getBMCHelixAttributesByResource(instanceId, this.bmcHelixResources[idx]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          isLast ? this.buildForm() : null;
        }, err => {
          isLast ? this.buildForm() : null;
        });
      }
    } else {
      isLast ? this.buildForm() : null;
    }
  }

  buildForm() {
    if (this.instanceId) {
      this.instanceData?.config_resources?.resource_types?.map((rst, resourceTypeIndex) => {
        if (rst.cloud_resource_name && rst.unity_device?.includes('aws') && this.awsResources.length) {
          this.awsResourceMapping[resourceTypeIndex] = _clone(this.awsResources);
        }
        if (rst.cloud_resource_name && rst.unity_device.includes('azure') && this.azureResources.length) {
          this.azureResourceMapping[resourceTypeIndex] = _clone(this.azureResources);
        }
      })
    }

    /*
    * LOADS FOR BOTH `CREATE` and `EDIT`,
    * for `CREATE`, loads after getting all BMCHelix Resources.
    * for `CREATE`,  this.instanceData, this.deviceTypes, this.bmcHelixResources(with out attrs) should be available
    * for `EDIT`, loads after getting all BMCHelix Attrs for each selected BMCHelix resource in all Resource Types mappings
    * for `EDIT`, this.instanceData, this.deviceTypes, this.bmcHelixResources(with attrs for selected),this.awsResourceMapping, this.azureResourceMapping should be available
    */
    this.nonFieldErr = '';
    this.configurationForm = this.svc.buildConfigurationForm(this.instanceData, this.deviceTypes, this.bmcHelixResources, this.awsResourceMapping, this.azureResourceMapping);
    this.configurationFormErrors = this.svc.resetConfigurationFormErrors();
    this.configurationFormValidationMessages = this.svc.configurationFormValidationMessages;

    // if (this.instanceId) {
    //   for (let resourceTypeIndex = 0; resourceTypeIndex < this.resourceTypes.length; resourceTypeIndex++) {
    //     let fg = this.resourceTypes.at(resourceTypeIndex) as FormGroup;
    //     if (fg) {
    //       let bmcHelixResource = this.bmcHelixResources.find(r => r.name == fg.get('resource_type')?.value?.name);
    //       if (bmcHelixResource) {
    //         fg.get('attribute_mapping')?.value?.forEach((attr: BMCHelixInstanceAttributeMapping, rstAttrIndex: number) => {
    //           const bmcAttrName = this.instanceData.config_resources?.resource_types[resourceTypeIndex]?.attribute_mapping[rstAttrIndex]?.bmc_attr;
    //           const bmcAttrValue = bmcHelixResource.attrs?.find(a => a.value == bmcAttrName);
    //           if (bmcAttrName && bmcAttrValue) {
    //             ((fg.get('attribute_mapping') as FormArray).at(rstAttrIndex) as FormGroup)?.get('bmc_attr')?.patchValue(bmcAttrValue);
    //           }
    //         });
    //       }
    //       fg.get('relationship_types')?.value?.forEach((rstRM: BMCHelixInstanceRelationshipType, relationShipMappingIndex: number) => {
    //         /*
    //         * for `EDIT`, this.instanceData, this.deviceTypes, this.bmcHelixResources(with attrs for selected),this.awsResourceMapping, this.azureResourceMapping should be available
    //         */
    //         this.getBMCHelixRelationshipTypesByResource(resourceTypeIndex, relationShipMappingIndex, true);
    //         this.configurationFormErrors.resource_types[resourceTypeIndex]?.relationship_types?.push(this.svc.getRelationshipTypeErrors());
    //         let relationShipFg = ((fg.get('relationship_types') as FormArray).at(relationShipMappingIndex) as FormGroup)
    //         relationShipFg.get('attribute_mapping')?.value?.forEach((attr: BMCHelixInstanceAttributeMapping, rstRMAttrIndex: number) => {
    //           const bmcAttrName = this.instanceData.config_resources?.resource_types[resourceTypeIndex]?.relationship_mapping[relationShipMappingIndex]?.attribute_mapping[rstRMAttrIndex]?.bmc_attr;
    //           const bmcAttrValue = bmcHelixResource.attrs?.find(a => a.value == bmcAttrName);
    //           if (bmcAttrName && bmcAttrValue) {
    //             ((relationShipFg.get('attribute_mapping') as FormArray).at(rstRMAttrIndex) as FormGroup)?.get('bmc_attr')?.patchValue(bmcAttrValue);
    //           }
    //         });
    //       })
    //     }
    //   }
    // }
    this.getUnitySubDeviceModalFields();
    if (this.activeForm == 'configurationForm') {
      this.showForm = true;
    } else {
      this.showForm = false;
    }
    if (this.instanceId) {
      this.managePatchValues();
      this.manageFormErrorsInEdit();
    }
    this.configurationForm.updateValueAndValidity();
    this.spinner.stop('main');
  }

  async getUnitySubDeviceModalFields() {
    /*
    * LOADS FOR BOTH `CREATE` and `EDIT`,
    * Loads after building the form.
    * INBOUND & OUTBOUND attr's of Major child devices type, is taken from already existing.
    * For sub device types like below, INBOUND & OUTBOUND attr's are taken from `model_fields` API call.
    *       INTERFACES, BGP PEERS, KUBERNETES NODES & PODS, 
    *       PURE STORAGE -> ARRAYS, VOLUMES, HOSTS, PODS, HOST GROUPS, VOLUME GROUPS, VOLUME SNAPSHOTS, PROTECTION GROUPS & PROTECTION SNAPSHOTS,
    *       ONTAP STORAGE -> CLUSTERS, DISKS, NODES, SVM's, VOLUMES, AGGREGATES, LUN's, SNAP MIRRORS, CLUSTER PEERS, ETHERNETS, FC's, SHELVES
    */
    for (let i = 0; i < this.deviceTypes.length; i++) {
      if (this.deviceTypes[i].children) {
        for (let j = 0; j < this.deviceTypes[i].children.length; j++) {
          let sameResource = this.deviceTypes.find(dt => dt.value == this.deviceTypes[i].children[j].value);
          if (sameResource && sameResource.inbound && sameResource.outbound) {
            this.deviceTypes[i].children[j].inbound = sameResource.inbound;
            this.deviceTypes[i].children[j].outbound = sameResource.outbound;
          } else {
            let deviceTypes = _clone(this.deviceTypes);
            let sameChildResource = deviceTypes.flatMap(dt => dt.children || []).find(dtc => dtc.value == this.deviceTypes[i].children[j].value);
            if (sameChildResource && sameChildResource.inbound && sameChildResource.outbound) {
              this.deviceTypes[i].children[j].inbound = sameChildResource.inbound;
              this.deviceTypes[i].children[j].outbound = sameChildResource.outbound;
            } else {
              let k = await this.svc.getUnityAttributesByDeviceType(this.deviceTypes[i].children[j]).toPromise();
            }
          }
        }
      }
    }
  }

  managePatchValues() {
    for (let rstIndex = 0; rstIndex < this.resourceTypes.length; rstIndex++) {
      let rtFG = this.resourceTypes.at(rstIndex) as FormGroup;
      if (rtFG) {
        let bmcHelixResource = this.bmcHelixResources.find(r => r.name == rtFG.get('resource_type')?.value?.name);
        if (bmcHelixResource) {
          let bmcHelixResourceAttributes = this.getResourceTypeAttributes(rstIndex);
          if (bmcHelixResourceAttributes && bmcHelixResourceAttributes.length) {
            for (let rstAttrIndex = 0; rstAttrIndex < bmcHelixResourceAttributes.length; rstAttrIndex++) {
              let rtAttrFG = bmcHelixResourceAttributes.at(rstAttrIndex) as FormGroup;
              if (rtAttrFG) {
                const bmcAttrName = this.instanceData.config_resources?.resource_types[rstIndex]?.attribute_mapping[rstAttrIndex]?.bmc_attr;
                const bmcAttrValue = bmcHelixResource.attrs?.find(a => a.value == bmcAttrName);
                if (bmcAttrName && bmcAttrValue) {
                  rtAttrFG.get('bmc_attr')?.patchValue(bmcAttrValue);
                }
              }
            }
          }
          let bmcHelixResourceRelatipnships = this.getRelationshipTypeArray(rstIndex);
          if (bmcHelixResourceRelatipnships && bmcHelixResourceRelatipnships.length) {
            for (let rstRmIndex = 0; rstRmIndex < bmcHelixResourceRelatipnships.length; rstRmIndex++) {
              let rtRsFG = bmcHelixResourceRelatipnships.at(rstRmIndex) as FormGroup;
              if (rtRsFG) {
                let subBMCHelixResource = this.bmcHelixResources.find(r => r.name == rtRsFG.get('resource_type')?.value?.name);
                if (subBMCHelixResource) {
                  this.getBMCHelixRelationshipTypesByResource(rstIndex, rstRmIndex, true);
                  this.configurationFormErrors.resource_types[rstIndex]?.relationship_types?.push(this.svc.getRelationshipTypeErrors());
                  let subBMCHelixResourceAttributes = this.getRelationshipAttributeMapArray(rstIndex, rstRmIndex);
                  if (subBMCHelixResourceAttributes && subBMCHelixResourceAttributes.length) {
                    for (let rstRmAttrIndex = 0; rstRmAttrIndex < subBMCHelixResourceAttributes.length; rstRmAttrIndex++) {
                      let rtRsAttrFG = subBMCHelixResourceAttributes.at(rstRmAttrIndex) as FormGroup;
                      if (rtRsAttrFG) {
                        const subBMCAttrName = this.instanceData.config_resources?.resource_types[rstIndex]?.relationship_types[rstRmIndex]?.attribute_mapping[rstRmAttrIndex]?.bmc_attr;
                        const subBMCAttrValue = subBMCHelixResource.attrs?.find(a => a.value == subBMCAttrName);
                        if (subBMCAttrName && subBMCAttrValue) {
                          rtRsAttrFG.get('bmc_attr')?.patchValue(subBMCAttrValue);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  manageFormErrorsInEdit() {
    if (this.instanceData.config_resources && this.instanceData.config_resources.resource_types && this.instanceData.config_resources.resource_types.length > 0) {
      // if (this.instanceData.config_resources.resource_types[0].relationship_types && this.instanceData.config_resources.resource_types[0].relationship_types.length) {
      //   for (let rstRM = 0; rstRM < this.instanceData.config_resources.resource_types[0].relationship_types.length; rstRM++) {
      //     this.configurationFormErrors.resource_types[0].relationship_types[rstRM] = this.svc.getRelationshipTypeErrors();
      //     if (this.instanceData.config_resources.resource_types[0].relationship_types[rstRM].attribute_mapping && this.instanceData.config_resources.resource_types[0].relationship_types[rstRM].attribute_mapping.length > 1) {
      //       for (let rstRMAttr = 1; rstRMAttr < this.instanceData.config_resources.resource_types[0].relationship_types[rstRM].attribute_mapping.length; rstRMAttr++) {
      //         this.configurationFormErrors.resource_types[0].relationship_types[rstRM].attribute_mapping[rstRMAttr] = this.svc.getAttributeMappingErrors();
      //       }
      //     }
      //   }
      // }

      for (let rst = 0; rst < this.instanceData.config_resources.resource_types.length; rst++) {
        this.configurationFormErrors.resource_types[rst] = this.svc.getResourceTypeErrors();
        if (this.instanceData.config_resources.resource_types[rst].attribute_mapping && this.instanceData.config_resources.resource_types[rst].attribute_mapping.length > 1) {
          for (let rstAttr = 1; rstAttr < this.instanceData.config_resources.resource_types[rst].attribute_mapping.length; rstAttr++) {
            this.configurationFormErrors.resource_types[rst].attribute_mapping[rstAttr] = this.svc.getAttributeMappingErrors();
          }
        }

        if (this.instanceData.config_resources.resource_types[rst].relationship_types && this.instanceData.config_resources.resource_types[rst].relationship_types.length) {
          for (let rstRM = 0; rstRM < this.instanceData.config_resources.resource_types[rst].relationship_types.length; rstRM++) {
            this.configurationFormErrors.resource_types[rst].relationship_types[rstRM] = this.svc.getRelationshipTypeErrors();
            if (this.instanceData.config_resources.resource_types[rst].relationship_types[rstRM].attribute_mapping && this.instanceData.config_resources.resource_types[rst].relationship_types[rstRM].attribute_mapping.length > 1) {
              for (let rstRMAttr = 1; rstRMAttr < this.instanceData.config_resources.resource_types[rst].relationship_types[rstRM].attribute_mapping.length; rstRMAttr++) {
                this.configurationFormErrors.resource_types[rst].relationship_types[rstRM].attribute_mapping[rstRMAttr] = this.svc.getAttributeMappingErrors();
              }
            }
          }
        }
      }
    }
  }

  toggleResourceTypeMappingOpenOrClose(index: number) {
    this.sectionOpenStates[index] = !this.sectionOpenStates[index];
  }

  get resourceTypes(): FormArray {
    return this.configurationForm.get('resource_types') as FormArray;
  }

  get attributeArray(): FormArray {
    const resourceTypeIndex = _clone(this.activeResourceTypeIndex);
    return (this.configurationForm.get('resource_types') as FormArray)?.at(resourceTypeIndex)?.get('attribute_mapping') as FormArray;
  }

  getResourceTypeAttributes(resourceTypeIndex: number) {
    return (this.configurationForm.get('resource_types') as FormArray)?.at(resourceTypeIndex)?.get('attribute_mapping') as FormArray;
  }

  get relationShipArray(): FormArray {
    const resourceTypeIndex = _clone(this.activeResourceTypeIndex);
    return (this.configurationForm.get('resource_types') as FormArray)?.at(resourceTypeIndex)?.get('relationship_types') as FormArray;
  }

  getRelationshipTypeArray(resourceTypeIndex: number): FormArray {
    return (this.configurationForm.get('resource_types') as FormArray)?.at(resourceTypeIndex)?.get('relationship_types') as FormArray;
  }

  get relationShipAttributeArray(): FormArray {
    const resourceTypeIndex = _clone(this.activeResourceTypeIndex);
    const relationShipMappingIndex = _clone(this.activeRelationShipMappingIndex);
    return (((this.configurationForm.get('resource_types') as FormArray)?.at(resourceTypeIndex)?.get('relationship_types') as FormArray)
      .at(relationShipMappingIndex) as FormGroup).get('attribute_mapping') as FormArray;
  }

  getRelationshipAttributeMapArray(resourceTypeIndex: number, relationShipIndex: number): FormArray {
    return (((this.configurationForm.get('resource_types') as FormArray).at(resourceTypeIndex).get('relationship_types') as FormArray)
      .at(relationShipIndex) as FormGroup).get('attribute_mapping') as FormArray;
  }

  onSelectUnityDeviceType(resourceTypeIndex: number, value: any) {
    let fg = <FormGroup>this.resourceTypes.at(resourceTypeIndex);
    let selectedUnityDeviceType = fg.get('unity_device').value;
    (fg.get('attribute_mapping') as FormArray).clear();
    this.addAttributeMapping(resourceTypeIndex, 0, true);
    if (selectedUnityDeviceType.value == 'aws_resource') {
      this.azureResourceMapping[resourceTypeIndex] = null;
      this.awsResourceMapping[resourceTypeIndex] = _clone(this.awsResources);
      fg.get('cloud_resource_name') ? null : fg.addControl('cloud_resource_name', new FormControl('', [Validators.required]));
    } else if (selectedUnityDeviceType.value == 'azure_resource') {
      this.awsResourceMapping[resourceTypeIndex] = null;
      this.azureResourceMapping[resourceTypeIndex] = _clone(this.azureResources);
      fg.get('cloud_resource_name') ? null : fg.addControl('cloud_resource_name', new FormControl('', [Validators.required]));
    } else {
      fg.get('cloud_resource_name') ? fg.removeControl('cloud_resource_name') : null;
    }
    // if (!this.unityChildDeviceList[index]) {
    //   this.unityChildDeviceList[index] = [];
    // }
    // this.unityChildDeviceList[index] = UnityDeviceTypeChildDropdownValues.find(u => u.device == this.resourceTypes?.at(index)?.get('unity_device').value.value)?.childList || [];
    // if (this.resourceTypes?.at(index)?.get('relationship_mapping')) {
    //   this.resourceTypes?.at(index)?.get('relationship_mapping').setValue(false);
    // }
  }

  onSelectBMCHelixResource(resourceTypeIndex: number, value: any) {
    let fg = <FormGroup>this.resourceTypes.at(resourceTypeIndex);
    if (fg) {
      const selectedBMCHelixResourceType = fg.get('resource_type').value;
      (fg.get('attribute_mapping') as FormArray).clear();
      const isResourceTypeNameExist: boolean = this.resourceTypeNames.includes(selectedBMCHelixResourceType.name);
      this.addAttributeMapping(resourceTypeIndex, 0, true);
      let instanceId = this.instanceId ? this.instanceId : (this.instanceData ? this.instanceData.uuid : null);
      if (!isResourceTypeNameExist) {
        this.resourceTypeNames.push(selectedBMCHelixResourceType.name);
        this.getBMCHelixAttributesByResource(selectedBMCHelixResourceType.name);
      }
    }
  }

  addAttributeMapping(resourceTypeIndex: number, attributeMappingIndex: number, isValid?: boolean) {
    // this.resourceTypesLength = i;
    // this.onAttrubuteAdd = true;
    this.activeResourceTypeIndex = _clone(resourceTypeIndex);
    let curentAttrFG = <FormGroup>this.attributeArray.at(attributeMappingIndex);
    if (curentAttrFG && curentAttrFG.invalid) {
      this.configurationFormErrors.resource_types[resourceTypeIndex].attribute_mapping[attributeMappingIndex] = this.utilService.validateForm(curentAttrFG, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[resourceTypeIndex].attribute_mapping[attributeMappingIndex]);
      curentAttrFG.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.configurationFormErrors.resource_types[resourceTypeIndex].attribute_mapping[attributeMappingIndex] = this.utilService.validateForm(curentAttrFG, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[resourceTypeIndex].attribute_mapping[attributeMappingIndex]);
      });
    } else {
      let newFGIndex = curentAttrFG ? attributeMappingIndex + 1 : attributeMappingIndex;
      const attrFG = this.builder.group({
        'inbound': [false],
        'unity_attr': ['', [Validators.required]],
        'bmc_attr': ['', [Validators.required]],
        'default': [''],
      });
      this.configurationFormErrors.resource_types[resourceTypeIndex]?.attribute_mapping?.push(this.svc.getAttributeMappingErrors());
      this.attributeArray.push(attrFG);
      this.markConfigurationFormAsDirty();
      (this.attributeArray.at(newFGIndex) as FormGroup)?.get('inbound')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        (this.attributeArray.at(newFGIndex) as FormGroup)?.get('unity_attr')?.setValue('');
      });
    }
  }

  removeAttributeMapping(resourceTypeIndex: number, attributeMappingIndex: number) {
    this.activeResourceTypeIndex = _clone(resourceTypeIndex);
    if (this.attributeArray.length > 1) {
      this.attributeArray.removeAt(attributeMappingIndex);
    }
    this.configurationFormErrors.resource_types[resourceTypeIndex].attribute_mapping.splice(attributeMappingIndex, 1);
    this.markConfigurationFormAsDirty();
  }

  onSelectBMCHelixAttributeMapping(resourceTypeIndex: number, attributeMappingIndex: number) {
    let attrControls = this.resourceTypes?.controls[resourceTypeIndex]?.get('attribute_mapping') as FormArray;
    attrControls.controls[attributeMappingIndex]?.get('default').setValue('');
  }

  onToggleRelationShipMapping(resourceTypeIndex: number, event: Event) {
    let fg = <FormGroup>this.resourceTypes.at(resourceTypeIndex);
    const checked = (event.target as HTMLInputElement).checked;
    if (fg) {
      if (checked) {
        fg.get('relationship_types') ? null : fg.addControl('relationship_types', new FormArray([]));
        this.addReltionshipMap(resourceTypeIndex);
      } else {
        this.deleteReltionshipMap(resourceTypeIndex);
        fg.get('relationship_types') ? fg.removeControl('relationship_types') : null;
      }
    }
  }

  addReltionshipMap(resourceTypeIndex: number, relationshipMappingIndex?: number) {
    console.log('resourceTypeIndex : ', resourceTypeIndex);
    console.log('relationshipMappingIndex : ', relationshipMappingIndex);

    this.activeResourceTypeIndex = _clone(resourceTypeIndex);
    if (relationshipMappingIndex || relationshipMappingIndex == 0) {
      let curentRelationshipFG = <FormGroup>this.relationShipArray.at(relationshipMappingIndex);
      if (curentRelationshipFG && curentRelationshipFG.invalid) {
        this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types[relationshipMappingIndex] = this.utilService.validateForm(curentRelationshipFG, this.configurationFormValidationMessages.resource_types.relationship_types, this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types[relationshipMappingIndex]);
        curentRelationshipFG.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
          this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types[relationshipMappingIndex] = this.utilService.validateForm(curentRelationshipFG, this.configurationFormValidationMessages.resource_types.relationship_types, this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types[relationshipMappingIndex]);
        });
      } else {
        const relationshipFG = this.builder.group({
          'unity_child_device': ['', [Validators.required]],
          'resource_type': ['', [Validators.required]],
          'relationship_type': ['', [Validators.required]],
          'relationship_name': ['', [Validators.required]],
          'attribute_mapping': this.builder.array([this.builder.group({
            'unity_attr': ['', [Validators.required]],
            'bmc_attr': ['', [Validators.required]],
            'default': [''],
            'inbound': [false]
          })])
        });
        this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types.push(this.svc.getRelationshipTypeErrors());
        this.relationShipArray.push(relationshipFG);
      }
    } else {
      const relationshipFG = this.builder.group({
        'unity_child_device': ['', [Validators.required]],
        'resource_type': ['', [Validators.required]],
        'relationship_type': ['', [Validators.required]],
        'relationship_name': ['', [Validators.required]],
        'attribute_mapping': this.builder.array([this.builder.group({
          'unity_attr': ['', [Validators.required]],
          'bmc_attr': ['', [Validators.required]],
          'default': [''],
          'inbound': [false]
        })])
      });
      console.log('in else resourceTypeIndex : ', resourceTypeIndex);
      console.log('this.configurationFormErrors.resource_types : ', this.configurationFormErrors.resource_types);

      this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types.push(this.svc.getRelationshipTypeErrors());
      this.relationShipArray.push(relationshipFG);
    }
  }

  deleteReltionshipMap(resourceTypeIndex: number, relationShipMappingIndex?: number) {
    this.activeResourceTypeIndex = _clone(resourceTypeIndex);
    if (relationShipMappingIndex || relationShipMappingIndex == 0) {
      if (this.relationShipArray?.length > 1) {
        this.relationShipArray.removeAt(relationShipMappingIndex);
        this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types.splice(relationShipMappingIndex, 1);
      }
    } else {
      for (let k = 0; k < this.relationShipArray?.length; k++) {
        this.relationShipArray.removeAt(k);
        this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types.splice(k, 1);
      }
    }
    this.markConfigurationFormAsDirty();
  }

  onSelectUnityChildDeviceType(resourceTypeIndex: number, relationShipMappingIndex: number) {
    this.activeResourceTypeIndex = _clone(resourceTypeIndex);
    this.activeRelationShipMappingIndex = _clone(relationShipMappingIndex);

    let fg = <FormGroup>this.relationShipArray.at(relationShipMappingIndex);
    if (fg) {
      let selectedUnityChildDeviceType = fg.get('unity_child_device').value;
      (fg.get('attribute_mapping') as FormArray).clear();
      console.log('attr mapping cleared');
      this.addRelationshipAttributeMapping(resourceTypeIndex, relationShipMappingIndex);
    }
    // if (!this.unityChildDeviceList[index]) {
    //   this.unityChildDeviceList[index] = [];
    // }
    // this.unityChildDeviceList[index] = UnityDeviceTypeChildDropdownValues.find(u => u.device == this.resourceTypes?.at(index)?.get('unity_device').value.value)?.childList || [];
    // if (this.resourceTypes?.at(index)?.get('relationship_mapping')) {
    //   this.resourceTypes?.at(index)?.get('relationship_mapping').setValue(false);
    // }
  }

  onSelectBMCHelixChildResource(resourceTypeIndex: number, relationShipMappingIndex: number) {
    this.activeResourceTypeIndex = _clone(resourceTypeIndex);
    this.activeRelationShipMappingIndex = _clone(relationShipMappingIndex);
    let fg = <FormGroup>this.relationShipArray.at(relationShipMappingIndex);
    if (fg) {
      this.getBMCHelixRelationshipTypesByResource(resourceTypeIndex, relationShipMappingIndex);
      const selectedBMCHelixChildResourceType = fg.get('resource_type').value;

      (fg.get('attribute_mapping') as FormArray).clear();
      const isResourceTypeNameExist: boolean = this.resourceTypeNames.includes(selectedBMCHelixChildResourceType.name);
      this.addRelationshipAttributeMapping(resourceTypeIndex, relationShipMappingIndex);
      let instanceId = this.instanceId ? this.instanceId : (this.instanceData ? this.instanceData.uuid : null);
      if (!isResourceTypeNameExist) {
        this.resourceTypeNames.push(selectedBMCHelixChildResourceType.name);
        this.getBMCHelixAttributesByResource(selectedBMCHelixChildResourceType.name);
      }
    }
  }

  onSelectChildBMCHelixAttribute(resourceTypeIndex: number, relationShipMappingIndex: number, relationShipAttrIndex: number) {
    (this.getRelationshipAttributeMapArray(resourceTypeIndex, relationShipMappingIndex)?.at(relationShipAttrIndex) as FormGroup)?.get('default')?.setValue('');
  }

  getBMCHelixRelationshipTypesByResource(resourceTypeIndex: number, relationShipMappingIndex: number, patchValue?: boolean) {
    /*
    * LOADS FOR BOTH `CREATE` and `EDIT`,
    * for `CREATE`, loads on user selection/change of BMCHelix Resource (In Relationship mappings)
    * for `EDIT`, loads
    *    1. before building the form, to load all BMCHelix Relationship Types for each selected BMCHelix resource in all Resource Type Relationship mappings
    *    2. on user selection/change of BMCHelix Resource (In Relationship mappings)
    */
    this.activeResourceTypeIndex = resourceTypeIndex;
    let fg = <FormGroup>this.resourceTypes.at(resourceTypeIndex);
    if (!fg) {
      return;
    }
    let instanceId = this.instanceId ? this.instanceId : this.instanceData ? this.instanceData.uuid : null;
    if (instanceId) {
      let parentBMCResource = fg.get('resource_type')?.value;
      let childBMCResource = this.relationShipArray?.at(relationShipMappingIndex)?.get('resource_type')?.value;
      if (parentBMCResource && childBMCResource) {
        let source = `${parentBMCResource.namespace}:${parentBMCResource.name}`;
        let target = `${childBMCResource.namespace}:${childBMCResource.name}`;
        let relationshipsByName = `${source}&${target}`;
        let relationshipsByOrder = `${resourceTypeIndex}${relationShipMappingIndex}`;
        if (this.bmcHelixRelationshipTypesByName[relationshipsByName]) {
          this.bmcHelixRelationshipTypesByOrder[relationshipsByOrder] = <BMCHelixRelationshipType[]>this.bmcHelixRelationshipTypesByName[relationshipsByName];
          if (patchValue) {
            let valFromObj = this.instanceData.config_resources?.resource_types[resourceTypeIndex]?.relationship_types[relationShipMappingIndex]?.relationship_type;
            let patchObj = this.bmcHelixRelationshipTypesByOrder[relationshipsByOrder]?.find(rst => rst.name == valFromObj.name);
            if (patchObj) {
              let fg = this.getRelationshipTypeArray(resourceTypeIndex)?.at(relationShipMappingIndex);
              if (fg) {
                fg?.get('relationship_type')?.patchValue(patchObj);
              }
            }
          }
        } else {
          this.svc.getBMCHelixRelationshipTypes(instanceId, source, target).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
            this.bmcHelixRelationshipTypesByName[relationshipsByName] = res;
            this.bmcHelixRelationshipTypesByOrder[relationshipsByOrder] = res;
            if (patchValue) {
              let valFromObj = this.instanceData.config_resources?.resource_types[resourceTypeIndex]?.relationship_types[relationShipMappingIndex]?.relationship_type;
              let patchObj = this.bmcHelixRelationshipTypesByOrder[relationshipsByOrder]?.find(rst => rst.name == valFromObj.name);
              if (patchObj) {
                let fg = this.getRelationshipTypeArray(resourceTypeIndex)?.at(relationShipMappingIndex);
                if (fg) {
                  fg?.get('relationship_type')?.patchValue(patchObj);
                }
              }
            }
          }, err => {
          })
        }
      }
    }
  }

  addRelationshipAttributeMapping(resourceTypeIndex: number, relationShipMappingIndex: number, relationShipAttrIndex?: number) {
    this.activeResourceTypeIndex = _clone(resourceTypeIndex);
    this.activeRelationShipMappingIndex = _clone(relationShipMappingIndex);

    if (relationShipAttrIndex || relationShipAttrIndex == 0) {
      let curentRelationShipAttrFG = <FormGroup>this.relationShipAttributeArray.at(relationShipAttrIndex);
      if (curentRelationShipAttrFG && curentRelationShipAttrFG.invalid) {
        this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types[relationShipMappingIndex].attribute_mapping
          = this.utilService.validateForm(curentRelationShipAttrFG, this.configurationFormValidationMessages.resource_types.relationship_types.attribute_mapping, this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types[relationShipMappingIndex].attribute_mapping);
        curentRelationShipAttrFG.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
          this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types[relationShipMappingIndex]
            = this.utilService.validateForm(curentRelationShipAttrFG, this.configurationFormValidationMessages.resource_types.relationship_types, this.configurationFormErrors.resource_types[resourceTypeIndex].relationship_types[relationShipMappingIndex].attribute_mapping);
        });
      } else {
        const attrFG = this.builder.group({
          'unity_attr': ['', [Validators.required]],
          'bmc_attr': ['', [Validators.required]],
          'default': [''],
          'inbound': [false]
        });
        this.configurationFormErrors.resource_types[resourceTypeIndex]?.relationship_types[relationShipMappingIndex]?.attribute_mapping?.push(this.svc.getAttributeMappingErrors());
        this.relationShipAttributeArray?.push(attrFG);
        this.relationShipArray.at(relationShipMappingIndex)?.updateValueAndValidity();
      }
    } else {
      const attrFG = this.builder.group({
        'unity_attr': ['', [Validators.required]],
        'bmc_attr': ['', [Validators.required]],
        'default': [''],
        'inbound': [false]
      });
      this.configurationFormErrors.resource_types[resourceTypeIndex]?.relationship_types[relationShipMappingIndex]?.attribute_mapping?.push(this.svc.getAttributeMappingErrors());
      this.relationShipAttributeArray.push(attrFG);
    }
    this.markConfigurationFormAsDirty();
    // this.markConfigurationFormAsDirty();
    // let index = isPrevAmIndex ? amIndex + 1 : amIndex;
    // (this.getRelationshipAttributeMapArray(rtIndex, rmIndex).at(index) as FormGroup).get('bmc_attr')?.valueChanges.pipe(
    //   takeUntil(this.ngUnsubscribe)).subscribe(res => {
    //     // index = isPrevAmIndex ? amIndex + 1 : amIndex;
    //     console.log('index', index);
    //     (this.getRelationshipAttributeMapArray(rtIndex, rmIndex).at(index) as FormGroup).get('default').setValue('');
    //   });
  }

  removeRelationshipAttributeMapping(resourceTypeIndex: number, relationShipMappingIndex: number, relationShipAttrIndex?: number) {
    this.activeResourceTypeIndex = _clone(resourceTypeIndex);
    this.activeRelationShipMappingIndex = _clone(relationShipMappingIndex);
    if (relationShipAttrIndex || relationShipAttrIndex == 0) {
      if (this.relationShipAttributeArray.length > 1) {
        this.relationShipAttributeArray?.removeAt(relationShipAttrIndex);
        this.configurationFormErrors.resource_types[resourceTypeIndex]?.relationship_types[relationShipMappingIndex]?.attribute_mapping?.splice(relationShipAttrIndex, 1);
      }
    } else {
      for (let l = 0; l < this.relationShipAttributeArray.length; l++) {
        this.relationShipAttributeArray?.removeAt(l);
        this.configurationFormErrors.resource_types[resourceTypeIndex]?.relationship_types[relationShipMappingIndex]?.attribute_mapping.splice(l, 1);
      }
    }
    this.markConfigurationFormAsDirty();
  }

  onSubmitConfigurationForm() {
    if (this.configurationForm.invalid) {
      this.configurationFormErrors = this.utilService.validateForm(this.configurationForm, this.configurationFormValidationMessages, this.configurationFormErrors);
      this.configurationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.configurationFormErrors = this.utilService.validateForm(this.configurationForm, this.configurationFormValidationMessages, this.configurationFormErrors);
      });
    } else {
      this.spinner.start('main');
      const instanceId = this.instanceId ? this.instanceId : this.instanceData ? this.instanceData.uuid : null;
      this.svc.saveConfigurationForm(this.configurationForm.getRawValue(), this.instanceData, instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
        const msg = this.instanceData.config_resources ? 'updated' : 'added';
        this.notification.success(new Notification(`BMC Helix account configuration ${msg} successfully.`));
        this.spinner.stop('main');
        this.onSubmit.emit();
      }, (err: HttpErrorResponse) => {
        this.handleConfigFormErrors(err.error);
      });
    }
  }

  handleConfigFormErrors(err: any) {
    this.configurationFormErrors = this.svc.resetConfigurationFormErrors();
    this.onAttrubuteAdd = true;
    for (let index = 0; index < this.resourceTypes.length; index++) {
      this.resourceTypesLength = index;
      if (index < this.resourceTypes?.length - 1) {
        this.configurationFormErrors.resource_types?.push(this.svc.getResourceTypeErrors());
      }
      for (let i = 0; i < this.attributeArray?.length - 1; i++) {
        this.resourceTypesLength = index;
        this.onAttrubuteAdd = true;
        this.configurationFormErrors.resource_types[index]?.attribute_mapping?.push(this.svc.getAttributeMappingErrors());
      }
    }

    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.configurationForm.controls) {
          this.configurationFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  goBack() {
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
















  addResourceType() {
    this.onAttrubuteAdd = false;
    const index = this.resourceTypes?.length - 1;
    let formGroup = <FormGroup>this.resourceTypes?.at(this.resourceTypes?.length - 1);
    let attrFormGroup = <FormGroup>this.attributeArray?.at(this.attributeArray?.length - 1);
    if (formGroup.invalid) {
      this.configurationFormErrors.resource_types[index] = this.utilService.validateForm(formGroup, this.configurationFormValidationMessages.resource_types, this.configurationFormErrors.resource_types[index]);
      formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.configurationFormErrors.resource_types[index] = this.utilService.validateForm(formGroup, this.configurationFormValidationMessages.resource_types, this.configurationFormErrors.resource_types[index]);
      });
    } else if (attrFormGroup.invalid) {
      this.configurationFormErrors.resource_types[this.resourceTypes.length - 1].attribute_mapping[this.attributeArray.length - 1] = this.utilService.validateForm(attrFormGroup, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[this.resourceTypes.length - 1].attribute_mapping[this.attributeArray.length - 1]);
      attrFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.configurationFormErrors.resource_types[this.resourceTypes.length - 1].attribute_mapping[this.attributeArray.length - 1] = this.utilService.validateForm(attrFormGroup, this.configurationFormValidationMessages.resource_types.attribute_mapping, this.configurationFormErrors.resource_types[this.resourceTypes.length - 1].attribute_mapping[this.attributeArray.length - 1]);
      });
    } else {
      const newResourceTypeForm = this.builder.group({
        'unity_device': ['', [Validators.required]],
        'resource_type': ['', [Validators.required]],
        'relationship_mapping': [false],
        'attribute_mapping': this.builder.array([
          this.builder.group({
            'unity_attr': ['', [Validators.required]],
            'bmc_attr': ['', [Validators.required]],
            'default': [''],
            'inbound': [false]
          })
        ])
      });
      const formArray = this.configurationForm.get('resource_types') as FormArray;
      this.configurationFormErrors.resource_types?.push(this.svc.getResourceTypeErrors());
      formArray.push(newResourceTypeForm);
      this.sectionOpenStates?.push(false);
      const rtIndex = this.resourceTypes.length - 1;
      this.resourceTypes?.at(rtIndex)?.get('relationship_mapping')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        if (val) {
          this.configurationFormErrors.resource_types[rtIndex]?.relationship_types?.push(this.svc.getRelationshipTypeErrors());
          (this.resourceTypes.at(rtIndex) as FormGroup).addControl('relationship_types', new FormArray([this.builder.group({
            'unity_child_device': ['', [Validators.required]],
            'resource_type': ['', [Validators.required]],
            'relationship_type': ['', [Validators.required]],
            'relationship_name': ['', [Validators.required]],
            'attribute_mapping': this.builder.array([this.builder.group({
              'unity_attr': ['', [Validators.required]],
              'bmc_attr': ['', [Validators.required]],
              'default': [''],
            })])
          })]));
          (((this.resourceTypes.at(rtIndex) as FormGroup).get('relationship_types') as FormArray).at(0) as FormGroup)
            .get('unity_child_device')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
              this.getRelationshipAttributeMapArray(rtIndex, 0).clear();
              this.configurationFormErrors.resource_types[rtIndex].relationship_types[0].attribute_mapping = [];
              this.addRelationshipAttributeMapping(rtIndex, 0, 0);
            });
          (((this.resourceTypes.at(rtIndex) as FormGroup).get('relationship_types') as FormArray).at(0) as FormGroup)
            .get('resource_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
              const isResourceTypeNameExist: boolean = this.resourceTypeNames?.includes(res.name);
              this.getRelationshipAttributeMapArray(rtIndex, 0).clear();
              this.configurationFormErrors.resource_types[rtIndex].relationship_types[0].attribute_mapping = [];
              this.addRelationshipAttributeMapping(rtIndex, 0, 0);
              if (!isResourceTypeNameExist) {
                this.resourceTypeNames.push(res.name);
                this.svc.getBMCHelixAttributesByResource(this.instanceData.uuid, res).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
                  this.spinner.stop('main');
                }, err => {
                  this.spinner.stop('main');
                });
              }
            });
          // (this.getRelationshipAttributeMapArray(rtIndex, 0).at(0) as FormGroup).get('bmc_attr').valueChanges.pipe(
          //   takeUntil(this.ngUnsubscribe)).subscribe(res => {
          //     (this.getRelationshipAttributeMapArray(rtIndex, 0).at(0) as FormGroup).get('default').setValue('');
          //   });
        } else {
          (this.resourceTypes.at(rtIndex) as FormGroup)?.removeControl('relationship_types');
          this.configurationFormErrors.resource_types[rtIndex].relationship_types = [];
        }
      });
      this.markConfigurationFormAsDirty();
    }
  }

  deleteResourceType(index: number) {
    const formArray = this.configurationForm.get('resource_types') as FormArray;
    if (index >= 0 && index < formArray.length) {
      if (formArray.length > 1) {
        this.deleteCloudResourceNameData(index);
        formArray?.removeAt(index);
        this.sectionOpenStates?.splice(index, 1);
      }
    }
    this.configurationFormErrors.resource_types?.splice(index, 1);
    this.markConfigurationFormAsDirty();
  }


  markConfigurationFormAsDirty() {
    this.configurationForm.markAsDirty(); //For quick fix
  }


  deleteCloudResourceNameData(index: number) {
    let unityDeviceValue: string = this.resourceTypes?.at(index)?.get('unity_device')?.value?.value;
    if (unityDeviceValue == 'aws_resource' || unityDeviceValue == 'azure_resource') {
      this.awsResourceMapping?.splice(index, 1);
      this.azureResourceMapping?.splice(index, 1);
    } else {
      if (this.awsResourceMapping[index] == null) {
        this.awsResourceMapping?.splice(index, 1);
      } else {
        if (!(index in this.awsResourceMapping)) {
          this.awsResourceMapping?.splice(index, 1);
        }
      }
      if (this.azureResourceMapping[index] == null) {
        this.azureResourceMapping?.splice(index, 1);
      } else {
        if (!(index in this.azureResourceMapping)) {
          this.azureResourceMapping?.splice(index, 1);
        }
      }
    }
  }



}
