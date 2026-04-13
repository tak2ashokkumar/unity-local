import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitySetupIntegrationService } from '../../unity-setup-integration.service';
import { UsiImportDataCrudService } from '../usi-import-data-crud/usi-import-data-crud.service';
import { AwsImportDataType } from '../usi-import-data.service';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';

@Component({
  selector: 'usi-import-data-widget',
  templateUrl: './usi-import-data-widget.component.html',
  styleUrls: ['./usi-import-data-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiImportDataWidgetComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  imageURL: string = `${environment.assetsUrl}external-brand/logos/Upload Drive.svg`
  addtooltipMsg: string;
  viewtooltipMsg: string;
  files: AwsImportDataType[] = [];

  constructor(private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,
    private usiIdCrdSrv: UsiImportDataCrudService,
    private svc: UnitySetupIntegrationService) { }

  ngOnInit(): void {
    let hasManageAccess = this.userService.hasCompleteAccess(UnityModules.SUSTAINABILITY) && this.userService.hasCompleteAccess(UnityModules.PUBLIC_CLOUD);
    this.addtooltipMsg = hasManageAccess ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.SUSTAINABILITY) ? 'View Details' : 'You do not have permission';
    if (this.userService.hasViewAccess(UnityModules.SUSTAINABILITY)) {
      this.getSustanabilityData();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getSustanabilityData() {
    this.files = [];
    this.svc.getSustanabilityData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.files = res;
    });
  }

  viewImportData() {
    this.router.navigate(['import-data'], { relativeTo: this.route });
  }

  importData() {
    this.router.navigate(['import-data', 'create'], { relativeTo: this.route });
  }

}
