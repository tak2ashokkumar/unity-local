import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DATACENTER_BILL_TICKET_METADATA, DATACENTER_BILL_TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { DCViewData, DatacenterCostSummaryService, DatacenterCostViewData } from './datacenter-cost-summary.service';

@Component({
  selector: 'datacenter-cost-summary',
  templateUrl: './datacenter-cost-summary.component.html',
  styleUrls: ['./datacenter-cost-summary.component.scss'],
  providers: [DatacenterCostSummaryService]
})
export class DatacenterCostSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  view: DatacenterCostViewData = new DatacenterCostViewData();

  constructor(private summaryService: DatacenterCostSummaryService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private ticketService: SharedCreateTicketService) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getDCBillingSummary();
    this.getDCBillingInfo();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(){
    this.spinner.start('main');
    this.getDCBillingSummary();
    this.getDCBillingInfo();
  }

  getDCBillingSummary() {
    this.summaryService.getDCBillSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.view.billSummary = this.summaryService.convertToSummaryViewData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    })
  }

  getDCBillingInfo() {
    this.summaryService.getDCBillingInfo().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.view.dcList = this.summaryService.convertToDcListViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    })
  }

  showBillDetails(dc: DCViewData) {
    if (!dc.billId) {
      return;
    }
    this.storageService.put('dcId', dc.dcId, StorageType.SESSIONSTORAGE);
    this.router.navigate(['billdetails'], { relativeTo: this.route.parent });
  }

  createTicket(dc: DCViewData) {
    this.ticketService.createTicket({
      subject: DATACENTER_BILL_TICKET_SUBJECT(dc.dcName),
      metadata: DATACENTER_BILL_TICKET_METADATA(dc.dcName, dc.dcLocation, dc.billAmount)
    });
  }
}
