import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { workflowIntegration } from '../usi-workflow-integration.type';

@Component({
  selector: 'usi-workflow-integration-widget',
  templateUrl: './usi-workflow-integration-widget.component.html',
  styleUrls: ['./usi-workflow-integration-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiWorkflowIntegrationWidgetComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  imageURL: string = `${environment.assetsUrl}external-brand/logos/workflow-integ.svg`;
  viewDisabled: boolean = true;
  addtooltipMsg: string;
  viewtooltipMsg: string;
  workflows: workflowIntegration[] = []

  constructor(private route: ActivatedRoute,
    private router: Router,
    private svc: UnitySetupIntegrationService,
    public userService: UserInfoService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasManageAccess(UnityModules.DEVOPS_AUTOMATION) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.DEVOPS_AUTOMATION) ? 'View Details' : 'You do not have permission';
    if (this.userService.hasViewAccess(UnityModules.DEVOPS_AUTOMATION)) {
      this.getWorkflowIntegrations();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getWorkflowIntegrations() {
    this.workflows = [];
    this.svc.getWorkflowIntegrations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.workflows = res;
    });
  }

  viewWorkflow() {
    this.router.navigate(['workflow'], { relativeTo: this.route });
  }

  addWorkflow() {
    this.router.navigate(['workflow', 'create'], { relativeTo: this.route });
  }
}
