/// <reference types="google.maps" />

import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { MapService } from 'src/app/map.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { environment } from 'src/environments/environment';
import { DashboardMapWidgetService, WorldMapWidgetDCMap, WorldMapWidgetViewdata } from './dashboard-map-widget.service';
@Component({
  selector: 'dashboard-map-widget',
  templateUrl: './dashboard-map-widget.component.html',
  styleUrls: ['./dashboard-map-widget.component.scss'],
  providers: [DashboardMapWidgetService]
})
export class DashboardMapWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewdata: WorldMapWidgetViewdata[] = [];
  dcMap: WorldMapWidgetDCMap = null;

  isMapAvailable: boolean = false;
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map: google.maps.Map;

  cluster: any;
  private clusterListeners: google.maps.MapsEventListener[] = [];
  clusterInfoWindow: google.maps.InfoWindow;
  private tilesLoaded: google.maps.MapsEventListener;
  private zoomChangedListener: google.maps.MapsEventListener;

  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  private maxZIndex = 0;
  initialZoom: number;
  INIT_ZOOM: number = 1.5;
  INIT_CENTER = { lat: 25.738611, lng: 0 };

  constructor(private mapWidgetSerice: DashboardMapWidgetService,
    private mapSvc: MapService,
    private notification: AppNotificationService,
    private ngZone: NgZone,
    private spinner: AppSpinnerService) { }

  ngOnInit() { }

  async ngAfterViewInit() {
    this.spinner.start('dashboard_map_widget');
    await this.mapSvc.loadMap();

    this.isMapAvailable = this.mapSvc.isAvailable();
    if (!this.isMapAvailable) {
      this.spinner.stop('dashboard_map_widget');
      return;
    }
    this.loadAndSyncDCStatus();
  }

  ngOnDestroy() {
    this.clusterListeners.forEach(l => l.remove());
    if (this.zoomChangedListener) {
      this.zoomChangedListener.remove();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadAndSyncDCStatus() {
    this.mapWidgetSerice.getDatacenterSatus().pipe(
      takeUntil(this.ngUnsubscribe),
      tap(res => {
        this.processDCData(res);
      }),
      switchMap(() => this.mapWidgetSerice.syncDatacenterSatus()),
      switchMap(() => this.mapWidgetSerice.getDatacenterSatus())
    ).subscribe(
      res => {
        this.processDCData(res);
        this.spinner.stop('dashboard_map_widget');
      },
      err => {
        this.spinner.stop('dashboard_map_widget');
        this.notification.error(
          new Notification(
            'Problem occurred while updating datacenter status. Please try again.'
          )
        );

      }
    );
  }

  private processDCData(res: any) {
    if (!res) return;
    this.viewdata = this.mapWidgetSerice.convertToViewdata(res);
    const dcm: WorldMapWidgetDCMap = {};
    this.viewdata.forEach(view => {
      dcm[view.location] = view.datacenters.map(dc => dc.name);
    });
    this.dcMap = dcm;
    if (this.map) {
      this.addMarkers();
    } else {
      this.drawMap();
    }
  }

  async drawMap() {
    if (!this.mapElement?.nativeElement) {
      return;
    }
    const mapsLibrary = await this.mapSvc.importMapsLibrary();
    if (!mapsLibrary) {
      this.isMapAvailable = false;
      this.spinner.stop('dashboard_map_widget');
      return;
    }
    const { Map } = mapsLibrary;
    this.ngZone.runOutsideAngular(() => {
      const mapProperties = {
        center: this.INIT_CENTER,
        zoom: this.INIT_ZOOM,
        minZoom: 2.2,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        mapId: environment.gmId
      };
      this.map = new Map(this.mapElement.nativeElement, mapProperties);
      this.clusterInfoWindow = new google.maps.InfoWindow();
      this.zoomChangedListener = this.map.addListener('zoom_changed', () => this.clusterInfoWindow?.close());
      this.initialZoom = this.map.getZoom();
      this.addResetZoomControl();
      this.tilesLoaded = this.map.addListener('tilesloaded', () => {
        this.addMarkers();
        this.tilesLoaded.remove();
      });
    });
  }

  /**
   * This is done as per google guidelines, later need to refactor using angular Renderer2
   */
  addResetZoomControl() {
    const controlDiv = document.createElement('div');
    const controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.borderRadius = '2px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginRight = '10px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the zoom';
    controlDiv.appendChild(controlUI);
    const button = document.createElement('button');
    button.style.backgroundColor = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '2px';
    button.style.outline = 'none';
    button.style.height = '40px';
    button.style.width = '40px';
    button.style.paddingLeft = '5px';
    button.style.paddingRight = '5px';
    const icon = document.createElement('i');
    icon.style.color = 'rgb(25,25,25)';
    icon.classList.add('fa');
    icon.classList.add('fa-life-ring');
    icon.classList.add('fa-2x');
    button.appendChild(icon);
    controlUI.appendChild(button);
    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
    controlUI.addEventListener('click', () => {
      this.map.setZoom(this.INIT_ZOOM);
      this.map.setCenter(this.INIT_CENTER);
    });
  }

  async addMarkers() {
    if (!this.map) return;
    this.markers.forEach(marker => marker.map = null);
    this.markers = [];
    if (this.cluster) {
      this.cluster.clearMarkers();
      this.cluster = null;
    }

    const markerLibrary = await this.mapSvc.importMarkerLibrary();
    if (!markerLibrary) return;
    const { AdvancedMarkerElement } = markerLibrary;
    this.viewdata.map((loc, i) => {
      // const ll = new google.maps.LatLng(loc.lat, loc.long);
      const ll = { lat: Number(loc.lat), lng: Number(loc.long) };
      const marker = new AdvancedMarkerElement({
        position: ll,
        map: this.map,
        title: loc.location,
        content: this.mapSvc.createMarkerContent(loc),
      });
      const iwContent = document.createElement('div');
      iwContent.innerHTML = this.mapWidgetSerice.createInfoWindowContent(loc);
      iwContent.style.cursor = 'pointer';
      let infoWindow = new google.maps.InfoWindow({ content: iwContent, position: ll });
      this.bringToFront(infoWindow);
      iwContent.addEventListener('click', () => this.bringToFront(infoWindow));
      infoWindow.open({
        map: this.map,
        anchor: marker
      });
      this.markers.push(marker);
    });

    this.cluster = new MarkerClusterer({
      map: this.map,
      markers: this.markers,
      onClusterClick: () => { } // suppress default zoom-on-click; the 'click' listener below opens the popover
    });

    this.clusterListeners.push(
      this.cluster.addListener('click', (cl: any) => {
        this.openClusterPopOver(cl);
      })
    )
  }

  openClusterPopOver(cl: any) {
    let contentString = '<div style="font-weight:500;">Available Datacenters</div><br>';
    cl.markers.forEach((marker: any) => {
      let dcs: string[] = this.dcMap[marker.title];
      (dcs || []).forEach(dc => {
        contentString = `${contentString}<span>${dc}</span><br>`;
      });
    });
    const iwContent = document.createElement('div');
    iwContent.innerHTML = contentString;
    iwContent.style.cursor = 'pointer';
    iwContent.addEventListener('click', () => this.bringToFront(this.clusterInfoWindow));
    this.clusterInfoWindow.setContent(iwContent);
    this.clusterInfoWindow.setPosition(cl.position);
    this.clusterInfoWindow.open(this.map);
    this.bringToFront(this.clusterInfoWindow);
  }

  private bringToFront(infoWindow: google.maps.InfoWindow): void {
    infoWindow.setZIndex(++this.maxZIndex);
  }
}
