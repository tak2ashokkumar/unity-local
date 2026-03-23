import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDActionTypes, TICKET_MGMT_TYPE } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UsiJiraCrudService } from '../usi-jira-crud/usi-jira-crud.service';
import { takeUntil } from 'rxjs/operators';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { Subject } from 'rxjs';
import { UnityModules } from 'src/app/app.component';

@Component({
  selector: 'usi-jira-widget',
  templateUrl: './usi-jira-widget.component.html',
  styleUrls: ['./usi-jira-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiJiraWidgetComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  imageURL: string = `${environment.assetsUrl}external-brand/logos/Jira Software.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private svc: UnitySetupIntegrationService,
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,
    private crudSvc: UsiJiraCrudService) { }

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
      let tm = res.find((tm) => tm.type == TICKET_MGMT_TYPE.JIRA);
      if (tm) {
        this.viewDisabled = false;
      }
    })
  }

  jira() {
    this.router.navigate(['jira'], { relativeTo: this.route });
  }

  addJira() {
    // this.crudSvc.addOrEdit(null);
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['jira'], { relativeTo: this.route });
  }

}
