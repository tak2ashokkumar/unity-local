import { Component, OnDestroy, OnInit } from '@angular/core';
import { PrivateCloudListItemViewData, UscpResourcePvtcloudMappingCrudService } from './uscp-resource-pvtcloud-mapping-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormGroup } from '@angular/forms';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { HttpErrorResponse } from '@angular/common/http';
import { UscpResourceModelDataType } from '../../uscp-resource-model/uscp-resource-model.type';

@Component({
  selector: 'uscp-resource-pvtcloud-mapping-crud',
  templateUrl: './uscp-resource-pvtcloud-mapping-crud.component.html',
  styleUrls: ['./uscp-resource-pvtcloud-mapping-crud.component.scss'],
  providers: [UscpResourcePvtcloudMappingCrudService]
})
export class UscpResourcePvtcloudMappingCrudComponent implements OnInit, OnDestroy {
  resourceId: string;
  private ngUnsubscribe = new Subject();
  resourceData: UscpResourceModelDataType;
  cloudType: string;
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  pvtCloudAccountList: string[];
  resourceName: string;

  cloudTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    keyToSelect: 'uuid',
    lableToDisplay: 'name',
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
  selectedPvClouds: any;


  constructor(private svc: UscpResourcePvtcloudMappingCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.resourceId = params.get('resourceId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getResourceModel();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getResourceModel() {
    this.svc.getResourceDetails(this.resourceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resourceData = res;
      this.resourceName = res.resource_name
      this.cloudType = res.cloud_type;
      this.buildForm();
      this.getPvtCloudAccounts();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification("Failed to get resource data"));
      this.spinner.stop('main');
    });
  }

  getPvtCloudAccounts() {
    this.svc.getPvtCloudAccounts(this.resourceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.data.length) {
        this.pvtCloudAccountList = res.data;
      } else {
        this.notification.error(new Notification("Private Cloud Accounts not available. "));
        this.spinner.stop('main');
      }
    }, err => {
      this.notification.error(new Notification("Private Cloud Accounts not available. "));
      this.spinner.stop('main');
    });
  }


  buildForm() {
    this.selectedPvClouds = []
    this.spinner.stop('main');
    this.form = this.svc.buildForm(this.resourceData, this.resourceId);
    this.formErrors = this.svc.resetformErrors();
    this.validationMessages = this.svc.validationMessages;
  }

  selectPvtAcc() {
    const obj = this.form.get('private_cloud_list').value;
    this.selectedPvClouds = obj.map((item: any) => item.name);
  }


  unSelectPvtAcc(i: number) {
    this.form.get('private_cloud_list').value.splice(i, 1);
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetformErrors();
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
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
        });
    } else {
      this.spinner.start('main');

      const formData = this.form.getRawValue();
      const payload = this.buildPayload(formData);

      this.svc.add(payload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.notification.success(new Notification('Private cloud assigned successfully.'));
        this.goBack();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.handleError(err.error);
      });
    }
  }



  private buildPayload(formData: any) {
    return {
      resource: formData.resource,
      is_active: formData.is_active,
      private_cloud_list: formData.private_cloud_list.map((item: any) => ({
        private_cloud: item.uuid
      }))
    };
  }
}
