import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HistoryViewData, OrchestrationIntegrationDetailsPlaybookService, PlaybooksViewData } from './orchestration-integration-details-playbook.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'orchestration-integration-details-playbook',
  templateUrl: './orchestration-integration-details-playbook.component.html',
  styleUrls: ['./orchestration-integration-details-playbook.component.scss'],
  providers: [OrchestrationIntegrationDetailsPlaybookService]
})
export class OrchestrationIntegrationDetailsPlaybookComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  repoId: string;
  subscr: Subscription;

  @ViewChild('viewPlaybook') view: ElementRef;
  playbookViewModalRef: BsModalRef;
  detailsForm: FormGroup;
  taskModalRef: BsModalRef;
  viewData: PlaybooksViewData[] = [];
  playbookUUID: string;
  playbook: PlaybooksViewData;

  @ViewChild('create') create: ElementRef;
  playbookForm: FormGroup;
  playbookFormErrors: any;
  playbookValidationMessages: any;
  playbookModalRef: BsModalRef;
  action: 'Add' | 'Edit';
  fileToUpload: File;
  nonFieldErr: string = '';

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  playbookDeleteModalRef: BsModalRef;
  taskUUID: string;
  @ViewChild('history') history: ElementRef;
  viewHistoryData: HistoryViewData[] = [];

  constructor(private route: ActivatedRoute,
    private orchestrationIntegrationDetailsPlaybookService: OrchestrationIntegrationDetailsPlaybookService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService) {
    this.route.parent.paramMap.subscribe(params => this.repoId = params.get('repoId'));
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinner.start('viewplaybooks');
    }, 100);
    this.getPlaybooksData();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPlaybooksData() {
    this.orchestrationIntegrationDetailsPlaybookService.getPlaybooks(this.repoId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.orchestrationIntegrationDetailsPlaybookService.convertToViewData(data);
      this.spinner.stop('viewplaybooks');
    }, err => {
      this.viewData = [];
      this.spinner.stop('viewplaybooks');
    });
  }

  viewDetails(data: PlaybooksViewData) {
    this.buildDeatilsForm(data);
    this.playbookViewModalRef = this.modalService.show(this.view, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  buildDeatilsForm(data: PlaybooksViewData) {
    this.detailsForm = this.orchestrationIntegrationDetailsPlaybookService.buildDetailsForm(data);
  }

  addPlaybook() {
    this.playbook = null;
    this.nonFieldErr = '';
    this.action = 'Add';
    this.buildPlaybookForm(null);
    this.playbookModalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  editPlaybook(data: PlaybooksViewData) {
    this.playbook = data;
    this.nonFieldErr = '';
    this.action = 'Edit';
    this.buildPlaybookForm(data);
    this.playbookModalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  playbookFile(files: FileList) {
    if (!files.length) {
      return;
    }
    this.fileToUpload = files.item(0);
  }

  buildPlaybookForm(data: PlaybooksViewData) {
    this.playbookForm = this.orchestrationIntegrationDetailsPlaybookService.createPlaybookForm(data);
    this.playbookFormErrors = this.orchestrationIntegrationDetailsPlaybookService.resetPlaybookFormErrors();
    this.playbookValidationMessages = this.orchestrationIntegrationDetailsPlaybookService.playbookValidationMessages;
  }

  handleError(err: any) {
    this.playbookFormErrors = this.orchestrationIntegrationDetailsPlaybookService.resetPlaybookFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.playbookForm.controls) {
          this.playbookFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.playbookModalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  confirmPlaybookCreate() {
    if (this.playbookForm.invalid) {
      this.playbookFormErrors = this.utilService.validateForm(this.playbookForm, this.playbookValidationMessages, this.playbookFormErrors);
      this.playbookForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.playbookFormErrors = this.utilService.validateForm(this.playbookForm, this.playbookValidationMessages, this.playbookFormErrors); });
    } else {
      this.spinner.start('main');
      if (this.playbook) {
        if (this.fileToUpload) {
          this.orchestrationIntegrationDetailsPlaybookService.updatePlaybook(this.playbook.uuid, this.playbookForm.getRawValue(), this.repoId, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.playbookModalRef.hide();
            this.spinner.stop('main');
            this.notification.success(new Notification('Playbook updated Successfully.'));
            this.getPlaybooksData();
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
        }
        else {
          this.orchestrationIntegrationDetailsPlaybookService.updatePlaybook(this.playbook.uuid, this.playbookForm.getRawValue(), this.repoId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.playbookModalRef.hide();
            this.spinner.stop('main');
            this.notification.success(new Notification('Playbook updated Successfully.'));
            this.getPlaybooksData();
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
        }
      } else {
        this.orchestrationIntegrationDetailsPlaybookService.createPlaybook(this.playbookForm.getRawValue(), this.fileToUpload, this.repoId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.playbookModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Playbook created successfully.'));
          this.getPlaybooksData();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  deletePlaybook(UUID: string) {
    this.playbookUUID = UUID;
    this.playbookDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmPlaybookDelete() {
    this.playbookDeleteModalRef.hide();
    this.spinner.start('main');
    this.orchestrationIntegrationDetailsPlaybookService.deletePlaybook(this.playbookUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Playbook deleted successfully.'));
      this.getPlaybooksData();
    }, err => {
      this.notification.error(new Notification(' Playbook has more than one reference so it can not be deleted!! Please try again.'));
    });
  }

  viewHistory(view: any) {
    this.spinner.start('main');
    this.orchestrationIntegrationDetailsPlaybookService.getHistoryData(view.uuid, view.repoFk).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewHistoryData = this.orchestrationIntegrationDetailsPlaybookService.convertToHistoryViewData(data);
      this.taskModalRef = this.modalService.show(this.history, Object.assign({}, { class: 'modal-xl pl-5', keyboard: true, ignoreBackdropClick: true }));
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewHistoryData = [];
      this.taskModalRef = this.modalService.show(this.history, Object.assign({}, { class: 'modal-xl pl-5', keyboard: true, ignoreBackdropClick: true }));
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get History'));
    });
  }

}
