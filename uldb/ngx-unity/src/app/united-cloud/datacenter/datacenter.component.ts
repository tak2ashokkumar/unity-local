import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatacenterService } from './datacenter.service';
import { Router, ActivatedRoute, ParamMap, NavigationEnd } from '@angular/router';
import { DataCenterTabs } from './tabs';
import { Subscription, Subject } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { DcCrudService } from 'src/app/app-shared-crud/dc-crud/dc-crud.service';

@Component({
  selector: 'datacenter',
  templateUrl: './datacenter.component.html',
  styleUrls: ['./datacenter.component.scss']
})
export class DatacenterComponent implements OnInit, OnDestroy {

  tabItems: DataCenterTabs[] = [];
  dcId: string;
  subscr: Subscription;
  tabData: TabData[] = [];
  private ngUnsubscribe = new Subject();


  constructor(private dcService: DatacenterService,
    private spinnerService: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: DcCrudService) {
    this.route.paramMap.subscribe((params: ParamMap) => this.dcId = params.get('dcId'));
    /**
     * This is to load private cloud when clicked on left panel
     * as there is no reload:true option in angular
     */
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unitycloud/datacenter' || event.url === '/unitycloud/datacenter/' + this.dcId) {
          this.route.data.subscribe((data: { tabItems: DataCenterTabs[] }) => {
            this.tabItems = data.tabItems;
            if (this.tabItems.length) {
              if (this.dcId === null) {
                this.router.navigate([this.tabItems[0].url, 'cabinets']);
              } else {
                this.router.navigate(['/unitycloud/datacenter/', this.dcId, 'cabinets']);
              }
            }
          });
        } else {
          this.tabData = [];
          this.route.data.subscribe((data: { tabItems: DataCenterTabs[] }) => {
            this.tabItems = data.tabItems;
            this.tabData = tabData;
          });
        }
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.subscr.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  goTo(tab: TabData) {
    this.router.navigate(['/unitycloud/datacenter/', this.dcId, tab.url]);
  }

  isActive(tab: TabData) {
    if (this.router.url.match('/unitycloud/datacenter/' + this.dcId + '/' + tab.url)) {
      return 'active text-success';
    }
  }

  onCrud(event: { type: CRUDActionTypes, dcId?: string }) {
    if (event.type == CRUDActionTypes.DELETE) {
      this.router.navigate(['/unitycloud/datacenter/']);
    } else {
      if (event.type == CRUDActionTypes.ADD) {
        this.router.navigate(['/unitycloud/datacenter/', event.dcId]);
      } else {
        this.reloadDatacenter();
      }
    }
  }

  addDatacenter() {
    this.crudSvc.addOrEditDataCenter(null);
  }

  editDatacenter() {
    this.crudSvc.addOrEditDataCenter(this.dcId);
  }

  deleteDatacenter() {
    this.crudSvc.deleteDataCenter(this.dcId);
  }

  reloadDatacenter() {
    this.dcService.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tabItems = res
    });
  }
}

const tabData: TabData[] = [
  {
    name: 'Cabinets',
    url: 'cabinets',
    icon: 'fa-cube'
  },
  {
    name: 'PDUs',
    url: 'pdus',
    icon: 'fa-plug'
  },
  {
    name: 'Private Cloud',
    url: 'pccloud',
    icon: 'fa-cloud'
  }
];