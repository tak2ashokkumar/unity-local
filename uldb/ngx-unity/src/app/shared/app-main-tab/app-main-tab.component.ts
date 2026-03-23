import { Component, ComponentFactoryResolver, ContentChild, Input, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabData } from 'src/app/shared/tabdata';
import { AppMainTabService } from './app-main-tab.service';
import { BaseIconComponent } from './base-icon.component';
import { IconDirective } from './icon-host.directive';

@Component({
  selector: 'app-main-tab',
  templateUrl: './app-main-tab.component.html',
  styleUrls: ['./app-main-tab.component.scss']
})
export class AppMainTabComponent implements OnInit, OnDestroy {

  @Input() tabItems: Array<TabData>;
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;
  @ViewChild(IconDirective, { static: true }) iconHost: IconDirective;
  @Input() removeBg?: Boolean = false;
  private ngUnsubscribe = new Subject();

  constructor(private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appMainTabService: AppMainTabService) { }

  ngOnInit() {
    this.appMainTabService.tabToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if(!this.removeBg){
        this.loadComponent();
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  isActive(url: string) {
    if (this.router.url.match(url)) {
      return 'active';
    }
  }

  goTo(tab: TabData) {
    if (!this.router.url.match(tab.url)) {
      if (tab.data) {
        if (tab.data.queryParams) {
          this.router.navigate([tab.url], { queryParams: tab.data.queryParams });
        } else {
          this.router.navigate([tab.url]);
        }
      } else {
        this.router.navigate([tab.url]);
      }
    }
  }

  loadComponent() {
    let iconItem = this.appMainTabService.iconItem;
    let viewContainerRef = this.iconHost.viewContainerRef;
    viewContainerRef.clear();
    if (iconItem) {
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(iconItem.component);
      let componentRef = viewContainerRef.createComponent(componentFactory);
      (<BaseIconComponent>componentRef.instance).data = iconItem.data;
    }
  }
}