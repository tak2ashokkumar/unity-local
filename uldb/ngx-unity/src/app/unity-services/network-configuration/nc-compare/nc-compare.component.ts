import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { NcCompareService } from './nc-compare.service';
import { FormGroup } from '@angular/forms';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { NCMConfigurationType, NCMDeviceVersionType } from './nc-compare.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { JSONDiffReport } from 'src/app/shared/json-comparison/json-comparison.type';

@Component({
  selector: 'nc-compare',
  templateUrl: './nc-compare.component.html',
  styleUrls: ['./nc-compare.component.scss'],
  providers: [NcCompareService]
})
export class NcCompareComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  deviceType: string;
  deviceId: string;
  versionId: string;

  deviceVersions: NCMDeviceVersionType[] = [];
  currentActiveVersion: NCMDeviceVersionType;
  previousVersion: NCMDeviceVersionType;
  selectedVersions: NCMDeviceVersionType[] = [];

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  constructor(private svc: NcCompareService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private utilSvc: AppUtilityService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.deviceType = params.get('deviceType');
      this.deviceId = params.get('deviceId');
      this.versionId = params.get('historyId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDeviceVersions();
    // this.getVersionData();
  }

  refreshData() {

  }

  getDeviceVersions() {
    this.svc.getDeviceVersions(this.deviceType, this.deviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceVersions = res;
      if (this.deviceVersions.length) {
        let currentVersionIndex = this.deviceVersions.findIndex(dv => dv.uuid == this.versionId);
        if (currentVersionIndex != -1 && this.deviceVersions[currentVersionIndex + 1]) {
          this.currentActiveVersion = this.deviceVersions[currentVersionIndex];
          this.previousVersion = this.deviceVersions[currentVersionIndex + 1]
        }
      }
      this.buildForm();
      this.spinner.stop('main');
    }, err => {
      this.deviceVersions = [];
      this.buildForm();
      this.spinner.stop('main');
    })
  }

  buildForm() {
    this.form = this.svc.buildForm(this.previousVersion, this.currentActiveVersion);
    this.formErrors = this.svc.formErrors();
    this.validationMessages = this.svc.validationMessages;
    if (this.previousVersion && this.currentActiveVersion) {
      setTimeout(() => {
        this.onSubmit();
      });
    }
  }

  processVersionData(versionData: NCMConfigurationType) {
    let versionDataInArr = versionData?.data?.split("\n");
    let processVersionData: string[] = [];
    for (let i = 0; i < versionDataInArr.length; i++) {
      if (versionDataInArr[i] == '') {
        continue;
      } else if (!versionDataInArr[i].includes("&quot;")) {
        let line: string = versionDataInArr[i].replace(/"/g, "'");
        processVersionData.push(line);
      }
    }
    return processVersionData;
  }

  onSubmit() {
    this.selectedVersions = [];
    if (this.form.invalid) {
      this.formErrors = this.utilSvc.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.formErrors = this.utilSvc.validateForm(this.form, this.validationMessages, this.formErrors);
      })
    } else {
      let formData = this.form.getRawValue();
      this.selectedVersions.push(formData.version1);
      this.selectedVersions.push(formData.version2);
      from(this.selectedVersions).pipe(
        mergeMap(v => this.svc.getVersionData(v.uuid).pipe(takeUntil(this.ngUnsubscribe))))
        .subscribe(
          res => {
            const key = res.keys().next().value;
            let index = this.selectedVersions.map(v => v.uuid).indexOf(key);
            if (res.get(key)) {
              let versionData = this.processVersionData(res.get(key));
              this.selectedVersions[index].versionData = versionData;
            }
            if (this.selectedVersions[0].versionData && this.selectedVersions[1].versionData) {
              setTimeout(() => {
                this.compare();
              }, 2500);
            }
          }
        )
    }
  }

  compare() {
    document.getElementById('compare').click();
  }

  diffReport: JSONDiffReport;
  differenceReport(event: any) {
    this.diffReport = event;
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
