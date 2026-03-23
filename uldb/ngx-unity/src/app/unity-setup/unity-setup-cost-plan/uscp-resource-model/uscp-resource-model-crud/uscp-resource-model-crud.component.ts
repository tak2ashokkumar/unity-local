import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { UscpResourceModelCrudService, CostPlans, PriceUnits, StorageUnits, CostModelDropdownData, PlanTypes } from './uscp-resource-model-crud.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { cloneDeep as _clone } from 'lodash-es';
import { CloudTypesItem, CostPlansListType, UscpResourceModelDataType } from '../uscp-resource-model.type';
import { UscpCostModelService } from '../../uscp-cost-model/uscp-cost-model.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'uscp-resource-model-crud',
  templateUrl: './uscp-resource-model-crud.component.html',
  styleUrls: ['./uscp-resource-model-crud.component.scss'],
  providers: [UscpResourceModelCrudService, UscpCostModelService]
})

export class UscpResourceModelCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  action: 'Create' | 'Update';
  resourceId: string;
  resourceData: UscpResourceModelDataType;
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  // planNames: string[] = ['CPU Only', 'Memory Only', 'Disk Only', 'CPU and Memory'];
  planCounts: Record<string, number> = null;

  modalRef: BsModalRef;
  @ViewChild('confirmUpdate') confirmUpdate: ElementRef;

  cloudTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    // keyToSelect: 'cloud',
    lableToDisplay: 'cloud',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
    appendToBody: true,
    mandatoryLimit: 1,
  };

  cloudTypeSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'cloud',
    checkedPlural: 'clouds',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select Clouds',
    allSelected: 'All Clouds',
  };

  @ViewChild('cusdropdown') cusDropdown: ElementRef;
  @HostListener('document: click', ['$event.target'])
  onClick(target: HTMLElement) {
    if (!this.dropdownOpen) return;
    if (this.cusDropdown.nativeElement.contains(target)) {
      this.dropdownOpen = true;
    }
    else {
      this.dropdownOpen = false;
    }
  }

  cloudTypeList: CloudTypesItem[] = [];
  storageUnitList: string[] = StorageUnits;
  costPlanTypes: string[] = CostPlans;
  costModelList: CostModelDropdownData[] = [];
  costModelSrc: CostModelDropdownData[] = [];
  priceUnitList: string[] = PriceUnits;

  searchValue: string = '';
  fieldsToFilterOn: string[] = ['planName', 'priceUnit', 'unitCostPrice'];
  selectedCostModel: CostModelDropdownData[] = [];
  costModelOptions: CostModelDropdownData[] = [];
  dropdownOpen: boolean = false;

  regionData: string[] = [];
  datacenterList: string[] = [];
  regionSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  userSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select',
  };

  customHintMsg = "This will allow to customise the value during provisioning"

  constructor(private crudSvc: UscpResourceModelCrudService,
    private uscpCostModelService: UscpCostModelService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private modalService: BsModalService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.resourceId = params.get('resourceId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getCostModelLists();
    this.initializePlanCounts();
    this.getPrivateClouds();
    this.getRegions();
    if (this.resourceId) {
      this.action = 'Update';
      // this.getResourceDetails();
    } else {
      this.action = 'Create';
      this.buildForm();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  initializePlanCounts(): void {
    const defaultPlanTypes = PlanTypes || [];
    this.planCounts = defaultPlanTypes.reduce((acc, planType) => {
      acc[planType] = 0;
      return acc;
    }, {});
  }

  getPrivateClouds() {
    this.crudSvc.getPrivateClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cloudTypeList = this.crudSvc.convertCloudData(res);
    }, err => {
      this.notification.error(new Notification("Failed to get private clouds"));
    });
  }

  getRegions() {
    this.uscpCostModelService.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.regionData = this.uscpCostModelService.convertRegionData(data);
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Regions'));
    });
  }

  onPlanTypeChange(event: Event): void {

    Object.keys(this.planCounts).forEach((key) => {
      this.planCounts[key] = 0;
    });

  }

  getCostModelLists() {
    this.crudSvc.getCostModelListData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costModelSrc = this.crudSvc.convertList(res);
      if (this.resourceId) {
        // this.action = 'Update';
        this.getResourceDetails();
      }
      this.manageCostModelList();
    }, err => {
      this.notification.error(new Notification("Failed to get cost model dropdown data"));
    });
  }

  getResourceDetails() {
    this.crudSvc.getResourceDetails(this.resourceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resourceData = res;
      let x = this.filterByCostPlanUUID(this.extractCostPlanUUIDs(res))
      const planTypes = x?.map(plan => plan.planType);
      this.planCounts = this.crudSvc.validateSelectedPlans(planTypes)
      this.buildForm();
    }, err => {
      this.notification.error(new Notification("Failed to get resource data"));
      this.spinner.stop('main');
    });
  }

  extractCostPlanUUIDs(data: any): string[] {
    if (data?.cost_plans_list && Array.isArray(data.cost_plans_list)) {
      return data.cost_plans_list.map(plan => plan.cost_plan);
    }
    return [];
  }

  filterByCostPlanUUID(uuids: string[]): any[] | null {
    if (!Array.isArray(uuids) || uuids.length === 0) {
      return null;
    }
    let filteredPlans = [];
    if (this.costModelSrc) {
      filteredPlans = this.costModelSrc.filter(plan => uuids.includes(plan.uuid));
    }

    return filteredPlans.length > 0 ? filteredPlans : null;
  }


  buildForm() {
    this.spinner.stop('main');
    this.form = this.crudSvc.buildForm(this.resourceData);
    this.formErrors = this.crudSvc.resetformErrors();
    this.validationMessages = this.crudSvc.validationMessages;
    if (this.resourceId) {
      let clouds = (<CloudTypesItem[]>this.form.get('cloud_types').value).map(c => c.cloud);
      this.form.get('cloud_types').setValue(this.cloudTypeList.filter(cList => clouds.includes(cList.cloud)));
      // let costPlans = (<CostPlansListType[]>this.form.get('cost_plans_list').value).map(c => c.cost_plan);
      // this.selectedCostModel = this.costModelSrc.filter(d => costPlans.includes(d.uuid));
      // this.form.get('cost_plans_list').setValue(this.crudSvc.fomatCostModelData(this.selectedCostModel));
    }
    this.manageCostModelList();
    this.handleSubscriptions(this.form);
  }

  manageCostModelList() {
    let region = this.form?.get('regions')?.value;
    let diskType = this.form?.get('disk_type')?.value;
    let costType = this.form?.get('cost_type')?.value;
    //Need to refactor it with enums
    if (region && costType == 'All At One Price') {
      this.costModelOptions = this.costModelSrc.filter(i => i.planType == 'All At One Price' && region.some((region: string) => i.region.includes(region)));
    }
    if (region && costType == 'Resource Model') {
      this.costModelOptions = this.costModelSrc.filter(i => i.planType != 'All At One Price' && region.some((region: string) => i.region.includes(region)));

    }
    if (diskType) {
      this.costModelOptions = this.costModelOptions.filter(i => {
        if (i.planType == 'All At One Price' || i.planType == 'Disk Only') { return i.diskType == diskType }
        else { return true };
      });

    }
    this.costModelList = _clone(this.costModelOptions);

    if (this.resourceId && this.form) {
      let costPlans = (<CostPlansListType[]>this.form.get('cost_plans_list').value).map(c => c.cost_plan);
      this.selectedCostModel = this.costModelSrc.filter(d => costPlans.includes(d.uuid));
      this.form.get('cost_plans_list').setValue(this.crudSvc.fomatCostModelData(this.selectedCostModel));
    }

  }

  resetCostPlan(val: string) {
    if (val) {
      this.form.get('cost_plans_list').setValue([]);
      this.selectedCostModel = [];
      this.manageCostModelList();
    }
  }

  handleSubscriptions(form: FormGroup) {
    form.get('regions').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.resetCostPlan(val);
    })
    form.get('disk_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.resetCostPlan(val);
    })
    form.get('cost_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.resetCostPlan(val);
    })
  }

  getDatacenters(val: string[]) {
    this.spinner.start('main');
    this.crudSvc.getDatacenters(val).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenterList = this.crudSvc.getAllDatacenters(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get cost model.'));
      this.spinner.stop('main');
    })
  }

  onRegionChange() {
    const region = this.form.get('regions').value;
    if (!region?.length) {
      this.form.get('datacenters').disable();
    }
    else {
      this.getDatacenters(region);
      this.resetCostPlan(region);
      this.form.get('datacenters').enable();
    }
  }

  onSearched(event: string) {
    this.searchValue = event;
    this.costModelOptions = [];
    this.costModelOptions = this.clientSideSearchPipe.transform(this.costModelList, event, this.fieldsToFilterOn);
  }

  toggleDropdown(event: Event) {
    this.dropdownOpen = !this.dropdownOpen;
    event.stopPropagation();
  }

  isSelected(costModel: any): boolean {
    return this.selectedCostModel.some(
      selected => selected.uuid == costModel.uuid
    );
  }

  toggleSelection(costModel: any, event: MouseEvent) {
    event.stopPropagation();
    if (!costModel) {
      return;
    }

    const idx = this.selectedCostModel.findIndex(
      selected => selected.uuid == costModel.uuid
    );
    if (idx != -1) {
      this.selectedCostModel.splice(idx, 1);
    } else {
      this.selectedCostModel.push(costModel);
    }

    const planTypes = this.filterPlanTypes();

    this.planCounts = this.crudSvc.validateSelectedPlans(planTypes)
    this.form.get('cost_plans_list').setValue(this.crudSvc.fomatCostModelData(this.selectedCostModel));
  }

  filterPlanTypes = (): string[] => {
    return this.selectedCostModel.map(costModel => costModel.planType);
  };

  getSelectedText(): string {
    if (this.selectedCostModel.length == 0) {
      return 'Select Model';
    } else if (this.selectedCostModel.length == 1) {
      return this.selectedCostModel[0].planName;
    } else {
      return `${this.selectedCostModel.length} selected`;
    }
  }

  handleError(err: any) {
    this.formErrors = this.crudSvc.resetformErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.msg) {
      this.nonFieldErr = err.msg;
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  goBack() {
    if (this.resourceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  onEditSubmit() {
    this.modalRef.hide();
    this.spinner.start('main');
    if (!this.checkCpValidity()) {
      this.notification.error(new Notification('Multiple Cost Plans of the same Plan type are selected. Please select one.'));
      return;
    }
    this.crudSvc.update(this.form.getRawValue(), this.resourceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.notification.success(new Notification('Resource model updated successfully.'));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.handleError(err.error);
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        });
    } else {
      if (!this.checkCpValidity()) {
        this.notification.error(new Notification('Multiple Cost Plans of the same Plan type are selected. Please select one.'));
        return;
      }
      if (this.resourceId) {
        this.modalRef = this.modalService.show(this.confirmUpdate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
      } else {
        this.spinner.start('main');
        this.crudSvc.add(this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.notification.success(new Notification('Resource model created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
    }
  }

  checkCpValidity(): boolean {
    return Object.values(this.planCounts).every(count => count < 2);
  }

}