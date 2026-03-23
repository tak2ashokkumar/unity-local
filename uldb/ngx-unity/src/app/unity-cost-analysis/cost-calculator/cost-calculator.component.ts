import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { tabItems } from './tabs';
import { CostCalculatorService, CostCalculatorCloudDetails, CostCalculatorSliderOptions, CostCalculatorCommitmentYear, CostCalculatorSelectedInstanceData, InstanceComparator, CostCalculatorCloudUnitsFormData, CLOUD_TYPES, CostCalculatorSliderOptionUnits, cloudList, costcalculatorCommitmentYears } from './cost-calculator.service';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { SelfHelpPopupService } from 'src/app/shared/self-help-popup/self-help-popup.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AbstractCostComparatorViewData, CostCalculatorAWSInstanceViewData, CostCalculatorAzureInstanceViewData, CostCalculatorGcpInstanceViewData, CostCalculatorG3InstanceViewData } from './cost-calculator.type';
import { takeUntil } from 'rxjs/operators';
import { SelfHelpEndpointMapping } from 'src/app/shared/self-help-popup/self-help-endpoint.enum';

@Component({
  selector: 'cost-calculator',
  templateUrl: './cost-calculator.component.html',
  styleUrls: ['./cost-calculator.component.scss'],
  providers: [CostCalculatorService]
})
export class CostCalculatorComponent implements OnInit, OnDestroy {
  tabItems: TabData[] = tabItems;
  private ngUnsubscribe = new Subject();
  CLOUD_TYPES = CLOUD_TYPES;

  clouds: CostCalculatorCloudDetails[] = cloudList;
  selectedClouds: CostCalculatorCloudDetails[] = [];

  cloudUnitsForm: FormGroup;
  cloudUnitsFormOptions: CostCalculatorSliderOptions;
  cloudUnitsFormErrors: any;
  cloudUnitsFormValidationMessages: any;
  cloudUnits: CostCalculatorCloudUnitsFormData = null;
  commitmentYears: CostCalculatorCommitmentYear[] = costcalculatorCommitmentYears;

  costComparatorData: CostCalculatorSelectedInstanceData = new CostCalculatorSelectedInstanceData();
  instancesToCompare: InstanceComparator[] = [];

  constructor(private costCalculatorService: CostCalculatorService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private selfHelpPopupService: SelfHelpPopupService) { }

  ngOnInit() {
    this.buildCloudUnitsForm();
  }

