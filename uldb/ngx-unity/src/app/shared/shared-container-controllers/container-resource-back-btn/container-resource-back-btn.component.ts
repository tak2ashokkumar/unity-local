import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Small Back button rendered inside each resource table header (after the refresh button).
// It walks up the route tree to the controller shell route (the one carrying :controllerId),
// so it navigates back to the account/controller list exactly like the shell used to - and it
// hides itself in the account-less global Devices view (no controllerId ancestor).
@Component({
  selector: 'container-resource-back-btn',
  template: `<button *ngIf="scoped" class="btn btn-pill btn-warning btn-sm ml-1" tooltip="Back" container="body"
    (click)="goBack()"><i class="fa fa-arrow-left"></i></button>`
})
export class ContainerResourceBackBtnComponent implements OnInit {
  scoped = false;
  private shellRoute: ActivatedRoute;
  private backSteps = 2;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    let r: ActivatedRoute = this.route.parent;
    while (r) {
      if (r.snapshot.paramMap.get('controllerId')) {
        this.shellRoute = r;
        break;
      }
      r = r.parent;
    }
    if (this.shellRoute) {
      this.scoped = true;
      this.backSteps = this.shellRoute.snapshot.data && this.shellRoute.snapshot.data.backSteps ? this.shellRoute.snapshot.data.backSteps : 2;
    }
  }

  goBack() {
    this.router.navigate(['../'.repeat(this.backSteps)], { relativeTo: this.shellRoute });
  }
}
