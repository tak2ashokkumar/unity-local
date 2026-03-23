import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JiraInstance } from 'src/app/shared/SharedEntityTypes/jira.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { TabData } from 'src/app/shared/tabdata';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UsiJiraService } from './usi-jira.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { UsiJiraCrudService } from './usi-jira-crud/usi-jira-crud.service';

@Component({
  selector: 'usi-jira',
  templateUrl: './usi-jira.component.html',
  styleUrls: ['./usi-jira.component.scss'],
  providers: [UsiJiraService]
})
export class UsiJiraComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = [{
    name: 'JIRA',
    url: '/setup/integration/jira'
  }];
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  instanceList: JiraInstance[] = [];
  instanceId: string;

  constructor(private svc: UsiJiraService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    public userService: UserInfoService,
    private crudSvc: UsiJiraCrudService,
    private route: ActivatedRoute) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getInstances();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getInstances();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getInstances();
  }

  getInstances() {
    this.svc.getInstances(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instanceList = res;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch JIRA instances. Tryagain later.'))
    });
  }

  add() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(view: JiraInstance) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
  }

  showProjects(view: JiraInstance) {
    this.crudSvc.showProjects(view.uuid);
  }

  delete(view: JiraInstance) {
    this.crudSvc.deleteAccount(view.uuid);
  }

  onCrud(event: CRUDActionTypes) {
    this.spinner.start('main');
    this.getInstances();
  }

  goTo(view: JiraInstance) {
    this.router.navigate(['support/ticketmgmt', view.uuid]);
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
