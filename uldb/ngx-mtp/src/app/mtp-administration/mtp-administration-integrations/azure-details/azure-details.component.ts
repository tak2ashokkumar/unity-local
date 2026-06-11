import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { TabData } from 'src/app/shared/tabdata';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AzureCrudService } from '../azure-crud/azure-crud.service';
import { AzureAccountsViewData, AzureDetailsService } from './azure-details.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'azure-details',
  templateUrl: './azure-details.component.html',
  styleUrls: ['./azure-details.component.scss'],
  providers: [AzureDetailsService]
})
export class AzureDetailsComponent implements OnInit, OnDestroy {

  public tabItems: TabData[] = [{
    name: 'Azure',
    url: '/administration/integration/azure'
  }];

  private ngUnsubscribe = new Subject();

  viewData: AzureAccountsViewData[] = [];
  filteredViewData: AzureAccountsViewData[] = [];
  pagedviewData: AzureAccountsViewData[] = [];
  currentCriteria: SearchCriteria;
  count: number = 0;
  poll: boolean = false;
  azureaccount: AzureAccountsViewData;
  fieldsToFilterOn: string[] = ['accountName', 'subscriptionId'];
  azureAccountIndex: number;

  @ViewChild('changeazurePassword') changeazurePassword: ElementRef;
  changeAzurepasswordModalRef: BsModalRef;
  resetPasswordErrors: any;
  validationPasswordMessages: any;
  changePasswordAzureForm: FormGroup;

  constructor(private accountService: AzureDetailsService,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private clientSidePage: ClientSidePage,
    private crudSvc: AzureCrudService,
    private router: Router,
    private route: ActivatedRoute,) {
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

  onCrud(event: CRUDActionTypes) {
    this.getAccounts();
  }

  // private filterAndPage() {
  //   this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
  //   this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  // }

  // onSearched(event: string) {
  //   this.currentCriteria.searchValue = event;
  //   this.currentCriteria.pageNo = 1;
  //   this.filterAndPage();
  // }

  // pageChange(pageNo: number) {
  //   this.currentCriteria.pageNo = pageNo;
  //   this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  // }

  // pageSizeChange(pageSize: number) {
  //   this.currentCriteria.pageSize = pageSize;
  //   this.currentCriteria.pageNo = 1;
  //   this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  // }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getAccounts();
  }

  getAccounts() {
    this.accountService.getAccounts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.accountService.convertToViewdata(res.results);
      // this.filterAndPage();
      this.spinnerService.stop('main');
    }, err => {
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
      this.spinnerService.stop('main');
    });
  }

  addAzureAccount() {
    this.crudSvc.addOrEdit(null);
  }

  deleteAzureAccount(index: number) {
    this.crudSvc.delete(this.viewData[index].uuid);
  }

  editAzureAccount(index: number) {
    this.crudSvc.addOrEdit(this.viewData[index]);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  
}
