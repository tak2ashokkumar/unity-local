import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDirectivesModule } from '../app-directives/app-directives.module';
import { AppFiltersModule } from '../app-filters/app-filters.module';
import { CabinetCrudComponent } from './cabinet-crud/cabinet-crud.component';
import { DcCrudComponent } from './dc-crud/dc-crud.component';
import { PcCrudComponent } from './pc-crud/pc-crud.component';
import { PduCrudComponent } from './pdu-crud/pdu-crud.component';
import { DeviceInterfaceCrudComponent } from './device-interface-crud/device-interface-crud.component';
import { PublicCloudAwsCrudComponent } from './public-cloud-aws-crud/public-cloud-aws-crud.component';
import { PublicCloudAzureCrudComponent } from './public-cloud-azure-crud/public-cloud-azure-crud.component';
import { PublicCloudGcpCrudComponent } from './public-cloud-gcp-crud/public-cloud-gcp-crud.component';
import { PublicCloudOciCrudComponent } from './public-cloud-oci-crud/public-cloud-oci-crud.component';
import { UnitySetupLdapCrudComponent } from './unity-setup-ldap-crud/unity-setup-ldap-crud.component';
import { UnityDevicesMonitoringCrudComponent } from './unity-devices-monitoring-crud/unity-devices-monitoring-crud.component';
import { UnityDevicesCustomAttributesCrudComponent } from './unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.component';
import { UsiOntapCrudComponent } from './usi-ontap-crud/usi-ontap-crud.component';
import { UsiOntapCrudNewComponent } from './usi-ontap-crud-new/usi-ontap-crud-new.component';
import { UsiPureStorageCrudComponent } from './usi-pure-storage-crud/usi-pure-storage-crud.component';


@NgModule({
  imports: [
    CommonModule,
    AppDirectivesModule,
    AppFiltersModule
  ],
  declarations: [
    CabinetCrudComponent,
    DcCrudComponent,
    PcCrudComponent,
    PduCrudComponent,
    DeviceInterfaceCrudComponent,
    PublicCloudAwsCrudComponent,
    PublicCloudAzureCrudComponent,
    PublicCloudGcpCrudComponent,
    PublicCloudOciCrudComponent,
    UnitySetupLdapCrudComponent,
    UnityDevicesMonitoringCrudComponent,
    UnityDevicesCustomAttributesCrudComponent,
    UsiOntapCrudComponent,
    UsiOntapCrudNewComponent,
    UsiPureStorageCrudComponent,

  ],
  exports: [
    CabinetCrudComponent,
    DcCrudComponent,
    PcCrudComponent,
    PduCrudComponent,
    DeviceInterfaceCrudComponent,
    PublicCloudAwsCrudComponent,
    PublicCloudAzureCrudComponent,
    PublicCloudGcpCrudComponent,
    PublicCloudOciCrudComponent,
    UnitySetupLdapCrudComponent,
    UnityDevicesMonitoringCrudComponent,
    UnityDevicesCustomAttributesCrudComponent,
    UsiOntapCrudComponent,
    UsiOntapCrudNewComponent,
    UsiPureStorageCrudComponent,

  ]
})
export class AppSharedCrudModule {}