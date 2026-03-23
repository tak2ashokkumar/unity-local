import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { AssetsRoutingModule } from './assets-routing.module';
import { AssetsComponent } from './assets.component';
import { AssetsVmsComponent } from './assets-vms/assets-vms.component';
import { AssetsCloudControllersComponent } from './assets-cloud-controllers/assets-cloud-controllers.component';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { UnitedCloudSharedModule } from '../shared/united-cloud-shared.module';
import { AssetsVmsAllComponent } from './assets-vms/assets-vms-all/assets-vms-all.component';
import { AssetsVmsAwsComponent } from './assets-vms/assets-vms-aws/assets-vms-aws.component';
import { AssetsVmsAzureComponent } from './assets-vms/assets-vms-azure/assets-vms-azure.component';
import { AssetsVmsGcpComponent } from './assets-vms/assets-vms-gcp/assets-vms-gcp.component';
import { AssetsMobileDeviceComponent } from './assets-mobile-device/assets-mobile-device.component';
import { AssetsMobileDeviceCrudComponent } from './assets-mobile-device/assets-mobile-device-crud/assets-mobile-device-crud.component';
import { AssetsMobileDeviceCrudService } from './assets-mobile-device/assets-mobile-device-crud/assets-mobile-device-crud.service';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AssetsVmsOracleComponent } from './assets-vms/assets-vms-oracle/assets-vms-oracle.component';
import { AssetsVmsResolverService } from './assets-vms-resolver.service';
@NgModule({
  declarations: [AssetsComponent, AssetsVmsComponent, AssetsCloudControllersComponent, AssetsVmsAllComponent, AssetsVmsAwsComponent, AssetsVmsAzureComponent, AssetsVmsGcpComponent, AssetsMobileDeviceComponent, AssetsMobileDeviceCrudComponent, AssetsVmsOracleComponent],
  imports: [
    AppCoreModule,
    SharedModule,
    AssetsRoutingModule,
    UnitedCloudSharedModule,
    TypeaheadModule.forRoot()
  ],
  providers: [
    AssetsMobileDeviceCrudService,
    AssetsVmsResolverService
  ]
})
export class AssetsModule { }
