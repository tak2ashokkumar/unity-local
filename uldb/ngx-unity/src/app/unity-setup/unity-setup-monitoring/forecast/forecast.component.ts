import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ForecastMetricViewData, ForecastService, ForecastViewData } from './forecast.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { DATABASE_GRAPH_TICKET_METADATA, DATABASE_GRAPH_TICKET_SUBJECT, SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { eventNames } from 'process';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss'],
  providers: [ForecastService]
})
export class ForecastComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;
  viewData: ForecastViewData[] = [];
  forecastId: string;
  deviceId: number;
  itemId: number;
  showBulkDeleteIcon: boolean = false;
  bulkDeletePayload: { host_id: number; item_ids: number[] }[] = [];

  expandedDeviceIndex: number | null = null;
  selectAllDevices = false;
  allDevicesSelected: boolean = false;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  @ViewChild('confirmBulkDelete') confirmBulkDelete: ElementRef;
  confirmBulkDeleteModalRef: BsModalRef;

  @ViewChild('confirmDeviceDelete') confirmDeviceDelete: ElementRef;
  confirmDeviceDeleteModalRef: BsModalRef;

  constructor(private svc: ForecastService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getForecastList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getForecastList();
    this.syncForecastList();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getForecastList();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getForecastList();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getForecastList();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getForecastList();
  }

  getForecastList() {
    this.svc.getForecast(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.svc.convertToViewData(data.results);
      this.count = data.count;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Forecast list'));
    });
  }

  toggleChildTable(index: number) {
    this.expandedDeviceIndex = this.expandedDeviceIndex === index ? null : index;
  }

  toggleAllDevices(checked: boolean) {
    checked ? this.showBulkDeleteIcon = true : this.showBulkDeleteIcon = false;
    this.viewData.forEach(device => {
      device.selected = checked;
      device.allMetricsSelected = checked;

      device.items.forEach(item => {
        item.selected = checked;
      });
    });
    if (checked) {
      this.bulkDeletePayload = this.viewData.map(device => ({
        host_id: device.id,
        item_ids: device.items.map(item => item.itemId)
      }));
    } else {
      this.bulkDeletePayload = [];
    }
  }

  onDeviceCheckboxChange(device: any, event: any) {
    const checked = event.target.checked;
    this.showBulkDeleteIcon = checked;
    if (checked) {
      device.allMetricsSelected = true;

      device.items.forEach(item => {
        item.selected = true;
      });

      // Construct the payload for this one device
      const itemIds = device.items.map(item => item.itemId);

      // Remove any existing entry for this device (prevent duplicates)
      this.bulkDeletePayload = this.bulkDeletePayload.filter(
        entry => entry.host_id !== device.id
      );

      // Add the new entry
      this.bulkDeletePayload.push({
        host_id: device.id,
        item_ids: itemIds
      });
    } else {
      device.allMetricsSelected = false;
      device.selected = false;

      device.items.forEach(item => {
        item.selected = false;
      });

      // Remove the device entry from bulkDeletePayload
      this.bulkDeletePayload = this.bulkDeletePayload.filter(
        entry => entry.host_id !== device.id
      );
      if (!this.bulkDeletePayload.length) {
        this.toggleAllDevices(false);
      }
    }
  }

  toggleAllMetrics(device: any, event: any): void {
    const checked = event.target.checked;
    this.showBulkDeleteIcon = checked;
    if (checked) {
      device.allMetricsSelected = true;

      device.items.forEach(item => {
        item.selected = true;
      });

      // Construct the payload for this one device
      const itemIds = device.items.map(item => item.itemId);

      // Remove any existing entry for this device (prevent duplicates)
      this.bulkDeletePayload = this.bulkDeletePayload.filter(
        entry => entry.host_id !== device.id
      );

      // Add the new entry
      this.bulkDeletePayload.push({
        host_id: device.id,
        item_ids: itemIds
      });
    } else {
      device.allMetricsSelected = false;
      device.selected = false;

      device.items.forEach(item => {
        item.selected = false;
      });

      // Remove the device entry from bulkDeletePayload
      this.bulkDeletePayload = this.bulkDeletePayload.filter(
        entry => entry.host_id !== device.id
      );
      if (!this.bulkDeletePayload.length) {
        this.toggleAllDevices(false);
      }
    }
  }


  toggleSingleItem(device: any, item: any, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const hostId = device.id;
    const itemId = item.itemId;
    this.showBulkDeleteIcon = checked;
    // Try to find existing entry for this host
    const payloadEntry = this.bulkDeletePayload.find(entry => entry.host_id === hostId);

    if (checked) {
      // Add item to payload
      if (payloadEntry) {
        // Only add if it's not already there
        if (!payloadEntry.item_ids.includes(itemId)) {
          payloadEntry.item_ids.push(itemId);
        }
      } else {
        // No entry yet, create one
        this.bulkDeletePayload.push({
          host_id: hostId,
          item_ids: [itemId]
        });
      }
    } else {
      // Remove item from payload
      if (payloadEntry) {
        payloadEntry.item_ids = payloadEntry.item_ids.filter(id => id !== itemId);

        // If no items left, remove the whole entry
        if (payloadEntry.item_ids.length === 0) {
          this.bulkDeletePayload = this.bulkDeletePayload.filter(entry => entry.host_id !== hostId);
        }
      }
      if (!this.bulkDeletePayload.length) {
        this.toggleAllDevices(false);
      }
    }

    // Optional: Update allMetricsSelected checkbox
    device.allMetricsSelected = device.items.every(i => i.selected);
  }


  updateBulkDeletePayload(): void {
    this.bulkDeletePayload = this.viewData
      .map(device => {
        const selectedItems = device.items
          .filter(item => item.selected)
          .map(item => item.itemId);

        if (selectedItems.length > 0) {
          return {
            host_id: device.id,
            item_ids: selectedItems
          };
        }
        return null;
      })
      .filter(entry => entry !== null) as { host_id: number; item_ids: number[] }[];

  }

  addForecast() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  EditForecast(device: ForecastViewData, j: number) {
    this.storageService.put('device', { uuid: device.uuid, deviceId: device.id, deviceType: device.deviceType, configured: true }, StorageType.SESSIONSTORAGE);
    this.router.navigate([device.items[j].itemId, 'edit'], { relativeTo: this.route });
  }

  bulkDeleteForecast() {
    this.confirmBulkDeleteModalRef = this.modalService.show(this.confirmBulkDelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  deleteForecast(device: ForecastViewData, index: number) {
    this.deviceId = device.id;
    this.itemId = device.items[index].itemId;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  deleteDeviceForecast(device: ForecastViewData){
    this.deviceId = device.id;
    this.confirmDeviceDeleteModalRef = this.modalService.show(this.confirmDeviceDelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmBulkForecastDelete() {
    this.confirmBulkDeleteModalRef.hide();
    this.spinner.start('main');
    this.svc.bulkDeleteForecast(this.bulkDeletePayload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Forecasts deleted successfully.'));
      this.showBulkDeleteIcon = !this.showBulkDeleteIcon;
      this.getForecastList();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Unable to delete Forecasts. Please try again.'));
    });
  }

  confirmForecastDelete() {
    this.confirmDeleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteForecast(this.deviceId, this.itemId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Forecast deleted successfully.'));
      this.getForecastList();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Unable to delete Forecast. Please try again.'));
    });
  }

  confirmDeviceForecastDelete(){
    this.confirmDeviceDeleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteDeviceForecast(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Forecast Device deleted successfully.'));
      this.getForecastList();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Unable to delete Forecast Device. Please try again.'));
    });
  }

  goToStats(device: ForecastViewData, index: number) {
    this.storageService.put('device', { itemId: device.items[index].itemId, deviceId: device.id, deviceType: device.deviceType, configured: true }, StorageType.SESSIONSTORAGE);
    this.router.navigate([device.uuid, 'graphs'], { relativeTo: this.route });
  }

  toggleMetric(device: ForecastViewData, i: number, j: number) {
    this.svc.toggleMetrics(device.items[j].enabled, device.id, device.items[j].itemId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      device.items[j].enabled = !device.items[j].enabled;
      const status = device.items[j].enabled ? 'enabled' : 'disabled';
      this.notification.success(new Notification(`Forecast Metric ${status} successfully`));
      this.getForecastList();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Update Forecast Metric'));
    });
  }

  viewForecastHistory(device: ForecastViewData, index: number) {
    this.storageService.put('device', { itemId: device.items[index].itemId, deviceId: device.id }, StorageType.SESSIONSTORAGE);
    this.router.navigate([device.uuid, 'history'], { relativeTo: this.route });
  }

  createTicket(device: ForecastViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(this.utilService.getDeviceMappingByDeviceType(device.deviceType), device.name),
      metadata: SUMMARY_TICKET_METADATA(this.utilService.getDeviceMappingByDeviceType(device.deviceType), device.name)
    }, this.utilService.getDeviceMappingByDeviceType(device.deviceType));
  }

  syncForecastList() {
    this.svc.syncForecastList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.svc.pollingResult(res.task_id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (data: TaskStatus) => {
            if (data.state === 'SUCCESS') {
              this.getForecastList();
              // this.notification.success(new Notification(data.result?.data));
            }
          },
          (err: HttpErrorResponse) => {
            this.spinner.stop('main');
            this.notification.error(new Notification('Failed to sync Forecasts'));
          }
        );
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Unable to Sync Forecast. Please try again.'));
    });
  }
}
