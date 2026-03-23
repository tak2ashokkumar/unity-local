import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { PrivateCloudService } from 'src/app/app-home/infra-as-a-service/private-cloud/private-cloud.service'
import { PCFastData } from './pc-fast.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'private-cloud',
  templateUrl: './private-cloud.component.html',
  styleUrls: ['./private-cloud.component.scss'],
  providers: [PrivateCloudService]
})
export class PrivateCloudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  public pcFastData: PCFastData[] = [];

  constructor(private pcService: PrivateCloudService,
    private notification: AppNotificationService) { }

  ngOnInit() {
    this.getPrivateCloudFast();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPrivateCloudFast() {
    this.pcService.getPrivateCloudFast().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: Array<PrivateCLoudFast>) => {
      this.pcFastData = this.pcService.convertToPCFastData(data);
    }, err => {
      this.notification.error(new Notification('Problem ocurred in fetching Private Clouds. Please try again later.'))
    })
  }

  isClusterWidget(platfromType: string){
    switch (platfromType) {
      case 'VMware':
      case 'United Private Cloud vCenter': return true;
      default: return false;
    }    
  }
}
