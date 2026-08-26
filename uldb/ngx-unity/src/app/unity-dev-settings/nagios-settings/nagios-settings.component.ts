import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { NagiosEventCategoryViewData, NagiosEventTypeViewData, NagiosSettingsService } from './nagios-settings.service';
import { FormGroup } from '@angular/forms';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { cloneDeep as _clone } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'nagios-settings',
  templateUrl: './nagios-settings.component.html',
  styleUrls: ['./nagios-settings.component.scss'],
  providers: [NagiosSettingsService]
})
export class NagiosSettingsComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  nonFieldErr: string = '';

  eventTypes: NagiosEventTypeViewData[] = [];
  selectedEventType: NagiosEventTypeViewData = new NagiosEventTypeViewData();
  eventCategories: NagiosEventCategoryViewData[] = [];
  selectedEventCategory: NagiosEventCategoryViewData = new NagiosEventCategoryViewData();

  eventTypeForm: FormGroup;
  eventFormErrors: any;
  eventFormValidationMessages: any;

  eventKeywordForm: FormGroup;
  eventKeywordFormErrors: any;
  eventKeywordFormValidationMessages: any;
  event: NagiosEventTypeViewData;

  categoryKeywordForm: FormGroup;
  categoryKeywordFormErrors: any;
  categoryKeywordFormValidationMessages: any;
  category: NagiosEventCategoryViewData;

  eventCategoryForm: FormGroup;
  eventCategoryFormErrors: any;
  eventCategoryFormValidationMessages: any;

  seletedEventId: string;
  selectedCategoryId: string;

  selectedCategory: string[] = [];
  selectedEvent: string[] = [];
  onAddMultiselect: boolean = false;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmEventDeleteModalRef: BsModalRef;

  @ViewChild('confirmdeleteCategory') confirmdeleteCategory: ElementRef;
  confirmCategoryDeleteModalRef: BsModalRef;

  constructor(private svc: NagiosSettingsService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private nagiosSettingsService: NagiosSettingsService,
    private modalService: BsModalService,
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.HUNDRED };
  }

  ngOnInit(): void {
    this.getEventTypes();
    this.getEventCategories();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSortedEvent($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getEventCategories();
  }

  onSearchedEvent(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEventCategories();
  }

  onSortedCategory($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getEventTypes();
  }

  onSearchedCategory(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEventTypes();
  }

  getEventTypes() {
    this.svc.getEventTypes(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.eventTypes = this.svc.convertToEventTypeViewData(res.results);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Event'));
    })
  }

  addEventType() {
    const newEvent: NagiosEventTypeViewData = new NagiosEventTypeViewData();
    newEvent.onForm = true;
    newEvent.statusIconClass = 'fas fa-toggle-on';
    newEvent.eventForm = this.nagiosSettingsService.buildForm(null);
    newEvent.eventFormErrors = this.nagiosSettingsService.eventFormErrors;
    newEvent.eventFormValidationMessage = this.nagiosSettingsService.eventFormValidationMessage;
    this.eventTypeForm = newEvent.eventForm;
    this.eventTypes.unshift(newEvent);
  }

  onEditEvent(index: number) {
    this.eventTypes[index].onForm = true;
    for (let i = 0; i < this.eventTypes.length; i++) {
      if (index != i) {
        this.eventTypes[i].onForm = false;
      }
    }
  }

  resetEventName(view: NagiosEventTypeViewData) {
    if (view) {
      view.eventForm = this.nagiosSettingsService.buildForm(view.name);
    } else {
      if (this.eventTypeForm) {
        this.eventTypeForm.reset();
      }
    }
  }

  onSubmitEvent(view: NagiosEventTypeViewData) {
    this.spinner.start('main');
    if (view.uuid) {
      this.nagiosSettingsService.eventUpdate(view.eventForm.getRawValue(), view.uuid).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.notification.success(new Notification('Event updated successfully'));
          view.onForm = false;
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    } else {
      this.nagiosSettingsService.eventAdd(this.eventTypeForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.notification.success(new Notification('Event added successfully'));
          view.onForm = false;
          this.getEventTypes();
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    }
  }

  getEventCategories() {
    this.svc.getEventCategories(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.eventCategories = this.svc.convertToEventCategoryViewData(res.results);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Category'));
    })
  }

  addNewCategory() {
    const newCategory: NagiosEventCategoryViewData = new NagiosEventCategoryViewData();
    newCategory.onForm = true;
    newCategory.statusIconClass = 'fas fa-toggle-on';
    newCategory.categoryForm = this.nagiosSettingsService.buildForm(null);
    newCategory.categoryFormErrors = this.nagiosSettingsService.eventFormErrors;
    newCategory.categoryFormValidationMessage = this.nagiosSettingsService.eventFormValidationMessage;
    this.eventCategoryForm = newCategory.categoryForm;
    this.eventCategories.unshift(newCategory);
  }

  onEditCategory(index: number) {
    this.eventCategories[index].onForm = true;
    for (let i = 0; i < this.eventCategories.length; i++) {
      if (index != i) {
        this.eventCategories[i].onForm = false;
      }
    }
  }

  resetCategoryName(view: NagiosEventCategoryViewData) {
    view.categoryForm = this.nagiosSettingsService.buildForm(view.name);
    if (view.name) {
      if (view.onForm) {
        view.onForm = false;
      }
    } else {
      this.eventCategories.shift();
    }
  }

  onSubmitCategory(view: NagiosEventCategoryViewData) {
    this.spinner.start('main');
    if (view.uuid) {
      this.nagiosSettingsService.categoryUpdate(view.categoryForm.getRawValue(), view.uuid).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.notification.success(new Notification('Category updated successfully'));
          view.onForm = false;
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    } else {
      this.nagiosSettingsService.categoryAdd(this.eventCategoryForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.notification.success(new Notification('Category added successfully'));
          view.onForm = false;
          this.getEventCategories();
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
    }
  }

  onSubmitKeywordCategory() {
    if (this.categoryKeywordForm.invalid) {
      this.categoryKeywordFormErrors = this.utilService.validateForm(this.categoryKeywordForm, this.categoryKeywordFormValidationMessages, this.categoryKeywordFormErrors);
      this.categoryKeywordForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.categoryKeywordFormErrors = this.utilService.validateForm(this.categoryKeywordForm, this.categoryKeywordFormValidationMessages, this.categoryKeywordFormErrors);
        });
    } else {
      const newKeyword = this.categoryKeywordForm.getRawValue().keyword;
      if (this.selectedEventCategory.keywords.includes(newKeyword)) {
        this.notification.error(new Notification('Keyword already exists'));
      } else {
        this.selectedEventCategory.keywords.push(this.categoryKeywordForm.getRawValue().keyword);
        this.spinner.start('main');
        this.nagiosSettingsService.keywordCategoryUpdate(this.selectedEventCategory.keywords, this.selectedEventCategory.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('keyword Added successfully.'));
          this.getEventCategories();
          this.selectedEventCategory.isAddkeywordsPopover = false;
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  deleteKeywordCategory(index: number, j: number) {
    this.category = this.eventCategories[index];
    this.category.keywords.splice(j, 1);
    this.spinner.start('main');
    this.nagiosSettingsService.keywordCategoryUpdate(this.category.keywords, this.category.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('keyword Deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  handleError(err: any) {
    this.eventFormErrors = this.nagiosSettingsService.eventFormErrors();
    this.eventCategoryFormErrors = this.nagiosSettingsService.eventFormErrors();
    this.eventKeywordFormErrors = this.nagiosSettingsService.resetKeywordFormErrors();
    this.categoryKeywordFormErrors = this.nagiosSettingsService.resetKeywordFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (this.eventTypeForm && field in this.eventTypeForm.controls) {
          this.eventCategoryFormErrors[field] = err[field][0];
        }
        if (this.eventCategoryForm && field in this.eventCategoryForm.controls) {
          this.eventFormErrors[field] = err[field][0];
        }
        if (this.eventKeywordForm && field in this.eventKeywordForm.controls) {
          this.eventKeywordFormErrors[field] = err[field][0];
        }
        if (this.categoryKeywordForm && field in this.categoryKeywordForm.controls) {
          this.categoryKeywordFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  buildKeywordForm() {
    this.eventKeywordForm = this.nagiosSettingsService.buildKeywordForm();
    this.eventKeywordFormErrors = this.nagiosSettingsService.resetKeywordFormErrors();
    this.eventKeywordFormValidationMessages = this.nagiosSettingsService.keywordFormValidationMessages;
  }

  buildCategoryKeywordForm() {
    this.categoryKeywordForm = this.nagiosSettingsService.buildKeywordForm();
    this.categoryKeywordFormErrors = this.nagiosSettingsService.resetKeywordFormErrors();
    this.categoryKeywordFormValidationMessages = this.nagiosSettingsService.keywordFormValidationMessages;
  }

  addEventTypeKeyword(index: number) {
    this.buildKeywordForm();
    this.selectedEventType = this.eventTypes[index];
    this.eventTypes.forEach(et => {
      et.isAddkeywordsPopover = false;
      et.isAddEventCategoryPopover = false;
    })
    setTimeout(() => {
      this.eventTypes[index].isAddkeywordsPopover = true;
    })
  }

  onSubmitEventTypeKeyword() {
    if (this.eventKeywordForm.invalid) {
      this.eventKeywordFormErrors = this.utilService.validateForm(this.eventKeywordForm, this.eventKeywordFormValidationMessages, this.eventKeywordFormErrors);
      this.eventKeywordForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.eventKeywordFormErrors = this.utilService.validateForm(this.eventKeywordForm, this.eventKeywordFormValidationMessages, this.eventKeywordFormErrors);
      });
    } else {
      const newKeyword = this.eventKeywordForm.getRawValue().keyword;
      if (this.selectedEventType.keywords.includes(newKeyword)) {
        this.notification.error(new Notification('Keyword already exists'));
      } else {
        this.selectedEventType.keywords.push(newKeyword);
        this.spinner.start('main');
        this.nagiosSettingsService.keywordUpdate(this.selectedEventType.keywords, this.selectedEventType.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Keyword added successfully.'));
          this.getEventTypes();
          this.selectedEventType.isAddkeywordsPopover = false;
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  deleteKeyword(index: number, j: number) {
    this.event = this.eventTypes[index];
    this.event.keywords.splice(j, 1);
    this.spinner.start('main');
    this.nagiosSettingsService.keywordUpdate(this.event.keywords, this.event.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('keyword Deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  bindEventCategoryToEventType(index: number) {
    this.selectedEventType = this.eventTypes[index];
    this.eventTypes.forEach(et => {
      et.isAddkeywordsPopover = false;
      et.isAddEventCategoryPopover = false;
    })
    setTimeout(() => {
      this.eventTypes[index].isAddEventCategoryPopover = true;
    })
  }

  onEventCategoryChecked(event: any, categoryType: string) {
    this.selectedCategory = _clone(this.selectedEventType.categories);
    if (event.target.checked) {
      this.selectedCategory.push(categoryType);
    } else {
      const index = this.selectedCategory.indexOf(categoryType);
      if (index !== -1) {
        this.selectedCategory.splice(index, 1);
      }
    }
  }

  onSubmitEventCategory() {
    if (!this.selectedCategory.length) {
      this.notification.error(new Notification('Keyword Not Selected'));
    } else {
      this.spinner.start('main');
      this.nagiosSettingsService.eventCategorykeywordUpdate(this.selectedCategory, this.selectedEventType.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Keyword Added successfully.'));
        this.getEventTypes();
        this.selectedEventType.isAddEventCategoryPopover = false;
        this.onAddMultiselect = false;
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  deleteEventCategoryKeyword(index: number, j: number) {
    this.event = this.eventTypes[index];
    this.event.categories.splice(j, 1);
    this.spinner.start('main');
    this.nagiosSettingsService.eventCategorykeywordUpdate(this.selectedCategory, this.event.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('EVent-Type keyword Deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  addEventCategoryKeyword(index: number) {
    this.buildCategoryKeywordForm();
    this.selectedEventCategory = this.eventCategories[index];
    this.eventCategories.forEach(et => {
      et.isAddkeywordsPopover = false;
      et.isAddEventTypePopover = false;
    })
    setTimeout(() => {
      this.eventCategories[index].isAddkeywordsPopover = true;
    })
  }

  bindEventTypeToEventCategory(index: number) {
    this.selectedEventCategory = this.eventCategories[index];
    this.eventCategories.forEach(et => {
      et.isAddkeywordsPopover = false;
      et.isAddEventTypePopover = false;
    })
    setTimeout(() => {
      this.eventCategories[index].isAddEventTypePopover = true;
    })
  }

  onCategoryEventChecked(event: any, eventType: string) {
    this.selectedEvent = _clone(this.selectedEventCategory.types);
    if (event.target.checked) {
      this.selectedEvent.push(eventType);
    } else {
      const index = this.selectedEvent.indexOf(eventType);
      if (index !== -1) {
        this.selectedEvent.splice(index, 1);
      }
    }
  }

  onSubmitCategoryEvent() {
    if (!this.selectedEvent.length) {
      this.notification.error(new Notification('Keyword Not Selected'));
    } else {
      this.spinner.start('main');
      this.nagiosSettingsService.categoryEventkeywordUpdate(this.selectedEvent, this.selectedEventCategory.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.notification.success(new Notification('Keyword Added successfully.'));
        this.getEventCategories();
        this.selectedEventCategory.isAddEventTypePopover = false;
        this.onAddMultiselect = false;
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  deleteCategoryEventKeyword(index: number, k: number) {
    this.category = this.eventCategories[index];
    this.category.types.splice(k, 1);
    this.spinner.start('main');
    this.nagiosSettingsService.categoryEventkeywordUpdate(this.selectedEvent, this.category.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('EVent-Category keyword Deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  eventDelete(uuid: string, index: number) {
    if (uuid) {
      this.seletedEventId = uuid;
      this.confirmEventDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    } else {
      this.eventTypes.splice(index, 1);
    }
  }

  confirmEventDelete() {
    this.nagiosSettingsService.eventDelete(this.seletedEventId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmEventDeleteModalRef.hide();
      this.notification.success(new Notification('Event deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
      this.getEventTypes();
    }, err => {
      this.confirmEventDeleteModalRef.hide();
      this.notification.error(new Notification('Event could not be deleted!!'));
    });
  }

  categoryDelete(uuid: string, index: number) {
    if (uuid) {
      this.selectedCategoryId = uuid;
      this.confirmCategoryDeleteModalRef = this.modalService.show(this.confirmdeleteCategory, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    } else {
      this.eventCategories.splice(index, 1);
    }
  }

  confirmCategoryDelete() {
    this.nagiosSettingsService.categoryDelete(this.selectedCategoryId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmCategoryDeleteModalRef.hide();
      this.notification.success(new Notification('Category deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
      this.getEventCategories();
    }, err => {
      this.confirmCategoryDeleteModalRef.hide();
      this.notification.error(new Notification('Category could not be deleted!!'));
    });
  }

}
