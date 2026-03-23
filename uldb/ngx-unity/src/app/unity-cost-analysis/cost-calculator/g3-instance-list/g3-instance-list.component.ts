import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { G3InstanceListService, G3Filters } from './g3-instance-list.service';
import { CostCalculatorCloudDetails, CostCalculatorCloudUnitsFormData } from '../cost-calculator.service';
import { CostCalculatorG3InstanceViewData } from '../cost-calculator.type';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'g3-instance-list',
  templateUrl: './g3-instance-list.component.html',
  styleUrls: ['./g3-instance-list.component.scss'],
  providers: [G3InstanceListService]
})
export class G3InstanceListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() cloud: CostCalculatorCloudDetails;
  @Input() cloudUnits: CostCalculatorCloudUnitsFormData;
  @Output() instanceSelected = new EventEmitter<CostCalculatorG3InstanceViewData>();

  private ngUnsubscribe = new Subject();

  g3InstanceFiltersForm: FormGroup;
  regionList: Array<{ name: string, code: string }> = [];
  storageTypes: Array<{ name: string, code: string, price_per_GB: string }> = [];

  instances: CostCalculatorG3InstanceViewData[] = [];
  selectedInstance: CostCalculatorG3InstanceViewData = new CostCalculatorG3InstanceViewData();

  constructor(private g3InstanceService: G3InstanceListService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start('g3-instance-prices');
    }, 0);
    this.getG3FilterDropdowns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.cloudUnits.firstChange) {
      setTimeout(() => {
        this.spinnerService.start('g3-instance-prices');
      }, 0);
      this.selectedInstance = new CostCalculatorG3InstanceViewData();
      this.getG3FilterDropdowns();
    }
  }

  ngOnDestroy() {
    this.spinnerService.stop('g3-instance-prices');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getOptions(sliderControl: Array<string>) {
    const min: number = Number(sliderControl[0]);
    const max: number = Number(sliderControl[1]);
    let arr: Array<number> = []
    Array(max - (min - 1)).fill(min).map((e, i) => {
      arr.push(e + i);
    })
    return arr;
  }

  getG3FilterDropdowns() {
    this.g3InstanceService.getG3FilterDropdowns().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.regionList = data[0];
      this.storageTypes = data[1];
      setTimeout(() => {
        this.spinnerService.stop('g3-instance-prices');
      }, 0);
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get G3 storage types. Please try again later'));
    })
  }

  buildForm() {
    let filters: G3Filters = new G3Filters();
    filters.region = this.regionList[0].name;
    filters.storage_type = this.storageTypes[0];
    this.calculatePrice(filters);
    this.g3InstanceFiltersForm = this.g3InstanceService.buildG3InstanceFiltersForm(filters);

    this.g3InstanceFiltersForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: any) => {
      this.calculatePrice(val);
    });
  }

  calculatePrice(filters: G3Filters) {
    this.instances = this.g3InstanceService.convertToViewData(this.cloudUnits, filters);
    this.instanceSelected.emit(new CostCalculatorG3InstanceViewData());
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
