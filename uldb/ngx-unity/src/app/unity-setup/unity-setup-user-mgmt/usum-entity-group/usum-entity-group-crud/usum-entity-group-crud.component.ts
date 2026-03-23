import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { IPageInfo } from 'ngx-virtual-scroller';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UsumEntityGroupCrudService } from './usum-entity-group-crud.service';
import { EntityGroupDataType, GroupObjectsDataType, ModuleModelsDataType } from '../usum-entity-group.type';

@Component({
  selector: 'usum-entity-group-crud',
  templateUrl: './usum-entity-group-crud.component.html',
  styleUrls: ['./usum-entity-group-crud.component.scss'],
  providers: [UsumEntityGroupCrudService]
})
export class UsumEntityGroupCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  action: 'Create' | 'Update';
  entityGroupId: string;

  viewData: EntityGroupDataType;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string;

  entityTypes: ModuleModelsDataType[];
  entityTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    // keyToSelect: "content_type_id",
    enableSearch: true,
    selectAsObject: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 4,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
    mandatoryLimit: 1,
  };
  entityTypeSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select entity Type',
    checkedPlural: 'entity types selected'
  };
  entityResourcesCriteria: SearchCriteria;

  entityResourcesCount: number = 0;
  entityResources: GroupObjectsDataType[] = [];
  entityResourcesToBeSelected: GroupObjectsDataType[] = [];
  entityResourcesToBeRemoved: GroupObjectsDataType[] = [];
  selectedEntityResources: GroupObjectsDataType[] = [];
  entityResourcesLoading: boolean = false;

  constructor(private svc: UsumEntityGroupCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.entityGroupId = params.get('groupId');
      this.action = this.entityGroupId ? 'Update' : 'Create';
    });
    this.entityResourcesCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { entity: [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getEntityTypes();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getEntityTypes(){
    this.svc.getEntityTypes().subscribe((res: ModuleModelsDataType[]) => {
      this.entityTypes = res;
      if (this.entityGroupId) {
        this.getEntityGroupDetailsById();
      } else {
        this.buildForm();
      }
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(err.error.error));
    })
  }

  getEntityGroupDetailsById() {
    this.svc.getEntityGroupDetailsById(this.entityGroupId).subscribe((res: EntityGroupDataType) => {
      this.viewData = res;
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(err.error.error));
    })
  }

  buildForm() {
    this.form = this.svc.buildForm(this.viewData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    if (this.entityGroupId) {
      let entityArr = (<ModuleModelsDataType[]>this.form.get('module_models').value).map(c => c.name);
      this.form.get('module_models').setValue(this.entityTypes?.filter(i => entityArr.includes(i.name)));
    }
    if(this.form.get('entity_selection')?.value == 'custom'){
      this.getResourcesByEntityTypes();
      this.selectedEntityResources = this.form.get('group_objects')?.value;
    }
    this.subscribeToFormChanges();
    this.spinner.stop('main');
  }

  subscribeToFormChanges() {
    this.form.get('module_models')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: []) => {
      if (val?.length > 0) {
        this.getResourcesByEntityTypes();
      }
    });
    this.form.get('entity_selection')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'custom') {
        this.getResourcesByEntityTypes();
        this.form.addControl('group_objects', new FormControl([], [Validators.required]));
      }
      else {
        this.form.removeControl('group_objects');
      }
    });
  }

  getResourcesByEntityTypes() {
    let entity_types = (<ModuleModelsDataType[]>this.form.get('module_models').value).map(c => c.content_type_id);
    if (entity_types?.length > 0) {
      this.spinner.start('entityResourcesList');
      this.entityResources = [];
      this.entityResourcesCount = 0;
      this.entityResourcesLoading = true;
      this.entityResourcesCriteria.pageNo = 1;
      this.entityResourcesCriteria.pageSize = 10;
      this.entityResourcesCriteria.multiValueParam.entity = entity_types;
      this.svc.getResourcesByEntityTypes(this.entityResourcesCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.entityResourcesCount = res.count;
        this.entityResources = res.results;
        this.entityResourcesLoading = false;
        this.spinner.stop('entityResourcesList');
      }, (err: HttpErrorResponse) => {
        this.entityResourcesLoading = false;
        this.spinner.stop('entityResourcesList');
      });
    }
  }

  onResourceSearched(event: string) {
    this.entityResourcesCriteria.searchValue = event;
    this.entityResourcesCriteria.pageNo = 1;
    this.getResourcesByEntityTypes();
  }

  isResourceInSelectedList(Resource: GroupObjectsDataType) {
    let d = this.selectedEntityResources.find(sd => sd.uuid == Resource.uuid);
    if (d) {
      return true;
    }
    return false;
  }

  onClickToSelectResource(Resource: GroupObjectsDataType) {
    if (this.entityResourcesToBeSelected.length) {
      let ResourceExistsInIndex = this.entityResourcesToBeSelected.findIndex(d => d.uuid == Resource.uuid);
      if (ResourceExistsInIndex == -1) {
        this.entityResourcesToBeSelected.push(_clone(Resource));
      } else {
        this.entityResourcesToBeSelected.splice(ResourceExistsInIndex, 1);
      }
    } else {
      this.entityResourcesToBeSelected.push(_clone(Resource));
    }
  }

  entityResourcesSelectedClass(Resource: GroupObjectsDataType) {
    if (!this.entityResourcesToBeSelected.length && !this.selectedEntityResources.length) {
      return `far fa-square`;
    }
    for (let i = 0; i < this.entityResourcesToBeSelected.length; i++) {
      let d = this.entityResourcesToBeSelected.find(dtbs => dtbs.uuid == Resource.uuid);
      if (d) {
        return "fas fa-check-square";
      }
    }
    for (let i = 0; i < this.selectedEntityResources.length; i++) {
      let d = this.selectedEntityResources.find(sd => sd.uuid == Resource.uuid);
      if (d) {
        return "fas fa-check-square";
      }
    }
    return "far fa-square";
  }

  addToSelectedResources() {
    if (this.selectedEntityResources.length) {
      for (let i = 0; i < this.entityResourcesToBeSelected.length; i++) {
        let ResourceExistsInIndex = this.selectedEntityResources.findIndex(sd => sd.uuid == this.entityResourcesToBeSelected[i].uuid);
        if (ResourceExistsInIndex == -1) {
          this.selectedEntityResources.push(_clone(this.entityResourcesToBeSelected[i]));
        }
      }
    } else {
      this.selectedEntityResources = this.selectedEntityResources.concat(this.entityResourcesToBeSelected);
    }
    this.entityResourcesToBeSelected = [];
  }

  removeResourceFromSelection(Resource: GroupObjectsDataType) {
    if (Resource.toBeRemoved) {
      let ResourceIndex = this.entityResourcesToBeRemoved.findIndex(d => d.uuid == Resource.uuid);
      if (ResourceIndex != -1) {
        this.entityResourcesToBeRemoved.splice(ResourceIndex, 1);
      }
      Resource.toBeRemoved = false;
    } else {
      Resource.toBeRemoved = true;
      this.entityResourcesToBeRemoved.push(_clone(Resource));
    }
  }

  removeFromSelectedResources() {
    this.selectedEntityResources = this.selectedEntityResources.filter(sd => !sd.toBeRemoved);
    this.entityResourcesToBeRemoved = [];
  }

  onSelectedSearch(event: string) { }

  fetchMoreResources(event: IPageInfo) {
    let returnCondition = !this.entityResources.length || this.entityResourcesLoading ||
      this.entityResourcesCount <= this.entityResources.length ||
      (this.entityResources.length % this.entityResourcesCriteria.pageSize) != 0 ||
      event.endIndex != (this.entityResources.length - 1);

    if (returnCondition) {
      return;
    }

    this.entityResourcesLoading = true;
    this.entityResourcesCriteria.pageNo = Math.ceil(this.entityResources.length / this.entityResourcesCriteria.pageSize + 1);
    this.svc.getResourcesByEntityTypes(this.entityResourcesCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.entityResourcesCount = res.count;
      this.entityResources = this.entityResources.concat(res.results);
      this.entityResourcesLoading = false;
    }, (err: HttpErrorResponse) => {
      this.entityResourcesLoading = false;
    })
  }

  manageSelectedResources() {
    if (this.selectedEntityResources && this.form.get('group_objects')) {
      this.form.get('group_objects').setValue(this.selectedEntityResources);
    }
  }

  submitEntityGroupForm() {
    this.manageSelectedResources();
    if (this.form.invalid) {
      this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilSvc.validateForm(this.form, this.formValidationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      if (this.entityGroupId) {
        let obj = Object.assign({}, this.form.getRawValue());
        this.svc.create(obj, this.entityGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('Entity Group updated successfully.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      } else {
        let obj = Object.assign({}, this.form.getRawValue());
        this.svc.create(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.goBack();
          this.notification.success(new Notification('Entity Group added successfully.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
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
    if (this.entityGroupId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
