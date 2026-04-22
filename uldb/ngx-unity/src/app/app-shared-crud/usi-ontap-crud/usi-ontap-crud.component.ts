import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { isString } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { OntapCrudFormdata, UsiOntapCrudService } from './usi-ontap-crud.service';
import { MonitoringTemplate } from '../../shared/SharedEntityTypes/monitoring-templates.type';
import { UserInfoService } from '../../shared/user-info.service';
import { ClientSideSearchPipe } from '../../app-filters/client-side-search.pipe';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { AppLevelService } from 'src/app/app-level.service';

@Component({
  selector: 'usi-ontap-crud',
  templateUrl: './usi-ontap-crud.component.html',
  styleUrls: ['./usi-ontap-crud.component.scss']
})
export class UsiOntapCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  @ViewChild('create') create: ElementRef;
  modalRef: BsModalRef;

  actionMessage: 'Add' | 'Edit';
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  uuid: string;
  datacenters: Array<DatacenterFast> = [];
  isTenantOrg: boolean = false;
  templates: MonitoringTemplate[] = [];
  filteredTemplates: MonitoringTemplate[] = [];
  fieldsToFilterOn: string[] = ['template_name'];
  selectedTemplates: MonitoringTemplate[] = [];
  searchValue: string = '';
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  tagsAutocompleteItems: string[] = [];
  constructor(private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private crudSvc: UsiOntapCrudService,
    private userInfo: UserInfoService,
    private appService: AppLevelService,
    private clientSideSearchPipe: ClientSideSearchPipe) {
    this.crudSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((uuid: string) => {
      if (uuid) {
        this.uuid = uuid;
        this.actionMessage = 'Edit';
        this.edit(uuid);
      } else {
        this.actionMessage = 'Add';
        this.add();
      }
    });
  }

  ngOnInit(): void {
    this.isTenantOrg = this.userInfo.isTenantOrg;
    this.getDatacenters();
    this.getTemplates();
    this.getCollectors();
    this.getTags();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.searchValue = event;
    this.filteredTemplates = this.clientSideSearchPipe.transform(this.templates, event, this.fieldsToFilterOn);
  }

  add() {
    this.actionMessage = 'Add';
    this.buildForm(null);
  }

  edit(uuid: string) {
    this.uuid = uuid;
    this.actionMessage = 'Edit';
    this.buildForm(uuid);
  }

  getDatacenters() {
    this.datacenters = [];
    this.crudSvc.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = res;
    });
  }

  getTemplates() {
    this.crudSvc.getTemplates().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.templates = res;
      this.filteredTemplates = res;
    });
  }

  getCollectors() {
    this.crudSvc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  buildForm(uuid: string) {
    this.nonFieldErr = '';
    this.selectedTemplates = [];
    this.crudSvc.buildForm(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.form = form;
      this.formErrors = this.crudSvc.resetFormErrors();
      this.validationMessages = this.crudSvc.validationMessages;
      let templates = <number[]>this.form.get('mtp_templates').value;
      if (templates.length) {
        templates.forEach(tId => {
          let template = this.filteredTemplates.find(tmpl => tmpl.template_id == tId);
          if (template) {
            this.selectedTemplates.push(template);
          }
        })
      }
      this.modalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));

      // this.form.get('monitor').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      //   if (val) {
      //     this.form.get('mtp_templates').setValidators([Validators.required]);
      //   } else {
      //     this.form.get('mtp_templates').removeValidators([Validators.required]);
      //   }
      // })
    });
  }

  selectTemplate(i: number) {
    if (this.filteredTemplates[i].isSelected) {
      this.filteredTemplates[i].isSelected = false;
    } else {
      this.filteredTemplates[i].isSelected = true;
    }
  }

  updateSelectedTemplates() {
    this.selectedTemplates = this.filteredTemplates.filter(tmpl => tmpl.isSelected);
    this.form.get('mtp_templates').setValue(this.selectedTemplates.map(t => t.template_id));
  }

  unSelectTemplate(i: number) {
    let tmplIndex = this.filteredTemplates.findIndex(tmpl => tmpl.template_id == this.selectedTemplates[i].template_id);
    if (tmplIndex != -1) {
      this.filteredTemplates[tmplIndex].isSelected = false;
    }
    this.selectedTemplates.splice(i, 1);
    this.form.get('mtp_templates').setValue(this.selectedTemplates.map(t => t.template_id));
  }

  handleError(err: any) {
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, this.form.getRawValue());
      if (this.actionMessage === 'Add') {
        this.crudSvc.createOntap(<OntapCrudFormdata>obj).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.modalRef.hide();
            this.notification.success(new Notification('Ontap cluster added successfully'));
            this.onCrud.emit(CRUDActionTypes.ADD)
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
      } else {
        this.crudSvc.updateOntap(this.uuid, <OntapCrudFormdata>obj).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.modalRef.hide();
            this.notification.success(new Notification('Ontap cluster updated successfully'));
            this.onCrud.emit(CRUDActionTypes.UPDATE)
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
      }
    }
  }
}
