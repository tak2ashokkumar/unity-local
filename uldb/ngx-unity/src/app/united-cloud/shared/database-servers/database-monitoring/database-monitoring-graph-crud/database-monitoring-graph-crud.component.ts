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
import { DabaseMonitoringGraphItems } from '../database-monitoring.type';
import { DBMonitoringGraphListView, DatabaseMonitoringGraphCrudService } from './database-monitoring-graph-crud.service';

@Component({
  selector: 'database-monitoring-graph-crud',
  templateUrl: './database-monitoring-graph-crud.component.html',
  styleUrls: ['./database-monitoring-graph-crud.component.scss'],
  providers: [DatabaseMonitoringGraphCrudService]
})
export class DatabaseMonitoringGraphCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  instanceId: string;
  viewData: DBMonitoringGraphListView[] = [];
  filteredViewData: DBMonitoringGraphListView[] = [];
  fieldsToFilterOn: string[] = ['name', 'graphType'];
  currentCriteria: SearchCriteria;

  selectedGraph: DBMonitoringGraphListView;
  graphItems: DabaseMonitoringGraphItems[] = [];
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';

  @ViewChild('dbGraphFormRef') dbGraphFormRef: ElementRef;
  dbGraphModelRef: BsModalRef;
  dbGraphForm: FormGroup;
  dbGraphFormErrors: any;
  dbGraphFormValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDBGraphDeleteModalRef: BsModalRef;

  itemSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: false,
    keyToSelect: 'item_id',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
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

  constructor(private graphService: DatabaseMonitoringGraphCrudService,
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
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.instanceId = params.get('instanceId'));
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
    this.graphService.getGraphList(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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

  createTicket(graph: DBMonitoringGraphListView) {
    this.ticketService.createTicket({
      subject: DATABASE_GRAPH_TICKET_SUBJECT(graph.name),
      metadata: DATABASE_GRAPH_TICKET_METADATA(DeviceMapping.DB_SERVER, graph.name)
    }, DeviceMapping.DB_SERVER);
  }

  getGraphItems() {
    this.graphService.getGraphItems(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphItems = res;
    }, (err: HttpErrorResponse) => {
    });
  }

  buildAddEditForm(graph?: DBMonitoringGraphListView) {
    this.dbGraphForm = this.graphService.createDbGraphForm(graph);
    this.dbGraphFormErrors = this.graphService.resetDBGraphFormErrors();
    this.dbGraphFormValidationMessages = this.graphService.dbGraphFormValidationMessages;
    this.dbGraphModelRef = this.modalService.show(this.dbGraphFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    console.log('err : ', err);
    this.dbGraphFormErrors = this.graphService.resetDBGraphFormErrors();
    if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.dbGraphForm.controls) {
          this.dbGraphFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.dbGraphModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  confirmDBGraphCreate() {
    if (this.dbGraphForm.invalid) {
      this.dbGraphFormErrors = this.utilService.validateForm(this.dbGraphForm, this.dbGraphFormValidationMessages, this.dbGraphFormErrors);
      this.dbGraphForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.dbGraphFormErrors = this.utilService.validateForm(this.dbGraphForm, this.dbGraphFormValidationMessages, this.dbGraphFormErrors); });
    } else {
      this.spinner.start('main');
      if (this.selectedGraph) {
        this.graphService.updateGraph(this.instanceId, this.selectedGraph.graphid, this.dbGraphForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.dbGraphModelRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Graph updated successfully.'));
          this.refreshData();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.graphService.createGraph(this.instanceId, this.dbGraphForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.dbGraphModelRef.hide();
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
    this.nonFieldErr = '';
    this.buildAddEditForm(null);
  }

  editGraph(view: DBMonitoringGraphListView) {
    if (!view.canEdit) {
      return;
    }
    this.action = 'Edit';
    this.selectedGraph = view;
    this.nonFieldErr = '';
    this.buildAddEditForm(this.selectedGraph);
  }

  deleteGraph(view: DBMonitoringGraphListView) {
    if (!view.canDelete) {
      return;
    }
    this.selectedGraph = view;
    this.confirmDBGraphDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDBDelete() {
    this.confirmDBGraphDeleteModalRef.hide();
    this.spinner.start('main');
    this.graphService.deleteGraph(this.instanceId, this.selectedGraph.graphid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Graph deleted successfully.'));
      this.refreshData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Graph could not be deleted!!'));
    });
  }

}
