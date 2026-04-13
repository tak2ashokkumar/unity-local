import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TICKET_MGMT_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';

@Component({
  selector: 'usi-itsm',
  templateUrl: './usi-itsm.component.html',
  styleUrls: ['./usi-itsm.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiItsmComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  addtooltipMsg: string;
  viewtooltipMsg: string;
  itsm = ITSMInstances;

  constructor(private svc: UnitySetupIntegrationService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasManageAccess(UnityModules.TICKET_MANAGEMENT) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.TICKET_MANAGEMENT) ? 'View Details' : 'You do not have permission';;
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
        this.itsm.serviceNow.length = res.filter(t => t.type == 'ServiceNow').length;
        tm = null;
      }
      tm = res.find((tm) => tm.type == TICKET_MGMT_TYPE.CRM);
      if (tm) {
        this.itsm.crm.length = res.filter(t => t.type == 'DynamicsCrm').length;
        tm = null;
      }
      tm = res.find((tm) => tm.type == TICKET_MGMT_TYPE.JIRA);
      if (tm) {
        this.itsm.jira.length = res.filter(t => t.type == 'Jira').length;
        tm = null;
      }
      tm = res.find((tm) => tm.type == TICKET_MGMT_TYPE.BMCHELIX);
      if (tm) {
        this.itsm.bmcHelix.length = res.filter(t => t.type == 'BMCHelix').length;
        tm = null;
      }
      tm = res.find((tm) => tm.type == TICKET_MGMT_TYPE.MANAGEENGINE);
      if (tm) {
        this.itsm.manageEngine.length = res.filter(t => t.type == 'ManageEngine').length;
        tm = null;
      }
      tm = res.find((tm) => tm.type == TICKET_MGMT_TYPE.UNITYONEITSM);
      if (tm) {
        this.itsm.unityOneITSM.length = res.filter(t => t.type == 'UnityOne ITSM').length;
        tm = null;
      }
    });
  }

  serviceNow() {
    this.router.navigate(['servicenow', 'instances'], { relativeTo: this.route });
  }

  addServiceNow() {
    this.router.navigate(['servicenow'], { relativeTo: this.route });
  }

  msDynamics365() {
    this.router.navigate(['msdynamics', 'instances'], { relativeTo: this.route });
  }

  addMsDynamics365() {
    this.router.navigate(['msdynamics'], { relativeTo: this.route });
  }

  jira() {
    this.router.navigate(['jira', 'instances'], { relativeTo: this.route });
  }

  addJira() {
    this.router.navigate(['jira'], { relativeTo: this.route });
  }

  viewBmcHelixInstances() {
    this.router.navigate(['bmchelix', 'instances'], { relativeTo: this.route });
  }

  addBmcHelixInstance() {
    this.router.navigate(['bmchelix'], { relativeTo: this.route });
  }

  viewManageEngineInstances() {
    this.router.navigate(['manage-engine', 'instances'], { relativeTo: this.route });
  }

  addManageEngineInstance() {
    this.router.navigate(['manage-engine'], { relativeTo: this.route });
  }

  viewUnityOneItsmInstances() {
    this.router.navigate(['unityone-itsm', 'instances'], { relativeTo: this.route });
  }

  addUnityOneItsmInstance() {
    this.router.navigate(['unityone-itsm'], { relativeTo: this.route });
  }
}

const ITSMInstances = {
  'serviceNow': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/servicenow 1.svg`,
    'length': 0
  },
  'crm': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/Microsoft-Dynamics-CRM-logo 1.svg`,
    'length': 0
  },
  'jira': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/jira-integ.svg`,
    'length': 0
  },
  'manageEngine': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/manageengine-logo.svg`,
    'length': 0
  },
  'bmcHelix': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/bmc-helix-logo.svg`,
    'length': 0
  },
  'unityOneITSM': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/UnityOneITSM.svg`,
    'length': 0
  }
}
