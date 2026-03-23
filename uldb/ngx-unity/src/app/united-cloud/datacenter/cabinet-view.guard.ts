import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CABINET_DEVIECS_BY_CABINET_ID } from 'src/app/shared/api-endpoint.const';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { catchError, map } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Observable, empty } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DatacenterCabinetViewCommonImages, DatacenterCabinetFrontViewImagePaths, DatacenterCabinetRearViewImagePaths } from './datacenter-cabinet-view/datacenter-cabinet-viewdata.type';
import { CabinetDetailsResponse } from './entities/cabinet-view-device.type';

@Injectable({
    providedIn: 'root',
})
export class CabinetViewGuard implements Resolve<CabinetDetailsResponse> {
    assetsUrl: string = environment.assetsUrl;
    imgs = new Array();
    constructor(private http: HttpClient,
        private notificationService: AppNotificationService,
        private spinnerService: AppSpinnerService
    ) { }

    resolve(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CabinetDetailsResponse> {
        this.spinnerService.start('main');
        // this.preloadCommonImages();
        // this.preloadFrontViewImages();
        // this.preloadRearViewImages();
        return this.http.get<CabinetDetailsResponse>(CABINET_DEVIECS_BY_CABINET_ID(next.paramMap.get('cabinetId'))).pipe(map(
            res => {
                this.spinnerService.stop('main');
                return res;
            }),
            catchError((err: HttpErrorResponse) => {
                this.spinnerService.stop('main');
                this.notificationService.error(new Notification('Unable to fetch Cabinet Details. Please contact Administrator (support@unityonecloud.com)'));
                return empty();
            })
        );
    }

    preload(...args: any[]): void {
        for (var i = 0; i < args.length; i++) {
            this.imgs[i] = new Image();
            this.imgs[i].src = args[i];
        }
    }

    preloadCommonImages() {
        this.preload(
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.CABINET_BOTTOM)}`,
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.CABINET_TOP)}`,
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.CABINET_LEFT_CELL)}`,
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.CABINET_RIGHT_CELL)}`,
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.VPDU_START)}`,
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.VPDU_END)}`,
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.VPDU_SINGLE_SOCKET)}`,
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.HPDU_START)}`,
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.HPDU_END)}`,
            `${this.assetsUrl.concat(DatacenterCabinetViewCommonImages.HPDU_SINGLE_SOCKET)}`
        )
    }

    preloadFrontViewImages() {
        this.preload(
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.SWITCH)}`,
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.FIREWALL)}`,
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.LOAD_BALANCER)}`,
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.SERVER)}`,
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.STORAGE)}`,
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.PDU)}`,
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.OTHER_DEVICE)}`,
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.BLANK_PANEL)}`,
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.CABLE_ORGANISER)}`,
            `${this.assetsUrl.concat(DatacenterCabinetFrontViewImagePaths.PATCH_PANEL)}`
        )
    }

    preloadRearViewImages() {
        this.preload(
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.SWITCH)}`,
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.FIREWALL)}`,
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.LOAD_BALANCER)}`,
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.SERVER)}`,
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.STORAGE)}`,
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.PDU)}`,
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.OTHER_DEVICE)}`,
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.BLANK_PANEL)}`,
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.CABLE_ORGANISER)}`,
            `${this.assetsUrl.concat(DatacenterCabinetRearViewImagePaths.PATCH_PANEL)}`
        )
    }
}