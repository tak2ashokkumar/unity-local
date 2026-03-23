import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'usi-manage-engine-widget',
  templateUrl: './usi-manage-engine-widget.component.html',
  styleUrls: ['./usi-manage-engine-widget.component.scss']
})
export class UsiManageEngineWidgetComponent implements OnInit {
  imageURL: string = `${environment.assetsUrl}external-brand/logos/manageengine-logo.svg`;
  addtooltipMsg: string;
  viewtooltipMsg: string;
  constructor(private route: ActivatedRoute,
    private router: Router,
    public userService: UserInfoService) { }

  ngOnInit(): void {
    this.addtooltipMsg = this.userService.isUserAdmin ? '' : 'You do not have permission';
    this.viewtooltipMsg = 'View Details';
  }

  viewInstances() {
    this.router.navigate(['manage-engine', 'instances'], { relativeTo: this.route });
  }

  addInstance() {
    this.router.navigate(['manage-engine'], { relativeTo: this.route });
  }

}
