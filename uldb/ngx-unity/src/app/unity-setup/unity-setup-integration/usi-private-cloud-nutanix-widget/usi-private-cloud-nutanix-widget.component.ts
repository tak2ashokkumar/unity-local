import { Component, Input, OnInit } from '@angular/core';
import { PrivateCloudsWidgetMetadataType } from '../usi-pc-crud/usi-pc-crud.const';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'usi-private-cloud-nutanix-widget',
  templateUrl: './usi-private-cloud-nutanix-widget.component.html',
  styleUrls: ['./usi-private-cloud-nutanix-widget.component.scss']
})
export class UsiPrivateCloudNutanixWidgetComponent implements OnInit {
  @Input('pcMetaData') pcMetaData: PrivateCloudsWidgetMetadataType = null;
  imageURL: string;

  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor( private router: Router,
    public userService: UserInfoService) {
      console.log(this.pcMetaData)
     }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.isUserAdmin ? '' : 'You do not have permission';
    this.viewtooltipMsg = 'View Details';
    this.imageURL = `${environment.assetsUrl}external-brand/logos/${this.pcMetaData.imageURL}`;
  }

  addAccount() {
    this.router.navigate(['/setup/integration/nutanix/add']);
  }

  viewAccounts() {
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

}
