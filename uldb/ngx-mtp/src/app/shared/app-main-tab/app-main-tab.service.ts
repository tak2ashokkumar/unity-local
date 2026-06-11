import { Injectable, Type } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppMainTabService {
  iconItem: IconItem = null;
  private tabSource = new Subject<Type<any>>();
  tabToggled$: Observable<Type<any>> = this.tabSource.asObservable();
  constructor() { }

  addIconItem(component: Type<any>, data?: any) {
    this.iconItem = new IconItem(component, data ? data : null);
    this.tabSource.next(component);
  }

  removeIconItem() {
    this.iconItem = null;
    this.tabSource.next(null);
  }
}

export class IconItem {
  constructor(public component: Type<any>, public data: any) { }
}