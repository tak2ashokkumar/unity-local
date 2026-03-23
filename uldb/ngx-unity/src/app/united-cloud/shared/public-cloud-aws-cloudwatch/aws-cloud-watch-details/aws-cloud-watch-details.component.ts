import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AwsCloudWatchDetailsService } from './aws-cloud-watch-details.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'aws-cloud-watch-details',
  templateUrl: './aws-cloud-watch-details.component.html',
  styleUrls: ['./aws-cloud-watch-details.component.scss'],
  providers: [AwsCloudWatchDetailsService]
})
export class AwsCloudWatchDetailsComponent implements OnInit, OnDestroy {
  @Input() params: { accountId: string, regionId: string, instanceId: string };
  private ngUnsubscribe = new Subject();
  data: AWSDetails;
  dateFormat: string = environment.unityDateFormat;

  constructor(private detailsService: AwsCloudWatchDetailsService,
    private spinnerService: AppSpinnerService,
    public userInfo: UserInfoService) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start('aws-cloud-watch-details');
      this.getDetails();
    }, 0);
  }

  ngOnDestroy() {
    this.spinnerService.stop('aws-cloud-watch-details');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDetails() {
    this.detailsService.getInstanceDetails(this.params.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(detail => {
      this.data = <AWSDetails>detail.result.data[0];
      this.spinnerService.stop('aws-cloud-watch-details');
    }, err => {
      this.spinnerService.stop('aws-cloud-watch-details');
    });
  }
}
