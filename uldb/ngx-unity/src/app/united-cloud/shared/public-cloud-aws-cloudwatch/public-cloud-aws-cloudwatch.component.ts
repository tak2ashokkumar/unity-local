import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PublicCloudAwsCloudwatchService } from './public-cloud-aws-cloudwatch.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AwsCloudWatchGraphType } from './aws-cloud-watch.type';

@Component({
  selector: 'public-cloud-aws-cloudwatch',
  templateUrl: './public-cloud-aws-cloudwatch.component.html',
  styleUrls: ['./public-cloud-aws-cloudwatch.component.scss'],
  providers: [PublicCloudAwsCloudwatchService]
})
export class PublicCloudAwsCloudwatchComponent implements OnInit, OnDestroy {
  params: { accountId: string};
  private ngUnsubscribe = new Subject();
  graphs: AwsCloudWatchGraphType[] = [];

  constructor(private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,
    private cwService: PublicCloudAwsCloudwatchService,
    private notification: AppNotificationService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.params = { accountId: params.get('accountId') }
    });
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getGraphs();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getGraphs() {
    this.cwService.getGraphs(this.params).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.graphs = res.result.data;
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Something went wrong. Please try again!!'))
    });
  }
}