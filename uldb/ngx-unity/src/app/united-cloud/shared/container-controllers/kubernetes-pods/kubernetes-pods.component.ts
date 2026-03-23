import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { KubernetesPodsService, KubernetesPodsViewdata } from './kubernetes-pods.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Subject, interval } from 'rxjs';
import { takeUntil, takeWhile, switchMap, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'kubernetes-pods',
  templateUrl: './kubernetes-pods.component.html',
  styleUrls: ['./kubernetes-pods.component.scss'],
  providers: [KubernetesPodsService]
})
export class KubernetesPodsComponent implements OnInit, OnDestroy {
  count: number = 0;
  viewData: KubernetesPodsViewdata[] = [];
  controllerId: string;
  selectedPodId: string;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  poll: boolean = false;

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;

  constructor(private route: ActivatedRoute,
    private notification: AppNotificationService,
    private router: Router,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private podsService: KubernetesPodsService,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'account_uuid': this.controllerId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(this.controllerId ? environment.pollingInterval * 6 : environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.controllerId ? this.syncPod() : this.getPods());
  }

  ngOnInit() {
    if (this.controllerId) {
      this.syncPod();
    } else {
      this.getPods();
    }
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
    this.getPods();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getPods();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getPods();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getPods();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getPods();
  }

  syncPod() {
    this.spinnerService.start('main');
    this.podsService.syncPods(this.controllerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      if (status.result.data) {
        this.spinnerService.stop('main');
        this.getPods();
      } else {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Kubernetes connection failed. Please Contact administrator!'));
      }
    }, (err: Error) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching Pods.'));
    });
  }

  getPods() {
    this.podsService.getPods(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.podsService.convertToViewdata(data.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching Pods.'));
    });
  }

  goToContainers(view: KubernetesPodsViewdata) {
    this.router.navigate([view.podId, 'containers'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  deletePod(view: KubernetesPodsViewdata) {
    this.selectedPodId = view.podId;
    this.deleteModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinnerService.start('main');
    this.podsService.deletePod(this.selectedPodId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deleteModalRef.hide();
      this.getPods();
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Pod deleted Successfully'));
    }, (err: HttpErrorResponse) => {
      this.deleteModalRef.hide();
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Pod delete Failed. Please try again later!!'));
    });
  }
}
