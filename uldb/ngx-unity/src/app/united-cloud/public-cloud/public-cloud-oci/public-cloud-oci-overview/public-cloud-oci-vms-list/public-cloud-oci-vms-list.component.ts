import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'public-cloud-oci-vms-list',
  templateUrl: './public-cloud-oci-vms-list.component.html',
  styleUrls: ['./public-cloud-oci-vms-list.component.scss']
})
export class PublicCloudOciVmsListComponent implements OnInit {
  accountId: string;

  constructor(private route: ActivatedRoute,
    private notificationService: AppNotificationService) { }

  ngOnInit() {
    this.notificationService.success(new Notification("Latest data is being updated."));
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
    });
  }
}
