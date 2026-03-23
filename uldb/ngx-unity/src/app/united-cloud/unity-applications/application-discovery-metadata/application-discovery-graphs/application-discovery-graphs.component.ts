import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ApplicationDiscoveryGraphsService, ZabbixGraphTimeRange } from './application-discovery-graphs.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FormGroup } from '@angular/forms';
import { AppUtilityService, DateRange } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { EChartsOption } from 'echarts';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';

@Component({
  selector: 'application-discovery-graphs',
  templateUrl: './application-discovery-graphs.component.html',
  styleUrls: ['./application-discovery-graphs.component.scss'],
  providers: [ApplicationDiscoveryGraphsService]
})
export class ApplicationDiscoveryGraphsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  pcId: string;
  deviceId: string;
  utilizationType: string;
  graphsCriteria: SearchCriteria;
  abc: SearchCriteria;

  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  device: DeviceTabData;

  graphCount: number;
  graphList: any;
  graphRange = ZabbixGraphTimeRange;
  now: any;
  dateRange: DateRange;
  chartConfigs: UnityChartDetails[] = [];
  chatConfigLength: number;

  mySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    keyToSelect: 'value',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false
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

  constructor(private graphService: ApplicationDiscoveryGraphsService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('deviceId'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.buildForm();
    });
    setInterval(() => {
      this.now = moment();
    }, 0);
    this.abc = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.device = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
    this.device.uuid = this.deviceId ? this.deviceId : this.pcId;

    setTimeout(() => {
      this.buildForm();
      this.getGraphList();
      // this.getGraph();
    }, 5000)
  }

  // ngAfterViewInit(): void {

  // }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('graphdata', StorageType.SESSIONSTORAGE);
  }

  getGraphList() {
    this.graphService.getGraphList(this.device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      // this.graphList = res;
      this.graphList = res.app_metrics_enabled_list.map(name => ({
        label: name,
        value: name
      }));
      const initialSelection = this.graphList?.slice(0, 3).map(opt => opt.value);
      this.filterForm.get('graph_list').setValue(initialSelection);
      this.getGraph();
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
  }

  onSubmit() {
    if (this.filterForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors);
      this.filterForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.formErrors = this.graphService.resetFormErrors();

      this.getGraph();
    }
  }

  getGraph() {
    this.graphService.getGraph(this.device.uuid, this.abc, this.filterForm).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      // this.graphList = res;
      this.chartConfigs = this.graphService.convertToLineCharts(res);
      this.chatConfigLength = res.length;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
