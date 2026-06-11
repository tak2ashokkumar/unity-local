import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { AutoTicketingSettingsViewData, MtpAdministrationAutoTicketService } from './mtp-administration-auto-ticket.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AutoTicketingSettings } from 'src/app/shared/SharedEntityTypes/mtp-settings.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'mtp-administration-auto-ticket',
  templateUrl: './mtp-administration-auto-ticket.component.html',
  styleUrls: ['./mtp-administration-auto-ticket.component.scss'],
  providers: [MtpAdministrationAutoTicketService]
})
export class MtpAdministrationAutoTicketComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;
  viewData: AutoTicketingSettingsViewData[] = [];
  formErrors: any;
  validationMessages: any;
  severityTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
  };

  severityOptions = [
    {
      label: 'Critical',
      value: 'critical'
    },
    {
      label: 'Warning',
      value: 'warning'
    },
    {
      label: 'Information',
      value: 'information'
    },
  ]

  defaultItsmSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: '',
    keyToSelect: '',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: '',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  statusButton: string = 'disable';
  selectedAll: boolean = true;
  @ViewChild('manage') manage: ElementRef;
  modalRef: BsModalRef;
  constructor(private svc: MtpAdministrationAutoTicketService,
    private notification: AppNotificationService,
    private router: Router,
    private spinner: AppSpinnerService,
    private modalService: BsModalService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getAutoTicketingSettings();
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.formValidationMessages;
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getAutoTicketingSettings();
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAutoTicketingSettings();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAutoTicketingSettings();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAutoTicketingSettings();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAutoTicketingSettings();
  }

  getAutoTicketingSettings() {
    this.svc.getAutoTicketingSettings(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.getTicketInstances();
    }, err => {
      this.viewData = [];
      this.spinner.stop('main');
    });
  }

  getTicketInstances() {
    let counter = 0;
    from(this.viewData).pipe(
      mergeMap((g) => {
        counter++;
        return this.svc.getTicketInstances(g);
      }),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        counter--;
        if (counter == 0) {
          for (let i = 0; i < this.viewData.length; i++) {
            this.viewData[i].form = this.svc.buildForm(this.viewData[i]);
          }
          this.formSubscriptions();
          this.spinner.stop('main');
        }
      }, err => console.log(err)
      )
  }

  formSubscriptions() {
    this.viewData.forEach((data, index) => {
      data.form.get('ticketing_instance').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
        if (val) {
          data.settings.ticketing_instance = data.ticketInstances.find(i => i.uuid == val);
        } else {
          data.settings.ticketing_instance = null;
        }
        this.updateSettings(index);
      });
      data.form.get('auto_ticketing_severity').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.settings.auto_ticketing_severity = val;
        this.updateSettings(index);
      });
      data.form.get('auto_ticketing_delay').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: number) => {
        data.settings.auto_ticketing_delay = val;
        this.updateSettings(index);
      });
    });
  }

  toggleSettings(i: number) {
    this.spinner.start('main');
    this.viewData[i].settings.auto_ticketing_enabled = !this.viewData[i].settings.auto_ticketing_enabled;
    this.svc.saveSettings(this.viewData[i].settings).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getAutoTicketingSettings()
      this.spinner.stop('main');
      this.notification.success(new Notification(`Tenant settings updated successfully.`));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.viewData[i].settings.auto_ticketing_enabled = !this.viewData[i].settings.auto_ticketing_enabled;
      this.notification.error(new Notification(`Failed to update tenant settings.`));
    });
  }

  updateSettings(i: number) {
    this.svc.saveSettings(this.viewData[i].settings).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getAutoTicketingSettings()
    }, (err: HttpErrorResponse) => {
    });
  }

  changeStatusView(status: string) {
    this.statusButton = status;
  }

  manageStatus() {
    this.modalRef = this.modalService.show(this.manage, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

}
