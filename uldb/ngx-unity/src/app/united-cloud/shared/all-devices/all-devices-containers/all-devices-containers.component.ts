import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AllDevicesContainersService, AllDevicePodsViewData } from './all-devices-containers.service';

@Component({
  selector: 'all-devices-containers',
  templateUrl: './all-devices-containers.component.html',
  styleUrls: ['./all-devices-containers.component.scss'],
  providers: [AllDevicesContainersService]
})
export class AllDevicesContainersComponent implements OnInit, OnDestroy {
  count: number = 0;
  private pcId: string;
  viewData: AllDevicePodsViewData[] = [];
  selectedPodId: string;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  poll: boolean = false;

  constructor(private route: ActivatedRoute,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService,
    private containerPodsService: AllDevicesContainersService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0, params: [{ 'cloud_uuid': this.pcId }] };
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start('allcon');
      this.getPods();
    }, 0);
  }

  ngOnDestroy() {
    this.spinnerService.stop('allcon');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getPods();
  }

  getPods() {
    this.containerPodsService.getAllPods(this.pcId,this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.length;
      this.viewData = this.containerPodsService.convertToViewdata(data);
      this.spinnerService.stop('allcon');
    }, err => {
      this.spinnerService.stop('allcon');
      this.notification.error(new Notification('Error while fetching Pods.'));
    });
  }
}


