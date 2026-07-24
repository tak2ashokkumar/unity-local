import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DockerContainerService, DockerContainersViewdata } from './docker-container.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Subject, from, interval } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { tap, switchMap, takeWhile, takeUntil, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'docker-container',
  templateUrl: './docker-container.component.html',
  styleUrls: ['./docker-container.component.scss'],
  providers: [DockerContainerService]
})
export class DockerContainerComponent implements OnInit, OnDestroy {
  count: number = 0;
  viewData: DockerContainersViewdata[] = [];
  controllerId: string;
  selectedContainerId: string;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  poll: boolean = false;

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;

  constructor(private route: ActivatedRoute,
    private notification: AppNotificationService,
    private router: Router,
    private spinnerService: AppSpinnerService,
    private containerService: DockerContainerService,
    private termService: FloatingTerminalService,
    private storageService: StorageService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'account_uuid': this.controllerId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(this.controllerId ? environment.pollingInterval * 6 : environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.controllerId ? this.syncContainers() : this.getContainers());
  }
  ngOnInit() {
    if (this.controllerId) {
      this.getContainers();
      this.syncContainers();
    } else {
      this.getContainers();
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

  syncContainers() {
    this.spinnerService.start('main');
    this.containerService.syncContainers(this.controllerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      if (status.result.data) {
        this.spinnerService.stop('main');
        this.getContainers();
      } else {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Docker connection failed. Please Contact administrator!'));
      }
      // this.getContainers();
    }, (err: Error) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching Containers.'));
    });
  }

  getContainers() {
    this.containerService.getContainers(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.containerService.convertToViewdata(data.results);
      this.spinnerService.stop('main');
      this.getDeviceData();
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching Containers.'));
    });
  }

  getDeviceData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.containerService.getDeviceData(e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  goToStats(view: DockerContainersViewdata) {
    if (!view.monitoring.configured || !view.monitoring.enabled || view.status != 'running') {
      return;
    }
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.DOCKER_CONTAINER, configured: view.monitoring.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.containerId, 'zbx', 'monitoring-graphs'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
