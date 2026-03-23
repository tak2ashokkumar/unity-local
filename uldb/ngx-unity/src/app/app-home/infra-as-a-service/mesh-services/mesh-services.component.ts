import { Component, OnInit, OnDestroy } from '@angular/core';
import { MeshServicesService, DashboardMeshServicesViewData } from './mesh-services.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { MESH_SERVICE_TYPE_MAPPING } from 'src/app/united-cloud/unity-cloud-services/mesh-services/mesh-service.type';
import { DashboardMeshServicesData } from './mesh-services.type';

@Component({
  selector: 'mesh-services',
  templateUrl: './mesh-services.component.html',
  styleUrls: ['./mesh-services.component.scss'],
  providers: [MeshServicesService]
})
export class MeshServicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  meshServices: DashboardMeshServicesViewData[] = [];
  MESH_SERVICE_TYPE_MAPPING = MESH_SERVICE_TYPE_MAPPING;
  constructor(private meshService: MeshServicesService,
    private notification: AppNotificationService) { }

  ngOnInit() {
    this.getMeshServives();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMeshServives() {
    this.meshService.getMeshServives().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: DashboardMeshServicesData[]) => {
      this.meshServices = this.meshService.convertToViewData(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Problem occurred in fetching Mesh Services. Please try again.'));
    });
  }

}
