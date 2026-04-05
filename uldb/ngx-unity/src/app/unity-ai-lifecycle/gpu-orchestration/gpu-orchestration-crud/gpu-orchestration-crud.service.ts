import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';

@Injectable()
export class GpuOrchestrationCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getGpuContainerDetails(id: string): Observable<any> {
    // Stubbed: Replace with actual endpoint
    return of({
      cloud: 'Azure',
      account: 'Unity-Production',
      account_region: 'East US',
      azure_plan: 'Standard_NC6',
      azure_image_offer: 'Ubuntu-1804',
      storage_account_type: 'Premium_LRS',
      image_publisher: 'Canonical',
      rg_name: 'RG-GPU-AI',
      vm_name: 'GPU-Node-01'
    });
  }

  getDropdownData(): Observable<any> {
    return forkJoin({
      clouds: of(['Azure', 'AWS', 'GCP', 'Private Cloud']),
      accounts: of(['Unity-Production', 'Unity-Staging', 'Unity-Development']),
      regions: of(['East US', 'West US', 'Central US', 'North Europe', 'South Asia']),
      plans: of(['Standard_NC6', 'Standard_NC12', 'Standard_ND6s']),
      imageOffers: of(['Ubuntu-1804', 'Ubuntu-2004', 'CentOS-7.5']),
      storageTypes: of(['Premium_LRS', 'Standard_LRS', 'StandardSSD_LRS']),
      publishers: of(['Canonical', 'RedHat', 'Microsoft'])
    });
  }

  buildForm(data: any): FormGroup {
    return this.builder.group({
      'cloud': [data ? data.cloud : '', [Validators.required]],
      'account': [data ? data.account : '', [Validators.required]],
      'account_region': [data ? data.account_region : '', [Validators.required]],
      'azure_plan': [data ? data.azure_plan : '', [Validators.required]],
      'azure_image_offer': [data ? data.azure_image_offer : '', [Validators.required]],
      'storage_account_type': [data ? data.storage_account_type : '', [Validators.required]],
      'image_publisher': [data ? data.image_publisher : '', [Validators.required]],
      'rg_name': [data ? data.rg_name : '', [Validators.required]],
      'vm_name': [data ? data.vm_name : '', [Validators.required]],
    });
  }

  resetFormErrors() {
    return {
      'cloud': '',
      'account': '',
      'account_region': '',
      'azure_plan': '',
      'azure_image_offer': '',
      'storage_account_type': '',
      'image_publisher': '',
      'rg_name': '',
      'vm_name': '',
    };
  }

  formValidationMessages = {
    'cloud': { 'required': 'Cloud is required' },
    'account': { 'required': 'Account is required' },
    'account_region': { 'required': 'Region is required' },
    'azure_plan': { 'required': 'Azure Plan is required' },
    'azure_image_offer': { 'required': 'Azure Image Offer is required' },
    'storage_account_type': { 'required': 'Storage Account Type is required' },
    'image_publisher': { 'required': 'Image Publisher is required' },
    'rg_name': { 'required': 'RG Name is required' },
    'vm_name': { 'required': 'VM Name is required' },
  };

  createGpuContainer(data: any): Observable<any> {
    // Stubbed
    return of(data);
  }

  updateGpuContainer(id: string, data: any): Observable<any> {
    // Stubbed
    return of(data);
  }
}
