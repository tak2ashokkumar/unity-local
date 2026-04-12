import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';
import { CRUDActionTypes, ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PcCrudService } from 'src/app/shared/pc-crud/pc-crud.service';
import { PrivateCloudCountType, PrivateCLoudFastType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { PrivateClouds, UsiPcIntegrationWidgetService } from './usi-pc-integration-widget.service';

@Component({
  selector: 'usi-pc-integration-widget',
  templateUrl: './usi-pc-integration-widget.component.html',
  styleUrls: ['./usi-pc-integration-widget.component.scss'],
  providers: [UsiPcIntegrationWidgetService]
})
export class UsiPcIntegrationWidgetComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  addtooltipMsg: string;
  viewtooltipMsg: string;
  privateCloudData: Array<PrivateCLoudFastType> = [];
  privateCloudCountData: Array<PrivateCloudCountType> = [];
  privateClouds = PrivateClouds;

  constructor(private svc: UsiPcIntegrationWidgetService,
    public userService: UserInfoService,
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: PcCrudService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasManageAccess(UnityModules.PRIVATE_CLOUD) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.PRIVATE_CLOUD) ? 'View Details' : 'You do not have permission';
    // this.getPrivateCloudFast();
    if (this.userService.hasViewAccess(UnityModules.PRIVATE_CLOUD)) {
      this.getCloudCount();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getCloudCount() {
    this.svc.getCloudCount().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateCloudCountData = res;
      this.updatePrivateCloudViewEnabled();
    })
  }

  // getPrivateCloudFast() {
  //   this.svc.getPrivateCloudFast().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.privateCloudData = res;
  //     this.getCloudCount();
  //     // this.UpdatePrivateCloudViewEnabled();
  //   })
  // }

  updatePrivateCloudViewEnabled() {

    let cloud = this.privateCloudCountData.find((pc) => pc.platform_type == ServerSidePlatFormMapping.ESXI);
    if (cloud && cloud.count > 0) {
      this.privateClouds.esxi.length = cloud.count;
    }

    cloud = this.privateCloudCountData.find((pc) => pc.platform_type == ServerSidePlatFormMapping.VCLOUD);
    if (cloud && cloud.count > 0) {
      this.privateClouds.vmwareCloud.length = cloud.count;
    }

    cloud = this.privateCloudCountData.find((pc) => pc.platform_type == ServerSidePlatFormMapping.HYPER_V);
    if (cloud && cloud.count > 0) {
      this.privateClouds.hyperV.length = cloud.count;
    }

    cloud = this.privateCloudCountData.find((pc) => pc.platform_type == ServerSidePlatFormMapping.OPENSTACK);
    if (cloud && cloud.count > 0) {
      this.privateClouds.openstack.length = cloud.count;
    }

    cloud = this.privateCloudCountData.find((pc) => pc.platform_type == ServerSidePlatFormMapping.PROXMOX);
    if (cloud && cloud.count > 0) {
      this.privateClouds.proxmox.length = cloud.count;
    }

    cloud = this.privateCloudCountData.find((pc) => pc.platform_type == ServerSidePlatFormMapping.VMWARE);
    if (cloud && cloud.count > 0) {
      this.privateClouds.vmwareVcenter.length = cloud.count;
    }

    cloud = this.privateCloudCountData.find((pc) => pc.platform_type == ServerSidePlatFormMapping.G3_KVM);
    if (cloud && cloud.count > 0) {
      this.privateClouds.upcKvm.length = cloud.count;
    }

    cloud = this.privateCloudCountData.find((pc) => pc.platform_type == ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER);
    if (cloud && cloud.count > 0) {
      this.privateClouds.upcVcenter.length = cloud.count;
    }

    cloud = this.privateCloudCountData.find((pc) => pc.platform_type == ServerSidePlatFormMapping.NUTANIX);
    if (cloud && cloud.count > 0) {
      this.privateClouds.nutanix.length = cloud.count;
    }
  }

  addEsxiPvtCloud() {
    // this.crudSvc.integratePrivateCloud(ServerSidePlatFormMapping.ESXI);
    this.router.navigate(['esxi/add'], { relativeTo: this.route });
  }

  goToEsxiViewDetails() {
    if (!this.privateClouds.esxi.length) {
      return;
    }
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

  addVcloudPvtCloud() {
    // this.crudSvc.integratePrivateCloud(ServerSidePlatFormMapping.VCLOUD);
    this.router.navigate(['vcloud/add'], { relativeTo: this.route });
  }

  goToVcloudViewDetails() {
    if (!this.privateClouds.vmwareCloud.length) {
      return;
    }
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

  addHypervPvtCloud() {
    // this.crudSvc.integratePrivateCloud(ServerSidePlatFormMapping.HYPER_V);
    this.router.navigate(['hyperv/add'], { relativeTo: this.route });
  }

  goToHypervViewDetails() {
    if (!this.privateClouds.hyperV.length) {
      return;
    }
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

  addOpenstackPvtCloud() {
    // this.crudSvc.integratePrivateCloud(ServerSidePlatFormMapping.OPENSTACK);
    this.router.navigate(['openstack/add'], { relativeTo: this.route });
  }

  goToOpenstackViewDetails() {
    if (!this.privateClouds.openstack.length) {
      return;
    }
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

  addProxmoxPvtCloud() {
    // this.crudSvc.integratePrivateCloud(ServerSidePlatFormMapping.PROXMOX);
    this.router.navigate(['proxmox/add'], { relativeTo: this.route });
  }

  goToProxmoxViewDetails() {
    if (!this.privateClouds.proxmox.length) {
      return;
    }
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

  addVcenterVmwarePvtCloud() {
    this.router.navigate(['vmware-vcenter/add'], { relativeTo: this.route });
  }

  goToVcenterVmwareViewDetails() {
    if (!this.privateClouds.vmwareVcenter.length) {
      return;
    }
    this.router.navigate(['vmware-vcenter'], { relativeTo: this.route });
  }

  addUpckvmPvtCloud() {
    // this.crudSvc.integratePrivateCloud(ServerSidePlatFormMapping.G3_KVM);
    this.router.navigate(['unity-kvm/add'], { relativeTo: this.route });
  }

  goToUpckvmViewDetails() {
    if (!this.privateClouds.upcKvm.length) {
      return;
    }
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

  addUpcvcenterPvtCloud() {
    this.router.navigate(['unity-vcenter/add'], { relativeTo: this.route });
    // this.crudSvc.integratePrivateCloud(ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER);
  }

  goToUpcvcenterViewDetails() {
    if (!this.privateClouds.upcVcenter.length) {
      return;
    }
    this.router.navigate(['unity-vcenter'], { relativeTo: this.route });
  }

  addNutanixPvtCloud() {
    this.router.navigate(['nutanix/add'], { relativeTo: this.route });
  }

  goToNutanixViewDetails() {
    if (!this.privateClouds.nutanix.length) {
      return;
    }
    this.router.navigate(['nutanix'], { relativeTo: this.route });
  }

  onCrud(event: CRUDActionTypes) {
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

}
