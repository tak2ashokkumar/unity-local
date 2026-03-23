import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { UnityModules, UnityPermissionSet } from 'src/app/app.component';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AdvancedDiscoveryConnectivityCrudService } from './advanced-discovery-connectivity/advanced-discovery-connectivity-crud/advanced-discovery-connectivity-crud.service';
import { OnboardingTabStepType, UnitySetupOnBoardingService } from './unity-setup-on-boarding.service';

@Component({
  selector: 'unity-setup-on-boarding',
  templateUrl: './unity-setup-on-boarding.component.html',
  styleUrls: ['./unity-setup-on-boarding.component.scss'],
  providers: [UnitySetupOnBoardingService]
})
export class UnitySetupOnBoardingComponent implements OnInit, OnDestroy {
  public steps: OnboardingTabStepType[] = [];
  currentUrl: string;
  subscr: Subscription;
  collectorsCount: number = 0;
  private ngUnsubscribe = new Subject();
  @ViewChild('confirmAdd') confirmAdd: ElementRef;
  confirmAddModalRef: BsModalRef;

  unityCollectorPermissionSet: UnityPermissionSet;
  onboardingPermissionSet: UnityPermissionSet;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private agentSvc: AdvancedDiscoveryConnectivityCrudService,
    private notification: AppNotificationService,
    private onbSvc: UnitySetupOnBoardingService,
    private modalService: BsModalService,
    private userInfo: UserInfoService) {
    this.unityCollectorPermissionSet = new UnityPermissionSet(UnityModules.UNITY_COLLECTOR);
    this.onboardingPermissionSet = new UnityPermissionSet(UnityModules.ONBOARDING);
    this.route.data.pipe(take(1)).subscribe((data: { collectors: PaginatedResult<any> }) => {
      this.collectorsCount = data.collectors.count;
      this.setDiscoveryTab();
    });
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setDiscoveryTab();
        if (event.url == '/setup/devices') {
          if (this.steps.length) {
            this.router.navigate([this.steps[0].url], { relativeTo: this.route });
          }
        }
        this.setActive(event.url);
      }
    });
    this.agentSvc.crudAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getCollectors();
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscr.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setDiscoveryTab() {
    if (this.userInfo.advancedDiscovery) {
      let temp: OnboardingTabStepType = {
        stepName: 'Discovery',
        icon: 'fas fa-search-plus',
        url: 'advanced-discovery',
        active: false,
        disabled: false,
        className: 'btn-secondary',
        module: UnityModules.ONBOARDING,
      };
      this.steps = [steps[0], temp, steps[1]];
    } else {
      let temp: OnboardingTabStepType = {
        stepName: 'Discovery',
        icon: 'fas fa-search-plus',
        url: 'discovery',
        active: false,
        disabled: false,
        className: 'btn-secondary',
        module: UnityModules.ONBOARDING,
      };
      this.steps = [steps[0], temp, steps[1]];
    }
    if (!this.collectorsCount) {
      this.steps[1].disabled = true;
    } else {
      this.steps[0].className = 'btn-success';
    }
    this.setTabItems();
  }

  setTabItems() {
    let tabItems: OnboardingTabStepType[] = [];
    this.steps.forEach(td => {
      if (td.module) {
        if (this.userInfo.hasViewAccess(td.module)) {
          tabItems.push(td);
        }
      } else {
        tabItems.push(td);
      }
    })
    this.steps = tabItems;
  }

  setActive(url: string) {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (url.match(`/setup/devices/${step.url}`)) {
        step.active = true;
        step.className = 'btn-primary';
      } else {
        step.active = false;
        step.className = 'btn-secondary';
        if (step.stepName == 'Connectivity' && this.collectorsCount) {
          step.className = 'btn-success';
        }
      }
    }
  }

  goTo(step: OnboardingTabStepType) {
    if (step.disabled) {
      if (step.stepName == 'Discovery') {
        this.confirmAddModalRef = this.modalService.show(this.confirmAdd, Object.assign({}, { class: '', backdrop: true, keyboard: true, ignoreBackdropClick: true }));
      }
      return;
    }
    this.router.navigate([step.url], { relativeTo: this.route });
  }

  getCollectors() {
    this.onbSvc.getCollectorsCount().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectorsCount = res;
      this.setDiscoveryTab();
      this.setActive(this.router.url);
    }, err => {
      this.notification.error(new Notification('Error while fetching collectors list'))
    })
  }

  confirmAddCollector() {
    this.confirmAddModalRef.hide();
    this.agentSvc.addOrEdit(null);
  }
}


const steps: OnboardingTabStepType[] = [
  {
    stepName: 'Connectivity',
    icon: 'fas fa-link',
    url: 'connectivity',
    active: false,
    className: 'btn-secondary',
    module: UnityModules.UNITY_COLLECTOR
  },
  {
    stepName: 'Import Inventory',
    icon: 'fas fa-file-upload',
    url: 'onboarding',
    active: false,
    className: 'btn-secondary',
    module: UnityModules.ONBOARDING
  }
];