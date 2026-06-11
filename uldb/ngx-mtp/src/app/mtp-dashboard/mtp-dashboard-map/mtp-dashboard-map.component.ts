import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { environment } from 'src/environments/environment';
import { MtpDashboardMapService, WorldMapWidgetViewdata } from './mtp-dashboard-map.service';
declare var MarkerClusterer: any;

@Component({
  selector: 'mtp-dashboard-map',
  templateUrl: './mtp-dashboard-map.component.html',
  styleUrls: ['./mtp-dashboard-map.component.scss'],
  providers: [MtpDashboardMapService]
})
export class MtpDashboardMapComponent implements OnInit, OnDestroy {
  @ViewChild('map', { static: true }) mapElement: any;
  map: google.maps.Map;
  private ngUnsubscribe = new Subject();
  @ViewChild('info') info: ElementRef;
  private tilesLoaded: google.maps.MapsEventListener;
  viewdata: WorldMapWidgetViewdata[] = [];
  dcMap = null;
  markers: google.maps.Marker[] = [];
  cluster: any;
  iconBase = `https://maps.google.com/mapfiles/ms/icons/`;
  icons = {
    'up': `${this.iconBase}green-dot.png`,
    'down': `${this.iconBase}red-dot.png`,
    'partially-up': `${this.iconBase}orange-dot.png`
  };
  zIndexMap: { [key: string]: number } = {};
  oldZIndex: number = null;
  initialZoom: number;
  INIT_ZOOM: number = 1.5;
  INIT_CENTER: google.maps.LatLng = new google.maps.LatLng(25.738611, 0);
  clusterInfoWindow = new google.maps.InfoWindow();

  constructor(private mapWidgetService: MtpDashboardMapService,
    private notification: AppNotificationService,
    private ngZone: NgZone,
    private spinner: AppSpinnerService) { }

  ngOnInit() {
    this.drawMap();
    setTimeout(() => {
      this.getTenants();
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTenants() {
    this.spinner.start('dashboard_map_widget');
    this.mapWidgetService.getWidgetTenants().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res) {
        this.viewdata = this.mapWidgetService.convertToViewdata(res);
        let dcm = {};
        this.viewdata.forEach(view => {
          dcm[view.location] = view.tenants;
        });
        this.dcMap = dcm;
        this.addMarkers();
      }
      this.spinner.stop('dashboard_map_widget');
    }, err => {
      this.spinner.stop('dashboard_map_widget');
      this.notification.error(new Notification('Problem occurred while fetching datacenter status. Please try again.'));
    });
  }

  drawMap() {
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
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
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

  addMarkers() {
    this.markers.map(marker => marker.setMap(null));
    this.markers = [];
    if (this.cluster) {
      this.cluster.clearMarkers();
      this.cluster.setMap(null);
    }
    this.viewdata.map((loc, i) => {
      const ll = new google.maps.LatLng(loc.lat, loc.long);
      const marker = new google.maps.Marker({
        position: ll,
        map: this.map,
        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        title: loc.location
      });
      let infoWindow = new google.maps.InfoWindow();
      infoWindow.setContent(this.mapWidgetService.createInfoWindowContent(loc));
      infoWindow.setPosition(ll);
      infoWindow.open(this.map, marker);
      this.markers.push(marker);
      let domready = infoWindow.addListener('domready', () => {
        this.popOvers(infoWindow);
        let id = `${infoWindow.getPosition().lat()}_${infoWindow.getPosition().lng()}`;
        let currentIndex = (document.getElementById(id).closest('.gm-style-iw-a').parentElement as HTMLElement).style.getPropertyValue('z-index');
        this.zIndexMap[id] = Number.parseInt(currentIndex);
      });
    });

    this.cluster = new MarkerClusterer(this.map, this.markers, {
      imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });

    google.maps.event.addListener(this.cluster, "mouseover", (cl) => {
      this.openClusterPopOver(cl);
    });
    google.maps.event.addListener(this.cluster, "mouseout", (cl) => {
      this.clusterInfoWindow.close();
    });
    google.maps.event.addListener(this.cluster, "click", (cl) => {
      this.clusterInfoWindow.close();
    });
  }

  openClusterPopOver(cl: any) {
    let contentString = '<div style="font-weight:500;">Available Tenants</div><br>';
    cl.markers_.forEach((marker: any) => {
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