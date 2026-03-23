import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DATABASE_GRAPH_TICKET_METADATA, DATABASE_GRAPH_TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MacminiZabbixMonitoringGraphItems } from '../macmini-zabbix-monitoring.type';
import { MacminiMonitoringGraphsViewdata, ZabbixMacminiGraphCrudService } from './zabbix-macmini-graph-crud.service';


@Component({
  selector: 'zabbix-macmini-graph-crud',
  templateUrl: './zabbix-macmini-graph-crud.component.html',
  styleUrls: ['./zabbix-macmini-graph-crud.component.scss'],
  providers: [ZabbixMacminiGraphCrudService]
})
export class ZabbixMacminiGraphCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  deviceId: string;
  viewData: MacminiMonitoringGraphsViewdata[] = [];
  filteredViewData: MacminiMonitoringGraphsViewdata[] = [];
  fieldsToFilterOn: string[] = ['name', 'graphType'];
  currentCriteria: SearchCriteria;

  selectedGraph: MacminiMonitoringGraphsViewdata;
  graphItems: MacminiZabbixMonitoringGraphItems[] = [];
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
    lableToDisplay: 'name',
    selectAsObject: false,
    keyToSelect: 'item_id',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    showCheckAll: false,
    showUncheckAll: true,
    selectionLimit: 10
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  constructor(private graphService: ZabbixMacminiGraphCrudService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private storage: StorageService,
    private modalService: BsModalService,
    private ticketService: SharedCreateTicketService,
    private refreshService: DataRefreshBtnService,
    private utilService: AppUtilityService,
    private clientSideSearchPipe: ClientSideSearchPipe) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0 };
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.start('main');
      this.getGraphItems();
      this.getGraphList();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('graphdata', StorageType.SESSIONSTORAGE);
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
    this.graphService.getGraphList(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.graphService.convertGraphsToViewData(res);
      this.filteredViewData = this.viewData;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  refreshData() {
    this.spinner.start('main');
    this.getGraphList();
  }

  createTicket(graph: MacminiMonitoringGraphsViewdata) {
    this.ticketService.createTicket({
      subject: DATABASE_GRAPH_TICKET_SUBJECT(graph.name),
      metadata: DATABASE_GRAPH_TICKET_METADATA(DeviceMapping.MAC_MINI, graph.name)
    }, DeviceMapping.MAC_MINI);
  }

  getGraphItems() {
    this.graphService.getGraphItems(this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphItems = res;
    }, (err: HttpErrorResponse) => {
    });
  }

  buildAddEditForm(graph?: MacminiMonitoringGraphsViewdata) {
    this.graphForm = this.graphService.createGraphForm(graph);
    this.graphFormErrors = this.graphService.resetGraphFormErrors();
    this.graphFormValidationMessages = this.graphService.graphFormValidationMessages;
    this.graphModelRef = this.modalService.show(this.graphFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.graphFormErrors = this.graphService.resetGraphFormErrors();
    if (err.non_field_errors) {
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
    if (this.graphForm.invalid) {
      this.graphFormErrors = this.utilService.validateForm(this.graphForm, this.graphFormValidationMessages, this.graphFormErrors);
      this.graphForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.graphFormErrors = this.utilService.validateForm(this.graphForm, this.graphFormValidationMessages, this.graphFormErrors); });
    } else {
      this.spinner.start('main');
      if (this.selectedGraph) {
        this.graphService.updateGraph(this.deviceId, this.selectedGraph.graphid, this.graphForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.graphModelRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Graph updated successfully.'));
          this.refreshData();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.graphService.createGraph(this.deviceId, this.graphForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.graphModelRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Graph Created successfully.'));
          this.refreshData();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  addGraph() {
    this.action = 'Add';
    this.selectedGraph = null;
    this.buildAddEditForm(null);
  }

  editGraph(view: MacminiMonitoringGraphsViewdata) {
    if (!view.canEdit) {
      return;
    }
    this.action = 'Edit';
    this.selectedGraph = view;
    this.buildAddEditForm(view);
  }

  deleteGraph(view: MacminiMonitoringGraphsViewdata) {
    if (!view.canDelete) {
      return;
    }
    this.selectedGraph = view;
    this.confirmGraphDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmGraphDeleteModalRef.hide();
    this.spinner.start('main');
    this.graphService.deleteGraph(this.deviceId, this.selectedGraph.graphid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Graph deleted successfully.'));
      this.refreshData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Graph could not be deleted!! Please try again.'));
    });
  }

}
