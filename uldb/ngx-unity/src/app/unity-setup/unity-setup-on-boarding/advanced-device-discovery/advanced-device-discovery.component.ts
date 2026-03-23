import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AdvancedDeviceDiscoveryService, WIZARD_STEPS } from './advanced-device-discovery.service';
import { WizardStepType } from './advanced-device-discovery.type';
import { Subscription } from 'rxjs';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { clone as _clone } from 'lodash-es';
import * as cloneDeep from 'lodash';

@Component({
  selector: 'advanced-device-discovery',
  templateUrl: './advanced-device-discovery.component.html',
  styleUrls: ['./advanced-device-discovery.component.scss']
})
export class AdvancedDeviceDiscoveryComponent implements OnInit, OnDestroy {
  steps: WizardStepType[] = [];
  subscr: Subscription;
  discoveryId: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService,
    private devDisSvc: AdvancedDeviceDiscoveryService) {
    let steps = _clone(WIZARD_STEPS);
    steps.forEach(val => this.steps.push(Object.assign({}, val)));
    this.steps = Object.assign([], WIZARD_STEPS);
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/setup/devices/advanced-discovery') {
          this.router.navigate([this.steps[0].url], { relativeTo: this.route });
        }
        this.setActive(event.url);
      }
    });
  }

  ngOnInit() {
    this.discoveryId = this.devDisSvc.getSelectedDiscoveryId();
  }

  ngOnDestroy() {
    this.storage.removeByKey('discoveryId', StorageType.SESSIONSTORAGE);
    this.subscr.unsubscribe();
  }

  setActive(url: string) {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (url.match(`/setup/devices/advanced-discovery/${step.url}`)) {
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
        this.devDisSvc.advNextPrev({ nextUrl: next, prevUrl: prev });
      } else {
        step.active = false;
      }
    }
  }

  isActive(step: WizardStepType) {
    this.discoveryId = this.devDisSvc.getSelectedDiscoveryId();
    if (step.disabled && !this.discoveryId) {
      return 'disabled';
    } else {
      if (step.active) {
        return 'active';
      }
    }
  }

  goTo(step: WizardStepType) {
    this.discoveryId = this.devDisSvc.getSelectedDiscoveryId();
    if (step.disabled && !this.discoveryId) {
      return;
    }

    this.router.navigate([step.url], { relativeTo: this.route });
  }

}
