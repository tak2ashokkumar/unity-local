import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AssetsVmsAzureService, AzureVMViewData, AzurePowerToggleInput } from './assets-vms-azure.service';
import { Subject } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil, take } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PowerToggleInput, ServerPowerToggleService } from 'src/app/united-cloud/shared/server-power-toggle/server-power-toggle.service';
import { AppLevelService } from 'src/app/app-level.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';

@Component({
  selector: 'assets-vms-azure',
  templateUrl: './assets-vms-azure.component.html',
  styleUrls: ['./assets-vms-azure.component.scss'],
  providers: [AssetsVmsAzureService]
})
export class AssetsVmsAzureComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  viewData: AzureVMViewData[] = [];
  filteredviewData: AzureVMViewData[] = [];
  selectedVmIndex: number;
  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('confirmDelete') confirmDeleteRef: ElementRef;
  confirmModalRef: BsModalRef;
  confirmInput: AzurePowerToggleInput;
  fieldsToFilterOn: string[] = ['name', 'type', 'location', 'resource_group', 'availability_set'];
  constructor(private azureService: AssetsVmsAzureService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService,
    private modalService: BsModalService,
    private toggleService: ServerPowerToggleService,
    private clientSideSearchPipe: ClientSideSearchPipe) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1 };
  }

  ngOnInit() {
    // this.spinnerService.start('main');
    // this.getVms();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filteredviewData = this.clientSideSearchPipe.transform(this.viewData, event, this.fieldsToFilterOn);
  }

  getVms() {
    this.azureService.getVms().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.azureService.convertToViewData(res);
      this.filteredviewData = this.viewData;
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error in loading Azure Vms'))
    });
  }

  powerToggle(view: AzureVMViewData, index: number) {
    this.selectedVmIndex = index;
    this.confirmInput = this.azureService.getToggleInput(view);
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmToggle() {
    this.confirmModalRef.hide();
    this.filteredviewData[this.selectedVmIndex].powerStatusIcon = 'fa-spinner fa-spin';
    this.azureService.togglePower(this.confirmInput).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.filteredviewData[this.selectedVmIndex].powerStatusIcon = 'fa-power-off';
      if (status.result.data) {
        const msg = this.confirmInput.currentPowerStatus ? 'Stopped ' : 'Started ';
        this.notification.success(new Notification(msg + this.confirmInput.deviceId + ' Successfully'));
        this.getVms();
      } else {
        const msg = this.confirmInput.currentPowerStatus ? 'Stopping ' : 'Starting ';
        this.notification.error(new Notification(msg + this.confirmInput.deviceId + ' Failed. Please try again later.'));
      }
    }, (err: Error) => {
      this.filteredviewData[this.selectedVmIndex].powerStatusIcon = 'fa-power-off';
      const msg = this.confirmInput.currentPowerStatus ? 'Stopping ' : 'Starting ';
      this.notification.error(new Notification(msg + this.confirmInput.deviceId + ' Failed. Please try again later.'));
    });
  }

  deleteVM(view: AzureVMViewData) {
    this.confirmInput = this.azureService.getDeleteInput(view);
    this.confirmModalRef = this.modalService.show(this.confirmDeleteRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmVMDelete() {
    this.confirmModalRef.hide();
    this.spinnerService.start('main');
    this.azureService.deleteVM(this.confirmInput).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      this.spinnerService.stop('main');
      if (status.result.data) {
        this.notification.success(new Notification('VM deleted Successfully'));
        this.getVms();
      } else {
        this.notification.error(new Notification('VM deletion failed. Please try again later.'));
      }
    }, (err: Error) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('VM deletion failed. Please try again later.'));
    });
  }
}
