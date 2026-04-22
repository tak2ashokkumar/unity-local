import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { OCI_ACCOUNT_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { PublicCloudOciCrudService } from 'src/app/app-shared-crud/public-cloud-oci-crud/public-cloud-oci-crud.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { OCIAccountType } from '../../entities/oci-account.type';
import { OCIAccountViewData, PublicCloudOciAccountsService } from './public-cloud-oci-accounts.service';

@Component({
  selector: 'public-cloud-oci-accounts',
  templateUrl: './public-cloud-oci-accounts.component.html',
  styleUrls: ['./public-cloud-oci-accounts.component.scss'],
  providers: [PublicCloudOciAccountsService]
})
export class PublicCloudOciAccountsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  viewData: OCIAccountViewData[] = [];
  count: number;
  currentCriteria: SearchCriteria;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: PublicCloudOciAccountsService,
    private spinnerService: AppSpinnerService,
    private ticketService: SharedCreateTicketService,
    private crudSvc: PublicCloudOciCrudService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getAccounts();
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
    this.getAccounts();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAccounts();
  }

  onCrud(event: CRUDActionTypes) {
    this.spinnerService.start('main');
    if (event == CRUDActionTypes.ADD) {
      this.currentCriteria.pageNo = 1;
    }
    this.getAccounts();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getAccounts();
  }

  getAccounts() {
    this.accountService.getAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<OCIAccountType>) => {
      this.count = data.count;
      this.viewData = this.accountService.convertToViewData(data.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  goToInventory(view: OCIAccountViewData) {
    this.router.navigate(['../overview', view.uuid, 'vms'], { relativeTo: this.route });
  }

  addAccount() {
    this.crudSvc.addOrEdit(null);
  }

  editAccount(view: OCIAccountViewData) {
    this.crudSvc.addOrEdit(view);
  }

  deleteAccount(view: OCIAccountViewData) {
    this.crudSvc.delete(view.uuid);
  }

  createTicket(view: OCIAccountViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(view.name, view.region), metadata: OCI_ACCOUNT_TICKET_METADATA(view.name)
    });
  }
}
