import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes, TICKET_MGMT_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { UsiMsDynamicsCrmCrudService } from '../usi-ms-dynamics-crm-crud/usi-ms-dynamics-crm-crud.service';

@Component({
  selector: 'usi-ms-dynamics-crm-widget',
  templateUrl: './usi-ms-dynamics-crm-widget.component.html',
  styleUrls: ['./usi-ms-dynamics-crm-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiMsDynamicsCrmWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Microsoft-Dynamics-CRM-logo 1.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,
    private usiMsCrmCrudSvc: UsiMsDynamicsCrmCrudService) { }

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
      let tm = res.find((tm) => tm.type == TICKET_MGMT_TYPE.CRM);
      if (tm) {
        this.viewDisabled = false;
      }
    })
  }

  msDynamics365() {
    this.router.navigate(['msdynamics'], { relativeTo: this.route });
  }

  addMsDynamics365() {
    // this.usiMsCrmCrudSvc.addOrEdit(null);
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['msdynamics'], { relativeTo: this.route });
  }
}
