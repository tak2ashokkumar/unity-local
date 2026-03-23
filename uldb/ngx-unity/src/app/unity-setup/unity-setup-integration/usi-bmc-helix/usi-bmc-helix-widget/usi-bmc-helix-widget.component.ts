import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'usi-bmc-helix-widget',
  templateUrl: './usi-bmc-helix-widget.component.html',
  styleUrls: ['./usi-bmc-helix-widget.component.scss']
})
export class UsiBmcHelixWidgetComponent implements OnInit {
  imageURL: string = `${environment.assetsUrl}external-brand/logos/bmc-helix-logo.svg`;
  addtooltipMsg: string;
  viewtooltipMsg: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    public userSvc: UserInfoService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userSvc.isUserAdmin ? '' : 'You do not have permission';
    this.viewtooltipMsg = 'View Details';
  }

  viewInstances() {
    this.router.navigate(['bmchelix', 'instances'], { relativeTo: this.route });
  }

  addInstance() {
    this.router.navigate(['bmchelix'], { relativeTo: this.route });
  }

}
