import { Routes } from '@angular/router';
import { PublicCloudOciOverviewComponent } from './public-cloud-oci-overview/public-cloud-oci-overview.component';
import { PublicCloudOciStorageServiceFilesComponent } from './public-cloud-oci-overview/public-cloud-oci-storage-services/public-cloud-oci-storage-service-files/public-cloud-oci-storage-service-files.component';
import { PublicCloudOciStorageServicesComponent } from './public-cloud-oci-overview/public-cloud-oci-storage-services/public-cloud-oci-storage-services.component';
import { PublicCloudOciUsersComponent } from './public-cloud-oci-overview/public-cloud-oci-users/public-cloud-oci-users.component';
import { PublicCloudOciVmsListComponent } from './public-cloud-oci-overview/public-cloud-oci-vms-list/public-cloud-oci-vms-list.component';
import { PublicCloudOciSummaryComponent } from './public-cloud-oci-summary/public-cloud-oci-summary.component';
import { PublicCloudOciSummaryDetailsComponent } from './public-cloud-oci-summary/public-cloud-oci-summary-details/public-cloud-oci-summary-details.component';
import { PublicCloudOciSummaryBucketFilesComponent } from './public-cloud-oci-summary/public-cloud-oci-summary-details/public-cloud-oci-summary-bucket-files/public-cloud-oci-summary-bucket-files.component';
import { UsiPublicCloudOracleCrudComponent } from 'src/app/unity-setup/unity-setup-integration/usi-public-cloud-oracle/usi-public-cloud-oracle-crud/usi-public-cloud-oracle-crud.component';
import { UsiPublicCloudOracleResourceDataComponent } from 'src/app/unity-setup/unity-setup-integration/usi-public-cloud-oracle/usi-public-cloud-oracle-resource-data/usi-public-cloud-oracle-resource-data.component';

export const oci_routes: Routes = [
  {
    path: '',
    component: PublicCloudOciSummaryComponent,
    data: {
      breadcrumb: {
        title: 'OCI Dashboard',
        stepbackCount: 0
      }
    }
  },
  {
    path: ':instanceId/edit',
    component: UsiPublicCloudOracleCrudComponent,
    data: {
      breadcrumb: {
        title: 'Accounts',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/:resourceId',
    component: PublicCloudOciSummaryDetailsComponent,
    data: {
      breadcrumb: {
        title: 'OCI',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/:serviceId/:instanceId/resources/:resourceId',
    component: UsiPublicCloudOracleResourceDataComponent,
    data: {
      breadcrumb: {
        title: 'OCI',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'services/:resourceId/:accountId/:bucketName/files',
    component: PublicCloudOciSummaryBucketFilesComponent,
    data: {
      breadcrumb: {
        title: 'OCI',
        stepbackCount: 0
      }
    }
  },
  {
    path: 'overview/:accountId',
    component: PublicCloudOciOverviewComponent,
    children: [
      {
        path: 'vms',
        component: PublicCloudOciVmsListComponent,
        data: {
          breadcrumb: {
            title: 'Instances',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'users',
        component: PublicCloudOciUsersComponent,
        data: {
          breadcrumb: {
            title: 'Users',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'storage-services',
        component: PublicCloudOciStorageServicesComponent,
        data: {
          breadcrumb: {
            title: 'Storage Services',
            stepbackCount: 0
          }
        }
      },
      {
        path: 'storage-services/:bucketName',
        data: {
          breadcrumb: {
            title: 'Storage Services',
            stepbackCount: 1
          }
        },
        children: [
          {
            path: 'files',
            component: PublicCloudOciStorageServiceFilesComponent,
            data: {
              breadcrumb: {
                title: 'Files',
                stepbackCount: 0
              }
            }
          }
        ]
      },
    ]
  }
];