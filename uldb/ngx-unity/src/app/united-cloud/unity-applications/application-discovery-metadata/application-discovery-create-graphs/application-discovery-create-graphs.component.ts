import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ApplicationDiscoveryCreateGraphsService, ApplicationMonitoringGraphCRUDViewdata } from './application-discovery-create-graphs.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FormGroup } from '@angular/forms';
import { ZabbixGraphTimeRange, ZabbixMonitoringGraphViewdata } from 'src/app/united-cloud/shared/zabbix-graphs/zabbix-graphs.service';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { ZabbixMonitoringGraph } from 'src/app/united-view/monitoring/performance/performance.type';
import { AppUtilityService, DateRange } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { ZabbixMonitoringGraphCRUDViewdata } from 'src/app/united-cloud/shared/zabbix-graph-crud/zabbix-graph-crud.service';
import { ZabbixMonitoringGraphCRUDItems } from 'src/app/united-cloud/shared/zabbix-graph-crud/zabbix-graph-crud.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSideSearchPipe } from 'src/app/app-filters/client-side-search.pipe';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MonitoringGraphCRUDItems } from './application-discovery-create-graphs.type';

@Component({
  selector: 'application-discovery-create-graphs',
  templateUrl: './application-discovery-create-graphs.component.html',
  styleUrls: ['./application-discovery-create-graphs.component.scss'],
  providers: [ApplicationDiscoveryCreateGraphsService]
})
export class ApplicationDiscoveryCreateGraphsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  pcId: string;
  deviceId: string;
  device: DeviceTabData;
  currentCriteria: SearchCriteria;

  viewData: ApplicationMonitoringGraphCRUDViewdata;
  filteredViewData: ApplicationMonitoringGraphCRUDViewdata;
  fieldsToFilterOn: string[] = ['name', 'graphType'];

  selectedGraph: ZabbixMonitoringGraphCRUDViewdata;
  graphItems: any;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';

  @ViewChild('graphFormRef') graphFormRef: ElementRef;
  graphModelRef: BsModalRef;
  graphForm: FormGroup;
  graphFormErrors: any;
  graphFormValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmGraphDeleteModalRef: BsModalRef;

  itemSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
    selectAsObject: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    showCheckAll: false,
    showUncheckAll: true,
    selectionLimit: 10
  };

  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };


  constructor(private graphService: ApplicationDiscoveryCreateGraphsService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storage: StorageService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,
    private utilService: AppUtilityService,
    private clientSideSearchPipe: ClientSideSearchPipe) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceId'));
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0 };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      // this.spinner.start('main');
      this.device = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
      this.device.uuid = this.deviceId ? this.deviceId : this.pcId;
      this.getGraphItems();
      this.getGraphList();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.getGraphList();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, event, this.fieldsToFilterOn);
  }

  getGraphList() {
    this.graphService.getGraphList(this.device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.graphService.convertGraphsToViewData(res);
      if (this.currentCriteria.searchValue) {
        this.onSearched(this.currentCriteria.searchValue);
      } else {
        this.filteredViewData = this.viewData;
      }
      // this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  refreshData() {
    // this.spinner.start('main');
    this.getGraphList();
  }

  // createTicket(graph: ZabbixMonitoringGraphCRUDViewdata) {
  //   this.ticketService.createTicket({
  //     subject: DATABASE_GRAPH_TICKET_SUBJECT(graph.name),
  //     metadata: DATABASE_GRAPH_TICKET_METADATA(this.device.deviceType, graph.name)
  //   }, this.device.deviceType);
  // }

  getGraphItems() {
    this.graphService.getGraphItems(this.device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphItems = res.metric_names.map(name => ({
        label: name,
        value: name
      }));
    }, (err: HttpErrorResponse) => {
    });
  }

  buildAddEditForm() {
    this.graphForm = this.graphService.createGraphForm();
    this.graphFormErrors = this.graphService.resetGraphFormErrors();
    this.graphFormValidationMessages = this.graphService.graphFormValidationMessages;
    this.graphModelRef = this.modalService.show(this.graphFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.graphFormErrors = this.graphService.resetGraphFormErrors();
    if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.graphForm.controls) {
          this.graphFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.graphModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  confirmCreate() {
    this.graphForm.get('uuid').setValue(this.device.uuid);
    // let rawValue = this.graphForm.getRawValue();
    // rawValue.uuid = this.device.uuid;
    if (this.graphForm.invalid) {
      this.graphFormErrors = this.utilService.validateForm(this.graphForm, this.graphFormValidationMessages, this.graphFormErrors);
      this.graphForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.graphFormErrors = this.utilService.validateForm(this.graphForm, this.graphFormValidationMessages, this.graphFormErrors); });
    } else {
      // this.spinner.start('main');
      this.graphService.createGraph(this.device, this.graphForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.graphModelRef.hide();
        this.spinner.stop('main');
        this.notification.success(new Notification('Graph Created successfully.'));
        this.refreshData();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

  addGraph() {
    this.action = 'Add';
    this.selectedGraph = null;
    this.buildAddEditForm();
  }

  // editGraph(view: ZabbixMonitoringGraphCRUDViewdata) {
  //   if (!view.canEdit) {
  //     return;
  //   }
  //   this.action = 'Edit';
  //   this.selectedGraph = view;
  //   this.buildAddEditForm(view);
  // }

  // deleteGraph(view: ZabbixMonitoringGraphCRUDViewdata) {
  //   if (!view.canDelete) {
  //     return;
  //   }
  //   this.selectedGraph = view;
  //   this.confirmGraphDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  // }

  // confirmDelete() {
  //   this.confirmGraphDeleteModalRef.hide();
  //   this.spinner.start('main');
  //   this.graphService.deleteGraph(this.device, this.selectedGraph.graphid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.spinner.stop('main');
  //     this.notification.success(new Notification('Graph deleted successfully.'));
  //     this.refreshData();
  //   }, err => {
  //     this.spinner.stop('main');
  //     this.notification.error(new Notification('Graph could not be deleted!! Please try again.'));
  //   });
  // }

}
