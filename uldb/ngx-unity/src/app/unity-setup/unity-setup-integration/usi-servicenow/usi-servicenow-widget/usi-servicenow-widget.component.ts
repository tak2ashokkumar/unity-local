import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TICKET_MGMT_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { UnityModules } from 'src/app/app.component';

@Component({
  selector: 'usi-servicenow-widget',
  templateUrl: './usi-servicenow-widget.component.html',
  styleUrls: ['./usi-servicenow-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiServicenowWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/servicenow 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.isUserAdmin ? '' : 'You do not have permission';
    this.viewtooltipMsg = 'View Details';
    if (this.userService.hasViewAccess(UnityModules.TICKET_MANAGEMENT)) {
      this.getTicketManagementList();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTicketManagementList() {
    this.svc.getTicketManagementList().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      let tm = res.find((tm) => tm.type == TICKET_MGMT_TYPE.SERVICENOW);
      if (tm) {
        this.viewDisabled = false;
      }
    })
  }

  serviceNow() {
    this.router.navigate(['servicenow', 'instances'], { relativeTo: this.route });
  }

  addServiceNow() {
    this.router.navigate(['servicenow'], { relativeTo: this.route });
  }
}
