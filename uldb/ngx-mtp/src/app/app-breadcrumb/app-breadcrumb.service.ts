import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs/index';
import { filter } from 'rxjs/operators';

@Injectable()
export class AppBreadcrumbService {

  breadcrumbs: Observable<Array<Object>>;

  private _breadcrumbs: BehaviorSubject<Array<Object>>;

  constructor(private router: Router, private route: ActivatedRoute) {

    this._breadcrumbs = new BehaviorSubject<Object[]>(new Array<Object>());

    this.breadcrumbs = this._breadcrumbs.asObservable();

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event) => {
      const breadcrumbs = [];
      let currentRoute = this.route.root;
      let urls: string[] = [];
      do {
        const childrenRoutes = currentRoute.children;
        currentRoute = null;
        // tslint:disable-next-line:no-shadowed-variable
        childrenRoutes.forEach(route => {
          if (route.outlet === 'primary') {
            const routeSnapshot = route.snapshot;
            routeSnapshot.url.map(segment => {
              urls.push(segment.path);
            });
            let routeData = route.snapshot.data;
            if (routeData.hasOwnProperty('breadcrumb') && routeData['breadcrumb'] && routeData.breadcrumb.title) {
              const stepbackCount = routeData.breadcrumb.stepbackCount;
              breadcrumbs.push({
                label: routeData.breadcrumb.title,
                url: this.getUrl(urls, stepbackCount ? stepbackCount : 0)
              });
            }
            currentRoute = route;
          }
        });
      } while (currentRoute);

      this._breadcrumbs.next(Object.assign([], breadcrumbs));
      return breadcrumbs;
    });
  }

  getUrl(urls: string[], stepbackCount: number) {
    let path = '';
    for (let i = 0; i < urls.length - stepbackCount; i++) {
      const url = urls[i];
      path += '/' + url;
    }
    path += '/';
    return path;
  }
}
