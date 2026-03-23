import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { environment } from 'src/environments/environment';
import { DatacenterInRegion, SustainabilityMapDatacenterCluster, SustainabilityMapService, SustainabilityMapViewdata, UnitySustainabilityCO2Overlay } from './sustainability-map.service';

@Component({
  selector: 'sustainability-map',
  templateUrl: './sustainability-map.component.html',
  styleUrls: ['./sustainability-map.component.scss'],
  providers: [SustainabilityMapService]
})
export class SustainabilityMapComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: SustainabilityMapViewdata[] = []
  dcMap: SustainabilityMapDatacenterCluster = {};

  @ViewChild('map', { static: true }) mapElement: any;
  map: google.maps.Map;

  cluster: any;
  private clusterListeners: google.maps.MapsEventListener[] = [];
  clusterInfoWindow = new google.maps.InfoWindow();
  private tilesLoaded: google.maps.MapsEventListener;

  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  zIndexMap: { [key: string]: number } = {};
  oldZIndex: number = null;
  initialZoom: number;
  INIT_ZOOM: number = 1.0;
  INIT_CENTER: google.maps.LatLng = new google.maps.LatLng(25.738611, 0);

  overlays: UnitySustainabilityCO2Overlay[] = []

  constructor(private notification: AppNotificationService,
    private ngZone: NgZone,
    private spinner: AppSpinnerService,
    private smSvc: SustainabilityMapService) { }

  ngOnInit(): void {
    this.getCarbonEmmissionByRegion();
    // this.getDCStatus();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getCarbonEmmissionByRegion() {
    this.smSvc.getCarbonEmmissionByRegion().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.smSvc.convertToViewdata(res);
      this.drawMap();
    }, err => {

    });
  }

  drawMap() {
    this.ngZone.runOutsideAngular(() => {
      const mapProperties = {
        center: this.INIT_CENTER,
        zoom: this.INIT_ZOOM,
        minZoom: 1.15,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        mapId: environment.gmId,
        // zoomControl: false,
        fullscreenControl: false,
        controlSize: 30,
      };
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
      this.initialZoom = this.map.getZoom();
      this.addResetZoomControl();

      this.tilesLoaded = this.map.addListener('tilesloaded', () => {
        this.addOverLays();
        this.tilesLoaded.remove();
      });
    });
  }

  addOverLays() {
    this.viewData.forEach(view => {
      //Create cluster map
      view.datacenters.forEach(dc => {
        this.dcMap[dc.location] = dc.centers.map(dc => dc.name);
      });
      // Create overlay for each regions
      const overlay: UnitySustainabilityCO2Overlay = new UnitySustainabilityCO2Overlay(view.location, view.percent);
      overlay.setMap(this.map);
      this.overlays.push(overlay);
      google.maps.event.addListener(overlay, 'click', (event) => {
        this.map.setCenter(overlay.bound);
        this.showMarkers(overlay);
      });
    });
  }

  showMarkers(overlay: UnitySustainabilityCO2Overlay) {
    this.overlays.forEach(overlay => overlay.hide());
    this.viewData.forEach(view => {
      if (view.location == overlay.bound) {
        this.addMarkers(view.datacenters);
      }
    });
  }

  showOverLays() {
    this.markers.forEach(marker => {
      marker.map = null;
    });
    this.markers = [];
    if (this.cluster) {
      this.cluster.clearMarkers();
      this.cluster = null;
    }
    this.overlays.forEach(overlay => overlay.show());
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
    controlUI.style.marginRight = '8px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the zoom';
    controlDiv.appendChild(controlUI);
    const button = document.createElement('button');
    button.style.backgroundColor = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '2px';
    button.style.outline = 'none';
    button.style.height = '30px';
    button.style.width = '30px';
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
      this.showOverLays();
      this.map.setZoom(this.INIT_ZOOM);
      this.map.setCenter(this.INIT_CENTER);
    });
  }

  addMarkers(dcs: DatacenterInRegion[]) {
    let bounds = new google.maps.LatLngBounds();

    dcs.map((dc, i) => {
      const ll = new google.maps.LatLng(dc.lat, dc.long);
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: ll,
        map: this.map,
        title: dc.location,
      });
      let infoWindow = new google.maps.InfoWindow();
      infoWindow.setContent(this.smSvc.createInfoWindowContent(dc));
      infoWindow.setPosition(ll);
      infoWindow.open({
        map: this.map,
        anchor: marker
      });
      this.markers.push(marker);
      bounds.extend(ll);

      let domready = infoWindow.addListener('domready', () => {
        this.popOvers(infoWindow);
        let id = `${infoWindow.getPosition().lat()}_${infoWindow.getPosition().lng()}`;
        let currentIndex = (document.getElementById(id).closest('.gm-style-iw-a').parentElement as HTMLElement).style.getPropertyValue('z-index');
        this.zIndexMap[id] = Number.parseInt(currentIndex);
      });
    });
    this.map.setZoom(2);
    this.map.panToBounds(bounds);

    this.cluster = new MarkerClusterer({
      map: this.map,
      markers: this.markers
    });
    this.clusterListeners.push(
      this.cluster.addListener('mouseover', (cl: any) => {
        this.openClusterPopOver(cl);
      }),

      this.cluster.addListener('mouseout', () => {
        this.clusterInfoWindow.close();
      }),

      this.cluster.addListener('click', () => {
        this.clusterInfoWindow.close();
      })
    )
  }

  openClusterPopOver(cl: any) {
    let contentString = '<div style="font-weight:500;">Available Datacenters</div><br>';
    cl.markers.forEach((marker: any) => {
      let dcs: string[] = this.dcMap[marker.getTitle()];
      dcs.forEach(dc => {
        contentString = `${contentString}<span>${dc}</span><br>`;
      });
    });
    this.clusterInfoWindow.setContent(`${contentString}`);
    this.clusterInfoWindow.setPosition(cl.getCenter());
    this.clusterInfoWindow.open(this.map);
  }

  popOvers(infoWindow: google.maps.InfoWindow) {
    document.getElementById(`${infoWindow.getPosition().lat()}_${infoWindow.getPosition().lng()}`).addEventListener('mouseover', (e: MouseEvent) => {
      let high = null;
      for (const key in this.zIndexMap) {
        if (this.zIndexMap.hasOwnProperty(key)) {
          if (high != null) {
            high = this.zIndexMap[key];
            this.oldZIndex = high;
          } else {
            high = this.zIndexMap[key] > high ? this.zIndexMap[key] : high;
          }
        }
      }
      infoWindow.setZIndex(high + 1);
    });

    document.getElementById(`${infoWindow.getPosition().lat()}_${infoWindow.getPosition().lng()}`).addEventListener('mouseout', (e: MouseEvent) => {
      infoWindow.setZIndex(this.oldZIndex);
      this.oldZIndex = null;
    });
  }
}