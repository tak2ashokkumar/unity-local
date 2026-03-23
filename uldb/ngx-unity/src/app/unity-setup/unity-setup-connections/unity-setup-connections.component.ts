import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConnectionConfigViewData, UnitySetupConnectionsService } from './unity-setup-connections.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { ConnectionConfigType } from './unity-setup-connections-crud/unity-setup-connections.type';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'unity-setup-connections',
  templateUrl: './unity-setup-connections.component.html',
  styleUrls: ['./unity-setup-connections.component.scss'],
  providers: [UnitySetupConnectionsService]
})
export class UnitySetupConnectionsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number;
  viewData: ConnectionConfigViewData[] = [];
  @ViewChild('edit') edit: ElementRef;
  editModelRef: BsModalRef;
  connectionUUID: string;

  deleteConnectionModalRef: BsModalRef;
  @ViewChild('deleteconnection') deleteconnection: ElementRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: UnitySetupConnectionsService,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getConnections();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getConnections();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getConnections();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getConnections();
  }

  getConnections() {
    this.svc.getConnections(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<ConnectionConfigType>) => {
      this.spinner.stop('main');
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    });
  }

  addConnection(){
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  editConnection(view: ConnectionConfigViewData){
    this.connectionUUID = view.uuid;
    this.editModelRef = this.modalService.show(this.edit, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEdit() {
    this.editModelRef.hide();
    this.router.navigate([this.connectionUUID, 'update'], { relativeTo: this.route });
  }

  deleteConnection(uuid: string) {
    this.connectionUUID = uuid;
    this.deleteConnectionModalRef = this.modalService.show(this.deleteconnection, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmConnectionDelete() {
    this.deleteConnectionModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteConnection(this.connectionUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Connection deleted successfully.'));
      this.getConnections();
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Unable to delete Connection.Please try again Later.'));
    });
  }


}
