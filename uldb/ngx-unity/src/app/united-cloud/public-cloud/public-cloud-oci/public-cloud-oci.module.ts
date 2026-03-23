import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicCloudOciAccountsComponent } from './public-cloud-oci-accounts/public-cloud-oci-accounts.component';
import { PublicCloudOciOverviewComponent } from './public-cloud-oci-overview/public-cloud-oci-overview.component';
import { PublicCloudOciVmsListComponent } from './public-cloud-oci-overview/public-cloud-oci-vms-list/public-cloud-oci-vms-list.component';
import { UnitedCloudSharedModule } from '../../shared/united-cloud-shared.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { PublicCloudOciUsersComponent } from './public-cloud-oci-overview/public-cloud-oci-users/public-cloud-oci-users.component';
import { PublicCloudOciStorageServicesComponent } from './public-cloud-oci-overview/public-cloud-oci-storage-services/public-cloud-oci-storage-services.component';
import { PublicCloudOciStorageServiceFilesComponent } from './public-cloud-oci-overview/public-cloud-oci-storage-services/public-cloud-oci-storage-service-files/public-cloud-oci-storage-service-files.component';
import { PublicCloudOciSummaryComponent } from './public-cloud-oci-summary/public-cloud-oci-summary.component';
import { PublicCloudOciSummaryDetailsComponent } from './public-cloud-oci-summary/public-cloud-oci-summary-details/public-cloud-oci-summary-details.component';
import { PublicCloudOciSummaryBucketFilesComponent } from './public-cloud-oci-summary/public-cloud-oci-summary-details/public-cloud-oci-summary-bucket-files/public-cloud-oci-summary-bucket-files.component';

@NgModule({
  declarations: [PublicCloudOciAccountsComponent,
    PublicCloudOciOverviewComponent,
    PublicCloudOciVmsListComponent,
    PublicCloudOciUsersComponent,
    PublicCloudOciStorageServicesComponent,
    PublicCloudOciStorageServiceFilesComponent,
    PublicCloudOciSummaryComponent,
    PublicCloudOciSummaryDetailsComponent,
    PublicCloudOciSummaryBucketFilesComponent],
  imports: [
    AppCoreModule,
    SharedModule,
    UnitedCloudSharedModule
  ]
})
export class PublicCloudOciModule { }
