import { Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { AzureInstanceListService } from './azure-instance-list.service';
import { CostCalculatorCloudDetails, CostCalculatorCloudUnitsFormData } from '../cost-calculator.service';
import { CostCalculatorAzureInstanceViewData } from '../cost-calculator.type';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { CostCalculatorAzureStorageRate } from './azure-instance-list.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'azure-instance-list',
  templateUrl: './azure-instance-list.component.html',
  styleUrls: ['./azure-instance-list.component.scss'],
  providers: [AzureInstanceListService]

})
export class AzureInstanceListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() cloud: CostCalculatorCloudDetails;
  @Input() cloudUnits: CostCalculatorCloudUnitsFormData;
  @Output() instanceSelected = new EventEmitter<CostCalculatorAzureInstanceViewData>();

  private ngUnsubscribe = new Subject();

  regionList: Array<{ name: string, code: string }> = [];
  storageTypes: Array<{ name: string, code: string }> = [];
  tierValues: string[] = [];

  azureInstanceFiltersForm: FormGroup;
  storageRate: CostCalculatorAzureStorageRate;
  instances: CostCalculatorAzureInstanceViewData[] = [];
  selectedInstance: CostCalculatorAzureInstanceViewData = new CostCalculatorAzureInstanceViewData();

  constructor(private azureService: AzureInstanceListService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start('azure-instance-prices');
    }, 0);
    this.getAzureFilterDropdowns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.cloudUnits.firstChange) {
      setTimeout(() => {
        this.spinnerService.start('azure-instance-prices');
      }, 0);
      this.instances = [];
      this.selectedInstance = new CostCalculatorAzureInstanceViewData();
      this.getAzureStorageRates();
    }
  }

  ngOnDestroy() {
    this.spinnerService.stop('azure-instance-prices');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getAzureFilterDropdowns() {
    this.azureService.getAzureFilterDropdowns().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.regionList = data[0];
      this.tierValues = data[1];
      this.storageTypes = data[2];
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again later.'));
    })
  }

  buildForm() {
    const region: string = this.regionList[0].code;
    const tier: string = this.tierValues[2];
    const storageType: string = this.storageTypes[0].code;
    this.azureInstanceFiltersForm = this.azureService.buildAzureInstanceFiltersForm(region, tier, storageType);
    this.getAzureStorageRates();
    this.azureInstanceFiltersForm.get('region').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.selectedInstance = new CostCalculatorAzureInstanceViewData();
      this.getInstancePrices();
    });

    this.azureInstanceFiltersForm.get('tier').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.selectedInstance = new CostCalculatorAzureInstanceViewData();
      this.getInstancePrices();
    });

    this.azureInstanceFiltersForm.get('storage_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      this.getAzureStorageRates();
    });
  }

  getAzureStorageRates() {
    this.azureService.getStorageRates(this.cloudUnits.storage, this.azureInstanceFiltersForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.storageRate = data;
      this.getInstancePrices();
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('azure-instance-prices');
      this.notification.error(new Notification('Something went wrong. Please try again later'));
    });
  }

  getInstancePrices() {
    this.azureService.getInstancePrices(this.cloudUnits, this.azureInstanceFiltersForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.instances = this.azureService.convertToViewData(data, this.cloudUnits, this.azureInstanceFiltersForm.getRawValue(), this.storageRate);
      this.instanceSelected.emit(new CostCalculatorAzureInstanceViewData());
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong. Please try again later'))
    }, () => {
      this.spinnerService.stop('azure-instance-prices');
    });
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
