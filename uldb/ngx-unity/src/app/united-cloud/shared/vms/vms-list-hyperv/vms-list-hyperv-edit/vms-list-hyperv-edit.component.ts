import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, throwError } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HypervVMHardwareConfig, HypervVMHardwareEditData, VmsListHypervService } from '../vms-list-hyperv.service';

@Component({
  selector: 'vms-list-hyperv-edit',
  templateUrl: './vms-list-hyperv-edit.component.html',
  styleUrls: ['./vms-list-hyperv-edit.component.scss']
})
export class VmsListHypervEditComponent implements OnInit, OnDestroy {
  @Input('pcId') pcId: string;
  @Output('created') created = new EventEmitter<void>();

  @ViewChild('editVMRef') editVMRef: TemplateRef<void>;
  editVmModelRef: BsModalRef;
  editData: HypervVMHardwareEditData;
  readonly cpuOptions: number[] = Array.from({ length: 32 }, (_value, index) => index + 1);
  readonly noSwitchesMessage = 'No Hyper-V switches were returned for this VM';

  private ngUnsubscribe = new Subject<void>();

  constructor(public hyperVService: VmsListHypervService,
    private appService: AppLevelService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService) { }

  ngOnInit(): void {
    this.hyperVService.editVMConfigAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(vm => {
      this.getVMHardwareConfig(vm.name);
    });
  }

  ngOnDestroy(): void {
    this.editVmModelRef?.hide();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getVMHardwareConfig(name: string): void {
    this.spinner.start('main');
    this.hyperVService.getVMHardwareConfig(this.pcId, name).pipe(
      switchMap(res => {
        const taskId = this.hyperVService.getTaskId(res);
        if (!taskId) {
          return throwError(new Error('Task id was not returned'));
        }
        return this.appService.pollForTask(taskId, 3, 200).pipe(take(1));
      }),
      take(1),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(res => {
      this.spinner.stop('main');
      const taskError = this.getTaskError(res);
      if (taskError) {
        this.notification.error(new Notification(taskError));
      } else if (res && res.result && res.result.data) {
        this.editData = this.hyperVService.createEditConfigData(<HypervVMHardwareConfig>res.result.data);
        this.editVmModelRef?.hide();
        this.editVmModelRef = this.modalService.show(this.editVMRef, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
      } else {
        this.notification.error(new Notification('Failed to fetch vm details'));
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification(err.error?.detail || 'Failed to fetch vm details'));
    });
  }

  addNewHardDiskToEdit(): void {
    this.editData.newHardDisks.push(this.hyperVService.addHardDiskDefaults());
  }

  removeOldHardDiskToEdit(index: number): void {
    this.editData.hardDisks[index].hardDiskDeleted = true;
  }

  restoreOldHardDiskToEdit(index: number): void {
    this.editData.hardDisks[index].hardDiskDeleted = false;
  }

  removeNewHardDiskToEdit(index: number): void {
    this.editData.newHardDisks.splice(index, 1);
  }

  addNewNetworkToEdit(): void {
    this.editData.newNetwork.push(this.hyperVService.addNetworkDefaults());
  }

  addNewDvdDriveToEdit(): void {
    this.editData.newDvdDrives.push(this.hyperVService.addDvdDriveDefaults());
  }

  addScsiControllerToEdit(): void {
    this.editData.newScsiControllers.push(this.hyperVService.addScsiControllerDefaults());
  }

  removeOldNetworkToEdit(index: number): void {
    this.editData.network[index].networkDeleted = true;
  }

  restoreOldNetworkToEdit(index: number): void {
    this.editData.network[index].networkDeleted = false;
  }

  removeNewNetworkToEdit(index: number): void {
    this.editData.newNetwork.splice(index, 1);
  }

  removeOldDvdDriveToEdit(index: number): void {
    this.editData.dvdDrives[index].dvdDeleted = true;
  }

  restoreOldDvdDriveToEdit(index: number): void {
    this.editData.dvdDrives[index].dvdDeleted = false;
  }

  removeNewDvdDriveToEdit(index: number): void {
    this.editData.newDvdDrives.splice(index, 1);
  }

  removeOldScsiControllerToEdit(index: number): void {
    this.editData.scsiControllers[index].controllerDeleted = true;
  }

  restoreOldScsiControllerToEdit(index: number): void {
    this.editData.scsiControllers[index].controllerDeleted = false;
  }

  removeNewScsiControllerToEdit(index: number): void {
    this.editData.newScsiControllers.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  submitEdit(): void {
    if (!this.hyperVService.validateEditConfig(this.editData)) {
      return;
    }
    const data = this.hyperVService.convertToVMEditConfigData(this.editData);
    this.spinner.start('main');
    this.hyperVService.submitEditConfig(this.pcId, data).pipe(
      switchMap(res => {
        const taskId = this.hyperVService.getTaskId(res);
        if (!taskId) {
          return throwError(new Error('Task id was not returned'));
        }
        this.editVmModelRef?.hide();
        this.notification.success(new Notification('Request is being processed. Status will be updated shortly'));
        return this.appService.pollForTask(taskId, 3, 200).pipe(take(1));
      }),
      take(1),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(res => {
      this.spinner.stop('main');
      const taskError = this.getTaskError(res);
      if (taskError) {
        this.notification.error(new Notification(taskError));
      } else {
        this.created.emit();
        this.notification.success(new Notification('VM hardware config has been updated successfully.'));
      }
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification(err.error?.detail || err.message || 'VM hardware config update failed. Please try again!!'));
    });
  }

  private getTaskError(res: any): string {
    if (!res) {
      return '';
    }
    if (res.state === 'FAILURE') {
      return this.formatTaskError(res.result && (res.result.message || res.result.error)) || 'VM hardware config update failed. Please try again!!';
    }
    if (res.result && res.result.error) {
      return this.formatTaskError(res.result.error);
    }
    return '';
  }

  private formatTaskError(error: any): string {
    if (Array.isArray(error)) {
      return error.join(', ');
    }
    if (error && typeof error === 'object') {
      return error.message || error.error || JSON.stringify(error);
    }
    return error || '';
  }
}
