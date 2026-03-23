import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabData } from 'src/app/shared/tabdata';
import { AimlRulesService } from './aiml-rules.service';

@Component({
  selector: 'aiml-rules',
  templateUrl: './aiml-rules.component.html',
  styleUrls: ['./aiml-rules.component.scss'],
  providers: [AimlRulesService]
})
export class AimlRulesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  crudRoute: string = '';
  subscr: Subscription;
  tabItems: TabData[] = tabItems;
  // sourceTabItems: TabData[] = sourceTabItems;

  constructor(private svc: AimlRulesService,
    private router: Router,
    private route: ActivatedRoute,) {
    this.router.events.subscribe(event => {
      this.subscr = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          if (event.url === '/services/aiml/rules') {
            this.router.navigate([this.tabItems[0].url], { relativeTo: this.route });
          }
        }
      });
      if (event instanceof NavigationEnd) {
        this.crudRoute = `${event.url}crud`;
      }
    });
  }

  ngOnInit() {
    this.getEventSources();
  }

  ngOnDestroy(): void {
    this.subscr.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getEventSources() {
    //   this.svc.getEventSources().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    //     let sTabs = [];
    //     for (let i = 0; i < res.length; i++) {
    //       let k = this.sourceTabItems.find(st => st.name == res[i].source.name);
    //       if (k) {
    //         k.data = { queryParams: { source: res[i].source.id } };
    //         sTabs.push(k);
    //       }
    //     }
    //     this.tabItems = this.tabItems.concat(sTabs);
    //   })
  }

  goBack() {
    this.router.navigate(['/services/aiml', 'summary']);
  }
}

export const tabItems: TabData[] = [
  {
    name: 'First Response Policies',
    url: '/services/aiml/rules/firstresponsepolicies',
  },
  {
    name: 'Correlation Rules',
    url: '/services/aiml/rules/correlationrules',
  },
  {
    name: 'Event Types',
    url: '/services/aiml/rules/event-types',
  },
  {
    name: 'Event Categories',
    url: '/services/aiml/rules/event-categories',
  },
];

// export const sourceTabItems: TabData[] = [
//   {
//     name: 'Nagios',
//     url: '/services/aiml/rules/nagios',
//   },
//   {
//     name: 'Azure',
//     url: '/services/aiml/rules/azure',
//   },
//   {
//     name: 'Zabbix',
//     url: '/services/aiml/rules/zabbix',
//   },
//   {
//     name: 'Gcp',
//     url: '/services/aiml/rules/gcp',
//   },
//   {
//     name: 'Aws',
//     url: '/services/aiml/rules/aws',
//   },
//   {
//     name: 'Oci',
//     url: '/services/aiml/rules/oci',
//   },
//   {
//     name: 'Opsramp',
//     url: '/services/aiml/rules/opsramp',
//   },
//   {
//     name: 'AppDynamics',
//     url: '/services/aiml/rules/appdynamics',
//   },
//   {
//     name: 'LogicMonitor',
//     url: '/services/aiml/rules/logicmonitor',
//   },
//   {
//     name: 'Dynatrace',
//     url: '/services/aiml/rules/dynatrace',
//   },
//   {
//     name: 'NewRelic',
//     url: '/services/aiml/rules/new-relic',
//   },
//   // {
//   //   name: 'SolarWinds',
//   //   url: '/services/aiml/rules/solarwinds',
//   // }
// ];
