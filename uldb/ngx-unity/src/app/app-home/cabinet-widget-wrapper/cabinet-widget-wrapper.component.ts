import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { CabinetWidgetDatacenterViewData, CabinetWidgetService } from './cabinet-widget.service';

@Component({
  selector: 'cabinet-widget-wrapper',
  templateUrl: './cabinet-widget-wrapper.component.html',
  styleUrls: ['./cabinet-widget-wrapper.component.scss'],
  providers: [CabinetWidgetService]
})
export class CabinetWidgetWrapperComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  datacenters: CabinetWidgetDatacenterViewData[] = [];
  greenITEnabled: boolean = false;

  parentSubject: Subject<string> = new Subject();
  constructor(private cwService: CabinetWidgetService,
    private router: Router,
    private user: UserInfoService) {
    this.greenITEnabled = this.user.isGreenITEnabled;
  }

  ngOnInit() {
    this.getCabinetWidgetMetaData();
    this.syncCabinetWidgetData();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.parentSubject.complete();
  }

  getCabinetWidgetMetaData() {
    this.cwService.getCabinetWidgetMetaData().pipe(map(res => this.cwService.getEmptyCabinets(res)),
      takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res.length) {
          this.datacenters = res;
          setTimeout(() => {
            this.parentSubject.next('start');
            this.getCabinetWidgetData();
          }, 0);
        }
      }, err => { });
  }

  getCabinetWidgetData() {
    this.cwService.getCabinetWidgetData().pipe(map(res => this.cwService.convertToViewData(res)),
      takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res.length) {
          this.datacenters = res;
          this.parentSubject.next('stop');
        }
      }, err => {
        this.parentSubject.next('stop')
      });
  }

  syncCabinetWidgetData() {
    this.cwService.syncCabinetWidgetData().pipe(map(res => this.cwService.convertToViewData(res)),
      takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.datacenters = res;
        this.parentSubject.next('stop');
      }, err => {
        this.parentSubject.next('stop');
      });
  }

  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }
}
