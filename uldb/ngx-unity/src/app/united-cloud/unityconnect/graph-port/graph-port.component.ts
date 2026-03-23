import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil} from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { DateRange, GraphPortService, PortGraphRange, GraphPortViewData } from './graph-port.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'graph-port',
  templateUrl: './graph-port.component.html',
  styleUrls: ['./graph-port.component.scss'],
  providers: [GraphPortService]
})
export class GraphPortComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  portId: string;

  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  dateRange: DateRange;
  graphRange = PortGraphRange;
  now: any;

  viewData: GraphPortViewData[] = [];
  constructor(private graphService: GraphPortService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private refreshService: DataRefreshBtnService,
    private notification: AppNotificationService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.portId = params.get('portId'));
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.buildForm();
    });
    this.now = moment();
  }

  ngOnInit() {
    setTimeout(() => {
      this.buildForm();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('graphdata', StorageType.SESSIONSTORAGE);
  }

  buildForm() {
    this.dateRange = this.graphService.getDateRangeByPeriod(this.graphRange.LAST_24_HOURS);
    this.filterForm = this.graphService.buildForm(this.dateRange);
    this.formErrors = this.graphService.resetFormErrors();
    this.validationMessages = this.graphService.validationMessages;

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: PortGraphRange) => {
      this.dateRange = this.graphService.getDateRangeByPeriod(val);
      if (this.dateRange) {
        this.filterForm.get('from').patchValue(new Date(this.dateRange.from))
        this.filterForm.get('to').patchValue(new Date(this.dateRange.to))
      }
    });
    this.onSubmit();
  }

  onSubmit() {
    if (this.filterForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors);
      this.filterForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.filterForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      this.formErrors = this.graphService.resetFormErrors();
      this.getGraph();
    }
  }

  getGraph() {
    this.graphService.getGraph(this.portId, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.graphService.convertGraphsToViewData(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('failted to fetch ports graph'));
    })
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
