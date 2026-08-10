import { Component, OnInit, OnDestroy } from '@angular/core';
import { KubernetesContainersService, KubernetesContainersViewdata } from './kubernetes-containers.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, tap, switchMap, takeWhile } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { environment } from 'src/environments/environment';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { KubernetesMonitoringService } from 'src/app/shared/shared-container-controllers/kubernetes-monitoring.service';

@Component({
  selector: 'kubernetes-containers',
  templateUrl: './kubernetes-containers.component.html',
  styleUrls: ['./kubernetes-containers.component.scss'],
  providers: [KubernetesContainersService]
})
export class KubernetesContainersComponent implements OnInit, OnDestroy {
  count: number = 0;
  viewData: KubernetesContainersViewdata[] = [];
  private controllerId: string;
  private podId: string;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  poll: boolean = false;
  showMonitoring: boolean;

  constructor(private route: ActivatedRoute,
    private notification: AppNotificationService,
    private router: Router,
    private spinnerService: AppSpinnerService,
    private containerService: KubernetesContainersService,
    private termService: FloatingTerminalService,
    private k8sMon: KubernetesMonitoringService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
    });
    this.showMonitoring = !!(this.route.parent.parent && this.route.parent.parent.snapshot && this.route.parent.parent.snapshot.data && this.route.parent.parent.snapshot.data.monitoringEnabled);
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.podId = params.get('podId');
    });
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getContainers());
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getContainers();
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
    this.getContainers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getContainers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getContainers();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getContainers();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getContainers();
  }

  getContainers() {
    this.containerService.getContainers(this.controllerId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.containerService.convertToViewdata(data.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching Containers.'));
    });
  }

  goToStats(view: KubernetesContainersViewdata) {
    this.k8sMon.goToStats(this.router, this.route, DeviceMapping.KUBERNETES_CONTAINER, view.uuid, view.name, view.monitoring);
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
