import { Injectable } from '@angular/core';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { HttpClient } from '@angular/common/http';
import { GET_VM_MIGRATIONS, PRIVATE_CLOUDS, GET_VM_MIGRATIONS_FROM_DB, VMWARE_AUTH_CHECK, GET_AWS_CLOUD_LIST, GET_AWS_BUCKET_DATA, GET_AZURE_CLOUD_LIST, GET_AZURE_RESOURCE_GROUP, GET_AZURE_STORAGE_ACCOUNT, GET_AZURE_CONTAINER } from 'src/app/shared/api-endpoint.const';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { switchMap, take, map } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class VmBackupService {
  constructor(
    private http: HttpClient,
    private builder: FormBuilder,
    private appService: AppLevelService,
    private tableService: TableApiServiceService) { }

  getVMMigrations(cloud: PrivateCLoudFast) {
    return this.http.get<CeleryTask>(GET_VM_MIGRATIONS(cloud.uuid, cloud.platform_type))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 4).pipe(take(1))), take(1));
  }

  getVMMigrationsFromDB<T>(criteria: SearchCriteria, platform_type: string): Observable<PaginatedResult<T>> {
    return this.tableService.getData<PaginatedResult<T>>(GET_VM_MIGRATIONS_FROM_DB(platform_type), criteria);
  }

  getClouds(): Observable<PrivateCLoudFast[]> {
    return this.http.get<PaginatedResult<PrivateCLoudFast>>(PRIVATE_CLOUDS()).pipe(map(list => list.results));
  }

  getAWSAccounts(): Observable<PaginatedResult<AWSAccount>> {
    return this.http.get<PaginatedResult<AWSAccount>>(GET_AWS_CLOUD_LIST());
  }

  getAWSBuckets(accountId: string, region: string): Observable<AWSS3Buckets> {
    return this.http.get<AWSS3Buckets>(GET_AWS_BUCKET_DATA(accountId, region));
  }

  getAzureAccounts(): Observable<PaginatedResult<AzureAccount>> {
    return this.http.get<PaginatedResult<AzureAccount>>(GET_AZURE_CLOUD_LIST());
  }

  getAzureResourceGroup(accountId: number): Observable<AzureResourceGroup[]> {
    return this.http.get<AzureResourceGroup[]>(GET_AZURE_RESOURCE_GROUP(accountId));
  }

  getAzureStorageAccount(accountId: number, resource: string): Observable<AzureStorageAccount[]> {
    return this.http.get<AzureStorageAccount[]>(GET_AZURE_STORAGE_ACCOUNT(accountId, resource));
  }

  getAzureContainer(accountId: number, resource: string, storage: string): Observable<AzureContainer[]> {
    return this.http.get<AzureContainer[]>(GET_AZURE_CONTAINER(accountId, resource, storage));
  }
}