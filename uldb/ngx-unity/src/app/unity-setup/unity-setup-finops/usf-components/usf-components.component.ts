import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Categories, NgSelectOptions, SectionStates, UsfComponentsService } from './usf-components.service';

@Component({
  selector: 'usf-components',
  templateUrl: './usf-components.component.html',
  styleUrls: ['./usf-components.component.scss'],
  providers: []
})
export class UsfComponentsComponent implements OnInit, OnDestroy {

  @Input() dropdownData: NgSelectOptions;

  private ngUnsubscribe = new Subject();

  form: FormGroup;
  formErrors: any;
  validationMessages: any;

  categories = _clone(Categories);
  sectionStates = SectionStates;
  customDropdownData: NgSelectOptions = {}
  networkResourceTypes: string[] = ['Network DNS', 'Network Port'];
  managementToolsList: string[] = ['ITSM/CMDB', 'Monitoring', 'Orchestration', 'Patching', 'FinOps Tool'];

  constructor(private service: UsfComponentsService,
    private utilService: AppUtilityService,
    private builder: FormBuilder) {
    this.service.submitAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.submit();
    });
  }

  ngOnInit(): void {
    if (!this.dropdownData) {
      this.dropdownData = {};
    }
    this.buildForm(null);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm(data: any) {
    // this.form = this.service.buildForm(null);
    this.form = this.service.form;
    this.formErrors = this.service.resetFormErrors();
    this.validationMessages = this.service.validationMessages;
    this.form?.get('network') && this.manageNetworkFormSubscriptions();
    this.form?.get('management') && this.manageManagementFormSubscriptions();
    let selectedCategories = this.form?.get('sub_categories').value;
    this.categories.forEach((c) => {
      c.isSelected = selectedCategories.includes(c.name);
    })

  }

  manageNetworkFormSubscriptions() {
    const nwGroup = this.form.get('network') as FormGroup;
    nwGroup.get('network_resource_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      if (val.includes('Network DNS')) {
        nwGroup.get('network_dns_metric_type')?.enable();
        nwGroup.get('network_dns_metric_unit')?.enable();
        nwGroup.get('network_dns_rate_value')?.enable();
        nwGroup.get('network_dns_rate_frequency')?.enable();
      } else {
        nwGroup.get('network_dns_metric_type')?.disable();
        nwGroup.get('network_dns_metric_unit')?.disable();
        nwGroup.get('network_dns_rate_value')?.disable();
        nwGroup.get('network_dns_rate_frequency')?.disable();
      }
      if (val.includes('Network Port')) {
        nwGroup.get('network_port_metric_type')?.enable();
        nwGroup.get('network_port_metric_unit')?.enable();
        nwGroup.get('network_port_rate_value')?.enable();
        nwGroup.get('network_port_rate_frequency')?.enable();
      } else {
        nwGroup.get('network_port_metric_type')?.disable();
        nwGroup.get('network_port_metric_unit')?.disable();
        nwGroup.get('network_port_rate_value')?.disable();
        nwGroup.get('network_port_rate_frequency')?.disable();
      }
    })
  }

  get detailsArray(): FormArray {
    return this.form.get('management.details') as FormArray;
  }

  manageManagementFormSubscriptions() {
    const mGroup = this.form.get('management') as FormGroup;
    mGroup.get('management_tools').valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedTools: string[]) => {
        if (!mGroup.get('details')) {
          mGroup.addControl('details', this.builder.array([]));
        }
        const detailsArray = mGroup.get('details') as FormArray;
        selectedTools.forEach(tool => {
          const exists = detailsArray.controls.some(ctrl => ctrl.get('name')?.value === tool);
          if (!exists) {
            detailsArray.push(
              this.builder.group({
                name: [tool],
                metric: ['Per Workload'],
                rate: [null]
              })
            );
          }
        });
        detailsArray.controls
          .filter(ctrl => !selectedTools.includes(ctrl.get('name')?.value))
          .forEach(ctrl => {
            detailsArray.removeAt(detailsArray.controls.indexOf(ctrl));
          });
      });
  }

  updateForm() {
    this.service.updateForm(this.form);
  }

  submit() {
    this.updateForm();
    this.service.updateDropdownData(this.customDropdownData);
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      })
    }
  }

  manageCategory(selectedCategory: any) {
    selectedCategory.isSelected = !selectedCategory.isSelected;
    const selectedCategories = this.categories.filter(c => c.isSelected).map(c => c.name);
    this.form.get('sub_categories').setValue(selectedCategories);
    this.addOrRemoveControls(this.form.get('sub_categories').value);

    this.formErrors = this.service.resetFormErrors(); //need to confirm
    this.form.get('network') && this.manageNetworkFormSubscriptions();
    this.form.get('management') && this.manageManagementFormSubscriptions();
  }

  addOrRemoveControls(selectedCategories: string[]) {
    Object.keys(this.categoryControlMap).forEach((category) => {
      const controlExists = !!this.form.get(category.toLowerCase());
      if (selectedCategories.includes(category) && !controlExists) {
        this.form.addControl(category.toLowerCase(), this.categoryControlMap[category]());
      } else if (!selectedCategories.includes(category) && controlExists) {
        this.form.removeControl(category.toLowerCase());
      }
    });
  }

  private categoryControlMap: { [key: string]: () => FormGroup } = {
    'CPU': () => this.service.buildCpuGroup(null),
    'RAM': () => this.service.buildRamGroup(null),
    'Storage': () => this.service.buildStorageGroup(null),
    'Network': () => this.service.buildNetworkGroup(null),
    'Backup': () => this.service.buildBackupGroup(null),
    'OS': () => this.service.buildOsGroup(null),
    'Operational': () => this.service.buildOperationalGroup(null),
    'Fixed': () => this.service.buildFixedGroup(null),
    'Management': () => this.service.buildManagementGroup(null),
  };

  toggleSection(section: string) {
    this.sectionStates[section] = !this.sectionStates[section];
  }

  addCustomValue(field: string) {
    return (name: string) => {
      this.customDropdownData[field] = [];
      this.customDropdownData[field].push(name);
      // if (!this.customDropdownData[field]) {
      // }
      // if (!this.dropdownData[field]) {
      //   this.dropdownData[field] = [];
      // }
      // this.dropdownData[field] = [...this.dropdownData[field], name];
      return name;
    };
  }
}
