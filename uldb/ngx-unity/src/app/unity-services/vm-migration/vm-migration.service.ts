import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GET_VM_MIGRATIONS, PRIVATE_CLOUDS, GET_VM_MIGRATIONS_FROM_DB, VMWARE_AUTH_CHECK, GET_AWS_CLOUD_LIST, GET_AWS_BUCKET_DATA } from 'src/app/shared/api-endpoint.const';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { switchMap, take, map } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class VmMigrationService {
  constructor(
    private http: HttpClient,
    private appService: AppLevelService,
    private tableService: TableApiServiceService
  ) { }

  getClouds(): Observable<PrivateCLoudFast[]> {
    return this.http.get<PaginatedResult<PrivateCLoudFast>>(PRIVATE_CLOUDS()).pipe(map(list => list.results));
  }

  getVMMigrations(cloud: PrivateCLoudFast) {
    return this.http.get<CeleryTask>(GET_VM_MIGRATIONS(cloud.uuid, cloud.platform_type))
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 4).pipe(take(1))), take(1));
  }

  getVMMigrationsFromDB<T>(criteria: SearchCriteria, platform_type: string): Observable<PaginatedResult<T>> {
    return this.tableService.getData<PaginatedResult<T>>(GET_VM_MIGRATIONS_FROM_DB(platform_type), criteria);
  }

  getAWSAccounts():Observable<PaginatedResult<AWSAccount>> {
    return this.http.get<PaginatedResult<AWSAccount>>(GET_AWS_CLOUD_LIST());
  }

  getAWSBuckets(accountId: string, region:string): Observable<AWSS3Buckets>{
    return this.http.get<AWSS3Buckets>(GET_AWS_BUCKET_DATA(accountId, region));
  }

}