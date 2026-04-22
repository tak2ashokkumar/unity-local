import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDActionTypes, ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { PcCrudService } from 'src/app/app-shared-crud/pc-crud/pc-crud.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';
import { PrivateCloudsWidgetMetadataType } from './usi-pc-crud.const';

@Component({
  selector: 'usi-pc-crud',
  templateUrl: './usi-pc-crud.component.html',
  styleUrls: ['./usi-pc-crud.component.scss']
})
export class UsiPcCrudComponent implements OnInit {
  @Input('pcMetaData') pcMetaData: PrivateCloudsWidgetMetadataType = null;
  imageURL: string;

  addtooltipMsg: string;
  viewtooltipMsg: string;

  adding: boolean = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService,
    private crudSvc: PcCrudService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.isUserAdmin ? '' : 'You do not have permission';
    this.viewtooltipMsg = 'View Details';
    this.imageURL = `${environment.assetsUrl}external-brand/logos/${this.pcMetaData.imageURL}`;
  }

  addCloud() {
    this.adding = true;
    setTimeout(() => {
      if(this.pcMetaData.platFormType == ServerSidePlatFormMapping.NUTANIX){
        this.router.navigate(['nutanix/add'], { relativeTo: this.route });
        return;
      }
      this.crudSvc.integratePrivateCloud(this.pcMetaData.platFormType);
    }, 0);
  }

  viewPvtCloud() {
    if(this.pcMetaData.platFormType == ServerSidePlatFormMapping.NUTANIX){
      this.router.navigate(['nutanix'], { relativeTo: this.route });
      return;
    }
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

  modalClosed(){
    this.adding = false;
  }

  onCrud(event: CRUDActionTypes) {
    this.adding = false;
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }
}