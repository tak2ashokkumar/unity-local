import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AIMLCategoryTypeViewdata, SourceEventCategoriesService } from './source-event-categories.service';


@Component({
  selector: 'source-event-categories',
  templateUrl: './source-event-categories.component.html',
  styleUrls: ['./source-event-categories.component.scss'],
  providers: [SourceEventCategoriesService]
})
export class SourceEventCategoriesComponent implements OnInit, OnDestroy {
  state$: Observable<object>;
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  viewData: AIMLCategoryTypeViewdata[] = [];
  selectedCategoryIndex: number;
  selectedCategoryType: AIMLCategoryTypeViewdata = new AIMLCategoryTypeViewdata();
  selectedCategoryId: string;

  eventCategoryForm: FormGroup;
  eventCategoryFormErrors: any;
  eventCategoryFormValidationMessages: any;

  @ViewChild('deleteCategoryRef') deleteCategoryRef: ElementRef;
  deleteCategoryModalRef: BsModalRef;

  action: 'Add';
  nonFieldErr: string = '';
  eventModelRef: BsModalRef;
  selectedOptionCategory: string = '';
  selectedEvent: string[] = [];
  constructor(private svc: SourceEventCategoriesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO, params: [{ 'source': null }] };
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.currentCriteria.params[0].source = params.get('source');
      this.getCategoryTypes();
    });
  }

  ngOnInit(): void {
    this.getEventTypes();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.searchValue = '';
    this.getEventTypes();
    this.getCategoryTypes();
  }

  getCategoryTypes() {
    this.spinner.start('main');
    this.svc.getCategoryTypes(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToCategoryTypeViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.notification.error(new Notification('Failed to fetch category types'));
      this.spinner.stop('main');
    });
  }

  addCategory() {
    const InvalidEvent = this.viewData.find(event => event.onForm && event.categoryForm.invalid);
    if (InvalidEvent) {
      this.viewData.forEach(category => {
        if (category.onForm && category.categoryForm.invalid) {
          this.eventCategoryFormErrors = this.utilService.validateForm(category.categoryForm, category.categoryFormValidationMessages, category.categoryFormErrors);
        }
      });
      return;
    }
    const category = new AIMLCategoryTypeViewdata();
    category.onForm = true;
    category.statusIconClass = 'fas fa-toggle-on';
    category.categoryForm = this.svc.buildCategoryForm();
    category.categoryFormErrors = this.svc.resetCategoryFormErrors();
    category.categoryFormValidationMessages = this.svc.categoryFormValidationMessages;
    this.eventCategoryForm = category.categoryForm;
    this.eventCategoryFormErrors = category.categoryFormErrors;
    this.eventCategoryFormValidationMessages = category.categoryFormValidationMessages;
    this.viewData.unshift(category);
  }

  onEditCategory(index: number) {
    this.viewData[index].onForm = true;
    for (let i = 0; i < this.viewData.length; i++) {
      if (index != i) {
        this.viewData[i].onForm = false;
      }
    }
  }

  resetCategoryName(view: AIMLCategoryTypeViewdata) {
    view.categoryForm = this.svc.buildCategoryForm(view.categoryType);
    if (view.categoryType) {
      if (view.onForm) {
        view.onForm = false;
      }
    } else {
      this.viewData.shift();
    }
  }

  onSubmitCategory(view: AIMLCategoryTypeViewdata) {
    if (view.categoryForm.invalid) {
      view.categoryFormErrors = this.utilService.validateForm(view.categoryForm, view.categoryFormValidationMessages, view.categoryFormErrors);
      view.categoryForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        view.categoryFormErrors = this.utilService.validateForm(view.categoryForm, view.categoryFormValidationMessages, view.categoryFormErrors);
      });
    } else {
      this.spinner.start('main');
      if (view.uuid) {
        this.svc.categoryUpdate(view.categoryForm.getRawValue(), view.uuid, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.notification.success(new Notification('Category updated successfully'));
            // view.onForm = false;
            this.getCategoryTypes();
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.spinner.stop('main');
            this.notification.error(new Notification('Category not updated successfully'));
          });
      } else {
        this.svc.categoryAdd(this.eventCategoryForm.getRawValue(), this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.notification.success(new Notification('Category added successfully'));
            // view.onForm = false;
            this.getCategoryTypes();
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.spinner.stop('main');
            this.notification.error(new Notification('Category not added successfully'));
          });
      }
    }
  }

  switchCategoryStatus(view: AIMLCategoryTypeViewdata) {
    this.spinner.start('main');
    if (!view.isDisabled) {
      this.svc.toggleCategory(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Category Type enabled successfully.'));
        this.getCategoryTypes();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to enable Category Type. Please try again later.'));
      });
    } else {
      this.svc.toggleCategory(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Category Type disabled successfully.'));
        this.getCategoryTypes();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to disable Category Type. Please try again later.'));
      });
    }
  }

  categoryDelete(uuid: string, index: number) {
    this.selectedCategoryId = uuid;
    this.deleteCategoryModalRef = this.modalService.show(this.deleteCategoryRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    if (uuid) {
    } else {
      this.viewData.splice(index, 1);
    }
  }

  confirmCategoryDelete() {
    this.svc.categoryDelete(this.selectedCategoryId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deleteCategoryModalRef.hide();
      this.notification.success(new Notification('Category type deleted successfully.'));
      this.getCategoryTypes();
    }, err => {
      this.deleteCategoryModalRef.hide();
      this.notification.error(new Notification('Category type could not be deleted!!'));
    });
  }


  //********************************************** Keywords part ******************************/

  categoryKeywordForm: FormGroup;
  categoryKeywordFormErrors: any;
  categoryKeywordFormValidationMessages: any;
  category: AIMLCategoryTypeViewdata;

  buildCategoryKeywordForm() {
    this.categoryKeywordForm = this.svc.buildKeywordForm();
    this.categoryKeywordFormErrors = this.svc.resetKeywordFormErrors();
    this.categoryKeywordFormValidationMessages = this.svc.keywordFormValidationMessages;
  }

  addCategoryTypeKeyword(index: number) {
    this.buildCategoryKeywordForm();
    this.selectedCategoryType = this.viewData[index];
    this.viewData.forEach(et => {
      et.isAddkeywordsPopover = false;
      et.isAddEventTypePopover = false;
    })
    setTimeout(() => {
      this.viewData[index].isAddkeywordsPopover = true;
    })
  }

  onSubmitKeywordCategory() {
    if (this.categoryKeywordForm.invalid) {
      this.categoryKeywordFormErrors = this.utilService.validateForm(this.categoryKeywordForm, this.categoryKeywordFormValidationMessages, this.categoryKeywordFormErrors);
      this.categoryKeywordForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.categoryKeywordFormErrors = this.utilService.validateForm(this.categoryKeywordForm, this.categoryKeywordFormValidationMessages, this.categoryKeywordFormErrors);
        });
    } else {
      const newKeyword = this.categoryKeywordForm.getRawValue().keywords;
      if (this.selectedCategoryType.keywords.includes(newKeyword)) {
        this.notification.error(new Notification('Keyword already exists.'));
      } else {
        this.selectedCategoryType.keywords.push(this.categoryKeywordForm.getRawValue().keywords);
        this.spinner.start('main');
        this.svc.updateKeywords(this.selectedCategoryType.keywords, this.selectedCategoryType.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Keyword added successfully.'));
          this.getCategoryTypes();
          this.selectedCategoryType.isAddkeywordsPopover = false;
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    this.eventCategoryFormErrors = this.svc.resetCategoryFormErrors();
    this.categoryKeywordFormErrors = this.svc.resetKeywordFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.categoryKeywordForm.controls) {
          this.categoryKeywordFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.eventModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  deleteKeywordCategory(index: number, j: number) {
    this.category = this.viewData[index];
    this.category.keywords.splice(j, 1);
    this.spinner.start('main');
    this.svc.updateKeywords(this.category.keywords, this.category.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Keyword deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  //********************************************** Event Type part ******************************/

  onAddMultiselect: boolean = false;
  eventTypes: string[] = [];
  filteredEventTypes: string[] = [];
  fieldsToFilterOn: string[] = ['template_name'];

  getEventTypes() {
    this.eventTypes = [];
    this.svc.getEventTypes().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.eventTypes = res;
      this.filteredEventTypes = res;
    });
  }

  onSearchedEvent(e: string) {
    this.filteredEventTypes = Object.assign([], this.eventTypes).filter(
      item => item.toLowerCase().indexOf(e.toLowerCase()) > -1
    )
  }

  onSelectEventType(event: any, eventType: string) {
    this.selectedEvent = _clone(this.selectedCategoryType.eventType);
    if (event.target.checked) {
      this.selectedEvent.push(eventType);
    } else {
      const index = this.selectedEvent.indexOf(eventType);
      if (index !== -1) {
        this.selectedEvent.splice(index, 1);
      }
    }
  }

  bindEventTypeToEventCategory(index: number) {
    this.onAddMultiselect = true;
    this.selectedCategoryType = this.viewData[index];
    this.viewData.forEach(et => {
      et.isAddkeywordsPopover = false;
      et.isAddEventTypePopover = false;
    })
    setTimeout(() => {
      this.viewData[index].isAddEventTypePopover = true;
    })
  }

  onSubmitSelectedEventTypes() {
    if (!this.selectedEvent.length) {
      this.notification.error(new Notification('Event not selected'));
    } else {
      this.spinner.start('main');
      this.svc.updateEventTypes(this.selectedEvent, this.selectedCategoryType.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Events linked successfully.'));
        this.getCategoryTypes();
        this.selectedCategoryType.isAddEventTypePopover = false;
        this.onAddMultiselect = false;
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  deleteCategoryEventKeyword(index: number, k: number) {
    this.category = this.viewData[index];
    this.category.eventType.splice(k, 1);
    this.spinner.start('main');
    this.svc.updateEventTypes(this.selectedEvent, this.category.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('keyword removed successfully.'));
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

}
