import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { ExcelOnBoardingNextPrevService } from '../excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelOnboardingInventoryViewdata, ExcelOnBoardingInventoryService } from './excel-on-boarding-inventory.service';

@Component({
  selector: 'excel-on-boarding-inventory',
  templateUrl: './excel-on-boarding-inventory.component.html',
  styleUrls: ['./excel-on-boarding-inventory.component.scss'],
  providers: [ExcelOnBoardingInventoryService]
})
export class ExcelOnBoardingInventoryComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  viewData: ExcelOnboardingInventoryViewdata = new ExcelOnboardingInventoryViewdata();

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  selectedDevice: { name: string, unique_id: string, uuid: string, device_type: string };
  fileIds: string[] = [];

  constructor(private nxtPrvSvc: ExcelOnBoardingNextPrevService,
    private InventorySvc: ExcelOnBoardingInventoryService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private storage: StorageService,
    private spinner: AppSpinnerService) {
    this.nxtPrvSvc.excelSaveCurrentAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.nxtPrvSvc.continueNextPrev();
    });
  }
  ngOnInit() {
    this.fileIds = <string[]>this.storage.getByKey('fileId', StorageType.SESSIONSTORAGE);
    if (!this.fileIds || !this.fileIds.length) {
      this.notification.error(new Notification('Please select atleast 1 file from the uploaded files'));
      return;
    }
    this.spinner.start('main');
    this.getInventory();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getInventory() {
    this.InventorySvc.getInventory(this.fileIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.InventorySvc.convertToViewdata(res.results);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }

  deleteDevice(name: string, uniqueId: string, uuid: string, deviceType: string, onboarded: string) {
    if (onboarded == 'Onboarded') {
      return;
    }
    this.selectedDevice = { name: name, unique_id: uniqueId, uuid: uuid, device_type: deviceType };
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.InventorySvc.deleteDevice(this.selectedDevice).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getInventory();
      this.spinner.stop('main');
      this.confirmDeleteModalRef.hide();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something went wrong!! Please try again later.'));
    });
  }
}
