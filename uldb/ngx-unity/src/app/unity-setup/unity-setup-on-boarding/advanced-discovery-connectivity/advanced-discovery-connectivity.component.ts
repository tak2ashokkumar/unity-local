import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DOWNLOAD_COLLECTOR } from 'src/app/shared/api-endpoint.const';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { COLLECTOR_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AdvancedDiscoveryConnectivityCrudService } from './advanced-discovery-connectivity-crud/advanced-discovery-connectivity-crud.service';
import { AdvancedDiscoveryConnectivityService, AgentConfigurationViewData, NetworkConnectionTypeOption } from './advanced-discovery-connectivity.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Result } from 'src/app/shared/SharedEntityTypes/task-status.type';

@Component({
  selector: 'advanced-discovery-connectivity',
  templateUrl: './advanced-discovery-connectivity.component.html',
  styleUrls: ['./advanced-discovery-connectivity.component.scss']
})
export class AdvancedDiscoveryConnectivityComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  viewData: AgentConfigurationViewData[] = [];

  vmWareCollectorUrl = DOWNLOAD_COLLECTOR('vmware');
  hyperVCollectorUrl = DOWNLOAD_COLLECTOR('hyper-v');

  networkAction: string; // Allowed values - 'ping' | 'telnet'| 'traceroute';
  @ViewChild('testNWConnectionRef') testNWConnectionRef: ElementRef;
  testNetworkFormModalRef: BsModalRef;
  testNetworkFormErrors: any;
  testNetworkFormValidationMessages: any;
  testNetworkForm: FormGroup;
  collectorUuid: string;
  consoleResult: Result;

  constructor(private agentService: AdvancedDiscoveryConnectivityService,
    private crudSvc: AdvancedDiscoveryConnectivityCrudService,
    private notificationService: AppNotificationService,
    private ticketService: SharedCreateTicketService,
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    public userInfo: UserInfoService) {
    this.crudSvc.crudAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getConfigurations();
    });
  }

  ngOnInit() {
    this.getConfigurations();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getConfigurations() {
    this.spinner.start('main');
    this.agentService.getConfigurations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.viewData = this.agentService.convertToViewData(res);
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Something went wrong. Please try again!!'));
    });
  }

  addAgent() {
    // if (this.viewData.length) {
    //   return;
    // }
    this.crudSvc.addOrEdit(null);
  }

  editAgent(view: AgentConfigurationViewData) {
    this.crudSvc.addOrEdit(view);
  }

  testConnection(data: AgentConfigurationViewData) {
    if (data.testing) {
      return;
    }
    data.testing = true;
    this.agentService.testConnection(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      data.testing = false;
      // if (res.testResult.ping.result && res.testResult.ssh.result) {
      //   this.notificationService.success(new Notification('Test connection is successful'));
      // } else {
      //   if (!res.testResult.ping.result && !res.testResult.ssh.result) {
      //     this.notificationService.error(new Notification('Test connection failed'));
      //   } else if (!res.testResult.ping.result) {
      //     this.notificationService.error(new Notification('Test connection failed for ping'));
      //   } else if (!res.testResult.ssh.result) {
      //     this.notificationService.error(new Notification('Test connection failed for ssh'));
      //   }
      // }
    }, (err: HttpErrorResponse) => {
      data.testing = false;
    });
  }

  deleteConfig(view: AgentConfigurationViewData) {
    this.crudSvc.deleteAccount(view);
  }

  createTicket(data: AgentConfigurationViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT('Collector', data.agentName), metadata: COLLECTOR_TICKET_METADATA(data.agentName, data.ipAddress, data.sshPort, data.sshUser)
    });
  }

  consoleNewTab(view: AgentConfigurationViewData) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.agentService.getConsoleAccessInput(view);
    obj.managementIp = view.ipAddress;
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

  openNWConnectionPopup(view: AgentConfigurationViewData, method: string){
    if(!view || !method){
      return;
    }
    this.consoleResult = null;
    this.collectorUuid = view.uuid;
    this.networkAction = method;
    this.testNetworkFormErrors = this.agentService.resetTestNetworkFormErrors();
    this.testNetworkFormValidationMessages = this.agentService.testNetworkFormValidationMessages;
    this.testNetworkForm = this.agentService.buildPingOrTracerouteForm();
    if(method == 'telnet'){
      this.testNetworkForm = this.agentService.buildTelnetForm();
    }
    this.testNetworkFormModalRef = this.modalService.show(this.testNWConnectionRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  onSubmit()  {
    if (this.testNetworkForm.invalid) {
      this.testNetworkFormErrors = this.utilService.validateForm(this.testNetworkForm, this.testNetworkFormValidationMessages, this.testNetworkFormErrors);
      this.testNetworkForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.testNetworkFormErrors = this.utilService.validateForm(this.testNetworkForm, this.testNetworkFormValidationMessages, this.testNetworkFormErrors); });
      return;
    } else {      
      this.spinner.start('main');
      this.testNetworkFormErrors = this.agentService.resetTestNetworkFormErrors();
      this.testNetworkFormValidationMessages = this.agentService.testNetworkFormValidationMessages;
      let formObj = this.testNetworkForm.getRawValue();
      if(this.networkAction == 'ping'){
        this.agentService.testPing(formObj, this.collectorUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.consoleResult = res?.result;
          this.spinner.stop('main');
        }, err => {
          this.testNetworkFormModalRef.hide();
          this.spinner.stop('main');
          this.notificationService.error(new Notification('Error while initiating the ping.'));
        });
      }
      else if(this.networkAction == 'telnet'){
        this.agentService.testTelnet(formObj, this.collectorUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.consoleResult = res?.result;
          this.spinner.stop('main');
        }, err => {
          this.testNetworkFormModalRef.hide();
          this.spinner.stop('main');
          this.notificationService.error(new Notification('Error while initiating telnet connection.'));
        });
      }
      else{
        this.agentService.testTraceRoute(formObj, this.collectorUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.consoleResult = res?.result;
          this.spinner.stop('main');
        }, err => {
          this.testNetworkFormModalRef.hide();
          this.spinner.stop('main');
          this.notificationService.error(new Notification('Error while initiating trace-route.'));
        });
      }
    }
  }

  goTo(url: string) {
    this.router.navigate(['../', url], { relativeTo: this.route });
  }
}
