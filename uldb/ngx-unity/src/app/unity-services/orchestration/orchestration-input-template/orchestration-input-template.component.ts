import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { InputTemplateModel, OrchestrationInputTemplateService } from './orchestration-input-template.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'orchestration-input-template',
  templateUrl: './orchestration-input-template.component.html',
  styleUrls: ['./orchestration-input-template.component.scss']
})
export class OrchestrationInputTemplateComponent implements OnInit {

  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  viewData: InputTemplateModel[] = [];
  count: number;
  isPageSizeAll: boolean = true;
  name: string;
  templateId: string;
  cloneModalRef: BsModalRef;
  @ViewChild('clone') clone: ElementRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteModalRef: BsModalRef;
  @ViewChild('edit') edit: ElementRef;
  editModelRef: BsModalRef;

  constructor(
    private svc: OrchestrationInputTemplateService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE};
   }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getInputTemplateData();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getInputTemplateData();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getInputTemplateData();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getInputTemplateData();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getInputTemplateData();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInputTemplateData();
  }

  getInputTemplateData() {
    this.svc.getTemplateData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = data.results;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Templates'));
    });
  }

  toggleStatus(status: boolean, view: InputTemplateModel) {
    if (status === true) {
      view['template_status'] = 'Enabled';
    } else {
      view['template_status'] = 'Disabled';
    }
    this.svc.toggleStatus(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to change status'));
    });
  }

  createTemplate() {
    this.router.navigate(['crud'], { relativeTo: this.route });
  }

  cloneTemplate(name: string, uuid: string) {
    this.name = `Copy-${name}`;
    this.templateId = uuid;
    this.cloneModalRef = this.modalService.show(this.clone, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmClone() {
    this.spinner.start('main');
    this.svc.cloneData(this.templateId, this.name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getInputTemplateData();
      this.spinner.stop('main');
      this.notification.success(new Notification('Template cloned successfully'));
      this.cloneModalRef.hide();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to clone template'));
      this.cloneModalRef.hide();
    });
  }

  deleteTemplate(uuid: string) {
    this.templateId = uuid;
    this.deleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmTemplateDelete() {
    this.deleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteData(this.templateId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Template deleted successfully.'));
      this.getInputTemplateData();
    }, err => {
      this.notification.error(new Notification(' Template has more than one reference so it can not be deleted!! Please try again.'));
    });
  }

  editTemplate(view: InputTemplateModel) {
    this.templateId = view.uuid;
    this.editModelRef = this.modalService.show(this.edit, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEdit() {
    this.editModelRef.hide();
    this.router.navigate([this.templateId, 'edit'], { relativeTo: this.route });
  }

}
