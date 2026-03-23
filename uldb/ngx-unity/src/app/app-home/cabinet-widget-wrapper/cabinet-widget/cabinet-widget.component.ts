import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { CabinetWidgetData } from '../cabinet-widget.type';

@Component({
  selector: 'cabinet-widget',
  templateUrl: './cabinet-widget.component.html',
  styleUrls: ['./cabinet-widget.component.scss']
})
export class CabinetWidgetComponent implements OnInit {

  @Input() cabinetData: CabinetWidgetData;

  constructor(private router: Router,
    private user: UserInfoService,) { }

  ngOnInit() {
  }

  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }

}
