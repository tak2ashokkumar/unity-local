import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { UsiOntapCrudService } from '../../../shared/usi-ontap-crud/usi-ontap-crud.service';
import { UnitySetupIntegrationService, UsiOntapCluster } from '../unity-setup-integration.service';

@Component({
  selector: 'usi-ontap-widget',
  templateUrl: './usi-ontap-widget.component.html',
  styleUrls: ['./usi-ontap-widget.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiOntapWidgetComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  imageURL: string = `${environment.assetsUrl}external-brand/logos/ONTAP.svg`;
  addtooltipMsg: string;
  viewtooltipMsg: string;
  clusters: UsiOntapCluster[] = [];

  constructor(private router: Router,
    private svc: UnitySetupIntegrationService,
    public userService: UserInfoService,
    private usiOntapCrudSvc: UsiOntapCrudService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasCompleteAccess(UnityModules.DATACENTER) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.DATACENTER) ? 'View Details' : 'You do not have permission';
    if (this.userService.hasViewAccess(UnityModules.DATACENTER)) {
      this.getOntapClusters();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getOntapClusters() {
    this.svc.getOntapClusters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.clusters = res;
    })
  }

  ontap() {
    this.router.navigate(['/unitycloud/devices/storagedevices']);
  }

  addOntap() {
    this.usiOntapCrudSvc.addOrEdit(null);
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['/unitycloud/devices/storagedevices']);
  }
}
