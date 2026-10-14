import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone, isString } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { forkJoin, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnityScheduleService } from 'src/app/shared/unity-schedule/unity-schedule.service';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { HypervisorCRUDManufacturer, HypervisorCRUDModel, HypervisorCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/hypervisor-crud.type';
import { LifeCycleStageOptions, LifeCycleStageStatusOptions } from 'src/app/united-cloud/shared/hypervisors/hypervisors-crud/hypervisors-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { EsxiServerViewData, PrivateCloudEsxiCrudService } from '../private-cloud-esxi-crud.service';
import { CreateEsxiServerFormData } from '../private-cloud-esxi.type';

@Component({
  selector: 'private-cloud-esxi-crud',
  templateUrl: './private-cloud-esxi-crud.component.html',
  styleUrls: ['./private-cloud-esxi-crud.component.scss'],
  providers: [PrivateCloudEsxiCrudService]
})
export class PrivateCloudEsxiCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  dataCenters: DataCenter[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  instanceId: string;
  esxiViewData: EsxiServerViewData[] = []
  credentialForm: FormGroup;
  credentialFormErrors: any;
  credentialFormValidationMessages: any;
  credentialFormData: any;
  activeForm: string = 'credentialForm';
  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMessages: any;
  filterFormData: any;
  instance: any;
  nonFieldErr: string = '';
  count: number = 0;
  selectedEsxiServers: string[] = [];
  selectedAll: boolean = false;
  popTagList: any[];
  addEsxiForm: FormGroup;
  addEsxiFormErrors: any;
  addEsxiFormValidationMessages: any;
  manufacturers: HypervisorCRUDManufacturer[] = [];
  models: HypervisorCRUDModel[] = [];
  operatingSystems: HypervisorCRUDOperatingSystem[] = [];
  cabinets: CabinetFast[] = [];
  lifeCycleStageOptions: string[] = LifeCycleStageOptions;
  lifeCycleStageStatusOptions: string[] = LifeCycleStageStatusOptions;




  constructor(private svc: PrivateCloudEsxiCrudService,

    private scheduleSvc: UnityScheduleService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    });
  }

  ngOnInit(): void {
    this.getEsxiServers()
    if (this.instanceId) {
      this.getInstanceDetails()
    } else {
      this.getDropdownData();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  getDropdownData() {
    forkJoin({
      dataCenters: this.svc.loadDatacenters(),
      collectors: this.svc.getCollectors()
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: ({ dataCenters, collectors }) => {
        this.dataCenters = dataCenters;
        this.collectors = collectors;
        this.manageActiveForm('credentialForm');
      },
      error: () => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Unable to load datacenters and collectors.'));
      }
    });
  }
  getInstanceDetails() {
    this.svc.getInstanceDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      this.getDropdownData();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Unable to load Esxi Account Details.Please try later.'))
      this.instance = null;
      this.getDropdownData();
    })
  }

  manageActiveForm(formName?: string) {
    switch (formName) {
      case 'credentialForm':
        this.buildCredentialsForm();
        this.activeForm = formName;
        if (this.instanceId) {
          this.initializeSelectedEsxiServers();
        }
        break;
      case 'filterForm':
        if (this.credentialForm && this.credentialForm.valid) {
          this.activeForm = formName;
          if (this.instanceId) {
            this.initializeSelectedEsxiServers();
          }
        } else {
          this.onSubmitCredentialForm();
        }
        break;
      default:
        if (!this.selectedEsxiServers.length) {
          this.notification.warning(new Notification('Please fill in the Credentials, Linking and move to Schedule'));
          return;
        }
        if (this.linkingSuccessfull) {
          this.buildScheduleForm();
          this.activeForm = formName;
        } else {
          this.onSubmitFilterForm();
        }
        break;
    }
    this.spinner.stop('main');
  }


  loadDatacenters() {
    this.svc.loadDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dataCenters = res;
      this.setDataCenterValue();
    }, err => { });
  }

  setDataCenterValue() {
    //Angular selects selected value on if option and set value refer to same memory location
    this.dataCenters.map(dc => {
      if (dc.uuid == this.credentialForm?.get('colocation_cloud')?.value.uuid) {
        this.credentialForm.get('colocation_cloud').setValue(dc);
      }
    });
  }


  getCollectors() {
    this.svc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  getEsxiServers() {
    this.spinner.start('main');
    this.svc.getEsxiServers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.esxiViewData = this.svc.convertToViewData(data.results);
      this.syncSelectedEsxiServersWithViewData();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Esxi Servers'));
    });
  }

  initializeSelectedEsxiServers() {
    if (!this.instanceId || this.selectedEsxiServers.length || !this.instance?.servers?.length) {
      return;
    }
    this.selectedEsxiServers = this.instance.servers.map(server => server.uuid);
    this.syncSelectedEsxiServersWithViewData();
  }

  syncSelectedEsxiServersWithViewData() {
    if (!this.esxiViewData?.length) {
      this.selectedAll = false;
      return;
    }

    const selectedUuids = new Set(this.selectedEsxiServers);
    this.esxiViewData = this.esxiViewData.map(view => ({
      ...view,
      isSelected: selectedUuids.has(view.uuid)
    }));
    this.selectedAll = this.esxiViewData.every(view => view.isSelected);
  }

  modalRef: BsModalRef;
  @ViewChild('addEsxiModel') addEsxiModel: TemplateRef<any>;

  addInstance() {
    const datacenterUuid = this.credentialForm?.get('colocation_cloud.uuid')?.value;
    this.nonFieldErr = '';
    this.spinner.start('main');
    this.svc.buildCreateEsxiForm().pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.addEsxiForm = form;
      this.addEsxiFormErrors = this.svc.resetCreateEsxiFormErrors();
      this.addEsxiFormValidationMessages = this.svc.createEsxiFormValidationMessages;
      forkJoin({
        manufacturers: this.svc.getManufacturers(),
        operatingSystems: this.svc.getOperatingSystems(),
        cabinets: datacenterUuid ? this.svc.getCabinets(datacenterUuid) : of([])
      }).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: ({ manufacturers, operatingSystems, cabinets }) => {
          this.manufacturers = manufacturers;
          this.operatingSystems = operatingSystems;
          this.cabinets = cabinets || [];
          this.bindAddEsxiFormEvents();
          this.modalRef = this.modalService.show(this.addEsxiModel, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
          this.spinner.stop('main');
        },
        error: () => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Unable to load ESXi form data.'));
        }
      });
    });
  }

  bindAddEsxiFormEvents() {
    this.models = [];
    this.addEsxiForm.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((manufacturerId: string) => {
      this.models = [];
      this.addEsxiForm.get('model.id').setValue('');
      if (!manufacturerId) {
        return;
      }
      this.svc.getModels(manufacturerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.models = res;
      });
    });
  }

  closePopup() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.addEsxiForm = null;
    this.addEsxiFormErrors = null;
    this.models = [];
    this.nonFieldErr = '';
  }

  showTags(view: EsxiServerViewData) {
    this.popTagList = view.extraTags;
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getEsxiServers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEsxiServers();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getEsxiServers();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getEsxiServers();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo ?? this.currentCriteria.pageNo;
    this.getEsxiServers();
  }

  select(view: EsxiServerViewData) {
    view.isSelected = !view.isSelected;
    if (!view.isSelected) {
      this.selectedEsxiServers.splice(this.selectedEsxiServers.indexOf(view.uuid), 1);
    } else {
      this.selectedEsxiServers.push(view.uuid);
    }
    this.selectedAll = this.selectedEsxiServers.length == this.esxiViewData.length;
  }

  selectAll() {
    if (!this.esxiViewData.length) {
      this.selectedAll = false;
      return;
    }

    this.selectedAll = !this.selectedAll;
    if (this.selectedAll) {
      this.esxiViewData.forEach(view => {
        view.isSelected = true;
        this.selectedEsxiServers.push(view.uuid);
      });
    } else {
      this.esxiViewData.forEach(view => {
        view.isSelected = false;
      });
      this.selectedEsxiServers = [];
    }
  }

  buildCredentialsForm() {
    this.credentialForm = this.svc.buildCredentialForm(this.instance);
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    this.credentialFormValidationMessages = this.svc.credentialFormValidationMessages;
    this.credentialFormData = this.credentialForm.getRawValue();
  }

  onSubmitCredentialForm() {
    if (this.credentialForm.invalid) {
      this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
      this.credentialForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.credentialFormErrors = this.utilService.validateForm(this.credentialForm, this.credentialFormValidationMessages, this.credentialFormErrors);
        });
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, this.credentialForm.getRawValue());
      this.credentialFormData = _clone(obj);
      this.nonFieldErr = '';
      if (this.instanceId) {
        this.svc.saveCredentialsForm(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.spinner.stop('main');
          this.manageActiveForm('filterForm');
        }, (err: HttpErrorResponse) => {
          this.handleCredentialFormErrors(err.error);
        });
      } else {
        this.svc.saveCredentialsForm(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.instance = res;
          this.manageActiveForm('filterForm');
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleCredentialFormErrors(err.error);
        });
      }
    }
  }

  handleCredentialFormErrors(err: any) {
    this.credentialFormErrors = this.svc.resetCredentialFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.credentialForm.controls) {
          this.credentialFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  buildScheduleForm() {
    if (this.instanceId && this.instance.schedule_meta) {
      this.scheduleSvc.addOrEdit(this.instance.schedule_meta);
    } else {
      this.scheduleSvc.addOrEdit(null);
    }
  }

  linkingSuccessfull: boolean;
  onSubmitFilterForm() {
    if (!this.selectedEsxiServers.length) {
      this.notification.error(new Notification('Please select the Esxi servers to proceed.'));
    } else {
      this.spinner.start('main')
      if (this.instanceId) {
        this.svc.saveSelectedServers(this.selectedEsxiServers, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.spinner.stop('main');
          this.manageActiveForm('scheduleForm');
        }, (err: HttpErrorResponse) => {
          this.handleCredentialFormErrors(err.error);
        });
      } else {
        this.svc.saveSelectedServers(this.selectedEsxiServers, this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
          this.linkingSuccessfull = res;
          this.manageActiveForm('scheduleForm');
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleCredentialFormErrors(err.error);
        });
      }
    }
  }

  goBack() {
    if (this.instanceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  submit() {
    if (!this.addEsxiForm) {
      return;
    }

    if (this.addEsxiForm.invalid) {
      this.addEsxiFormErrors = this.utilService.validateForm(this.addEsxiForm, this.addEsxiFormValidationMessages, this.addEsxiFormErrors);
      this.addEsxiForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.addEsxiFormErrors = this.utilService.validateForm(this.addEsxiForm, this.addEsxiFormValidationMessages, this.addEsxiFormErrors);
      });
      return;
    }

    const instanceId = this.instanceId || this.instance?.uuid;
    if (!instanceId) {
      this.notification.error(new Notification('Unable to identify the ESXi account.'));
      return;
    }

    const payload = Object.assign({}, this.addEsxiForm.getRawValue(), {
      tags: [],
      custom_attribute_data: {}
    }) as CreateEsxiServerFormData;

    this.spinner.start('main');
    this.svc.createEsxiServer(instanceId, payload).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: () => {
        this.closePopup();
        this.spinner.stop('main');
        this.getEsxiServers();
        this.notification.success(new Notification('ESXi server created successfully.'));
      },
      error: (err: HttpErrorResponse) => {
        this.handleAddEsxiFormErrors(err?.error);
      }
    });
  }

  handleAddEsxiFormErrors(err: any) {
    this.addEsxiFormErrors = this.svc.resetCreateEsxiFormErrors();
    if (err?.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.addEsxiForm.controls) {
          this.addEsxiFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmitScheduleForm(runNowFlag: boolean) {
    this.scheduleSvc.submit();
    if (this.scheduleSvc.form.invalid) {
      return;
    } else {
      this.saveInstance(runNowFlag);
    }
  }


  saveInstance(runNowFlag: boolean) {
    this.spinner.start('main');
    let finalData = Object.assign({}, _clone(this.instance), this.scheduleSvc.getFormValue(runNowFlag));
    this.svc.saveInstance(finalData, this.instance.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      this.spinner.stop('main');
      if (this.instanceId) {
        this.notification.success(new Notification('Esxi account details updated successfully'));
        this.goBack();
      } else {
        this.notification.success(new Notification('Esxi account added successfully.'));
        // this.goToList();
      }
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(`${err.error}`));
    })
  }


}
