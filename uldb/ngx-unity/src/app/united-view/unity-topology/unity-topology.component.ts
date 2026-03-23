import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { clone as _clone } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AzureAccount } from 'src/app/shared/SharedEntityTypes/azure.type';
import { UnityTopologyService, UnityTopologyViewType, viewTypes } from './unity-topology.service';
import { OCIAccount } from 'src/app/shared/SharedEntityTypes/oci.type';
import { GCPAccountType } from 'src/app/shared/SharedEntityTypes/gcp.type';
import { AppSpinnerComponent } from 'src/app/shared/app-spinner/app-spinner.component';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Firewall } from 'src/app/united-cloud/shared/entities/firewall.type';
import { Switch } from 'src/app/united-cloud/shared/entities/switch.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UnityBorderDevices } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';


@Component({
  selector: 'unity-topology',
  templateUrl: './unity-topology.component.html',
  styleUrls: ['./unity-topology.component.scss'],
  providers: [UnityTopologyService]
})
export class UnityTopologyComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  borderDevicesForm: FormGroup;
  upadtedBorderDevices: UnityBorderDevices[] = [];

  viewTypes: UnityTopologyViewType[] = [];
  selectedViewType: UnityTopologyViewType;
  azureAccounts: AzureAccount[] = [];
  ociAccounts: OCIAccount[] = [];
  gcpAccounts: GCPAccountType[] = [];

  accounts = [];


  isCompleteNetwork: boolean;
  selectedActiveNodes: any[] = [];

  borderDevices: UnityBorderDevices[] = [];
  showMulitselect: boolean = false;

  borderDevicesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    selectAsObject: true,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All selected',
  };

  constructor(private svc: UnityTopologyService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
  }

  ngOnInit(): void {
    this.viewTypes = _clone(viewTypes);
    this.buildForm();
  }

  receiveMultiselectValue(event: { show: boolean, dcId: string }) {
    this.showMulitselect = event.show;
    if (event.show) {
      this.spinner.start('main');
      this.svc.getAllRootDevices(event.dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.borderDevices = data;
        this.buildBorderDevicesForm();
        this.spinner.stop('main');
      }, err => {
        this.spinner.stop('main');
      });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.buildForm();
  }

  getAzureAccounts() {
    this.accounts = [];
    this.svc.getAzureAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.azureAccounts = res;
      this.accounts = [...this.azureAccounts];
      this.form.addControl('cloudtype', new FormControl('azure', [Validators.required]));
    }, (err: HttpErrorResponse) => {
      this.azureAccounts = [];
    })
  }

  getOciAccounts() {
    this.accounts = [];
    this.svc.getOciAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.ociAccounts = res;
      this.accounts = [...this.ociAccounts];
      this.form.addControl('cloudtype', new FormControl('oci', [Validators.required]));
    }, (err: HttpErrorResponse) => {
      this.ociAccounts = [];
    })
  }

  getGcpAccounts() {
    this.accounts = [];
    this.svc.getGcpAccounts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.gcpAccounts = res;
      this.accounts = [...this.gcpAccounts];
      this.form.addControl('cloudtype', new FormControl('gcp', [Validators.required]));
    }, (err: HttpErrorResponse) => {
      this.gcpAccounts = [];
    })
  }

  buildForm() {
    this.form = this.svc.buildForm();
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.validationMessages;
    this.selectedViewType = _clone(this.form.get('view').value);
    this.form.get('view').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: UnityTopologyViewType) => {
      let k = _clone(_clone(viewTypes).find(vt => vt.view == val.view));
      switch (k.view) {
        case 'colocloud':
          this.removePublicCloudFormControls();
          break;
        case 'private_cloud':
          this.removePublicCloudFormControls();
          break;
        case 'public_cloud':
          this.addPublicCloudFormControls();
          break;
        default:
          return;
      }
      this.selectedViewType = _clone(k);
    })
  }

  buildBorderDevicesForm() {
    this.borderDevicesForm = this.svc.buildBorderDevicesForm(this.borderDevices);
  }

  addPublicCloudFormControls() {
    this.form.addControl('cloudtype', new FormControl('', [Validators.required]));
    this.form.get('cloudtype').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.selectedViewType.nodeId = null;
      if (val === 'azure') {
        this.getAzureAccounts()
      }
      if (val === 'oci') {
        this.getOciAccounts();
      }
      if (val === 'gcp') {
        this.getGcpAccounts();
      }
      this.addPublicCloudControls();
    })
  }

  addPublicCloudControls() {
    this.form.addControl('account', new FormControl('', [Validators.required]));
    this.form.patchValue({
      account: ''
    });
    this.form.get('account').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.selectedViewType = _clone(Object.assign({}, this.selectedViewType, { 'nodeId': val }));
    })
  }

  removePublicCloudFormControls() {
    this.form.removeControl('cloudtype');
    this.form.removeControl('account');
    delete this.selectedViewType.nodeId;
  }

  handleDeviceSelection(borderDevice: UnityBorderDevices) {
    if (this.upadtedBorderDevices.length) {
      const index = this.upadtedBorderDevices.findIndex(device => device === borderDevice);
      if (index === -1) {
        borderDevice.is_root_device = !borderDevice.is_root_device;
        this.upadtedBorderDevices.push(borderDevice);
      } else {
        borderDevice.is_root_device = !borderDevice.is_root_device;
        this.upadtedBorderDevices.splice(index, 1);
      }
    } else {
      borderDevice.is_root_device = !borderDevice.is_root_device;
      this.upadtedBorderDevices.push(borderDevice);
    }
  }


  submitBorderDevices() {
    this.svc.sendBorderDevices(this.upadtedBorderDevices).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('Border devices updated successfully!!!'));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    })
  }
}


