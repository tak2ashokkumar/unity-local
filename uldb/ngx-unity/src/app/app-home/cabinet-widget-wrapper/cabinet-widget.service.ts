import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CO2_EMISSION_VALUE_BY_DEVICE_TYPE, GET_CABIINET_WIDGET_METADATA, GET_CABINET_WIDGET_DATA, SYNC_CABINET_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { CabinetWidgetMetaData, DatacenterWidgetDCCo2EmissionData } from './cabinet-widget-metadata.type';
import { CabinetWidgetData, CabinetWidgetDatacenter, CabinetWidgetPDUData } from './cabinet-widget.type';

@Injectable()
export class CabinetWidgetService {

  constructor(private http: HttpClient,
    private appService: AppLevelService) { }

  getCabinetWidgetMetaData(): Observable<CabinetWidgetMetaData[]> {
    // return of(widgetMetadata);
    return this.http.get<CabinetWidgetMetaData[]>(GET_CABIINET_WIDGET_METADATA());
  }

  getCabinetWidgetData(): Observable<CabinetWidgetDatacenter[]> {
    // return of([]).pipe(delay(3000));
    return this.http.get<CabinetWidgetDatacenter[]>(GET_CABINET_WIDGET_DATA());
  }

  syncCabinetWidgetData(): Observable<CabinetWidgetDatacenter[]> {
    // return of(widgetdata).pipe(delay(3000));
    return this.http.get<CeleryTask>(SYNC_CABINET_WIDGET_DATA())
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 100)
        .pipe(map(res => <CabinetWidgetDatacenter[]>res.result.data), take(1))),
        take(1));
  }

  getEmptyCabinets(metadata: CabinetWidgetMetaData[]): CabinetWidgetDatacenterViewData[] {
    let datacenters: CabinetWidgetDatacenterViewData[] = [];
    metadata.map(datacenter => {
      if (datacenter.cabinets != 0) {
        let obj: CabinetWidgetDatacenterViewData = new CabinetWidgetDatacenterViewData();
        obj.datacenter_name = datacenter.datacenter_name;
        obj.datacenter_uuid = datacenter.datacenter_uuid;
        let emptyCabinet = new CabinetWidgetData();
        emptyCabinet.pdus = Array(4).fill(new CabinetWidgetPDUData());
        Array(Math.ceil((datacenter.cabinets / 4))).fill(null).map((n, i) => {
          let data: CardData = new CardData();
          data.cardIndex = i;
          for (let j = 0; j < 4; j++) {
            if (((i * 4) + j) < datacenter.cabinets) {
              data.cabinets.push(emptyCabinet);
            }
          }
          obj.cardData.push(data);
        });
        datacenters.push(obj);
      }
    });
    return datacenters;
  }

  getCabinetPDUViewData(cabinet: CabinetWidgetData) {
    const pduCount = cabinet.pdus.length;
    if (pduCount < 4) {
      Array(4 - pduCount).fill(new CabinetWidgetPDUData()).map(pdu => cabinet.pdus.push(pdu));
    }
    cabinet.pdus.map(pdu => {
      pdu.color = pdu.status === 2 ? 'text-muted' : pdu.status === 0 ? 'text-danger' : 'text-success';
      pdu.name = pdu.status === 2 ? 'Not configured' : pdu.name;
    });
    return cabinet;
  }

  convertToViewData(data: CabinetWidgetDatacenter[]): CabinetWidgetDatacenterViewData[] {
    let viewData: CabinetWidgetDatacenterViewData[] = [];
    data.map(datacenter => {
      if (datacenter.cabinets.length) {
        let obj: CabinetWidgetDatacenterViewData = new CabinetWidgetDatacenterViewData();
        obj.datacenter_name = datacenter.datacenter_name;
        obj.datacenter_uuid = datacenter.datacenter_uuid;
        obj.co2EmissionValue = `${Number(datacenter.co2_run_rate).toFixed(2)} ton CO${'2'.sub()} (Per Annum)`;
        obj.datacenter_url = `/unitycloud/datacenter/${datacenter.datacenter_uuid}/cabinets`;
        let dcTotalPower = 0;
        Array(Math.ceil((datacenter.cabinets.length / 4))).fill(null).map((n, i) => {
          let data: CardData = new CardData();
          data.cardIndex = i;
          for (let j = 0; j < 4; j++) {
            const cabinetIndex = ((i * 4) + j);
            if (cabinetIndex < datacenter.cabinets.length) {
              datacenter.cabinets[cabinetIndex].cabinet_url = `${obj.datacenter_url}/${datacenter.cabinets[cabinetIndex].cabinet_uuid}/view`;
              data.cabinets.push(this.getCabinetPDUViewData(datacenter.cabinets[cabinetIndex]));
              dcTotalPower += datacenter.cabinets[cabinetIndex].total_power;
            }
          }
          obj.dcTotalPower = dcTotalPower.toFixed(2)
          obj.cardData.push(data);
        });
        viewData.push(obj);
      }
    });
    return viewData;
  }
}

export class CabinetWidgetDatacenterViewData {
  datacenter_uuid: string = '';
  datacenter_name: string = '';
  datacenter_url: string = '';
  cardData: CardData[] = [];
  co2EmissionValue: string;
  dcTotalPower: string;
  constructor() { }
}

class CardData {
  cardIndex: number;
  cabinets: CabinetWidgetData[] = [];
  constructor() { }
}

