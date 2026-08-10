import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { CONTAINER_CONTROLLER_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { CONFIRM_MODAL_CONFIG } from 'src/app/shared/shared.const';
import { CONTROLLER_TYPE_MAPPING } from 'src/app/shared/SharedEntityTypes/container-contoller.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UsiContainersListService, UsiContainersListViewdata } from './usi-containers-list.service';

@Component({
  selector: 'usi-containers-list',
  templateUrl: './usi-containers-list.component.html',
  styleUrls: ['./usi-containers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsiContainersListService]
})
export class UsiContainersListComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  count: number = 0;
  viewData: UsiContainersListViewdata[] = [];
  currentCriteria: SearchCriteria;
  selectedController: UsiContainersListViewdata;

  controllerType: CONTROLLER_TYPE_MAPPING;
  typeLabel: string;
  isKubernetes: boolean;

  dockerCredentialForm: FormGroup;
  dockerCredentialErrors: any;

  @ViewChild('confirm') confirm: TemplateRef<void>;
  confirmModalRef: BsModalRef;
  @ViewChild('dockerCredential') dockerCredentialTpl: TemplateRef<void>;
  dockerCredentialRef: BsModalRef;

  constructor(private svc: UsiContainersListService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private modalSvc: BsModalService,
    private ticketSvc: SharedCreateTicketService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.controllerType = this.route.snapshot.data && this.route.snapshot.data.controllerType ? this.route.snapshot.data.controllerType : CONTROLLER_TYPE_MAPPING.KUBERNETES;
    this.typeLabel = this.controllerType == CONTROLLER_TYPE_MAPPING.DOCKER ? 'Docker' : 'Kubernetes';
    this.isKubernetes = this.controllerType == CONTROLLER_TYPE_MAPPING.KUBERNETES;
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
    if (this.isKubernetes) {
      this.discoverResources();
    }
    this.getControllers();
  }

  // Best-effort, non-blocking. The list still loads regardless of the outcome.
  private discoverResources() {
    this.svc.discoverResources().pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => { }, () => { });
  }

  ngOnDestroy() {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getControllers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getControllers();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getControllers();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getControllers();
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getControllers();
  }

  trackByControllerId(index: number, item: UsiContainersListViewdata): string {
    return item.controllerId;
  }

  addController() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  goToDetails(view: UsiContainersListViewdata) {
    let firstTab = 'nodes';
    this.router.navigate([view.controllerId, firstTab], { relativeTo: this.route });
  }

  syncResources(view: UsiContainersListViewdata) {
    if (view.syncInProgress) {
      return;
    }
    view.syncInProgress = true;
    this.cdr.markForCheck();
    this.svc.syncResources(view.controllerId).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => { view.syncInProgress = false; this.cdr.markForCheck(); }))
      .subscribe(() => {
        this.notificationSvc.success(new Notification('Resources synced successfully'));
        this.getControllers();
      }, () => {
        this.notificationSvc.error(new Notification('Failed to sync resources. Please try again.'));
      });
  }

  createTicket(view: UsiContainersListViewdata) {
    this.ticketSvc.createTicket({
      subject: TICKET_SUBJECT(DeviceMapping.CONTAINER_CONTROLLER, view.name),
      metadata: CONTAINER_CONTROLLER_TICKET_METADATA(DeviceMapping.CONTAINER_CONTROLLER, view.name, view.hostname)
    });
  }

  changeDockerCredentials(view: UsiContainersListViewdata) {
    this.selectedController = view;
    this.dockerCredentialForm = this.svc.buildDockerCredentialForm();
    this.dockerCredentialErrors = this.svc.resetDockerCredentialErrors();
    this.dockerCredentialRef = this.modalSvc.show(this.dockerCredentialTpl, CONFIRM_MODAL_CONFIG);
  }

  handleCertFileInput(files: FileList) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.dockerCredentialForm.addControl('unity-cert', new FormControl(e.target.result));
      this.dockerCredentialErrors['cert'] = '';
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(files.item(0));
  }

  handleKeyFileInput(files: FileList) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.dockerCredentialForm.addControl('unity-key', new FormControl(e.target.result));
      this.dockerCredentialErrors['key'] = '';
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(files.item(0));
  }

  handleCaFileInput(files: FileList) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.dockerCredentialForm.addControl('unity-ca', new FormControl(e.target.result));
      this.dockerCredentialErrors['ca'] = '';
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(files.item(0));
  }

  confirmDockerCredentials() {
    if (!this.dockerCredentialForm.get('unity-cert') || !this.dockerCredentialForm.get('unity-key') || !this.dockerCredentialForm.get('unity-ca')) {
      if (!this.dockerCredentialForm.get('unity-cert')) { this.dockerCredentialErrors['cert'] = 'Client cert is required'; }
      if (!this.dockerCredentialForm.get('unity-key')) { this.dockerCredentialErrors['key'] = 'Client key is required'; }
      if (!this.dockerCredentialForm.get('unity-ca')) { this.dockerCredentialErrors['ca'] = 'Client CA is required'; }
      return;
    }
    this.spinnerSvc.start('main');
    const data = this.svc.toDockerCredentialFormData(this.dockerCredentialForm.getRawValue());
    this.svc.updateDockerCredentials(this.selectedController.controllerId, data)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(() => {
        this.dockerCredentialRef.hide();
        this.notificationSvc.success(new Notification('Credentials updated successfully'));
      }, () => {
        this.notificationSvc.error(new Notification('Failed to update credentials. Please try again.'));
      });
  }

  editController(view: UsiContainersListViewdata) {
    this.router.navigate([view.controllerId, 'edit'], { relativeTo: this.route });
  }

  deleteController(view: UsiContainersListViewdata) {
    this.selectedController = view;
    this.confirmModalRef = this.modalSvc.show(this.confirm, CONFIRM_MODAL_CONFIG);
  }

  confirmDelete() {
    this.spinnerSvc.start('main');
    this.svc.deleteController(this.selectedController.controllerId, this.selectedController.controllerType)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe(() => {
        this.confirmModalRef.hide();
        this.notificationSvc.success(new Notification('Controller deleted successfully'));
        this.getControllers();
      }, () => {
        this.confirmModalRef.hide();
        this.notificationSvc.error(new Notification('Controller could not be deleted!!'));
      });
  }

  private getControllers() {
    this.spinnerSvc.start('main');
    this.svc.getControllers(this.currentCriteria, this.controllerType).pipe(
      takeUntil(this.ngUnsubscribe),
      finalize(() => this.stopSpinnerAndMarkForCheck()))
      .subscribe((res: any) => {
        let list = Array.isArray(res) ? res : (res && res.results ? res.results : []);
        this.viewData = this.svc.convertToViewdata(list, this.controllerType);
        this.count = this.viewData.length;
      }, () => {
        this.notificationSvc.error(new Notification('Problem in getting controllers. Please try again later.'));
      });
  }

  private stopSpinnerAndMarkForCheck() {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }
}
