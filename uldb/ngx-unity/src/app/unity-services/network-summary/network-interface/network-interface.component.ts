import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NetworkInterfaceDetailsViewData, NetworkInterfaceService } from './network-interface.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'network-interface',
  templateUrl: './network-interface.component.html',
  styleUrls: ['./network-interface.component.scss']
})
export class NetworkInterfaceComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  filterForm: FormGroup;
  formErrors: any;
  validationMessages: any;

  networkInterfaceViewData: NetworkInterfaceDetailsViewData;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: NetworkInterfaceService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,) { }

  ngOnInit(): void {
    this.getNetworkInterfaceDetails();
  }

  ngOnDestroy(): void {
  }


  getNetworkInterfaceDetails(){
    this.svc.getNetworkInterfaceDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.networkInterfaceViewData = this.svc.convertToNetworkInterfaceData(data);
      console.log(this.networkInterfaceViewData,'is data coming');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Interface Details.'));
      this.spinner.stop('main');
    });
  }

  

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
