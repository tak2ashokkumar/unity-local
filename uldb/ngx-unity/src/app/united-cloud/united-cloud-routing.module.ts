import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // {
  //   path: 'pccloud',
  //   loadChildren: 'src/app/united-cloud/private-cloud/private-cloud.module#PrivateCloudModule'
  // },
  // {
  //   path: 'publiccloud',
  //   loadChildren: 'src/app/united-cloud/public-cloud/public-cloud.module#PublicCloudModule'
  // },
  // {
  //   path: 'devices',
  //   loadChildren: 'src/app/united-cloud/assets/assets.module#AssetsModule'
  // },
  // {
  //   path: 'datacenter',
  //   loadChildren: 'src/app/united-cloud/datacenter/datacenter.module#DatacenterModule'
  // },
  // {
  //   path: 'connect',
  //   loadChildren: 'src/app/united-cloud/unityconnect/unityconnect.module#UnityconnectModule'
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnitedCloudRoutingModule { }
