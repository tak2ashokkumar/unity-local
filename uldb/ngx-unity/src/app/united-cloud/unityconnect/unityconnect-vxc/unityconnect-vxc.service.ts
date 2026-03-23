import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { GET_VXCS, CREATE_TICKET, ADD_VXC, GET_TICKET_DETAILS_DATA } from 'src/app/shared/api-endpoint.const';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TICKET_DESC, CLOSE_VXC_TICKET_DESC } from 'src/app/shared/create-ticket.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { switchMap, take, catchError, map } from 'rxjs/operators';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { AppLevelService } from 'src/app/app-level.service';
import { gcpRegions, regions, azureRegions } from '../../public-cloud/region.const';
import { Handle404Header } from 'src/app/app-http-interceptor';

@Injectable()
export class UnityconnectVxcService {

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private builder: FormBuilder) {}

  getVXCs(): Observable<PaginatedResult<VXC>> {
    return this.http.get<PaginatedResult<VXC>>(GET_VXCS());
  }

  convertToViewData(vxcs: VXC[]): VXCViewData[] {
    let viewData: VXCViewData[] = [];
    vxcs.map((vxc: VXC) => {
      let a: VXCViewData = new VXCViewData();
      a.requesterName = vxc.requester_name;
      a.connectionType = vxc.connection_type;
      a.ticketId = vxc.ticket_id;
      a.ticketStatus = null;
      a.detailsUrl = '/unitycloud/connect/vxc/' + a.ticketId + '/details';
      viewData.push(a);
    });
    return viewData;
  }

  resetFormErrors(): any {
    let formErrors = {
      'vxcType': '',
      'description': '',
      'region': ''
    };
    return formErrors;
  }

  validationMessages = {
    'vxcType': {
      'required': 'Subject is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'region': {
      'required': 'Region is required'
    }
  };

  buildForm(userEmail: string): FormGroup {
    return this.builder.group({
      'vxcType': ['', Validators.required],
      'subject': [{ value: '', disabled: true }, Validators.required],
      'description': [TICKET_DESC(userEmail), [Validators.required, NoWhitespaceValidator]]
    });
  }

  createTicket(data: { vxcType: string, subject: string, description: string }) {
    return this.http.post<CeleryTask>(CREATE_TICKET(), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 30).pipe(take(1))),
        switchMap(res => this.http.post<VXC>(ADD_VXC(), { ticket_id: res.result.request.id, connection_type: data.vxcType })), take(1));
  }

  getConnectionStatus(ticketId: string): Observable<Map<string, ConnectionStatusData>> {
    return this.http.get<CeleryTask>(GET_TICKET_DETAILS_DATA(ticketId))
      .pipe(
        switchMap(res => this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))),
        take(1)
      )
      .pipe(
        map((res: any) => {
          return new Map<string, ConnectionStatusData>().set(ticketId, res);
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, ConnectionStatusData>().set(ticketId, null));
        })
      );
  }
  
  createCloseTicket(data: { subject: string, description: string }) {
    return this.http.post<CeleryTask>(CREATE_TICKET(), data)
  }
  getRegions(val: string): Observable<Region[]> {
    if (val=='AWS Direct Connect'){
      return of(regions);
    }
    else if (val=='Azure Express Route'){
      return of(azureRegions);
    }
    else if (val=='Google Cloud Dedicated Interconnect'){
      return of(gcpRegions);
    }
    else{
      return of([]);
    }    
  };

  resetCloseFormErrors(): any {
    let formErrors = {
      'description': ''
    };
    return formErrors;
  }

  validationCloseMessages = {
    'description': {
      'required': 'Description is required'
    }
  };

  buildCloseForm(userEmail: string, vxcType: string, ticketId: number): FormGroup {
    return this.builder.group({
      'subject': [{ value: '', disabled: true }, Validators.required],
      'description': [CLOSE_VXC_TICKET_DESC(userEmail, vxcType, ticketId), [Validators.required, NoWhitespaceValidator]]
    });
  }
}

export class VXCViewData {
  requesterName: string;
  connectionType: string;
  ticketId: string;
  ticketStatus: string;
  detailsUrl: string;
  constructor() { }
}

export const connectionTypes: string[] = ['AWS Direct Connect', 'Azure Express Route', 'Google Cloud Dedicated Interconnect', 'Private'];
