import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { Subject, from, Subscription, forkJoin, pipe } from 'rxjs';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { DatacenterCabinetViewService } from './datacenter-cabinet-view.service';
import { DatacenterCabinetViewdataService } from './datacenter-cabinet-viewdata.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ObserviumGraphUtil } from 'src/app/shared/observium-graph-util/observium-graph-util.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { datacenterCabinetViewTypes, DatacenterCabinetViewData, DatacenterCabinetUnitDevice, DatacenterCabinetViewDevicePosition, DatacenterCabinetViewTypes, datacenterCabinetViewInfoTabData, DatacenterCabinetViewMonitoringGraph, DatacenterCabinetDeviceName, DatacenterCabinetViewPDUPositionType, DatacenterCabinetViewCommonImages } from './datacenter-cabinet-viewdata.type';
import { mergeMap, takeUntil, filter, map, tap } from 'rxjs/operators';
import { TooltipDirective } from 'ngx-bootstrap/tooltip/public_api';
import { DndDropEvent } from 'ngx-drag-drop';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TabData } from 'src/app/shared/tabdata';
import { environment } from 'src/environments/environment.prod';
import { DeviceGraphType } from 'src/app/shared/observium-graph-util/observium-graph.type';
import { CabinetDetailsResponse } from '../entities/cabinet-view-device.type';
import { cloneDeep as _clone } from 'lodash-es';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';


@Component({
  selector: 'datacenter-cabinet-view',
  templateUrl: './datacenter-cabinet-view.component.html',
  styleUrls: ['./datacenter-cabinet-view.component.scss'],
  providers: [DatacenterCabinetViewService, DatacenterCabinetViewdataService]
})
export class DatacenterCabinetViewComponent implements OnInit, OnDestroy {
  datacenterId: string;
  cabinetId: string;
  assetsUrl: string = environment.assetsUrl;
  private ngUnsubscribe = new Subject();
  private ngUnsubscribeMonitoringGraphs = new Subject();
  private monitoringGraphsSubscription: Subscription;

  cabinetViews: string[] = datacenterCabinetViewTypes;
  selectedCabinetView: string = datacenterCabinetViewTypes[0];
  cabinetViewTypes = DatacenterCabinetViewTypes;

  cabinetViewData: DatacenterCabinetViewData = new DatacenterCabinetViewData();
  dragSource: string;
  dragSourceIndex: number;
  dragTarget: string;
  dragTargetIndex: number;
  draggingDevice: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
  deviceHovered: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
  deviceClicked: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();

  verticalPDUSockets: number[] = [];
  horizontalPDUSockets: number[] = [];
  @ViewChildren("vLPDURef") vLPDURef: QueryList<TooltipDirective>;
  @ViewChildren("vRPDURef") vRPDURef: QueryList<TooltipDirective>;
  @ViewChildren("hDURef") hDURef: QueryList<TooltipDirective>;
  tabData: TabData[] = datacenterCabinetViewInfoTabData;
  selectedTab: TabData = this.tabData[0];

  showHeatMapLayer: boolean = false;
  heatMapForm = new FormGroup({
    heatMapEnable: new FormControl()
  });

  deviceGraphs: DeviceGraphType[] = [];
  zabbixDeviceGraphsForm: FormGroup;
  zabbixGraphListFormErrors: any;
  zabbixGraphListValidationMessages: any;
  isGraphsLoaded: boolean = false;
  reloading: boolean = false;
  termOpened: boolean;
  inProgress: boolean = false;

  mySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true,
  };

  constructor(private cabinetViewService: DatacenterCabinetViewService,
    private cabinetViewDataService: DatacenterCabinetViewdataService,
    private route: ActivatedRoute,
    private router: Router,
    private spinnerService: AppSpinnerService,
    private observiumUtil: ObserviumGraphUtil,
    private notification: AppNotificationService,
    private termService: FloatingTerminalService,
    private refreshService: DataRefreshBtnService,
    private utilService: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.datacenterId = params.get('dcId');
      this.cabinetId = params.get('cabinetId');
    })
    Array(24).fill(0).map((e, i) => this.verticalPDUSockets.push(i));
    Array(8).fill(0).map((e, i) => this.horizontalPDUSockets.push(i));
    this.termService.isOpenAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => this.termOpened = res);
    this.refreshService.inProgressToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => this.inProgress = res);
  }

  ngOnInit() {
    this.spinnerService.start('main');
    setTimeout(() => {
      this.getCabinetDetails();
      this.zabbixDeviceGraphsForm = this.cabinetViewService.buildZabbixGraphListForm();
      this.zabbixGraphListFormErrors = this.cabinetViewService.resetZabbixGraphListFormErrors();
      this.zabbixGraphListValidationMessages = this.cabinetViewService.zabbixGraphListValidationMessages;
    }, 0);
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.destroyMonitoringGraphs();
    if (!this.ngUnsubscribe.isStopped) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }

  filterBucketDevices = (device: DatacenterCabinetUnitDevice) => {
    return !device.isMACdevice;
  }

  destroyMonitoringGraphs() {
    this.spinnerService.stop('monitoring-loader');
    if (this.monitoringGraphsSubscription) {
      this.monitoringGraphsSubscription.unsubscribe();
    }
    this.ngUnsubscribeMonitoringGraphs.next();
    this.ngUnsubscribeMonitoringGraphs.complete();
  }

  getCabinetDetails() {
    this.route.data.subscribe((data: { cabinetData: CabinetDetailsResponse }) => {
      this.cabinetViewData = this.cabinetViewDataService.convertToViewData(data.cabinetData);
      this.getCarbonFootPrint();
      this.getPduStausData();
      this.getSocketConnectionToDevices();
      this.getPDUsMonitoringGraphs();
      this.getDevicesStausDataExceptPDUs();
      this.getPduSensorData();
      this.getDevicesSensorDataExceptPDUs();
      this.spinnerService.stop('main');
    });
  }

  getCarbonFootPrint() {
    this.cabinetViewService.getCarbonFootPrint(this.cabinetViewData.cabinetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.cabinetViewData.carbonFootPrint = `${Number.parseFloat(data).toFixed(2)} ton CO${'2'.sub()} (per annum)`;
    }, err => {
      this.cabinetViewData.carbonFootPrint = 'N/A';
    })
  }

  getPduStausData() {
    from(this.cabinetViewData.allDevices).pipe(filter(device => device.isPDU),
      mergeMap(pdu => this.cabinetViewService.getStatusData(pdu).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          let index = this.cabinetViewData.allDevices.map(data => data.uuid).indexOf(key);
          this.cabinetViewData.allDevices[index].status = this.cabinetViewDataService.convertStatusToViewData(res.get(key), this.cabinetViewData.allDevices[index].status);
          let device = this.cabinetViewData.allDevices[index];
          if (device.isCabinetDevice) {
            this.cabinetViewData.cabinetUnits[this.cabinetViewData.unitCapacity - Number(device.position)].status = device.status;
          } else if (device.isVerticalLeftPDU) {
            this.cabinetViewData.verticalLPDUs[device.position == 'C' ? 0 : 1].status = device.status;
          } else if (device.isVerticalRightPDU) {
            this.cabinetViewData.verticalRPDUs[device.position == 'B' ? 0 : 1].status = device.status;
          } else {
            this.cabinetViewData.bucketDevices[this.cabinetViewData.bucketDevices.map(data => data.uuid).indexOf(device.uuid)].status = device.status;
          }
        }
      )
  }

  getDevicesStausDataExceptPDUs() {
    from(this.cabinetViewData.allDevices).pipe(filter(device => !device.isPDU && device.isStatusExistsForDevice),
      mergeMap(device => this.cabinetViewService.getStatusData(device).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          let index = this.cabinetViewData.allDevices.map(data => data.uuid).indexOf(key);
          this.cabinetViewData.allDevices[index].status = this.cabinetViewDataService.convertStatusToViewData(res.get(key), this.cabinetViewData.allDevices[index].status);
          let device = this.cabinetViewData.allDevices[index];
          if (device.isCabinetDevice) {
            this.cabinetViewData.cabinetUnits[this.cabinetViewData.unitCapacity - Number(device.position)].status = device.status;
          } else {
            this.cabinetViewData.bucketDevices[this.cabinetViewData.bucketDevices.map(data => data.uuid).indexOf(device.uuid)].status = device.status;
          }
        }
      )
  }

  getPduSensorData() {
    from(this.cabinetViewData.allDevices).pipe(filter(device => device.isPDU),
      mergeMap(pdu => this.cabinetViewService.getSensorData(pdu).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          let index = this.cabinetViewData.allDevices.map(data => data.uuid).indexOf(key);
          this.cabinetViewData.allDevices[index].sensor = this.cabinetViewDataService.convertToSensorData(this.cabinetViewData.allDevices[index], res.get(key));
          let device = this.cabinetViewData.allDevices[index];
          if (device.isCabinetDevice) {
            this.cabinetViewData.cabinetUnits[this.cabinetViewData.unitCapacity - Number(device.position)].sensor = device.sensor;
          } else if (device.isVerticalLeftPDU) {
            this.cabinetViewData.verticalLPDUs[device.position == 'C' ? 0 : 1].sensor = device.sensor;
          } else if (device.isVerticalRightPDU) {
            this.cabinetViewData.verticalRPDUs[device.position == 'B' ? 0 : 1].sensor = device.sensor;
          } else {
            this.cabinetViewData.bucketDevices[this.cabinetViewData.bucketDevices.map(data => data.uuid).indexOf(device.uuid)].sensor = device.sensor;
          }
        }
      )
  }

  getDevicesSensorDataExceptPDUs() {
    from(this.cabinetViewData.allDevices).pipe(filter(device => !device.isPDU && device.isSensorExistsForDevice),
      mergeMap(pdu => this.cabinetViewService.getSensorData(pdu).pipe(takeUntil(this.ngUnsubscribe))))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          let index = this.cabinetViewData.allDevices.map(data => data.uuid).indexOf(key);
          this.cabinetViewData.allDevices[index].sensor = this.cabinetViewDataService.convertToSensorData(this.cabinetViewData.allDevices[index], res.get(key));
          let device = this.cabinetViewData.allDevices[index];
          if (device.isCabinetDevice) {
            this.cabinetViewData.cabinetUnits[this.cabinetViewData.unitCapacity - Number(device.position)].sensor = device.sensor;
          } else {
            this.cabinetViewData.bucketDevices[this.cabinetViewData.bucketDevices.map(data => data.uuid).indexOf(device.uuid)].sensor = device.sensor;
          }
        }
      )
  }

  getSocketConnectionToDevices() {
    from(this.cabinetViewData.allDevices).pipe(filter(device => device.isPDU),
      mergeMap(pdu => this.cabinetViewService.getSocketConnectionToDevices(pdu)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const socketValues = res.get(key);
          if (socketValues) {
            socketValues.map(socketConn => {
              let device = this.cabinetViewData.allDevices.find(device => device.uuid == socketConn.deviceUUId);
              if (device) {
                if (device.isCabinetDevice) {
                  this.cabinetViewData.cabinetUnits[this.cabinetViewData.unitCapacity - Number(device.position)].pduSockets.push(socketConn);
                } else {
                  this.cabinetViewData.bucketDevices[this.cabinetViewData.bucketDevices.map(data => data.uuid).indexOf(socketConn.deviceUUId)].pduSockets.push(socketConn);
                }
              }
            })
          }
        }, err => {
        }
      );
  }

  getPDUsMonitoringGraphs() {
    if (this.cabinetViewData.pduMonitoringTool == 'observium') {
      if (this.cabinetViewData.observiumConfiguredPDUs.length) {
        const Observables = this.cabinetViewData.observiumConfiguredPDUs.map(pdu => {
          pdu.graphs = [];
          return this.cabinetViewService.getMonitoringGraphs(pdu, 'device_current')
        });
        this.spinnerService.start('monitoring-loader');
        this.monitoringGraphsSubscription = forkJoin(Observables).subscribe(results => {
          results.map(res => {
            const key = res.keys().next().value;
            if (res.get(key)) {
              let index = this.cabinetViewData.allDevices.map(data => data.uuid).indexOf(key);

              let graphData: DatacenterCabinetViewMonitoringGraph = new DatacenterCabinetViewMonitoringGraph();
              graphData.name = 'Current';
              graphData.graph = res.get(key);
              graphData.observium = true;


              this.cabinetViewData.allDevices[index].graphs.push(graphData);
              let device = this.cabinetViewData.allDevices[index];
              if (device.isCabinetDevice) {
                this.cabinetViewData.cabinetUnits[this.cabinetViewData.unitCapacity - Number(device.position)].graphs = device.graphs;
              } else if (device.isVerticalLeftPDU) {
                this.cabinetViewData.verticalLPDUs[device.position == 'C' ? 0 : 1].graphs = device.graphs;
              } else if (device.isVerticalRightPDU) {
                this.cabinetViewData.verticalRPDUs[device.position == 'B' ? 0 : 1].graphs = device.graphs;
              } else {
                this.cabinetViewData.bucketDevices[this.cabinetViewData.bucketDevices.map(data => data.uuid).indexOf(device.uuid)].graphs = device.graphs;
              }
            }
          });
          this.spinnerService.stop('monitoring-loader');
        })
      } else {
        return;
      }
    } else if (this.cabinetViewData.pduMonitoringTool == 'zabbix') {
      if (this.cabinetViewData.zabbixConfiguredPDUs.length) {
        const Observables = this.cabinetViewData.zabbixConfiguredPDUs.map(pdu => {
          pdu.graphs = [];
          return this.cabinetViewService.getZabbixDeviceGraphData(pdu);
        });
        this.spinnerService.start('monitoring-loader');
        this.monitoringGraphsSubscription = forkJoin(Observables).subscribe(resObs => {
          resObs.map(resOb => {
            forkJoin(resOb).subscribe(results => {
              results.map(res => {
                const key = res.keys().next().value;
                let value = res.get(key);
                if (value) {
                  let index = this.cabinetViewData.allDevices.map(data => data.uuid).indexOf(key);

                  let graphData: DatacenterCabinetViewMonitoringGraph = new DatacenterCabinetViewMonitoringGraph();
                  graphData.name = key;
                  graphData.graph = value;
                  graphData.zabbix = true;

                  this.cabinetViewData.allDevices[index].graphs.push(graphData);
                  let device = this.cabinetViewData.allDevices[index];
                  if (device.isCabinetDevice) {
                    this.cabinetViewData.cabinetUnits[this.cabinetViewData.unitCapacity - Number(device.position)].graphs = device.graphs;
                  } else if (device.isVerticalLeftPDU) {
                    this.cabinetViewData.verticalLPDUs[device.position == 'C' ? 0 : 1].graphs = device.graphs;
                  } else if (device.isVerticalRightPDU) {
                    this.cabinetViewData.verticalRPDUs[device.position == 'B' ? 0 : 1].graphs = device.graphs;
                  } else {
                    this.cabinetViewData.bucketDevices[this.cabinetViewData.bucketDevices.map(data => data.uuid).indexOf(device.uuid)].graphs = device.graphs;
                  }
                }
              })
            });
          });
          this.spinnerService.stop('monitoring-loader');
        })
      } else {
        return;
      }
    } else {
      return;
    }
  }

  async getDeviceGraphs(device: DatacenterCabinetUnitDevice) {
    this.destroyMonitoringGraphs();
    this.deviceGraphs = [];
    device.graphs = [];
    this.selectedTab = this.tabData[0];

    if (device.monitoring && device.monitoring.configured && device.monitoring.enabled) {
      if (device.monitoring.observium) {
        this.deviceGraphs = await this.observiumUtil.getObserviumDeviceGraphByName(device.displayType).HEALTHGRAPHS.OVERVIEW;
        const deviceGraphObservables = this.deviceGraphs.map(graph => this.cabinetViewService.getDeviceMonitoringHealthGraphs(device, graph));
        this.spinnerService.start('monitoring-loader');
        this.monitoringGraphsSubscription = forkJoin(deviceGraphObservables).subscribe(results => {
          results.map(res => {
            const key = res.keys().next().value;
            if (res.get(key)) {
              let graphData: DatacenterCabinetViewMonitoringGraph = new DatacenterCabinetViewMonitoringGraph();
              graphData.name = key;
              graphData.graph = res.get(key);
              graphData.observium = true;
              device.graphs.push(graphData);
            }
          });
          this.spinnerService.stop('monitoring-loader');
        })
      } else if (device.monitoring.zabbix) {
        this.spinnerService.start('monitoring-loader');
        this.deviceGraphs = await this.cabinetViewService.getZabbixDeviceGraphs(device).pipe(takeUntil(this.ngUnsubscribe)).toPromise();
        if (this.deviceGraphs.length) {
          let initialGraphs = _clone(this.deviceGraphs).slice(0, 2);
          this.zabbixDeviceGraphsForm.get('graph_list').setValue(this.deviceGraphs.slice(0, 2));
          const deviceGraphObservables = initialGraphs.map(graph => this.cabinetViewService.getZabbixDeviceGraphImages(graph));
          this.monitoringGraphsSubscription = forkJoin(deviceGraphObservables).subscribe(results => {
            results.map(res => {
              const key = res.keys().next().value;
              const graph = res.get(key);
              if (graph) {
                let graphData: DatacenterCabinetViewMonitoringGraph = new DatacenterCabinetViewMonitoringGraph();
                graphData.name = key;
                graphData.graph = graph;
                graphData.zabbix = true;
                device.graphs.push(graphData);
              }
            });
            this.spinnerService.stop('monitoring-loader');
          })
        } else {
          this.spinnerService.stop('monitoring-loader');
        }
      } else {
        return;
      }
    } else {
      return;
    }
  }

  showSelectedGraphs(device: DatacenterCabinetUnitDevice) {
    if (this.zabbixDeviceGraphsForm.invalid) {
      this.zabbixGraphListFormErrors = this.utilService.validateForm(this.zabbixDeviceGraphsForm, this.zabbixGraphListValidationMessages, this.zabbixGraphListFormErrors);
      this.zabbixDeviceGraphsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.zabbixGraphListFormErrors = this.utilService.validateForm(this.zabbixDeviceGraphsForm, this.zabbixGraphListValidationMessages, this.zabbixGraphListFormErrors); });
    } else {
      this.spinnerService.start('monitoring-loader');
      let selectedGraphs = <DeviceGraphType[]>this.zabbixDeviceGraphsForm.get('graph_list').value;
      device.graphs = [];
      const deviceGraphObservables = selectedGraphs.map(graph => this.cabinetViewService.getZabbixDeviceGraphImages(graph));
      this.monitoringGraphsSubscription = forkJoin(deviceGraphObservables).subscribe(results => {
        results.map(res => {
          const key = res.keys().next().value;
          const graph = res.get(key);
          if (graph) {
            let graphData: DatacenterCabinetViewMonitoringGraph = new DatacenterCabinetViewMonitoringGraph();
            graphData.name = key;
            graphData.graph = graph;
            graphData.zabbix = true;
            device.graphs.push(graphData);
          }
        });
        this.spinnerService.stop('monitoring-loader');
      })
    }
  }

  hoveredDevice: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
  onHoverDevice(device: DatacenterCabinetUnitDevice) {
    if (!device.name) {
      this.hoveredDevice = new DatacenterCabinetUnitDevice();
      return;
    }
    this.hoveredDevice = device;
    if (device.type == DatacenterCabinetDeviceName.PDUS) {
      return;
    }
    for (var i = 0; i < device.pduSockets.length; i++) {
      const ele: HTMLElement = document.getElementById('pdu-' + device.pduSockets[i].pduId + (device.pduSockets[i].socketNumber - 1));
      if (ele) {
        ele.classList.add('highlight_socket');
        const attr = ele.attributes.getNamedItem('src');
        if (attr) {
          if (device.pduSockets[i].pduType == DatacenterCabinetViewPDUPositionType.HORIZONTAL) {
            this.hDURef.forEach(ref => {
              if (ref.tooltip == device.pduSockets[i].pduUUID + (device.pduSockets[i].socketNumber - 1)) {
                ref.tooltip = device.pduSockets[i].socketNumber.toString();
                ref.containerClass = 'static';
                ref.show();
              }
            });
            attr.value = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.HPDU_SELECTED_SOCKET)}`;
          } else {
            if (device.pduSockets[i].pduPosition == 'A' || device.pduSockets[i].pduPosition == 'C') {
              this.vLPDURef.forEach(ref => {
                if (ref.tooltip == device.pduSockets[i].pduUUID + (device.pduSockets[i].socketNumber - 1)) {
                  ref.tooltip = device.pduSockets[i].socketNumber.toString();
                  ref.containerClass = 'static';
                  ref.show();
                }
              });
            } else {
              this.vRPDURef.forEach(ref => {
                if (ref.tooltip == device.pduSockets[i].pduUUID + (device.pduSockets[i].socketNumber - 1)) {
                  ref.tooltip = device.pduSockets[i].socketNumber.toString();
                  ref.containerClass = 'static';
                  ref.show();
                }
              });
            }
            attr.value = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.VPDU_SELECTED_SOCKET)}`;
          }
        }
      }
    }
  }

  onLeaveDevice(device: DatacenterCabinetUnitDevice) {
    if (!device.name) {
      return;
    }

    if (this.selectedDevice && (this.selectedDevice.uuid == device.uuid)) {
      return;
    }

    for (var i = 0; i < device.pduSockets.length; i++) {
      const ele: HTMLElement = document.getElementById('pdu-' + device.pduSockets[i].pduId + (device.pduSockets[i].socketNumber - 1));
      if (ele) {
        ele.classList.remove('highlight_socket');
        const attr = ele.attributes.getNamedItem('src');
        if (attr) {
          if (device.pduSockets[i].pduType == DatacenterCabinetViewPDUPositionType.HORIZONTAL) {
            this.hDURef.forEach(ref => {
              if (ref.tooltip == device.pduSockets[i].socketNumber.toString()) {
                ref.tooltip = device.pduSockets[i].pduUUID + (device.pduSockets[i].socketNumber - 1);
                ref.hide();
              }
            });
            attr.value = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.HPDU_SINGLE_SOCKET)}`;
          } else {
            if (device.pduSockets[i].pduPosition == 'A' || device.pduSockets[i].pduPosition == 'C') {
              this.vLPDURef.forEach(ref => {
                if (ref.tooltip == device.pduSockets[i].socketNumber.toString()) {
                  ref.tooltip = device.pduSockets[i].pduUUID + (device.pduSockets[i].socketNumber - 1);
                  ref.hide();
                }
              });
            } else {
              this.vRPDURef.forEach(ref => {
                if (ref.tooltip == device.pduSockets[i].socketNumber.toString()) {
                  ref.tooltip = device.pduSockets[i].pduUUID + (device.pduSockets[i].socketNumber - 1);
                  ref.hide();
                }
              });
            }
            attr.value = `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.VPDU_SINGLE_SOCKET)}`;
          }
        }
      }
    }
  }

  selectedDevice: DatacenterCabinetUnitDevice = new DatacenterCabinetUnitDevice();
  onSelectDevice(device: DatacenterCabinetUnitDevice) {
    if (device.uuid == this.selectedDevice.uuid) {
      return;
    }
    if (!device || (device && !device.name)) {
      this.selectedDevice = new DatacenterCabinetUnitDevice();
      return;
    }
    let deselectedDevice: DatacenterCabinetUnitDevice = Object.assign({}, this.selectedDevice);
    this.selectedDevice = device;
    this.onLeaveDevice(deselectedDevice);
    this.getDeviceGraphs(device);
  }

  backToCabinetViewMonitoring() {
    this.destroyMonitoringGraphs();
    this.goTo(this.tabData[0]);
    this.isGraphsLoaded = false;
    if (this.cabinetViewData.observiumConfiguredPDUs.length) {
      this.getPDUsMonitoringGraphs();
    }
    this.selectedDevice = new DatacenterCabinetUnitDevice();
  }

  changeView(view: string) {
    this.selectedCabinetView = view;
  }

  onHeatmapLayerCheck(event: any) {
    this.showHeatMapLayer = event.target.checked;
  }

  goTo(tab: TabData) {
    this.selectedTab = tab;
  }

  getGraphCOnfig(graphType: string) {
    let a: DeviceGraphType;
    a.graphType = graphType;
    return a;
  }

  refreshData() {
    this.spinnerService.start('main');
    this.cabinetViewService.getCabinetDetails(this.cabinetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: CabinetDetailsResponse) => {
      this.cabinetViewData = this.cabinetViewDataService.convertToViewData(data);
      this.getPduStausData();
      this.backToCabinetViewMonitoring();
      this.getSocketConnectionToDevices();
      this.getDevicesStausDataExceptPDUs();
      this.getPduSensorData();
      this.getDevicesSensorDataExceptPDUs();
      this.spinnerService.stop('main');
    }, (err: HttpErrorResponse) => {
      this.backToCabinetViewMonitoring();
      setTimeout(() => {
        this.spinnerService.stop('main');
      }, 500)
    });
  }

  goBack() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.router.navigate(['/unitycloud/datacenter', this.datacenterId, 'cabinets']);
  }

  onCabinetDragStart(event: DragEvent, index: number, device: DatacenterCabinetUnitDevice) {
    this.dragSource = DatacenterCabinetViewDevicePosition.CABINET;
    this.dragSourceIndex = index;
    this.draggingDevice = device;
  }

  onCabinetDrop(event: DndDropEvent) {
    this.dragTarget = DatacenterCabinetViewDevicePosition.CABINET;
    this.dragTargetIndex = event.index;
  }

  onCabinetDragEnd(event: DragEvent) {
    if (!this.draggingDevice || !this.draggingDevice.name) {
      return;
    }

    if (this.dragTarget == DatacenterCabinetViewDevicePosition.CABINET) {
      for (let i = this.dragTargetIndex; i > this.dragTargetIndex - this.draggingDevice.size; i--) {
        if (this.cabinetViewData.cabinetUnits[i].unitOccupied) {
          return;
        }
      }

      for (let i = this.dragSourceIndex; i > (this.dragSourceIndex - this.draggingDevice.size); i--) {
        this.cabinetViewData.cabinetUnits[i] = new DatacenterCabinetUnitDevice();
      }

      this.cabinetViewData.cabinetUnits[this.dragTargetIndex] = this.draggingDevice;
      for (let i = this.dragTargetIndex; i > (this.dragTargetIndex - this.draggingDevice.size); i--) {
        this.cabinetViewData.cabinetUnits[i].unitOccupied = true;
      }

      this.draggingDevice.position = this.cabinetViewData.unitCapacity - this.dragTargetIndex;
      this.updateDevicePosition(this.draggingDevice);
    } else if (this.dragTarget == DatacenterCabinetViewDevicePosition.BUCKET) {
      for (let i = this.dragSourceIndex; i > (this.dragSourceIndex - this.draggingDevice.size); i--) {
        this.cabinetViewData.cabinetUnits[this.dragSourceIndex] = new DatacenterCabinetUnitDevice();
      }

      this.cabinetViewData.bucketDevices.splice(this.dragTargetIndex, 0, this.draggingDevice);

      this.draggingDevice.position = 0;
      this.updateDevicePosition(this.draggingDevice);
    } else {
      if (this.dragTarget == DatacenterCabinetViewDevicePosition.VERTICALLPDU || this.dragTarget == DatacenterCabinetViewDevicePosition.VERTICALRPDU) {
        this.notification.error(new Notification('Horizontal devices cannot be placed in vertical slots'));
      }
    }
  }

  onBucketDragStart(event: DragEvent, index: number, device: DatacenterCabinetUnitDevice) {
    this.dragSource = DatacenterCabinetViewDevicePosition.BUCKET;
    this.dragSourceIndex = index;
    this.draggingDevice = device;
  }

  onBucketDrop(event: DndDropEvent) {
    this.dragTarget = DatacenterCabinetViewDevicePosition.BUCKET;
    this.dragTargetIndex = event.index;
  }

  onBucketDragEnd(event: DragEvent) {
    if (!this.draggingDevice || !this.draggingDevice.name) {
      return;
    }

    switch (this.dragTarget) {
      case DatacenterCabinetViewDevicePosition.CABINET:
        for (let i = this.dragTargetIndex; i > this.dragTargetIndex - this.draggingDevice.size; i--) {
          if (this.cabinetViewData.cabinetUnits[i].unitOccupied) {
            return;
          }
        }
        if (!this.draggingDevice.isPDU || this.draggingDevice.isHorizontalPDU) {
          this.cabinetViewData.bucketDevices.splice(this.dragSourceIndex, 1);
          this.cabinetViewData.cabinetUnits[this.dragTargetIndex] = this.draggingDevice;
          for (let i = this.dragTargetIndex; i > (this.dragTargetIndex - this.draggingDevice.size); i--) {
            this.cabinetViewData.cabinetUnits[this.dragTargetIndex].unitOccupied = true;
          }

          this.draggingDevice.position = this.cabinetViewData.unitCapacity - this.dragTargetIndex;
          this.updateDevicePosition(this.draggingDevice);
        } else {
          this.notification.error(new Notification("Vertical PDU's cannot be placed inside a Cabinet"));
        }
        break;
      case DatacenterCabinetViewDevicePosition.VERTICALLPDU:
        if (this.cabinetViewData.verticalLPDUs[this.dragTargetIndex].unitOccupied) {
          return;
        }

        if (this.draggingDevice.isVerticalPDU) {
          this.cabinetViewData.bucketDevices.splice(this.dragSourceIndex, 1);
          this.cabinetViewData.verticalLPDUs[this.dragTargetIndex] = this.draggingDevice;

          this.draggingDevice.position = (this.dragTargetIndex == 0) ? 'C' : 'A';
          this.updateDevicePosition(this.draggingDevice);
        } else if (!this.draggingDevice.isPDU) {
          this.notification.error(new Notification(`${this.draggingDevice.displayType} cannot be placed in vertical slots.These slots are reserved for vertical PDUs only.`));
        } else {
          this.notification.error(new Notification('Horizontal devices cannot be placed in vertical slots'));
        }
        break;
      case DatacenterCabinetViewDevicePosition.VERTICALRPDU:
        if (this.cabinetViewData.verticalRPDUs[this.dragTargetIndex].unitOccupied) {
          return;
        }

        if (this.draggingDevice.isVerticalPDU) {
          this.cabinetViewData.bucketDevices.splice(this.dragSourceIndex, 1);
          this.cabinetViewData.verticalRPDUs[this.dragTargetIndex] = this.draggingDevice;

          this.draggingDevice.position = (this.dragTargetIndex == 0) ? 'B' : 'D';
          this.updateDevicePosition(this.draggingDevice);
        } else if (!this.draggingDevice.isPDU) {
          this.notification.error(new Notification(`${this.draggingDevice.displayType} cannot be placed in vertical slots.These slots are reserved for vertical PDUs only.`));
        } else {
          this.notification.error(new Notification('Horizontal PDUs cannot be placed in vertical slots'));
        }
        break;
      default:
    }
  }

  onLPDUDragStart(event: DragEvent, index: number, device: DatacenterCabinetUnitDevice) {
    this.dragSource = DatacenterCabinetViewDevicePosition.VERTICALLPDU;
    this.dragSourceIndex = index;
    this.draggingDevice = device;
  }

  onLPDUDrop(event: DndDropEvent) {
    this.dragTarget = DatacenterCabinetViewDevicePosition.VERTICALLPDU;
    this.dragTargetIndex = event.index;
  }

  onLPDUDragEnd(event: DragEvent) {
    if (!this.draggingDevice || !this.draggingDevice.name || this.dragTargetIndex > 1) {
      return;
    }

    if (this.dragTarget == DatacenterCabinetViewDevicePosition.BUCKET) {
      this.cabinetViewData.verticalLPDUs[this.dragSourceIndex] = new DatacenterCabinetUnitDevice();
      this.cabinetViewData.bucketDevices.splice(this.dragTargetIndex, 0, this.draggingDevice);

      this.draggingDevice.position = 0;
      this.updateDevicePosition(this.draggingDevice);
    } else if (this.dragTarget == DatacenterCabinetViewDevicePosition.VERTICALLPDU) {
      if (this.cabinetViewData.verticalLPDUs[this.dragTargetIndex].unitOccupied) {
        return;
      }

      this.cabinetViewData.verticalLPDUs[this.dragSourceIndex] = new DatacenterCabinetUnitDevice();
      this.cabinetViewData.verticalLPDUs[this.dragTargetIndex] = this.draggingDevice;

      this.draggingDevice.position = (this.dragTargetIndex == 0) ? 'C' : 'A';
      this.updateDevicePosition(this.draggingDevice);

    } else if (this.dragTarget == DatacenterCabinetViewDevicePosition.VERTICALRPDU) {
      if (this.cabinetViewData.verticalRPDUs[this.dragTargetIndex].unitOccupied) {
        return;
      }
      this.cabinetViewData.verticalLPDUs[this.dragSourceIndex] = new DatacenterCabinetUnitDevice();
      this.cabinetViewData.verticalRPDUs[this.dragTargetIndex] = this.draggingDevice;

      this.draggingDevice.position = (this.dragTargetIndex == 0) ? 'B' : 'D';
      this.updateDevicePosition(this.draggingDevice);
    } else {
      if (this.dragTarget == DatacenterCabinetViewDevicePosition.CABINET) {
        this.notification.error(new Notification("Vertical PDU's cannot be placed inside a Cabinet"));
      }
    }
  }

  onRPDUDragStart(event: DragEvent, index: number, device: DatacenterCabinetUnitDevice) {
    this.dragSource = DatacenterCabinetViewDevicePosition.VERTICALRPDU;
    this.dragSourceIndex = index;
    this.draggingDevice = device;
  }

  onRPDUDrop(event: DndDropEvent) {
    this.dragTarget = DatacenterCabinetViewDevicePosition.VERTICALRPDU;
    this.dragTargetIndex = event.index;
  }

  onRPDUDragEnd(event: DragEvent) {
    if (!this.draggingDevice || !this.draggingDevice.name || this.dragTargetIndex > 1) {
      return;
    }


    if (this.dragTarget == DatacenterCabinetViewDevicePosition.BUCKET) {
      this.cabinetViewData.verticalRPDUs[this.dragSourceIndex] = new DatacenterCabinetUnitDevice();
      this.cabinetViewData.bucketDevices.splice(this.dragTargetIndex, 0, this.draggingDevice);

      this.draggingDevice.position = 0;
      this.updateDevicePosition(this.draggingDevice);
    } else if (this.dragTarget == DatacenterCabinetViewDevicePosition.VERTICALLPDU) {
      if (this.cabinetViewData.verticalLPDUs[this.dragTargetIndex].unitOccupied) {
        return;
      }

      this.cabinetViewData.verticalRPDUs[this.dragSourceIndex] = new DatacenterCabinetUnitDevice();
      this.cabinetViewData.verticalLPDUs[this.dragTargetIndex] = this.draggingDevice;

      this.draggingDevice.position = (this.dragTargetIndex == 0) ? 'C' : 'A';
      this.updateDevicePosition(this.draggingDevice);

    } else if (this.dragTarget == DatacenterCabinetViewDevicePosition.VERTICALRPDU) {
      if (this.cabinetViewData.verticalRPDUs[this.dragTargetIndex].unitOccupied) {
        return;
      }
      this.cabinetViewData.verticalRPDUs[this.dragSourceIndex] = new DatacenterCabinetUnitDevice();
      this.cabinetViewData.verticalRPDUs[this.dragTargetIndex] = this.draggingDevice;

      this.draggingDevice.position = (this.dragTargetIndex == 0) ? 'B' : 'D';
      this.updateDevicePosition(this.draggingDevice);
    } else {
      if (this.dragTarget == DatacenterCabinetViewDevicePosition.CABINET) {
        this.notification.error(new Notification("Vertical PDU's cannot be placed inside a Cabinet"));
      }
    }
  }

  updateDevicePosition(device: DatacenterCabinetUnitDevice) {
    this.cabinetViewService.updateDevicePosition(this.cabinetId, device).pipe(takeUntil(this.ngUnsubscribe)).subscribe((msg: string) => {
    }, (err: HttpErrorResponse) => {
    })
  }
}
