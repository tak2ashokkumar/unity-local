import { Component, OnDestroy, OnInit } from '@angular/core';
import { from, Subject } from 'rxjs';
import { DateRange, ZabbixGraphsService, ZabbixGraphTimeRange, ZabbixMonitoringGraphViewdata } from './zabbix-graphs.service';
import { FormGroup } from '@angular/forms';
import { DeviceZabbixMonitoringGraph, ZabbixMonitoringGraph } from './zabbix-graphs.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { DeviceTabData } from '../device-tab/device-tab.component';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { IPageInfo } from 'ngx-virtual-scroller';


@Component({
  selector: 'zabbix-graphs',
  templateUrl: './zabbix-graphs.component.html',
  styleUrls: ['./zabbix-graphs.component.scss'],
  providers: [ZabbixGraphsService]
})
export class ZabbixGraphsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  deviceId: string;
  utilizationType: string;
  graphsCriteria: SearchCriteria;

  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  viewData: ZabbixMonitoringGraphViewdata[] = [];
  device: DeviceTabData;

  graphCount: number;
  graphList: ZabbixMonitoringGraph[] = [];
  graphRange = ZabbixGraphTimeRange;
  graphView: ZabbixMonitoringGraphViewdata;
  now: any;
  dateRange: DateRange;

  mySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
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

  constructor(private graphService: ZabbixGraphsService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.pcId = params.get('pcId'));
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.route.queryParamMap.subscribe((params: ParamMap) => this.utilizationType = params.get('utilizationType'));
    this.graphsCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.buildForm();
    });
    setInterval(() => {
      this.now = moment();
    }, 0);
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.device = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId ? this.deviceId : this.pcId;

    let deviceParam = { 'device_type': this.device.deviceType, 'device_uuid': this.device.uuid };
    this.graphsCriteria.params = [deviceParam];
    setTimeout(() => {
      this.getGraphList();
      // this.getDeviceGraphs();
    }, 0);
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('graphdata', StorageType.SESSIONSTORAGE);
  }

  getGraphList() {
    this.graphService.getGraphList(this.device.deviceType, this.device.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphList = res;
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  // graphsLoading: boolean = false;
  // getDeviceGraphs() {
  //   this.graphService.getDeviceGraphs(this.graphsCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.graphCount = res.count;
  //     this.graphList = res.results;
  //     this.buildForm();
  //     this.spinner.stop('main');
  //   }, (err: HttpErrorResponse) => {
  //     this.spinner.stop('main');
  //   })
  // }

  // fetchMoreDevices(event: IPageInfo) {
  //   let returnCondition = !this.graphList.length || this.graphsLoading ||
  //     this.graphCount <= this.graphList.length ||
  //     (this.graphList.length % this.graphsCriteria.pageSize) != 0 ||
  //     event.endIndex != (this.graphList.length - 1);

  //   if (returnCondition) {
  //     return;
  //   }

  //   this.graphsLoading = true;
  //   this.graphsCriteria.pageNo = Math.ceil(this.graphList.length / this.graphsCriteria.pageSize + 1);
  //   this.graphService.getDeviceGraphs(this.graphsCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.graphList = this.graphList.concat(res.results);
  //     this.graphsLoading = false;
  //     this.graphCount = res.count;
  //   }, (err: HttpErrorResponse) => {
  //     this.graphsLoading = false;
  //   })
  // }

  buildForm() {
    this.dateRange = this.graphService.getDateRangeByPeriod(this.graphRange.LAST_24_HOURS);
    this.filterForm = this.graphService.buildForm(this.dateRange);
    this.formErrors = this.graphService.resetFormErrors();
    this.validationMessages = this.graphService.validationMessages;

    const graphs = [...this.graphList].slice(0, 3);
    if (this.utilizationType && this.graphList.find(g => g.name == this.utilizationType)) {
      this.filterForm.get('graph_list').setValue([this.graphList.find(g => g.name == this.utilizationType)]);
    } else {
      this.viewData = this.graphService.convertGraphsToViewData(graphs);
      this.filterForm.get('graph_list').setValue(graphs);
    }

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: ZabbixGraphTimeRange) => {
      if (val == this.graphRange.CUSTOM) {
        this.filterForm.get('from').enable({ emitEvent: false });
        this.filterForm.get('to').enable({ emitEvent: false });
      } else {
        this.dateRange = this.graphService.getDateRangeByPeriod(val);
        if (this.dateRange) {
          this.filterForm.get('from').patchValue(new Date(this.dateRange.from))
          this.filterForm.get('to').patchValue(new Date(this.dateRange.to))
        }
        this.filterForm.get('from').disable({ emitEvent: false });
        this.filterForm.get('to').disable({ emitEvent: false });
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
      mergeMap(e => this.graphService.getGraph(this.device.deviceType, this.device.uuid, e.graphid, this.filterForm.getRawValue())
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
