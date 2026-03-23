import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AssetStatsViewData, AssetUnderMgmtService } from 'src/app/app-home/asset-under-mgmt/asset-under-mgmt.service';


@Component({
  selector: 'asset-under-mgmt',
  templateUrl: './asset-under-mgmt.component.html',
  styleUrls: ['./asset-under-mgmt.component.scss'],
  providers: [AssetUnderMgmtService]
})
export class AssetUnderMgmtComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  public assetsViewData: AssetStatsViewData;
  dcOptions : any;
  form: FormGroup;
  selectedDatacenters: string[]= [];

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    keyToSelect: 'uuid',
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: false,
    mandatoryLimit: 1,
    appendToBody: true
  };

  dcSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Datacenters',
  };

  constructor(private spinnerService: AppSpinnerService,
    private router: Router,
    private user: UserInfoService,
    private assetsUnderMgmtService: AssetUnderMgmtService) { }

  ngOnInit() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onLazyLoad(event: string) {
    this.spinnerService.start('assets');
    this.getDatacenters();
    // this.getAssetCounts();
  }

  getDatacenters(){
    this.assetsUnderMgmtService.getDatacenterList().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.dcOptions=data;
      this.buildForm();
      this.spinnerService.stop('assets');
    }, err => {
      this.spinnerService.stop('assets');
    });
  }

  buildForm(){
    this.selectedDatacenters = this.dcOptions.map(dc => dc.uuid);
    this.form = this.assetsUnderMgmtService.buildform(this.selectedDatacenters);
    // this.selectedDatacenters=this.form.get('datacenters').value;
    this.getAssetCounts();
  }

  onFilterChanged(){
    this.selectedDatacenters=this.form.get('datacenters').value
    this.getAssetCounts();
  }


  getAssetCounts() {
    this.spinnerService.start('assets');
    this.assetsUnderMgmtService.getAssetCounts(this.selectedDatacenters).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: CountStats) => {
      this.assetsViewData = this.assetsUnderMgmtService.convertToViewData(data);
      this.getAssetStats();
      this.spinnerService.stop('assets');
    }, err => {
      this.spinnerService.stop('assets');
    });
  }

  getAssetStats() {
    this.assetsUnderMgmtService.getAssetStats(this.selectedDatacenters).pipe(takeUntil(this.ngUnsubscribe)).subscribe((stats: Stats[]) => {
      this.assetsViewData = this.assetsUnderMgmtService.changeViewData(this.assetsViewData, stats);
      this.syncAssetsStatus();
      this.assetsUnderMgmtService.statsChange$.next();
    });
  }

  syncAssetsStatus() {
    this.assetsUnderMgmtService.syncAssetStats(this.selectedDatacenters).pipe(takeUntil(this.ngUnsubscribe)).subscribe((stats: Stats[]) => {
      this.assetsViewData = this.assetsUnderMgmtService.changeViewData(this.assetsViewData, stats);
    }, err => {
    });
  }

  goTo(path: string) {
    if (this.user.isDashboardOnlyUser) {
      return;
    }
    this.router.navigate([path]);
  }

  
}
