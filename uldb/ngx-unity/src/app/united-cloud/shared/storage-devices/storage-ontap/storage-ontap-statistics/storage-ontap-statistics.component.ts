import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, from } from 'rxjs';
import { StorageOntapStatisticsService, StorageOntapStatisticsViewdata } from './storage-ontap-statistics.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { FormGroup } from '@angular/forms';
import { AppUtilityService, DateRange, UnityTimeDuration } from 'src/app/shared/app-utility/app-utility.service';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { OntapMonitoringStatisticsGraphItem } from '../storage-ontap.type';

@Component({
  selector: 'storage-ontap-statistics',
  templateUrl: './storage-ontap-statistics.component.html',
  styleUrls: ['./storage-ontap-statistics.component.scss'],
  providers: [StorageOntapStatisticsService]
})
export class StorageOntapStatisticsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  clusterId: string;
  itemId: string;
  item: { name: string, type: string, state: string };

  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  viewData: StorageOntapStatisticsViewdata[] = [];

  graphList: OntapMonitoringStatisticsGraphItem[] = [];
  graphRange = UnityTimeDuration;
  graphView: StorageOntapStatisticsViewdata;
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
  constructor(private svc: StorageOntapStatisticsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private storageSvc: StorageService,
    private utilService: AppUtilityService,
    private refreshService: DataRefreshBtnService,) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.itemId = params.get('id'));
    this.route.parent.parent.paramMap.subscribe((params: ParamMap) => this.clusterId = params.get('deviceid'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
    this.now = moment();
  }

  ngOnInit(): void {
    let item = <{ name: string, type: string, state: string }>this.storageSvc.getByKey('ontap-entity', StorageType.SESSIONSTORAGE);
    this.item = item;
    setTimeout(() => {
      this.spinner.start('main');
      this.getGraphList();
    }, 0);
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.buildForm();
  }

  getGraphList() {
    this.svc.getGraphList(this.clusterId, this.item.name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphList = res;
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  buildForm() {
    this.dateRange = this.svc.getDateRangeByPeriod(this.graphRange.LAST_24_HOURS);
    this.filterForm = this.svc.buildForm(this.dateRange);
    this.formErrors = this.svc.resetFormErrors();
    this.validationMessages = this.svc.validationMessages;

    const graphs = [...this.graphList].slice(0, 3);
    this.viewData = this.svc.convertGraphsToViewData(graphs);
    this.filterForm.get('graph_list').setValue(graphs);

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: UnityTimeDuration) => {
      this.dateRange = this.svc.getDateRangeByPeriod(val);
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
      this.formErrors = this.svc.resetFormErrors();
      this.viewData = this.svc.convertGraphsToViewData(this.filterForm.get('graph_list').value);
      this.getGraph();
    }
  }

  getGraph() {
    from(this.viewData).pipe(tap(e => setTimeout(() => { this.spinner.start(e.graphid) }, 0)),
      mergeMap(e => this.svc.getGraph(this.clusterId, e.graphid, this.filterForm.getRawValue())
        .pipe(takeUntil(this.ngUnsubscribe)))).subscribe(
          res => {
            const key = Object.keys(res).getFirst();
            let index = this.viewData.map(view => view.graphid).indexOf(key);
            this.viewData[index].image = res[key];
            this.spinner.stop(key);
          }
        )
  }
}
