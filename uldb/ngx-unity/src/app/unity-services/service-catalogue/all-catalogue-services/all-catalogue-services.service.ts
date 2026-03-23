import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GET_SERVICE_CATALOGUE_TERMS, GET_SERVICE_CATELOGUES_BY_TERM, GET_SERVICE_CATEGORY, GET_SERVICE_PROVIDERS } from 'src/app/shared/api-endpoint.const';
import { ServiceCatalogue } from '../service-catalogue.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';

@Injectable()
export class AllCatalogueServicesService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService) { }

  getTerms(): Observable<string[]> {
    // return of(["1", "2", "3", "4", "5"])
    return this.http.get<string[]>(GET_SERVICE_CATALOGUE_TERMS());
  }

  convertToTermViewData(terms: string[]) {
    let termList: TermData[] = [];
    terms.map(term => {
      let a: TermData = new TermData();
      a.name = term;
      termList.push(a);
    })
    return termList;
  }

  getCatalogueByTerm(term: string, criteria: SearchCriteria): Observable<ServiceCatalogue[]> {
    // return of([{ "id": 27, "device_type": "Cabinet", "description": "Colo:Fiber connections", "provider": "UnitedLayer", "charge": "Remote Hands charge at 30min increment(Hourly Rate-$150:8am -5pm ; $250:5:00PM - 8am)" }, { "id": 28, "device_type": "Cabinet", "description": "Colo:KVM connection", "provider": "UnitedLayer", "charge": "Remote Hands charge at 30min increment(Hourly Rate-$150:8am -5pm ; $250:5:00PM - 8am)" }, { "id": 15, "device_type": "Cabinet", "description": "Test1", "provider": "UnitedLayer", "charge": "$200" }, { "id": 5, "device_type": "Firewall", "description": "Firewall Configuration Change", "provider": "UnitedLayer", "charge": "$200" }, { "id": 11, "device_type": "Storage", "description": "test1", "provider": "UnitedLayer", "charge": "200" }, { "id": 66, "device_type": "Storage", "description": "Expansion 100GB", "provider": "UnitedLayer", "charge": "$0.200 Per GB" }, { "id": 74, "device_type": "Virtual Machine", "description": "Drive expansion(Included in IaaS)", "provider": "UnitedLayer", "charge": "$200" }, { "id": 75, "device_type": "Virtual Machine", "description": "vRAM upgrade(Included in IaaS)", "provider": "UnitedLayer", "charge": "$200" }])
    return this.tableService.getData<ServiceCatalogue[]>(GET_SERVICE_CATELOGUES_BY_TERM(term), criteria);
  }

  convertToViewData(catalogs: ServiceCatalogue[], term: TermData): ServiceCatalogueViewData[] {
    let viewData: ServiceCatalogueViewData[] = [];
    catalogs.map(catalog => {
      let a: ServiceCatalogueViewData = new ServiceCatalogueViewData;
      a.id = catalog.id;
      a.serviceCategory = catalog.device_type;
      a.provider = catalog.provider;
      a.serviceName = catalog.description || 'N/A';
      a.charge = catalog.charge || 'N/A';
      a.term = term;
      viewData.push(a);
    })
    return viewData;
  }

  getServiceCategory(): Observable<Array<string>> {
    return this.http.get<Array<string>>(GET_SERVICE_CATEGORY());
  }

  getServiceProviders(): Observable<Array<string>> {
    return this.http.get<Array<string>>(GET_SERVICE_PROVIDERS());
  }
}

export class TermData {
  name: string;
  get displayName() {
    return this.name.concat(Number(this.name) > 1 ? ' Years' : ' Year');
  }
}

export class ServiceCatalogueViewData {
  id: number;
  serviceCategory: string;
  provider: string;
  serviceName: string;
  charge: string;
  term: TermData;
}