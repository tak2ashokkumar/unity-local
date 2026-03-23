import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { AwsInstanceListService } from './aws-instance-list.service';
import { CostCalculatorCloudDetails, CostCalculatorCloudUnitsFormData } from '../cost-calculator.service';
import { CostCalculatorAWSInstanceViewData } from '../cost-calculator.type';
import { Subject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CostCalculatorAWSStorageRate } from './aws-instance-list.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'aws-instance-list',
  templateUrl: './aws-instance-list.component.html',
  styleUrls: ['./aws-instance-list.component.scss'],
  providers: [AwsInstanceListService]
})
export class AwsInstanceListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() cloud: CostCalculatorCloudDetails;
  @Input() cloudUnits: CostCalculatorCloudUnitsFormData;
  @Output() instanceSelected = new EventEmitter<CostCalculatorAWSInstanceViewData>();

  private ngUnsubscribe = new Subject();

  regionList: Array<{ name: string, code: string, iops_rate: number }> = [];
  storageTypes: Array<{ name: string, code: string }> = [];
  bandwidthValues: string[] = [];

  awsInstanceFiltersForm: FormGroup;
  storageRate: CostCalculatorAWSStorageRate;
  instances: CostCalculatorAWSInstanceViewData[] = [];
  selectedInstance: CostCalculatorAWSInstanceViewData = new CostCalculatorAWSInstanceViewData();

  constructor(private awsService: AwsInstanceListService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start('aws-instance-prices');
    }, 0);
    this.getAWSFilterDropdowns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.cloudUnits.firstChange) {
      setTimeout(() => {
        this.spinnerService.start('aws-instance-prices');
      }, 0);
      this.instances = [];
      this.selectedInstance = new CostCalculatorAWSInstanceViewData();
      this.getInstancePrices();
    }
  }

  ngOnDestroy() {
    this.spinnerService.stop('aws-instance-prices');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAWSFilterDropdowns() {
    this.awsService.getAWSFilterDropdowns().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.regionList = data[0];
      this.bandwidthValues = data[1];
      this.storageTypes = data[2];
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again later'));
    })
  }

  buildForm() {
    const region: string = this.regionList[0].name;
    const bandwidthValue: string = this.bandwidthValues[2];
    const storageType: string = this.storageTypes[0].code;
    this.awsInstanceFiltersForm = this.awsService.buildAWSInstanceFiltersForm(region, bandwidthValue, storageType);
    this.getAWSStorageRates();
    this.awsInstanceFiltersForm.get('region').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.selectedInstance = new CostCalculatorAWSInstanceViewData();
      this.getInstancePrices();
    });

    this.awsInstanceFiltersForm.get('nw_performance').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.selectedInstance = new CostCalculatorAWSInstanceViewData();
      this.getInstancePrices();
    });

    this.awsInstanceFiltersForm.get('storage_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getAWSStorageRates();
      if (!this.awsInstanceFiltersForm.controls.iops && (val == 'Provisioned IOPS')) {
        this.awsInstanceFiltersForm.addControl('iops', new FormControl('', [Validators.required]));
      } else if (this.awsInstanceFiltersForm.controls.iops) {
        this.awsInstanceFiltersForm.removeControl('iops');
      }
    });

  }

  getAWSStorageRates() {
    this.awsService.getStorageRates(this.awsInstanceFiltersForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.storageRate = data;
      this.getInstancePrices();
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('aws-instance-prices');
      this.notification.error(new Notification('Something went wrong. Please try again later'));
    });
  }

  getInstancePrices() {
    this.awsService.getInstancePrices(this.cloudUnits, this.awsInstanceFiltersForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.instances = this.awsService.convertToViewData(data, this.cloudUnits, this.storageRate.rate, this.awsInstanceFiltersForm.getRawValue(), this.regionList);
      this.instanceSelected.emit(new CostCalculatorAWSInstanceViewData());
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again later'));
    }, () => {
      this.spinnerService.stop('aws-instance-prices');
    })
  }

  selectInstance(index: number) {
    this.selectedInstance.isSelected = false;
    this.selectedInstance.bgClass = 'text-dark';

    this.selectedInstance = this.instances[index];
    this.instanceSelected.emit(this.selectedInstance);
    this.instances[index].isSelected = true;
    this.instances[index].bgClass = 'bg-teal text-white';
  }

}
