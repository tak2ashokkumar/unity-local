import { Routes } from '@angular/router';
import { ExcelOnBoardFilesComponent } from './excel-on-board-files/excel-on-board-files.component';
import { ExcelOnBoardingInventoryComponent } from './excel-on-board-inventory/excel-on-boarding-inventory.component';
import { ExcelOnBoardingBmsComponent } from './excel-on-boarding-bms/excel-on-boarding-bms.component';
import { ExcelOnBoardingCabinetsComponent } from './excel-on-boarding-cabinets/excel-on-boarding-cabinets.component';
import { ExcelOnBoardingDataCentersComponent } from './excel-on-boarding-data-centers/excel-on-boarding-data-centers.component';
import { ExcelOnBoardingFirewallsComponent } from './excel-on-boarding-firewalls/excel-on-boarding-firewalls.component';
import { ExcelOnBoardingHypervisorsComponent } from './excel-on-boarding-hypervisors/excel-on-boarding-hypervisors.component';
import { ExcelOnBoardingLoadbalancersComponent } from './excel-on-boarding-loadbalancers/excel-on-boarding-loadbalancers.component';
import { ExcelOnBoardingMacComponent } from './excel-on-boarding-mac/excel-on-boarding-mac.component';
import { ExcelOnBoardingMobilesComponent } from './excel-on-boarding-mobiles/excel-on-boarding-mobiles.component';
import { ExcelOnBoardingPduComponent } from './excel-on-boarding-pdu/excel-on-boarding-pdu.component';
import { ExcelOnBoardingStorageComponent } from './excel-on-boarding-storage/excel-on-boarding-storage.component';
import { ExcelOnBoardingSummaryComponent } from './excel-on-boarding-summary/excel-on-boarding-summary.component';
import { ExcelOnBoardingSwitchesComponent } from './excel-on-boarding-switches/excel-on-boarding-switches.component';
import { ExcelOnBoardingComponent } from './excel-on-boarding.component';
import { ExcelOnBoardingDatabaseComponent } from './excel-on-boarding-database/excel-on-boarding-database.component';

export const EXCEL_ON_BOARDING_ROUTES: Routes = [
  {
    path: 'onboarding',
    component: ExcelOnBoardingComponent,
    data: {
      breadcrumb: {
        title: 'Import Inventory'
      }
    },
    children: [
      {
        path: 'files',
        component: ExcelOnBoardFilesComponent,
        data: {
          breadcrumb: {
            title: 'Files'
          }
        }
      },
      {
        path: 'inventory',
        component: ExcelOnBoardingInventoryComponent,
        data: {
          breadcrumb: {
            title: 'Inventory'
          }
        }
      },
      {
        path: 'datacenters',
        component: ExcelOnBoardingDataCentersComponent,
        data: {
          breadcrumb: {
            title: 'Datacenters'
          }
        }
      },
      {
        path: 'cabinets',
        component: ExcelOnBoardingCabinetsComponent,
        data: {
          breadcrumb: {
            title: 'Cabinets'
          }
        }
      },
      {
        path: 'firewalls',
        component: ExcelOnBoardingFirewallsComponent,
        data: {
          breadcrumb: {
            title: 'Firewalls'
          }
        }
      },
      {
        path: 'switches',
        component: ExcelOnBoardingSwitchesComponent,
        data: {
          breadcrumb: {
            title: 'Switches'
          }
        }
      },
      {
        path: 'pdus',
        component: ExcelOnBoardingPduComponent,
        data: {
          breadcrumb: {
            title: 'PDUs'
          }
        }
      },
      {
        path: 'bms',
        component: ExcelOnBoardingBmsComponent,
        data: {
          breadcrumb: {
            title: 'BMS'
          }
        }
      },
      {
        path: 'hypervisors',
        component: ExcelOnBoardingHypervisorsComponent,
        data: {
          breadcrumb: {
            title: 'Hypervisors'
          }
        }
      },
      {
        path: 'loadbalancers',
        component: ExcelOnBoardingLoadbalancersComponent,
        data: {
          breadcrumb: {
            title: 'Loadbalancers'
          }
        }
      },
      {
        path: 'mac',
        component: ExcelOnBoardingMacComponent,
        data: {
          breadcrumb: {
            title: 'MAC'
          }
        }
      },
      {
        path: 'storages',
        component: ExcelOnBoardingStorageComponent,
        data: {
          breadcrumb: {
            title: 'Storages'
          }
        }
      },
      {
        path: 'mobiles',
        component: ExcelOnBoardingMobilesComponent,
        data: {
          breadcrumb: {
            title: 'Mobiles'
          }
        }
      },
      {
        path: 'database',
        component: ExcelOnBoardingDatabaseComponent,
        data: {
          breadcrumb: {
            title: 'Database'
          }
        }
      },
      {
        path: 'summary',
        component: ExcelOnBoardingSummaryComponent,
        data: {
          breadcrumb: {
            title: 'Summary'
          }
        }
      }
    ]
  }
];
