import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatabaseMonitoringGraphsService, DBMonitoringGraphView, DBGraphRange, DateRange } from './database-monitoring-graphs.service';
import { Subject, from } from 'rxjs';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil, mergeMap, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DatabaseMonitoringGraph } from '../database-monitoring.type';

@Component({
  selector: 'database-monitoring-graphs',
  templateUrl: './database-monitoring-graphs.component.html',
  styleUrls: ['./database-monitoring-graphs.component.scss'],
  providers: [DatabaseMonitoringGraphsService]
})
export class DatabaseMonitoringGraphsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  viewData: DBMonitoringGraphView[] = [];

  instanceId: string;
  graphList: DatabaseMonitoringGraph[] = [];
  dbGraphRange = DBGraphRange;
  graphView: DBMonitoringGraphView;
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

  constructor(private graphService: DatabaseMonitoringGraphsService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => this.instanceId = params.get('deviceid'));
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
    this.graphService.getGraphList(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphList = res;
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  buildForm() {
    this.dateRange = this.graphService.getDateRangeByPeriod(this.dbGraphRange.LAST_24_HOURS);
    this.filterForm = this.graphService.buildForm(this.dateRange);
    this.formErrors = this.graphService.resetFormErrors();
    this.validationMessages = this.graphService.validationMessages;

    const graphs = [...this.graphList].slice(0, 3);
    this.viewData = this.graphService.convertGraphsToViewData(graphs);
    this.filterForm.get('graph_list').setValue(graphs);

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: DBGraphRange) => {
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
      mergeMap(e => this.graphService.getGraph(this.instanceId, e.graphid, this.filterForm.getRawValue())
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
