import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AppBreadcrumbService } from '../app-breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './app-breadcrumb.component.html',
  styleUrls: ['./app-breadcrumb.component.scss']
})
export class AppBreadcrumbComponent implements OnInit, OnDestroy {

  @Input() fixed: boolean;
  private subscr: Subscription;

  public breadcrumbs = [];

  constructor(public service: AppBreadcrumbService) { }

  public ngOnInit(): void {
    this.subscr = this.service.breadcrumbs.subscribe((param) => {
      this.breadcrumbs = param;
    });
  }

  ngOnDestroy() {
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
  }
}
