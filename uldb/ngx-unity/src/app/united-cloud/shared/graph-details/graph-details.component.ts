import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { GraphDetailsService, DeviceGraphDetailType, GraphDetailsType } from './graph-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import * as moment from 'moment';
import { DateRangeInUnix } from 'src/app/shared/SharedEntityTypes/DateRangeInUnix.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'graph-details',
  templateUrl: './graph-details.component.html',
  styleUrls: ['./graph-details.component.scss'],
  providers: [GraphDetailsService]
})
export class GraphDetailsComponent implements OnInit, OnDestroy {

  data: DeviceGraphDetailType;
  viewData: GraphDetailsType;
  dateForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  now: any;
  private ngUnsubscribe = new Subject();
  dateRange: DateRangeInUnix;
  loading: boolean = false;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private detailsService: GraphDetailsService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService) {
    this.route.paramMap.subscribe((param: ParamMap) => {
      param.get('deviceType');
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getGraph();
    });
    this.now = moment();
  }

  ngOnInit() {
    this.data = <DeviceGraphDetailType>this.storage.getByKey('graphdata', StorageType.SESSIONSTORAGE);
    if (this.data == null) {
      this.router.navigate(['../'], { relativeTo: this.route })
    } else {
      setTimeout(() => {
        this.dateRange = this.utilService.getDateRangeByGraphRange(this.data.graphRange);
        this.buildForm();
        this.getGraph();
      }, 0);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('graphdata', StorageType.SESSIONSTORAGE);
  }

  buildForm() {
    this.dateForm = this.detailsService.buildForm(this.dateRange);
    this.formErrors = this.detailsService.resetFormErrors();
    this.validationMessages = this.detailsService.validationMessages;
  }

  onSubmit() {
    if (this.dateForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.dateForm, this.validationMessages, this.formErrors);
      this.dateForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.dateForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.formErrors = this.detailsService.resetFormErrors();
      const range = this.dateForm.getRawValue();
      this.dateRange = {
        from: moment(range['from']).unix(), to: moment(range['to']).unix()
      }
      this.getGraph();
    }
  }

  getGraph() {
    this.loading = true;
    this.spinner.start(this.data.graphType);
    this.detailsService.getGraph(this.data, this.dateRange.from, this.dateRange.to).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: GraphDetailsType) => {
      this.spinner.stop(this.data.graphType);
      this.loading = false;
      this.viewData = res;
    }, err => {
      this.loading = false;
      this.spinner.stop(this.data.graphType);
    });
  }

}

