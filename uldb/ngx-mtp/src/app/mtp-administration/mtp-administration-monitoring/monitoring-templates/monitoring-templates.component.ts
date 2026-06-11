import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isString } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MonitoringTemplatesService, TemplateViewData } from './monitoring-templates.service';
import { MonitoringTemplates } from 'src/app/shared/SharedEntityTypes/monitoring.type';

@Component({
  selector: 'monitoring-templates',
  templateUrl: './monitoring-templates.component.html',
  styleUrls: ['./monitoring-templates.component.scss'],
  providers: [MonitoringTemplatesService]
})
export class MonitoringTemplatesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('clone') clone: ElementRef;
  modalRef: BsModalRef;
  cloneModalRef: BsModalRef;
  viewData: TemplateViewData[] = [];
  count: number = 0;
  currentCriteria: SearchCriteria;
  templates: MonitoringTemplates[];
  selectedFilter: string = '';
  nonFieldErr: string = '';
  cloneForm: FormGroup;
  cloneFormErrors: any;
  cloneValidationMessages: any;
  editTemplateID: number;
  selectedTemplateID: number;
  isEditing: boolean = false;
  isError: boolean;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private templatesService: MonitoringTemplatesService,
    private spinnerService: AppSpinnerService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ type: '' }] };
  }

  ngOnInit(): void {
    this.spinnerService.start('main');
    this.getTemplates();
    this.buildCloneForm();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getTemplates();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTemplates();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTemplates();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTemplates();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ type: '' }] };
    this.getTemplates();
  }

  getTemplates() {
    this.templatesService.getTemplates(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.templates = res.results;
      this.count = res.count;
      this.viewData = this.templatesService.convertToViewData(this.templates);
      this.getTemplateComponents();
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  getTemplateComponents() {
    from(this.viewData).pipe(
      mergeMap((e) => this.templatesService.getTemplateComponents(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  onFilterChange() {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = 1;
    this.getTemplates();
  }

  buildCloneForm() {
    this.cloneForm = this.templatesService.buildCloneForm();
    this.cloneFormErrors = this.templatesService.resetFormErrors();
    this.cloneValidationMessages = this.templatesService.validationMessages;
  }

  buildChangeForm() {
    this.cloneForm = this.templatesService.buildChangeForm(null);
    this.cloneFormErrors = this.templatesService.resetFormErrors();
    this.cloneValidationMessages = this.templatesService.validationMessages;
  }

  onSubmit() {
    if (this.cloneForm.invalid) {
      this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors);
      this.cloneForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.cloneFormErrors = this.utilService.validateForm(this.cloneForm, this.cloneValidationMessages, this.cloneFormErrors); });
      return;
    }
    else {
      this.spinnerService.start('main');
      this.templatesService.update(this.editTemplateID, this.cloneForm.getRawValue()).pipe((takeUntil(this.ngUnsubscribe))).subscribe(res => {
        this.cloneModalRef.hide();
        this.cloneForm.reset()
        this.getTemplates();
        this.notification.success(new Notification('Template cloned successfully'));
        this.spinnerService.stop('main');
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
        this.spinnerService.stop('main');
        this.notification.error(new Notification(' Failed to clone template. Please try again.'));
      });
    }
  }

  openRow(view: TemplateViewData) {
    this.viewData.map(data => {
      if (data != view) {
        data.isOpen = false;
      }
    });
    view.isOpen = !view.isOpen;
  }

  goToTemplate(view: TemplateViewData) {
    this.router.navigate(['templates', view.templateID, 'metrics'], { relativeTo: this.route.parent });
  }

  goToMetrics(view: TemplateViewData) {
    this.router.navigate(['templates', view.templateID, 'metrics'], { relativeTo: this.route.parent });
  }

  goToTriggers(view: TemplateViewData) {
    this.router.navigate(['templates', view.templateID, 'triggers'], { relativeTo: this.route.parent });
  }

  goToGraphs(view: TemplateViewData) {
    this.router.navigate(['templates', view.templateID, 'graphs'], { relativeTo: this.route.parent });
  }

  goToComponentMetrics(view: TemplateViewData, componentIndex: number) {
    this.router.navigate(['templates', view.templateID, 'component', view.components[componentIndex].ruleId, 'metrics'], { relativeTo: this.route.parent });
  }

  goToComponentTriggers(view: TemplateViewData, componentIndex: number) {
    this.router.navigate(['templates', view.templateID, 'component', view.components[componentIndex].ruleId, 'triggers'], { relativeTo: this.route.parent });
  }

  goToComponentGraphs(view: TemplateViewData, componentIndex: number) {
    this.router.navigate(['templates', view.templateID, 'component', view.components[componentIndex].ruleId, 'graphs'], { relativeTo: this.route.parent });
  }

  deletePanelDevice(view: TemplateViewData) {
    this.selectedTemplateID = view.templateID;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  cloneTemplate(templateID: number) {
    this.editTemplateID = templateID;
    this.cloneModalRef = this.modalService.show(this.clone, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinnerService.start('main');
    this.templatesService.delete(this.selectedTemplateID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Template deleted successfully.'));
      this.getTemplates();
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification(' Failed to delete template. Please try again.'));
    })
  }

  handleError(err: any) {
    this.cloneFormErrors = this.templatesService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.cloneForm.controls) {
          this.cloneFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  onSubmitEvent(view: TemplateViewData) {
    if (view.eventForm.invalid) {
      view.isError = true;
      return;
    }
    this.spinnerService.start('main');
    if (view.templateID) {
      this.templatesService.edit(view.templateID, view.eventForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.getTemplates();
          this.notification.success(new Notification('Template Updated successfully'));
          view.onForm = false;
          this.spinnerService.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    }
  }

  onEditEvent(index: number) {
    this.buildChangeForm();
    this.viewData[index].onForm = true;
    for (let i = 0; i < this.viewData.length; i++) {
      if (index != i) {
        this.viewData[i].onForm = false;
      }
    }
  }
}

