import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeviceDiscoveryCabinetsService, DeviceDiscCabinetViewData } from './device-discovery-cabinets.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil, tap } from 'rxjs/operators';
import { CabinetCrudService } from 'src/app/app-shared-crud/cabinet-crud/cabinet-crud.service';
import { DataCenterCabinet } from 'src/app/united-cloud/shared/entities/datacenter-cabinet.type';

@Component({
  selector: 'device-discovery-cabinets',
  templateUrl: './device-discovery-cabinets.component.html',
  styleUrls: ['./device-discovery-cabinets.component.scss'],
  providers: [DeviceDiscoveryCabinetsService]
})
export class DeviceDiscoveryCabinetsComponent implements OnInit, OnDestroy {
  cabinets: DataCenterCabinet[] = [];
  viewData: DeviceDiscCabinetViewData[] = [];
  private ngUnsubscribe = new Subject();
  poll: boolean = false;
  currentCriteria: SearchCriteria;
  count: number = 0;

  constructor(private cabinetService: DeviceDiscoveryCabinetsService,
    private spinner: AppSpinnerService,
    private crudSvc: CabinetCrudService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0 };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getCabinets();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getCabinets();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCabinets();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCabinets();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getCabinets();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinner.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getCabinets();
    }
  }

  getCabinets() {
    this.cabinetService.getCabinets(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets = res;
      this.count = res.length;
      this.viewData = this.cabinetService.convertToViewData(this.cabinets);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  add() {
    this.crudSvc.addOrEditCabinet(null);
  }

  edit(index: number) {
    this.crudSvc.addOrEditCabinet(this.cabinets[index]);
  }

  delete(view: DeviceDiscCabinetViewData) {
    this.crudSvc.deleteCabinet(view.cabinetId);
  }
}
