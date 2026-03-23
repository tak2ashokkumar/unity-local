import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { VmsService } from './vms.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService, PlatFormMapping, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'vms',
  templateUrl: './vms.component.html',
  styleUrls: ['./vms.component.scss']
})
export class VmsComponent implements OnInit, OnDestroy {
  pcId: string;
  platformType: string;
  PlatFormMapping = PlatFormMapping;
  DeviceMapping = DeviceMapping;
  private ngUnsubscribe = new Subject();
  constructor(private route: ActivatedRoute,
    private router: Router,
    private vmsService: VmsService,
    private utilService: AppUtilityService) {
    if (this.router.url.includes('vcclusters')) {
      this.route.parent.parent.paramMap.subscribe((params: ParamMap) => {
        this.pcId = params.get('pcId');
      });
    } else {
      this.route.parent.paramMap.subscribe((params: ParamMap) => {
        this.pcId = params.get('pcId');
      });
    }
  }

  ngOnInit() {
    this.getPrivateCloud();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPrivateCloud() {
    this.vmsService.getPrivateCloud(this.pcId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res.platform_type) {
          this.platformType = this.utilService.getCloudTypeByPlatformType(res.platform_type);
          this.vmsService.platformType = this.platformType;
        }
      }, err => {

      });
  }

}