  ngOnDestroy() {
    this.reset();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getCloudState(cloud: CostCalculatorCloudDetails) {
    let className = '';
    if (cloud.isDisabled || this.cloudUnits) {
      className = 'nopointerevents';
    }
    if (cloud.isSelected) {
      className += ' active';
    }
    return className;
  }

  selectCloud(cloud: CostCalculatorCloudDetails, index: number) {
    const existsAt = this.selectedClouds.indexOf(cloud);
    if (existsAt == -1) {
      this.clouds[index].isSelected = true;
      this.selectedClouds.push(cloud);
    } else {
      this.clouds[index].isSelected = false;
      this.selectedClouds.splice(existsAt, 1);
    }
  }

  buildCloudUnitsForm() {
    this.cloudUnitsFormOptions = this.costCalculatorService.cloudUnitsFormOptions();
    this.cloudUnitsForm = this.costCalculatorService.buildCloudUnitsForm(this.commitmentYears[0]);
    this.cloudUnitsFormErrors = this.costCalculatorService.resetcloudUnitsFormErrors();
    this.cloudUnitsFormValidationMessages = this.costCalculatorService.cloudUnitsValidationMessages;
  }

  onCPUFullSliderValueChange() {
    const newOptions: CostCalculatorSliderOptionUnits = Object.assign({}, this.cloudUnitsFormOptions.cpuMainOptions);
    newOptions.floor = this.cloudUnitsForm.get('cpuFullSliderControl').value[0];
    newOptions.ceil = this.cloudUnitsForm.get('cpuFullSliderControl').value[1];
    this.cloudUnitsFormOptions.cpuMainOptions = newOptions;
    setTimeout(() => {
      this.cloudUnitsForm.get('cpuMainSliderControl').patchValue([newOptions.floor, newOptions.ceil]);
    });
  }

  onRAMFullSliderValueChange() {
    const newOptions: CostCalculatorSliderOptionUnits = Object.assign({}, this.cloudUnitsFormOptions.ramMainOptions);
    newOptions.floor = this.cloudUnitsForm.get('ramFullSliderControl').value[0];
    newOptions.ceil = this.cloudUnitsForm.get('ramFullSliderControl').value[1];
    this.cloudUnitsFormOptions.ramMainOptions = newOptions;
    setTimeout(() => {
      this.cloudUnitsForm.get('ramMainSliderControl').patchValue([newOptions.floor, newOptions.ceil]);
    });
  }

  submitcloudUnitsForm() {
    if (!this.selectedClouds.length) {
      this.notification.error(new Notification('Select Clouds to Compare.'));
      return;
    }
    if (this.cloudUnitsForm.invalid) {
      this.cloudUnitsFormErrors = this.utilService.validateForm(this.cloudUnitsForm, this.cloudUnitsFormValidationMessages, this.cloudUnitsFormErrors);
      this.cloudUnitsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.cloudUnitsFormErrors = this.utilService.validateForm(this.cloudUnitsForm, this.cloudUnitsFormValidationMessages, this.cloudUnitsFormErrors);
      });
    } else {
      this.cloudUnits = this.cloudUnitsForm.getRawValue();
    }
  }

  updateInstanceSelected(event: AbstractCostComparatorViewData) {
    switch (event.constructor) {
      case CostCalculatorAWSInstanceViewData:
        let selectedAWSInstance = <CostCalculatorAWSInstanceViewData>event;
        if (selectedAWSInstance.instanceType) {
          this.costComparatorData.aws = selectedAWSInstance;
        } else {
          this.costComparatorData.aws = null;
        }
        break;
      case CostCalculatorAzureInstanceViewData:
        let selectedAzureInstance = <CostCalculatorAzureInstanceViewData>event;
        if (selectedAzureInstance.name) {
          this.costComparatorData.azure = selectedAzureInstance;
        } else {
          this.costComparatorData.azure = null;
        }
        break;
      case CostCalculatorGcpInstanceViewData:
        let selectedGCPInstance = <CostCalculatorGcpInstanceViewData>event;
        if (selectedGCPInstance.instanceType) {
          this.costComparatorData.gcp = selectedGCPInstance;
        } else {
          this.costComparatorData.gcp = null;
        }
        break;
      case CostCalculatorG3InstanceViewData:
        let selectedG3Instance = <CostCalculatorG3InstanceViewData>event;
        if (selectedG3Instance.totalBill) {
          this.costComparatorData.g3_cloud = selectedG3Instance;
        } else {
          this.costComparatorData.g3_cloud = null;
        }
        break;
      default:
        this.notification.error(new Notification('Something went wrong. Please try again later.'));
        break;
    }
  }

  isInstancesFromAllCloudsSelected(datoToCompare: CostCalculatorSelectedInstanceData): boolean {
    let isInstanceFromAllCloudsSelected: boolean = true;
    this.selectedClouds.map(cloud => {
      if (!datoToCompare[cloud.name]) {
        isInstanceFromAllCloudsSelected = false;
      }
    });
    return isInstanceFromAllCloudsSelected;
  }

  addInstanceToCompare() {
    if (this.isInstancesFromAllCloudsSelected(this.costComparatorData)) {
      this.clouds.map(cloud => {
        if (this.costComparatorData[cloud.name]) {
          cloud.totalPrice += this.costComparatorData[cloud.name].totalBill;
          cloud.instancesSelected += Number(this.costComparatorData[cloud.name].instancesNumber);
        }
      })
      this.instancesToCompare.push(this.costCalculatorService.getInstanceComparisonData(this.costComparatorData));
    } else {
      this.notification.error(new Notification('Select Instances from all Clouds to Compare.'));
    }
  }

  deleteInstance(targetIndex: number) {
    this.clouds.map(cloud => {
      if (this.instancesToCompare[targetIndex][cloud.name]) {
        cloud.totalPrice -= this.instancesToCompare[targetIndex][cloud.name].totalBill;
        cloud.instancesSelected -= this.instancesToCompare[targetIndex].instanceCount;
      }
    })
    this.instancesToCompare.splice(targetIndex, 1);
  }

  resetToInitialControls() {
    const newCPUOptions: CostCalculatorSliderOptionUnits = Object.assign({}, this.cloudUnitsFormOptions.cpuMainOptions);
    newCPUOptions.floor = 1;
    newCPUOptions.ceil = 50;

    const newRAMOptions: CostCalculatorSliderOptionUnits = Object.assign({}, this.cloudUnitsFormOptions.cpuMainOptions);
    newRAMOptions.floor = 1;
    newRAMOptions.ceil = 100;

    this.cloudUnitsForm.get('storage').patchValue('');
    this.cloudUnitsForm.get('instances_number').patchValue('');
    setTimeout(() => {
      this.cloudUnitsForm.get('cpuMainSliderControl').patchValue([1, 10]);
      this.cloudUnitsForm.get('cpuFullSliderControl').patchValue([1, 50]);
      this.cloudUnitsForm.get('ramMainSliderControl').patchValue([1, 32]);
      this.cloudUnitsForm.get('ramFullSliderControl').patchValue([1, 100]);
      this.cloudUnitsFormOptions.cpuMainOptions = newCPUOptions;
      this.cloudUnitsFormOptions.ramMainOptions = newRAMOptions;
    }, 100);
  }

  reset() {
    this.selectedClouds = [];
    this.clouds.map(cloud => {
      cloud.isSelected = false;
      cloud.instancesSelected = 0;
      cloud.totalPrice = 0;
    });
    this.resetToInitialControls();
    this.buildCloudUnitsForm();
    this.cloudUnits = null;
    this.costComparatorData = new CostCalculatorSelectedInstanceData();
    this.instancesToCompare = [];
  }

  showHelp() {
    this.selfHelpPopupService.showHelp(SelfHelpEndpointMapping.COST_CALCULATOR);
  }

}
