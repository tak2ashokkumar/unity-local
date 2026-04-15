import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DateRange, NaciZabbixGraphsService, ZabbixGraphTimeRange, ZabbixMonitoringItemsViewdata } from './naci-zabbix-graphs.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { FormGroup } from '@angular/forms';
import { DeviceType } from '../naci-chatbot/naci-chatbot.type';
import { from, Subject } from 'rxjs';
import { ZabbixMonitoringGraphItems } from 'src/app/united-cloud/shared/zabbix-graphs/zabbix-graphs.type';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'naci-zabbix-graphs',
  templateUrl: './naci-zabbix-graphs.component.html',
  styleUrls: ['./naci-zabbix-graphs.component.scss'],
  providers: [NaciZabbixGraphsService]
})
export class NaciZabbixGraphsComponent implements OnInit, OnChanges, OnDestroy {
  private ngUnsubscribe = new Subject();

  @Input('deviceData') deviceData: any;
  // @Input('monitoringType') monitoringType: string;
  @Input('index') index: number;

  spinnerName: string;
  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  viewData: ZabbixMonitoringItemsViewdata[] = [];

  graphList: ZabbixMonitoringGraphItems[] = [];
  graphRange = ZabbixGraphTimeRange;
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

  constructor(private svc: NaciZabbixGraphsService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService) { }

  ngOnInit(): void {
    this.spinnerName = `zabbixGraphs-${this.index}`;
    const device = this.deviceData?.device;
    if (!(device && device?.customer_id && device?.device_id && device?.device_ct)) {
      return;
    }
    this.spinner.start(this.spinnerName);
    this.getItemsList();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(): void {
  }

  getItemsList() {
    this.svc.getItemsList(this.deviceData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphList = res;
      this.buildForm();
      this.spinner.stop(this.spinnerName);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.spinnerName);
    })
  }

  buildForm() {
    this.dateRange = this.svc.getDateRangeByPeriod(this.graphRange.LAST_24_HOURS);
    this.filterForm = this.svc.buildForm(this.dateRange);
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.validationMessages;

    const graphs = [...this.graphList].slice(0, 3);
    this.viewData = this.svc.convertItemsToViewData(graphs, this.index);
    this.filterForm.get('graph_list').setValue(graphs);

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: ZabbixGraphTimeRange) => {
      if (val == this.graphRange.CUSTOM) {
        this.filterForm.get('from').enable({ emitEvent: false });
        this.filterForm.get('to').enable({ emitEvent: false });
      } else {
        this.dateRange = this.svc.getDateRangeByPeriod(val);
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
      this.formErrors = this.svc.resetFormErrors();
      this.viewData = this.svc.convertItemsToViewData(this.filterForm.get('graph_list').value, this.index);
      this.getGraph();
    }
  }

  getGraph() {
    from(this.viewData).pipe(tap(e => setTimeout(() => { this.spinner.start(e.graphSpinnerName) }, 0)),
      mergeMap(e => this.svc.getGraph(this.deviceData.device, e.itemId, this.filterForm.getRawValue())
        .pipe(takeUntil(this.ngUnsubscribe)))).subscribe(
          res => {
            const key = Object.keys(res).getFirst();
            let index = this.viewData.map(view => view.itemId).indexOf(key);
            this.viewData[index].image = res[key];
            this.spinner.stop(this.viewData[index].graphSpinnerName);
          }
        )
  }

}
