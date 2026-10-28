import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageType } from 'src/app/shared/app-storage/storage-type';
import { StorageService } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { VergeioVmViewData, VmsListVergeioService } from './vms-list-vergeio.service';

@Component({
  selector: 'vms-list-vergeio',
  templateUrl: './vms-list-vergeio.component.html',
  styleUrls: ['./vms-list-vergeio.component.scss'],
  providers: [VmsListVergeioService]
})
export class VmsListVergeioComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private pcId: string;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: VergeioVmViewData[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: VmsListVergeioService,
    private spinner: AppSpinnerService,
    private storageService: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getVMData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getVMData();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVMData();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getVMData();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVMData();
  }

  getVMData() {
    if (!this.pcId) {
      this.viewData = [];
      this.spinner.stop('main');
      return;
    }
    this.svc.getVMs(this.pcId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, () => {
      this.viewData = [];
      this.spinner.stop('main');
    });
  }

  goToMonitoring(view: VergeioVmViewData) {
    this.storageService.put('device', { name: view.name, deviceType: DeviceMapping.VERGEIO_VIRTUAL_MACHINE, configured: view.monitoring?.configured }, StorageType.SESSIONSTORAGE);
    this.router.navigate([view.uuid, 'zbx', 'details'], { relativeTo: this.route });
  }

  trackByUuid(index: number, view: VergeioVmViewData): string {
    return view.uuid;
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
