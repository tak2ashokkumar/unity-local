import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { GcpInstanceListService, gcpMachineClasses } from './gcp-instance-list.service';
import { CostCalculatorCloudDetails, CostCalculatorCloudUnitsFormData, CostcalculatorCommitmentYearsCodes } from '../cost-calculator.service';
import { CostCalculatorGcpInstanceViewData } from '../cost-calculator.type';
import { Subject } from 'rxjs';
import { GCPInstanceType, GCPSeries, GCPCostCalculatorResponseItem } from './gcp-instance-list.type';
import { FormGroup } from '@angular/forms';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'gcp-instance-list',
  templateUrl: './gcp-instance-list.component.html',
  styleUrls: ['./gcp-instance-list.component.scss'],
  providers: [GcpInstanceListService]
})
export class GcpInstanceListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() cloud: CostCalculatorCloudDetails;
  @Input() cloudUnits: CostCalculatorCloudUnitsFormData;
  @Output() instanceSelected = new EventEmitter<CostCalculatorGcpInstanceViewData>();

  private ngUnsubscribe = new Subject();

  regionList: Array<{ name: string, code: string }> = [];
  storageTypes: Array<{ name: string, code: string }> = [];
  machineClasses: string[] = gcpMachineClasses;
  machineFamilies: GCPInstanceType[] = [];
  machineSeries: GCPSeries[] = [];

  gcpInstanceFiltersForm: FormGroup;
  storageRate: number;
  instances: CostCalculatorGcpInstanceViewData[] = [];
  selectedInstance: CostCalculatorGcpInstanceViewData = new CostCalculatorGcpInstanceViewData();

  isPreemptibleExists: boolean = true;
  constructor(private gcpInstanceService: GcpInstanceListService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start('gcp-instance-prices');
    }, 0);
    this.getGCPFilterDropdowns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.cloudUnits.firstChange) {
      setTimeout(() => {
        this.spinnerService.start('gcp-instance-prices');
      }, 0);
      this.instances = [];
      this.selectedInstance = new CostCalculatorGcpInstanceViewData();
      this.getGCPFilterDropdowns();
    }
  }

  ngOnDestroy() {
    this.spinnerService.stop('gcp-instance-prices');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getGCPFilterDropdowns() {
    this.gcpInstanceService.getGCPFilterDropdowns().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.regionList = data[0];
      this.storageTypes = data[1];
      this.machineFamilies = data[2];
      this.machineSeries = data[2][0].series;
      if (this.cloudUnits.commitment.code != CostcalculatorCommitmentYearsCodes.ZERO) {
        this.isPreemptibleExists = false;
      } else {
        this.isPreemptibleExists = true;
      }
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again later'));
    })
  }

  buildForm() {
    const region: string = this.regionList[0].code;
    const storageType: string = this.storageTypes[0].code;
    const machineClass: string = this.machineClasses[0];
    const machineFamily: GCPInstanceType = this.machineFamilies[0];
    const machineSeries: GCPSeries = this.machineSeries[0];
    this.gcpInstanceFiltersForm = this.gcpInstanceService.buildGCPInstanceFiltersForm(region, storageType, machineClass, machineFamily, machineSeries);
    this.getGCPStorageRates();

    this.gcpInstanceFiltersForm.get('region').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.spinnerService.start('gcp-instance-prices');
      this.getGCPStorageRates();
    });

    this.gcpInstanceFiltersForm.get('storage_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.spinnerService.start('gcp-instance-prices');
      this.getGCPStorageRates();
    });

    this.gcpInstanceFiltersForm.get('machine_family').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: GCPInstanceType) => {
      this.machineSeries = val.series;
      this.gcpInstanceFiltersForm.get('series').setValue(val.series[0]);
    });

    this.gcpInstanceFiltersForm.get('series').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: GCPSeries) => {
      this.spinnerService.start('gcp-instance-prices');
      this.getMachineTypePrice(this.storageRate);
      if (val.code == 'E2') {
        this.isPreemptibleExists = false;
      } else {
        this.isPreemptibleExists = true;
      }
    });

    this.gcpInstanceFiltersForm.get('machine_class').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.spinnerService.start('gcp-instance-prices');
      this.getMachineTypePrice(this.storageRate);
    });
  }

  getGCPStorageRates() {
    this.gcpInstanceService.getStorageRates(this.gcpInstanceFiltersForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.storageRate = data.rate;
      this.getMachineTypePrice(data.rate)
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('gcp-instance-prices');
      this.notification.error(new Notification('Something went wrong. Please try again later'));
    });
  }

  getMachineTypePrice(storageRate: number) {
    this.gcpInstanceService.getMachineTypePrice(this.cloudUnits, this.gcpInstanceFiltersForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getMachineTypes(data, storageRate);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again later'));
    }, () => {
      this.spinnerService.stop('gcp-instance-prices');
    })
  }

  getMachineTypes(machineTypePrice: GCPCostCalculatorResponseItem, storageRate: number) {
    this.instances = this.gcpInstanceService.convertToViewData(this.cloudUnits, this.gcpInstanceFiltersForm.getRawValue(), machineTypePrice, storageRate);
    this.instanceSelected.emit(new CostCalculatorGcpInstanceViewData());
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
