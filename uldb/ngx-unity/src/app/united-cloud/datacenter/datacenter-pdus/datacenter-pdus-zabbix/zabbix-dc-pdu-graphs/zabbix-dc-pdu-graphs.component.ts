import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as moment from 'moment';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DcPDUZabbixMonitoringGraph } from '../datacenter-pdus-zabbix-monitoring.type';
import { DateRange, DcPDUGraphRange, DcPDUMonitoringGraphViewdata, ZabbixDcPduGraphsService } from './zabbix-dc-pdu-graphs.service';

@Component({
  selector: 'zabbix-dc-pdu-graphs',
  templateUrl: './zabbix-dc-pdu-graphs.component.html',
  styleUrls: ['./zabbix-dc-pdu-graphs.component.scss'],
  providers: [ZabbixDcPduGraphsService]
})
export class ZabbixDcPduGraphsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  viewData: DcPDUMonitoringGraphViewdata[] = [];

  deviceid: string;
  graphList: DcPDUZabbixMonitoringGraph[] = [];
  graphRange = DcPDUGraphRange;
  graphView: DcPDUMonitoringGraphViewdata;
  now: any;
  dateRange: DateRange;

  mySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true
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

  constructor(private graphService: ZabbixDcPduGraphsService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceid = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.buildForm();
    });
    this.now = moment();
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.start('main');
      this.getGraphList();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('graphdata', StorageType.SESSIONSTORAGE);
  }

  getGraphList() {
    this.graphService.getGraphList(this.deviceid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphList = res;
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  buildForm() {
    this.dateRange = this.graphService.getDateRangeByPeriod(this.graphRange.LAST_24_HOURS);
    this.filterForm = this.graphService.buildForm(this.dateRange);
    this.formErrors = this.graphService.resetFormErrors();
    this.validationMessages = this.graphService.validationMessages;

    const graphs = [...this.graphList].slice(0, 3);
    this.viewData = this.graphService.convertGraphsToViewData(graphs);
    this.filterForm.get('graph_list').setValue(graphs);

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: DcPDUGraphRange) => {
      this.dateRange = this.graphService.getDateRangeByPeriod(val);
      if (this.dateRange) {
        this.filterForm.get('from').patchValue(new Date(this.dateRange.from))
        this.filterForm.get('to').patchValue(new Date(this.dateRange.to))
      }
    });
    if (graphs.length) {
      this.onSubmit();
    }
  }

  onSubmit() {
    if (this.filterForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors);
      this.filterForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.formErrors = this.graphService.resetFormErrors();
      this.viewData = this.graphService.convertGraphsToViewData(this.filterForm.get('graph_list').value);
      this.getGraph();
    }
  }

  getGraph() {
    from(this.viewData).pipe(tap(e => setTimeout(() => { this.spinner.start(e.graphid) }, 0)),
      mergeMap(e => this.graphService.getGraph(this.deviceid, e.graphid, this.filterForm.getRawValue())
        .pipe(takeUntil(this.ngUnsubscribe)))).subscribe(
          res => {
            const key = Object.keys(res).getFirst();
            let index = this.viewData.map(view => view.graphid).indexOf(key);
            this.viewData[index].image = res[key];
            this.spinner.stop(key);
          }
        )
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
