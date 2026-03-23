import { Component, OnInit } from '@angular/core';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { FormGroup } from '@angular/forms';
import { AppUtilityService, DateRange } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { from, Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { DeviceTabData } from 'src/app/united-cloud/shared/device-tab/device-tab.component';
import moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { AiObservabilityGpuServiceGraphsService, ZabbixGraphTimeRange } from './ai-observability-gpu-service-graphs.service';

@Component({
  selector: 'ai-observability-gpu-service-graphs',
  templateUrl: './ai-observability-gpu-service-graphs.component.html',
  styleUrls: ['./ai-observability-gpu-service-graphs.component.scss'],
  providers: [AiObservabilityGpuServiceGraphsService]
})
export class AiObservabilityGpuServiceGraphsComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  // pcId: string;
  deviceId: string;
  // utilizationType: string;
  // currentCriteria: SearchCriteria;

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
  // chatConfigLength: number;

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

  constructor(private graphService: AiObservabilityGpuServiceGraphsService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.deviceId = params.get('Id'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.buildForm();
      // this.getGraphList();
    });
    setInterval(() => {
      this.now = moment();
    }, 0);
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.device = <DeviceTabData>this.storage.getByKey('device', StorageType.SESSIONSTORAGE);
    if (this.deviceId) {
      this.device.uuid = this.deviceId;
    }
    this.getGraphList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('graphdata', StorageType.SESSIONSTORAGE);
  }

  getGraphList() {
    this.graphService.getGraphList(this.device).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphList = res?.results?.map(gd => ({
        label: gd.name,
        value: gd.uuid
      }));
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

    const initialSelection = this.graphList?.slice(0, 3).map(opt => opt.value);
    this.filterForm.get('graph_list').setValue(initialSelection);

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
    if (initialSelection.length) {
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
      this.getGraph();
    }
  }

  getGraph() {
    this.spinner.start('main');
    this.graphService.getGraphData(this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.chartConfigs = this.graphService.convertToLineCharts(res, this.filterForm.getRawValue());
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
