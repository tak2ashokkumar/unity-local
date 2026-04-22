import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PDUCRUDCabinet, PDUCRUDModel } from 'src/app/app-shared-crud/pdu-crud/pdu-crud.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { BulkUpdateFieldType } from '../entities/bulk-update-field.type';
import { DeviceDetailsBulkUpdatePopupService, fieldDependencies } from './device-details-bulk-update-popup.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'device-details-bulk-update-popup',
  templateUrl: './device-details-bulk-update-popup.component.html',
  styleUrls: ['./device-details-bulk-update-popup.component.scss'],
  providers: [DeviceDetailsBulkUpdatePopupService]
})
export class DeviceDetailsBulkUpdatePopupComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  @Input('fieldsList') fieldsList: BulkUpdateFieldType[];
  @Input('deviceType') deviceType: string;
  @Output() close = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<any>();
  private rowIdCounter = 0;

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  dependencyError: string;
  rowIdMap: Map<number, number> = new Map(); //<formIndex,rowId>
  dependentOptionsMap: { [rowId: number]: PDUCRUDCabinet[] | DeviceCRUDPrivateCloudFast[] | PDUCRUDModel[] } = {};
  fieldDependencies = fieldDependencies

  selectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "name",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  constructor(private builder: FormBuilder,
    private bulkUpdateService: DeviceDetailsBulkUpdatePopupService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
  ) { }

  ngOnInit(): void {
    this.buildBulkUpdateForm();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildBulkUpdateForm() {
    this.form = this.bulkUpdateService.buildBulkUpdateForm();
    this.formErrors = this.bulkUpdateService.resetBulkUpdateFormErrors();

    if (this.fields) {
      this.rowIdMap.set(0, this.rowIdCounter++);
      for (let i = 1; i < this.fields.length; i++) {
        this.rowIdMap.set(i, this.rowIdCounter++);
        this.formErrors.fields.push(this.bulkUpdateService.getBulkUpdateFormErrors());
      }
    }

    this.validationMessages = this.bulkUpdateService.validationMessages;
  }

  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  getRowId(index: number): number {
    return this.rowIdMap.get(index);
  }

  isFieldAlreadySelected(fieldName: string, currentIndex: number): boolean {
    return this.form.get('fields')?.value?.some((f: any, idx: number) =>
      idx !== currentIndex && f.field === fieldName
    );
  }


  onFieldChange(selectedFieldName: string, index: number) {
    const selectedField = this.fieldsList.find(f => f.field_name === selectedFieldName);
    console.log('selectedField : ', selectedField);
    const control = this.fields.at(index) as FormGroup;

    if (!selectedField) return;

    // Always remove previous edit_value control first
    if (control.contains('edit_value')) {
      control.removeValidators(Validators.required);
      control.removeControl('edit_value');
    }

    // Handle dependency check
    let dependentValue = '';
    let requiredField = '';
    if (selectedField.dependent_field) {
      requiredField = selectedField.dependent_field.toLowerCase();

      const dependentControl = this.fields.controls.find(ctrl =>
        ctrl.get('field')?.value?.toLowerCase() === requiredField
      );

      if (!dependentControl) {
        this.dependencyError = `Please select "${requiredField}" before selecting "${selectedField.display_name}".`;
        return;
      } else {
        dependentValue = dependentControl.get('edit_value')?.value;
      }
    }

    // Add new control based on field type
    switch (selectedField.field_type) {
      case 'text':
      case 'Char':
        control.addControl('edit_value', this.builder.control('', Validators.required));
        break;
      case 'Integer':
        control.addControl('edit_value', this.builder.control('', [Validators.required, Validators.pattern(/^\d+$/)]));
        break;
      case 'Choice':
      case 'dropdown':
        control.addControl('edit_value', new FormControl('', [Validators.required]));
        break;
      case 'Boolean':
        control.addControl('edit_value', new FormControl(false, [Validators.required]));
        break;
      case 'multi_select_dropdown':
        control.addControl('edit_value', new FormControl([], [Validators.required]));
        break;
      case 'dependent_dropdown':
        control.addControl('edit_value', this.builder.control('', Validators.required));
        this.getDependentDropDownOptions(dependentValue, selectedField.field_name, index);;
        break;
    }


    // Clear dependency error
    this.dependencyError = '';
  }


  onDropdownChange(event: any, index: number): void {
    const control = (this.fields.at(index) as FormGroup).get('edit_value');
    const selectedValue = event;
    const selectedField = (this.fields.at(index) as FormGroup).get('field')?.value;

    // Update current field value
    if (control) {
      control.setValue(selectedValue);
      control.markAsDirty();
      control.updateValueAndValidity();
    }

    // ⚠️ Flush dependent fields if the changed field is "datacenter"
    if (selectedField === 'datacenter' && selectedValue) {
      const dependentFieldsToFlush = ['cloud', 'cabinet'];
      this.fields.controls.forEach((ctrl, i) => {
        const fieldName = ctrl.get('field')?.value;
        if (dependentFieldsToFlush.includes(fieldName)) {
          const depControl = ctrl.get('edit_value');
          if (depControl) {
            depControl.setValue('');// clean reset
          }
          // Refresh options for this field
          this.getDependentDropDownOptions(selectedValue, fieldName, i);
        }
      });
    } else {
      const dependentField = fieldDependencies[selectedField];

      // 🚀 Proceed with default dependent field behavior
      if (!dependentField || !selectedValue) return;

      const alreadyExists = this.fields.controls.some(ctrl => ctrl.get('field')?.value === dependentField);

      if (alreadyExists) {
        const existingIndex = this.fields.controls.findIndex(ctrl => ctrl.get('field')?.value === dependentField);
        const existingControl = this.fields.at(existingIndex)?.get('edit_value');
        if (existingControl) {
          existingControl.setValue(''); // 💡 Clear previous value after updating options
        }
        this.getDependentDropDownOptions(selectedValue, selectedField, existingIndex);
        return;
      }

      const newGroup = this.builder.group({
        field: [dependentField, Validators.required]
        // edit_value will be added in onFieldChange
      });

      this.fields.push(newGroup);
      this.formErrors.fields.push(this.bulkUpdateService.getBulkUpdateFormErrors());

      const newIndex = this.fields.length - 1;
      this.rowIdMap.set(newIndex, this.rowIdCounter++);
      this.onFieldChange(dependentField, newIndex);
    }
  }




  getDependentDropDownOptions(value: string, field: string, index: number) {
    const rowId = this.getRowId(index);
    if (rowId == null) return;

    this.spinnerService.start('main');
    this.bulkUpdateService.getDependentDropDownOptions(value, field, this.deviceType).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.dependentOptionsMap[rowId] = res;
      this.spinnerService.stop('main');
    });
  }

  getFieldType(fieldName: string): string | undefined {
    return this.fieldsList.find(f => f.field_name === fieldName)?.field_type;
  }

  getFieldOptions(fieldName: string): any[] {
    return this.fieldsList.find(f => f.field_name === fieldName)?.field_options || [];
  }

  getFieldDisplayName(fieldName: string): string {
    const field = this.fieldsList.find(f => f.field_name === fieldName);
    return field?.display_name || 'Edit Value';
  }

  addField(i: number) {
    let editFormGroup = <FormGroup>this.fields.at(i);
    if (editFormGroup.invalid) {
      this.formErrors.fields[i] = this.utilService.validateForm(editFormGroup, this.validationMessages.fields, this.formErrors.fields[i]);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors.fields[i] = this.utilService.validateForm(editFormGroup, this.validationMessages.fields, this.formErrors.fields[i]);
      });

    }
    else if (this.dependencyError) {
      return;
    } else {
      this.createFormGroup()
    }

  }


  createFormGroup() {
    const newGroup = this.builder.group({
      field: ['', Validators.required]
      // edit_value will be added dynamically on selection
    });
    this.formErrors.fields.push(this.bulkUpdateService.getBulkUpdateFormErrors());
    const newIndex = this.fields.length;
    this.fields.push(newGroup);
    this.rowIdMap.set(newIndex, this.rowIdCounter++);
  }

  removeField(index: number): void {
    const currentField = this.fields.at(index)?.get('field')?.value;
    if (!currentField) return;
    const removeIndices: number[] = [];

    switch (currentField) {
      case 'model':
        if (index > 0 && this.fields.at(index - 1)?.get('field')?.value === 'manufacturer') {
          removeIndices.push(index, index - 1);
        } else {
          removeIndices.push(index);
        }
        break;

      case 'manufacturer':
        if (index + 1 < this.fields.length && this.fields.at(index + 1)?.get('field')?.value === 'model') {
          removeIndices.push(index + 1, index);
        } else {
          removeIndices.push(index);
        }
        break;

      case 'datacenter':
        removeIndices.push(index);
        this.fields.controls.forEach((ctrl, i) => {
          const fieldName = ctrl.get('field')?.value;
          if (['cloud', 'cabinet'].includes(fieldName)) {
            removeIndices.push(i);
          }
        });
        break;

      default:
        removeIndices.push(index);
    }

    // 🔁 Remove in reverse order to avoid index shift
    [...new Set(removeIndices.sort((a, b) => b - a))].forEach(i => {
      this.removeFieldAtIndex(i);
    });

    this.rebuildRowIdMap();

    // Optional: if the form is empty, recreate an initial row
    if (!this.fields.length) {
      this.createFormGroup();
    }
  }



  private removeFieldAtIndex(index: number): void {
    const rowId = this.rowIdMap.get(index);
    this.fields.removeAt(index);
    this.formErrors.fields.splice(index, 1);
    this.rowIdMap.delete(index);

    if (rowId !== undefined) {
      delete this.dependentOptionsMap[rowId];
    }
  }

  private rebuildRowIdMap(): void {
    const updatedMap = new Map<number, number>();
    this.fields.controls.forEach((_, newIdx) => {
      const oldRowId = Array.from(this.rowIdMap.values())[newIdx];
      if (oldRowId !== undefined) {
        updatedMap.set(newIdx, oldRowId);
      }
    });
    this.rowIdMap = updatedMap;
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      });
    } else if (this.dependencyError) {
      return;
    } else {
      const rawFields = this.form.getRawValue()?.fields;
      const initialData = this.bulkUpdateService.convertBulkUpdateFormData(rawFields);
      const finalData = this.bulkUpdateService.transformSubmittedData(initialData, this.deviceType);
      this.onSubmit.emit(finalData);
    }
  }

  closePopup() {
    this.close.emit(true);
  }

}
