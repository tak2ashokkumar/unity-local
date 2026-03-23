import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, throwError } from 'rxjs';
import { catchError, switchMap, take, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { TabData } from 'src/app/shared/tabdata';
import { DeviceTabData } from '../../../device-tab/device-tab.component';
import { VmsVmwareSnapshotsService, VmsVmwareSnapshotViewdata } from './vms-vmware-snapshots.service';

@Component({
  selector: 'vms-vmware-snapshots',
  templateUrl: './vms-vmware-snapshots.component.html',
  styleUrls: ['./vms-vmware-snapshots.component.scss'],
  providers: [VmsVmwareSnapshotsService]
})
export class VmsVmwareSnapshotsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  vmId: string = '';
  currentRouteUrl: string = '';
  device: DeviceTabData = { name: '', deviceType: null };
  tabData: TabData[] = tabData;
  viewData: VmsVmwareSnapshotViewdata[] = [];
  selectedView: VmsVmwareSnapshotViewdata;
  nonFieldErr: string = '';

  @ViewChild('snapShotFormRef') snapShotFormRef: ElementRef;
  snapShotForm: FormGroup;
  snapShotFormErrors: any;
  snapShotFormValidationMessages: any;

  @ViewChild('confirmDelete') confirmDelete: ElementRef;
  @ViewChild('confirmDeleteAll') confirmDeleteAll: ElementRef;
  @ViewChild('confirmRevert') confirmRevert: ElementRef;
  modalRef: BsModalRef;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private appService: AppLevelService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private snapShotSvc: VmsVmwareSnapshotsService) {
    this.route.parent.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat('/' + path.path));
    });
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat('/' + path.path));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat('/' + path.path));
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.vmId = params.get('deviceid');
    });
  }

  ngOnInit() {
    this.loadTabs();
    this.getSanpshots();
  }

  loadTabs() {
    this.device = <DeviceTabData>this.storageService.getByKey('device', StorageType.SESSIONSTORAGE);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storageService.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  goTo(url: string) {
    this.router.navigate([url], { relativeTo: this.route });
  }

  isActive(tab: TabData) {
    if (this.router.url.match(this.currentRouteUrl)) {
      return 'text-success';
    }
    return '';
  }

  getSanpshots() {
    this.spinner.start('main');
    this.snapShotSvc.getSnapShots(this.vmId).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.viewData = this.snapShotSvc.convertToViewdata(res.result.data);
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Unable while fetching snapshots. Please try again!!'));
    });
  }

  takeSnapshot() {
    this.nonFieldErr = '';
    this.snapShotForm = this.snapShotSvc.buildForm();
    this.snapShotFormErrors = this.snapShotSvc.resetSnapshotFormErrors();
    this.snapShotFormValidationMessages = this.snapShotSvc.snapshotFormValidationMessages;
    this.modalRef = this.modalService.show(this.snapShotFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.snapShotFormErrors = this.snapShotSvc.resetSnapshotFormErrors();
    if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.snapShotForm.controls) {
          this.snapShotFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  private pollForTask(res: CeleryTask) {
    if (res.task_id) {
      this.modalRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('Request is being processed. Snapshot data will be updated shortly'));
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    } else {
      throw new Error('Something went wrong !... Please try again later');
    }
  }

  submitCreateSnapshot() {
    if (this.snapShotForm.invalid) {
      this.snapShotFormErrors = this.utilService.validateForm(this.snapShotForm, this.snapShotFormValidationMessages, this.snapShotFormErrors);
      this.snapShotForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.snapShotFormErrors = this.utilService.validateForm(this.snapShotForm, this.snapShotFormValidationMessages, this.snapShotFormErrors); });
    } else {
      this.spinner.start('main');
      this.snapShotSvc.createSnapshot(this.vmId, this.snapShotForm.getRawValue()).pipe(catchError((e: HttpErrorResponse) => {
        return throwError(e);
      }), switchMap(res => {
        return this.pollForTask(res);
      }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.getSanpshots();
        this.spinner.stop('main');
        this.notification.success(new Notification('Snapshot Created successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  deleteSnapshot(view: VmsVmwareSnapshotViewdata) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirmDelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmSnapshotDelete() {
    this.spinner.start('main');
    this.snapShotSvc.deleteSnapshot(this.vmId, this.selectedView).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.getSanpshots();
      this.modalRef.hide();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while deleting snapshot. Please try again!!'));
    });
  }

  deleteAllSnapshots() {
    if (this.viewData.length) {
      this.modalRef = this.modalService.show(this.confirmDeleteAll, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    }
  }

  confirmDeleteAllSnapshots() {
    this.spinner.start('main');
    this.snapShotSvc.deleteAllSnapshots(this.vmId).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.getSanpshots();
      this.modalRef.hide();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while deleting snapshot. Please try again!!'));
    });
  }

  revertSnapshot(view: VmsVmwareSnapshotViewdata) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirmRevert, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmRevertSnapshot() {
    this.spinner.start('main');
    this.snapShotSvc.revertSnapshot(this.vmId, this.selectedView).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      return this.pollForTask(res);
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.getSanpshots();
      this.modalRef.hide();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while reverting the snapshot. Please try again!!'));
    });
  }
}

const tabData: TabData[] = [
  {
    name: 'Snapshots',
    url: 'snapshots',
  }
]
