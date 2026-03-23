import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { Category } from './knowledge-management-crud.type';
import { BaseUrlService } from '../base-url.service';

@Injectable()
export class KnowledgeManagementCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private userService: UserInfoService, private urlService: BaseUrlService) { }

  getCategories(): Observable<Category[]> {
    const headers = new HttpHeaders().set('Authorization', 'Bearer extremely-insecure-november')
      .set('x-tenant-id', this.userService.userOrgUUID)
      .set('x-user-id', this.userService.userDetails.uuid);
    return this.http.get<Category[]>(`${this.urlService.getBaseUrl()}category/`, { headers });
  }

  buildForm(): FormGroup {
    return this.builder.group({
      'files': [[], [Validators.required]],
      'category': [null, [Validators.required]]
    })
  }

  resetFormErrors() {
    return {
      'files': '',
      'category': '',
    }
  }

  validationMessages = {
    'files': {
      'required': 'File upload is required'
    },
    'category': {
      'required': 'Category is required'
    },
  }

  createResource(data: FormData) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer extremely-insecure-november')
      .set('x-tenant-id', this.userService.userOrgUUID)
      .set('x-user-id', this.userService.userDetails.uuid);
    return this.http.post(`${this.urlService.getBaseUrl()}documents`, data, { headers });
  }

  createCategory(name: string) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer extremely-insecure-november')
      .set('x-tenant-id', this.userService.userOrgUUID)
      .set('x-user-id', this.userService.userDetails.uuid);
    return this.http.post(`${this.urlService.getBaseUrl()}category/?name=${name}`, null, { headers });
  }

}
