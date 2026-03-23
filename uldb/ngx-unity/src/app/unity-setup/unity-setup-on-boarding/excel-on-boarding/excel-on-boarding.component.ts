import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { ExcelOnBoardingService, WIZARD_STEPS } from './excel-on-boarding.service';
import { OnBoardingWizardStepType } from './excel-on-boarding.type';

@Component({
  selector: 'excel-on-boarding',
  templateUrl: './excel-on-boarding.component.html',
  styleUrls: ['./excel-on-boarding.component.scss']
})
export class ExcelOnBoardingComponent implements OnInit, OnDestroy {
  steps: OnBoardingWizardStepType[] = [];
  subscr: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private onbSvc: ExcelOnBoardingService,
    private storage: StorageService) {
    this.steps = WIZARD_STEPS;
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/setup/devices/onboarding') {
          this.router.navigate([this.steps[0].url], { relativeTo: this.route });
        }
        this.setActive(event.url);
      }
    });
  }

  ngOnInit() {
    // this.storage.put('fileId', [], StorageType.SESSIONSTORAGE);
  }

  ngOnDestroy() {
    this.storage.removeByKey('fileId', StorageType.SESSIONSTORAGE);
    this.subscr.unsubscribe();
  }

  setActive(url: string) {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (url.match(`/setup/devices/onboarding/${step.url}`)) {
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
        this.onbSvc.setNextPrev({ nextUrl: next, prevUrl: prev });
      } else {
        step.active = false;
      }
    }
  }

  isActive(step: OnBoardingWizardStepType) {
    if (step.active) {
      return 'active';
    }
  }

  goTo(step: OnBoardingWizardStepType) {
    this.router.navigate([step.url], { relativeTo: this.route });
  }
}