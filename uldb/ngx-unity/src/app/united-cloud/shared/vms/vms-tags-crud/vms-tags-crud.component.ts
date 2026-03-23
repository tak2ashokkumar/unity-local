import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { VmsTagsCrudService, VMTagsCRUD } from './vms-tags-crud.service';

@Component({
  selector: 'vms-tags-crud',
  templateUrl: './vms-tags-crud.component.html',
  styleUrls: ['./vms-tags-crud.component.scss']
})
export class VmsTagsCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  private ngUnsubscribe = new Subject();

  @ViewChild('tagsFormRef') tagsFormRef: ElementRef;
  tagsFormModelRef: BsModalRef;
  tagsForm: FormGroup;
  tagsFormErrors: any;
  tagsFormValidationMessages: any;
  nonFieldErr: string = '';
  input: VMTagsCRUD = new VMTagsCRUD();

  tagsAutocompleteItems: string[] = [];

  constructor(private crudService: VmsTagsCrudService,
    private modalService: BsModalService,
    private appService: AppLevelService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(input => {
      this.input = input;
      this.getTags();
      this.nonFieldErr = '';
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTags() {
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
      this.buildForm();
    });
  }

  buildForm() {
    this.tagsForm = this.crudService.createTagsForm(this.input.tags);
    this.tagsFormErrors = this.crudService.resetTagsFormErrors();
    this.tagsFormValidationMessages = this.crudService.tagsFormValidationMessages;
    this.tagsFormModelRef = this.modalService.show(this.tagsFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  submitTags() {
    this.spinnerService.start('main');
    this.tagsFormModelRef.hide();
    this.crudService.updateTagsData(<{ tags: string[] }>this.tagsForm.getRawValue(), this.input).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Tags updated successfully.'));
      this.onCrud.emit(CRUDActionTypes.UPDATE);
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Failed to update tags. Please try again later.'));
    });
  }

}
