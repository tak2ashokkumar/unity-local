import { Component, OnDestroy, OnInit } from '@angular/core';
import { DateRange, ForecastGraphsService, ZabbixGraphTimeRange, ZabbixMonitoringGraphViewdata } from './forecast-graphs.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { from, Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FormGroup } from '@angular/forms';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import moment from 'moment';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import { ZabbixMonitoringGraph } from 'src/app/united-cloud/shared/zabbix-graphs/zabbix-graphs.type';
import { HttpErrorResponse } from '@angular/common/http';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'forecast-graphs',
  templateUrl: './forecast-graphs.component.html',
  styleUrls: ['./forecast-graphs.component.scss'],
  providers: [ForecastGraphsService]
})
export class ForecastGraphsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  deviceId: string;
  graphsCriteria: SearchCriteria;

  device: any;
  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  viewData: ZabbixMonitoringGraphViewdata[] = [];
  graphCount: number;
  graphList: ZabbixMonitoringGraph[] = [];
  graphRange = ZabbixGraphTimeRange;
  graphView: ZabbixMonitoringGraphViewdata;
  now: any;
  dateRange: DateRange;
  utilizationType: string;

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

  constructor(private graphService: ForecastGraphsService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceid'));
    this.graphsCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    // this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
    //   this.buildForm();
    // });
    // this.buildForm();
    setInterval(() => {
      this.now = moment();
    }, 0);
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.device = this.storage.getByKey('device', StorageType.SESSIONSTORAGE);

    let deviceParam = { 'device_type': this.device.deviceType, 'device_uuid': this.device.uuid };
    this.graphsCriteria.params = [deviceParam];
    setTimeout(() => {
      // this.buildForm();
      this.spinner.stop('main');
      this.getGraphList();
      // this.getDeviceGraphs();
    }, 0);
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('device', StorageType.SESSIONSTORAGE);
  }

  getGraphList() {
    this.graphService.getGraphList(this.device.deviceType, this.device.deviceId, this.device.itemId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
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
    // if (this.utilizationType && this.graphList.find(g => g.name == this.utilizationType)) {
    //   this.filterForm.get('graph_list').setValue([this.graphList.find(g => g.name == this.utilizationType)]);
    // } else {
    this.viewData = this.graphService.convertGraphsToViewData(graphs);
    this.filterForm.get('graph_list').setValue(graphs);
    // }

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
      mergeMap(e => this.graphService.getGraph(this.device.deviceId, this.device.itemId, e.graphid, this.filterForm.getRawValue())
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