const widgetdata = [
  {
    "datacenter_uuid": "a10e2b2c-f3bc-46c8-a325-6046da8f45c7",
    "cabinets": [
      {
        "alerts": 0,
        "capacity": 67,
        "down_count": 0,
        "total_power": 0,
        "pdus": [],
        "occupied": 23,
        "max_temperature": 0,
        "cabinet_name": "1c1",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 10,
        "down_count": 0,
        "total_power": 0,
        "pdus": [],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "c2",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 70,
        "down_count": 0,
        "total_power": 0,
        "pdus": [],
        "occupied": 51,
        "max_temperature": 0,
        "cabinet_name": "cab123",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 20,
        "down_count": 0,
        "total_power": 0,
        "pdus": [],
        "occupied": 11,
        "max_temperature": 0,
        "cabinet_name": "defuse",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0.9,
        "pdus": [
          {
            "status": 1,
            "name": "pdua-1003.sf10"
          },
          {
            "status": 2,
            "name": "pdu-st"
          },
          {
            "status": 2,
            "name": "test"
          }
        ],
        "occupied": 11,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-10.05",
        "up_count": 2
      }
    ],
    "datacenter_name": "Aerys SF10 ColoCloud"
  },
  {
    "datacenter_uuid": "af8345e6-6569-4fb6-8a1b-732e777fe7d2",
    "cabinets": [
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0.2,
        "pdus": [
          {
            "status": 1,
            "name": "pdua-103.sf8"
          }
        ],
        "occupied": 1,
        "max_temperature": 0,
        "cabinet_name": "sf8-test",
        "up_count": 1
      }
    ],
    "datacenter_name": "Aerys LA1 ColoCloud"
  },
  {
    "datacenter_uuid": "55f82b2b-ba61-483e-bf95-6cc0d219fa73",
    "cabinets": [
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 1,
        "pdus": [
          {
            "status": 1,
            "name": "pdub-103.sf8"
          }
        ],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF8-CAB-01.03",
        "up_count": 1
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 1,
        "total_power": 0,
        "pdus": [
          {
            "status": 0,
            "name": "pdua-104.sf8"
          },
          {
            "status": 2,
            "name": "pdub-104.sf8"
          }
        ],
        "occupied": 2,
        "max_temperature": 0,
        "cabinet_name": "SF8-CAB-01.04",
        "up_count": 1
      }
    ],
    "datacenter_name": "Aerys SF8 ColoCloud"
  },
  {
    "datacenter_uuid": "7f725636-f4aa-451d-9fa1-063a77230a55",
    "cabinets": [
      {
        "alerts": 0,
        "capacity": 22,
        "down_count": 0,
        "total_power": 0,
        "pdus": [],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "cab013",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 44,
        "down_count": 0,
        "total_power": 0,
        "pdus": [],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "test123",
        "up_count": 0
      }
    ],
    "datacenter_name": "SF9qwasdsfscdfsfsdfsdff33"
  },
  {
    "datacenter_uuid": "67d82202-455b-48dc-a8f5-cdd1fa32c3ac",
    "cabinets": [
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0,
        "pdus": [
          {
            "status": 2,
            "name": "pdua-906.sf10"
          },
          {
            "status": 2,
            "name": "pdub-906.sf10"
          }
        ],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-9.06",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0,
        "pdus": [
          {
            "status": 2,
            "name": "pdua-907.sf10"
          },
          {
            "status": 2,
            "name": "pdub-907.sf10"
          }
        ],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-9.07",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0,
        "pdus": [
          {
            "status": 2,
            "name": "pdua-908.sf10"
          },
          {
            "status": 2,
            "name": "pdub-908.sf10"
          }
        ],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-9.08",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0,
        "pdus": [
          {
            "status": 2,
            "name": "pdua-909.sf10"
          },
          {
            "status": 2,
            "name": "pdub-909.sf10"
          }
        ],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-9.09",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0,
        "pdus": [
          {
            "status": 2,
            "name": "pdua-910.sf10"
          },
          {
            "status": 2,
            "name": "pdub-910.sf10"
          }
        ],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-9.10",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0,
        "pdus": [],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-9.11",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0,
        "pdus": [],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-9.12",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0,
        "pdus": [
          {
            "status": 2,
            "name": "pdua-913.sf10"
          },
          {
            "status": 2,
            "name": "pdub-913.sf10"
          }
        ],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-9.13",
        "up_count": 0
      },
      {
        "alerts": 0,
        "capacity": 42,
        "down_count": 0,
        "total_power": 0,
        "pdus": [
          {
            "status": 2,
            "name": "pdua-914.sf10"
          },
          {
            "status": 2,
            "name": "pdub-914.sf10"
          }
        ],
        "occupied": 0,
        "max_temperature": 0,
        "cabinet_name": "SF10-CAB-9.14",
        "up_count": 0
      }
    ],
    "datacenter_name": "Test - 9 Cabs"
  }
];

const widgetMetadata: CabinetWidgetMetaData[] = [
  {
    "datacenter_uuid": "a10e2b2c-f3bc-46c8-a325-6046da8f45c7",
    "cabinets": 5,
    "datacenter_name": "Aerys SF10 ColoCloud"
  },
  {
    "datacenter_uuid": "af8345e6-6569-4fb6-8a1b-732e777fe7d2",
    "cabinets": 4,
    "datacenter_name": "Aerys LA1 ColoCloud"
  },
  {
    "datacenter_uuid": "55f82b2b-ba61-483e-bf95-6cc0d219fa73",
    "cabinets": 2,
    "datacenter_name": "Aerys SF8 ColoCloud"
  },
  {
    "datacenter_uuid": "7f725636-f4aa-451d-9fa1-063a77230a55",
    "cabinets": 2,
    "datacenter_name": "SF9qwasdsfscdfsfsdfsdff33"
  },
  {
    "datacenter_uuid": "67d82202-455b-48dc-a8f5-cdd1fa32c3ac",
    "cabinets": 9,
    "datacenter_name": "Test - 9 Cabs"
  }
]