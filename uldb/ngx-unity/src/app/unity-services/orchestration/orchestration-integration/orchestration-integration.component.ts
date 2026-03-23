import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InstanceFormData, InstanceViewData, OrchestrationIntegrationService } from './orchestration-integration.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'orchestration-integration',
  templateUrl: './orchestration-integration.component.html',
  styleUrls: ['./orchestration-integration.component.scss'],
  providers: [OrchestrationIntegrationService]
})
export class OrchestrationIntegrationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: InstanceViewData[] = [];
  currentCriteria: SearchCriteria;
  instance: any;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';
  instanceModalRef: BsModalRef;
  @ViewChild('create') create: ElementRef;
  @ViewChild('confirmToggle') confirmToggle: ElementRef;
  @ViewChild('confirmDelete') confirmDelete: ElementRef;
  confirmModalRef: BsModalRef;
  integrationForm: FormGroup;
  integrationFormErrors: any;
  integrationValidationMessages: any;
  confirmMsg: string;
  confirmDeleteMsg: string;



  constructor(
    private orchestraionIntegrationService: OrchestrationIntegrationService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private router: Router) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO };

  }

  ngOnInit() {
    this.spinner.start("main");
    this.getInstanceData()
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getInstanceData();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getInstanceData();
  }

  getInstanceData() {
    this.orchestraionIntegrationService.getInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.orchestraionIntegrationService.convertToViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Instances'));
    });
  }

  addInstance() {
    this.instance = null;
    this.nonFieldErr = '';
    this.action = 'Add';
    this.createForm(null);
    this.instanceModalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  editInstance(source: InstanceViewData) {
    this.instance = source;
    this.nonFieldErr = '';
    this.action = 'Edit';
    this.createForm(source);
    this.instanceModalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  createForm(data: any) {
    this.integrationForm = this.orchestraionIntegrationService.createForm(data);
    this.integrationFormErrors = this.orchestraionIntegrationService.resetIntegrationFormErrors();
    this.integrationValidationMessages = this.orchestraionIntegrationService.taskValidationMessages;
  }

  handleError(err: any) {
    this.integrationFormErrors = this.orchestraionIntegrationService.resetIntegrationFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.integrationForm.controls) {
          this.integrationFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.instanceModalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  goToviewDetails(view: any) {
    this.router.navigate([view.uuid, 'details'], { relativeTo: this.route });

  }

  togglestatus(view: InstanceViewData) {
    this.instance = view;
    let action = !view.status ? 'enable' : 'disable';
    this.confirmMsg = `Are you sure you want to ${action} this instance ?`;
    this.confirmModalRef = this.modalService.show(this.confirmToggle, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggleStatus() {
    this.confirmModalRef.hide();
    let data = !this.instance.status ? 'enable' : 'disable';
    this.orchestraionIntegrationService.toggleStatus(this.instance.uuid, data)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(e => {
        this.spinner.stop('main');
        this.getInstanceData();
        this.notification.success(new Notification(`Status updated successfully`));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification(`Error while updating status. Please try again!!`));
      });
  }

  deleteInstance(view: InstanceViewData) {
    this.instance = view;
    this.confirmDeleteMsg = `Are you sure want to delete ${view.instanceName}?`;
    this.confirmModalRef = this.modalService.show(this.confirmDelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteGroup() {
    this.confirmModalRef.hide();
    this.orchestraionIntegrationService.deleteInstance(this.instance.uuid)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(group => {
        this.spinner.stop('main');
        this.getInstanceData();
        this.notification.success(new Notification('Instance deleted successfully'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while deleting Instance. Please try again!!'));
      });
  }

  confirmTaskCreate() {
    if (this.integrationForm.invalid) {
      this.integrationFormErrors = this.utilService.validateForm(this.integrationForm, this.integrationValidationMessages, this.integrationFormErrors);
      this.integrationForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.integrationFormErrors = this.utilService.validateForm(this.integrationForm, this.integrationValidationMessages, this.integrationFormErrors);
      });
    } else {
      this.spinner.start('main');
      let obj = <InstanceFormData>Object.assign({}, this.integrationForm.getRawValue());
      if (this.action == 'Edit') {
        this.orchestraionIntegrationService.updateTask(this.instance.uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.instanceModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Task updated Successfully.'));
          this.getInstanceData();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.orchestraionIntegrationService.createTask(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.instanceModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Task created successfully.'));
          this.getInstanceData();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

}
