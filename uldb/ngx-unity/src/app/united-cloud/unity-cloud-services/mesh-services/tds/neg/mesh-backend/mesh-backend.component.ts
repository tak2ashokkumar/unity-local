import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { BACKEND_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { environment } from 'src/environments/environment';
import { MeshBackendService, MeshBackendViewDataType } from './mesh-backend.service';

@Component({
  selector: 'mesh-backend',
  templateUrl: './mesh-backend.component.html',
  styleUrls: ['./mesh-backend.component.scss'],
  providers: [MeshBackendService]
})
export class MeshBackendComponent implements OnInit {
  meshId: string;
  serviceName: string;
  zone: string;
  index: number;
  neg: string;
  containers: [];
  clusters: [];
  vms: [];
  clouds: any[];
  fieldsToFilterOn: string[] = ['healthState', 'instance', 'ipAddress', 'port'];
  currentCriteria: SearchCriteria;
  VMCloudMappingEnum = PlatFormMapping;

  @ViewChild('create') create: ElementRef;
  createModalRef: BsModalRef;
  vmMappingFormErrors: any;
  createValidationMessages: any;
  createForm: FormGroup;

  viewData: MeshBackendViewDataType[] = [];
  filteredViewData: MeshBackendViewDataType[] = [];
  pagedviewData: MeshBackendViewDataType[] = [];
  poll: boolean = false;
  syncInProgress: boolean = false;

  private ngUnsubscribe = new Subject();
  constructor(private route: ActivatedRoute,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private router: Router,
    private ticketService: SharedCreateTicketService,
    private backendService: MeshBackendService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService,
    private clientSidePage: ClientSidePage,
    private termService: FloatingTerminalService,
    private utilService: AppUtilityService) {
    this.route.parent.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.meshId = params.get('meshId');
    });
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
      this.serviceName = params.get('serviceName');
    });
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.zone = params.get('zone');
      this.neg = params.get('neg');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  subscribeToTerminal() {
    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll && !this.syncInProgress), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => {
        this.createTaskAndPoll()
      });
  }

  ngOnInit() {
    this.createTaskAndPoll();
    this.getBackendList();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.createTaskAndPoll();
  }

  createTaskAndPoll() {
    if (this.syncInProgress) {
      this.spinnerService.stop('main');
      return;
    }
    this.syncInProgress = true;
    this.notification.success(new Notification("Latest data is being updated."));
    this.backendService.syncBackendList(this.meshId, this.serviceName, this.zone, this.neg).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        if (status.result.data) {
          this.viewData = this.backendService.convertToViewData(status.result.data);
          this.filterAndPage();
        } else {
          this.notification.error(new Notification(status.result.message));
        }
        this.spinnerService.stop('main');
        this.syncInProgress = false;
        this.subscribeToTerminal();
      }, (err: Error) => {
        this.spinnerService.stop('main');
        this.syncInProgress = false;
        this.subscribeToTerminal();
        this.notification.error(new Notification('Error while fetching NEGs'));
      });
  }

  getBackendList() {
    this.spinnerService.start('main');
    this.backendService.getBackendList(this.meshId, this.serviceName, this.zone, this.neg).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.viewData = this.backendService.convertToViewData(data.results);
        this.filterAndPage();
        this.spinnerService.stop('main');
      }, (err: Error) => {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Error while fetching NEGs'));
      });
  }

  goBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

  getCluster(cloudType: string, cloud: string) {
    this.clusters = [];
    if (cloud) {
      this.backendService.getCluster(cloudType, cloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
        this.clusters = response;
      },err => {}
      );
    }
  }

  getContainer(clusterUuid: string) {
    this.containers = [];
    if (clusterUuid) {
      this.backendService.getContainer(clusterUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
        this.containers = response;
      },err => {}
      );
    }
  }

  getVM(cloudType: string, cloud: string) {
    this.vms = [];
    if (cloud) {
      this.backendService.getVM(cloudType, cloud).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
        this.vms = response;
      },err => {});
    }
  }

  getCloud(data: string) {
    this.clouds = [];
    this.backendService.getCloud(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
      this.clouds = response.results;
    },err => {});
  }

  mapVMFormChanges(): void {
    this.createForm.get('cloudType').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.createForm.get('cloud').setValue('');
      this.createForm.removeControl('vm');
      this.createForm.removeControl('container');
      this.createForm.get('deviceType').setValue('');
      this.getCloud(data);
    });
    this.createForm.get('cloud').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.createForm.removeControl('vm');
      this.createForm.removeControl('container');
      this.createForm.get('deviceType').setValue('');
    });
    this.createForm.get('deviceType').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      const cloudType = this.createForm.get('cloudType').value;
      const cloud = this.createForm.get('cloud').value;
	  this.createForm.removeControl('vm');
	  this.createForm.removeControl('cluster');
	  this.createForm.removeControl('container');
      if (val == 'Container') {
		this.createForm.addControl('cluster', new FormControl('', [Validators.required]));
		this.getCluster(cloudType, cloud);
		this.createForm.get('cluster').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(clusterUuid => {
			this.createForm.addControl('container', new FormControl('', [Validators.required]));
			this.getContainer(clusterUuid);
		})
      } else if (val == 'Virtual Machine') {
        this.createForm.addControl('vm', new FormControl('', [Validators.required]));
        this.createForm.removeControl('container');
        this.getVM(cloudType, cloud);
      }
    });

  }

  mapVM(uuid: string) {
    this.viewData.map((data, i) => { if (data.uuid === uuid) this.index = i; })
    this.vmMappingFormErrors = this.backendService.resetFormErrors();
    this.createValidationMessages = this.backendService.validationMessages;
    this.createForm = this.backendService.createForm(uuid);
    this.mapVMFormChanges();
    this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmMapping() {
    if (this.createForm.invalid) {
      this.vmMappingFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.vmMappingFormErrors);
      this.createForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.vmMappingFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.vmMappingFormErrors); });
    } else {
      this.createModalRef.hide();
      this.spinnerService.start('main');
      const data = this.createForm.getRawValue();
      this.backendService.mapVM(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
        this.notification.success(new Notification('Virtual machine added successfully.'));
        this.viewData[this.index] = this.backendService.convert(response);
        this.filterAndPage();
        this.spinnerService.stop('main');
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Something went wrong. Please try again!!'));
        this.spinnerService.stop('main');
      });
    }
  }

  createTicket(data: MeshBackendViewDataType) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Backend', data.instance), metadata: BACKEND_TICKET_METADATA('Network Endpoints', data.instance, data.ipAddress, data.port, data.port)
    });
  }
}

