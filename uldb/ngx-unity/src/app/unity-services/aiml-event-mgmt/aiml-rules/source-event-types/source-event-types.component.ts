import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { EventTypeViewData, SourceEventTypesService } from './source-event-types.service';


@Component({
  selector: 'source-event-types',
  templateUrl: './source-event-types.component.html',
  styleUrls: ['./source-event-types.component.scss'],
  providers: [SourceEventTypesService]
})
export class SourceEventTypesComponent implements OnInit, OnDestroy {
  // @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  nonFieldErr: string = '';

  eventTypes: EventTypeViewData[] = [];
  selectedEventType: EventTypeViewData = new EventTypeViewData();

  eventTypeForm: FormGroup;
  eventFormErrors: any;
  eventFormValidationMessages: any;

  eventKeywordForm: FormGroup;
  eventKeywordFormErrors: any;
  eventKeywordFormValidationMessages: any;
  event: EventTypeViewData;
  seletedEventId: string;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmEventDeleteModalRef: BsModalRef;

  constructor(private eventTypeService: SourceEventTypesService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.HUNDRED };

  }

  ngOnInit(): void {
    this.getEventTypes();
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
    this.getEventTypes();
  }

  onSearchedEvent(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEventTypes();
  }

  refreshData() {
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.searchValue = '';
    this.getEventTypes();
  }

  getEventTypes() {
    this.spinner.start('main');
    this.eventTypeService.getEventTypes(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.eventTypes = this.eventTypeService.convertToEventTypeViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Event'));
    })
  }

  addEventType() {
    const InvalidEvent = this.eventTypes.find(event => event.onForm && event.eventForm.invalid);
    if(InvalidEvent){
      this.eventTypes.forEach(event => {
        if(event.onForm && event.eventForm.invalid){
          this.eventFormErrors = this.utilService.validateForm(event.eventForm, event.eventFormValidationMessage, event.eventFormErrors);
        }
      });
      return;
    }
    const newEvent: EventTypeViewData = new EventTypeViewData();
    newEvent.onForm = true;
    newEvent.statusIconClass = 'fas fa-toggle-on';
    newEvent.eventForm = this.eventTypeService.buildForm(null);
    newEvent.eventFormErrors = this.eventTypeService.eventFormErrors();
    newEvent.eventFormValidationMessage = this.eventTypeService.eventFormValidationMessage;
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

  resetEventName(view: EventTypeViewData) {
    view.eventForm = this.eventTypeService.buildForm(view.name);
    if (view.name) {
      if (view.onForm) {
        view.onForm = false;
      }
    } else {
      this.eventTypes.shift();
    }
  }

  onSubmitEvent(view: EventTypeViewData) {
    if (view.eventForm.invalid) {
      view.eventFormErrors = this.utilService.validateForm(view.eventForm, view.eventFormValidationMessage, view.eventFormErrors);
      view.eventForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        view.eventFormErrors = this.utilService.validateForm(view.eventForm, view.eventFormValidationMessage, view.eventFormErrors);
      });
    } else {
      this.spinner.start('main');
      if (view.uuid) {
        this.eventTypeService.eventUpdate(view.eventForm.getRawValue(), view.uuid).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.notification.success(new Notification('Event updated successfully'));
            view.onForm = false;
            this.getEventTypes();
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
      } else {
        this.eventTypeService.eventAdd(this.eventTypeForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
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
    this.eventTypeService.eventDelete(this.seletedEventId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmEventDeleteModalRef.hide();
      this.notification.success(new Notification('Event deleted successfully.'));
      this.getEventTypes();
    }, err => {
      this.confirmEventDeleteModalRef.hide();
      this.notification.error(new Notification('Event could not be deleted!!'));
    });
  }

  handleError(err: any) {
    this.eventFormErrors = this.eventTypeService.eventFormErrors();
    this.eventKeywordFormErrors = this.eventTypeService.resetKeywordFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (this.eventTypeForm && field in this.eventTypeForm.controls) {
          this.eventFormErrors[field] = err[field][0];
        }
        if (this.eventKeywordForm && field in this.eventKeywordForm.controls) {
          this.eventKeywordFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
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

  buildKeywordForm() {
    this.eventKeywordForm = this.eventTypeService.buildKeywordForm();
    this.eventKeywordFormErrors = this.eventTypeService.resetKeywordFormErrors();
    this.eventKeywordFormValidationMessages = this.eventTypeService.keywordFormValidationMessages;
  }

  onSubmitEventTypeKeyword() {
    if (this.eventKeywordForm.invalid) {
      this.eventKeywordFormErrors = this.utilService.validateForm(this.eventKeywordForm, this.eventKeywordFormValidationMessages, this.eventKeywordFormErrors);
      this.eventKeywordForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.eventKeywordFormErrors = this.utilService.validateForm(this.eventKeywordForm, this.eventKeywordFormValidationMessages, this.eventKeywordFormErrors);
      });
    } else {
      const newKeyword = this.eventKeywordForm.getRawValue().keywords;
      if (this.selectedEventType.keywords.includes(newKeyword)) {
        this.notification.error(new Notification('Keyword already exists'));
      } else {
        this.selectedEventType.keywords.push(newKeyword);
        this.spinner.start('main');
        this.eventTypeService.keywordUpdate(this.selectedEventType.keywords, this.selectedEventType.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
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

  deleteKeyword(eventIndex: number, keywordIndex: number) {
    this.spinner.start('main');
    this.event = this.eventTypes[eventIndex];
    this.event.keywords.splice(keywordIndex, 1);
    this.eventTypeService.keywordUpdate(this.event.keywords, this.event.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Keyword removed successfully.'));
      this.getEventTypes();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }
}
