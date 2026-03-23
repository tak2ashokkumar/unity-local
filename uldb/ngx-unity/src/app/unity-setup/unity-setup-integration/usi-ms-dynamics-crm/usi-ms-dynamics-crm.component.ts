import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { TabData } from 'src/app/shared/tabdata';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { UsiMsDynamicsCrmCrudService } from './usi-ms-dynamics-crm-crud/usi-ms-dynamics-crm-crud.service';
import { MSDynamicsCRMClientType, MSDynamicsCRMType, UsiMsDynamicsCRMService } from './usi-ms-dynamics-crm.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'usi-ms-dynamics-crm',
  templateUrl: './usi-ms-dynamics-crm.component.html',
  styleUrls: ['./usi-ms-dynamics-crm.component.scss'],
  providers: [UsiMsDynamicsCRMService]
})
export class UsiMsDynamicsCRMComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = [{
    name: 'Microsoft Dynamics CRM',
    url: '/setup/integration/msdynamics'
  }];
  private ngUnsubscribe = new Subject();

  currentCriteria: SearchCriteria;
  count: number = 0;
  viewData: MSDynamicsCRMType[] = [];

  constructor(private svc: UsiMsDynamicsCRMService,
    private spinnerSvc: AppSpinnerService,
    public userService: UserInfoService,
    private router: Router,
    private usiMsCrmCrudSvc: UsiMsDynamicsCrmCrudService,
    private route: ActivatedRoute) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO };
  }

  ngOnInit() {
    this.spinnerSvc.start('main');
    this.getMSDynamicsCRMInstances();
  }

  ngOnDestroy() {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getMSDynamicsCRMInstances();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getMSDynamicsCRMInstances();
  }

  pageChange(pageNo: number) {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMSDynamicsCRMInstances();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getMSDynamicsCRMInstances();
  }

  refreshData(pageNo: number) {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMSDynamicsCRMInstances();
  }

  onCrud(event: CRUDActionTypes) {
    this.spinnerSvc.start('main');
    this.getMSDynamicsCRMInstances();
  }

  getMSDynamicsCRMInstances() {
    this.svc.getMSDynamicsClients(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = res;
      this.spinnerSvc.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinnerSvc.stop('main');
    });
  }

  goTo(data: MSDynamicsCRMClientType) {
    this.router.navigate(['support/ticketmgmt', data.uuid]);
  }

  add() {
    if (!this.userService.isUserAdmin) {
      return;
    }
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(data: MSDynamicsCRMType) {
    if (!this.userService.isUserAdmin) {
      return;
    }
    this.router.navigate([data.uuid, 'edit'], { relativeTo: this.route });
  }

  delete(data: MSDynamicsCRMType) {
    if (!this.userService.isUserAdmin) {
      return;
    }
    this.usiMsCrmCrudSvc.deleteAccount(data.uuid);
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
