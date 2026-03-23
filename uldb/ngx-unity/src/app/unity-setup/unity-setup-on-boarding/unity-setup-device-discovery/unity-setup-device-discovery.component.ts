import { Component, OnInit, OnDestroy } from '@angular/core';
import { UnitySetupDeviceDiscoveryService, WIZARD_STEPS } from './unity-setup-device-discovery.service';
import { WizardStepType } from './unity-setup-device-discovery.type';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'unity-setup-device-discovery',
  templateUrl: './unity-setup-device-discovery.component.html',
  styleUrls: ['./unity-setup-device-discovery.component.scss']
})
export class UnitySetupDeviceDiscoveryComponent implements OnInit, OnDestroy {
  steps: WizardStepType[] = [];
  subscr: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private devDisSvc: UnitySetupDeviceDiscoveryService) {
    this.steps = WIZARD_STEPS;
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/setup/devices/discovery') {
          this.router.navigate([this.steps[0].url], { relativeTo: this.route });
        }
        this.setActive(event.url);
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

  setActive(url: string) {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (url.match(`/setup/devices/discovery/${step.url}`)) {
        step.active = true;
        let next: string = null, prev: string = null;
        if (i == 0 && this.steps.length > 1) {
          next = this.steps[i + 1].url;
          prev = null;
        } else if ((i == this.steps.length - 1) && this.steps.length > 1) {
          next = null;
          prev = this.steps[i - 1].url;
        } else {
          next = this.steps[i + 1].url;
          prev = this.steps[i - 1].url;
        }
        this.devDisSvc.nextPrev({ nextUrl: next, prevUrl: prev });
      } else {
        step.active = false;
      }
    }
  }

  isActive(step: WizardStepType) {
    if (step.active) {
      return 'active';
    }
  }

  goTo(step: WizardStepType) {
    this.router.navigate([step.url], { relativeTo: this.route });
  }
}