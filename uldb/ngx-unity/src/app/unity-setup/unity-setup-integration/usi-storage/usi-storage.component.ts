import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { UnityModules } from 'src/app/shared/unity-rbac-permissions/unity-modules';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { UsiOntapCrudService } from 'src/app/app-shared-crud/usi-ontap-crud/usi-ontap-crud.service';
import { UsiPureStorageCrudService } from 'src/app/app-shared-crud/usi-pure-storage-crud/usi-pure-storage-crud.service';
import { environment } from 'src/environments/environment';
import { UnitySetupIntegrationService } from '../unity-setup-integration.service';

@Component({
  selector: 'usi-storage',
  templateUrl: './usi-storage.component.html',
  styleUrls: ['./usi-storage.component.scss'],
  providers: [UnitySetupIntegrationService]
})
export class UsiStorageComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  addtooltipMsg: string;
  viewtooltipMsg: string;
  storage = Storage;
  constructor(private svc: UnitySetupIntegrationService,
    private usiOntapCrudSvc: UsiOntapCrudService,
    private usiPureStorageCrudSvc: UsiPureStorageCrudService,
    public userService: UserInfoService,
    private router: Router,
    private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.hasCompleteAccess(UnityModules.DATACENTER) ? 'Integrate' : 'You do not have permission';
    this.viewtooltipMsg = this.userService.hasViewAccess(UnityModules.DATACENTER) ? 'View Details' : 'You do not have permission';
    if (this.userService.hasViewAccess(UnityModules.DATACENTER)) {
      this.getOntapClusters();
      this.getPureStorageClusters();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getOntapClusters() {
    this.storage.ontap.clusters = [];
    this.svc.getOntapClusters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.storage.ontap.clusters = res;
    })
  }

  getPureStorageClusters() {
    this.storage.pure.clusters = [];
    this.svc.getPureStorageClusters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.storage.pure.clusters = res;
    })
  }

  ontap() {
    this.router.navigate(['/unitycloud/devices/storagedevices']);
  }

  addOntap() {
    // this.usiOntapCrudSvc.addOrEdit(null);
    this.router.navigate(['storage/add'], { relativeTo: this.route });
  }

  onOntapCrud(event: CRUDActionTypes) {
    this.router.navigate(['/unitycloud/devices/storagedevices']);
  }

  pureStorage() {
    this.router.navigate(['pure-storage'], { relativeTo: this.route });
  }

  addPureStorage() {
    // this.usiPureStorageCrudSvc.addOrEdit(null);
    this.router.navigate(['pure-storage/add'], { relativeTo: this.route });
  }

  // onPureStorageCrud(event: CRUDActionTypes) {
  //   this.router.navigate(['pure-storage'], { relativeTo: this.route });
  // }
}

const Storage = {
  'ontap': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/ontap-integ.svg`,
    'clusters': []
  },
  'pure': {
    'imageURL': `${environment.assetsUrl}external-brand/logos/PureStorage.svg`,
    'clusters': []
  }
}
