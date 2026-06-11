import { Component, OnInit, Input, TemplateRef, ContentChild, Type, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { Router } from '@angular/router';
import { IconDirective } from './icon-host.directive';
import { BaseIconComponent } from './base-icon.component';
import { AppMainTabService } from './app-main-tab.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-main-tab',
  templateUrl: './app-main-tab.component.html',
  styleUrls: ['./app-main-tab.component.scss']
})
export class AppMainTabComponent implements OnInit, OnDestroy {

  @Input() tabItems: Array<TabData>;
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;
  @ViewChild(IconDirective, { static: true }) iconHost: IconDirective;
  private ngUnsubscribe = new Subject();


  constructor(private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appMainTabService: AppMainTabService) { }

  ngOnInit() {
    this.appMainTabService.tabToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.loadComponent();
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
      this.router.navigate([tab.url]);
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