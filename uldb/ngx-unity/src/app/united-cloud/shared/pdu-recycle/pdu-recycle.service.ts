import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppLevelService } from 'src/app/app-level.service';
import { CHECK_PDU_AUTHENTICATION, RECYCLE_PDU } from 'src/app/shared/api-endpoint.const';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class PduRecycleService {
  private recyclePDUAnnouncedSource = new Subject<PDUToRecycle>();
  recyclePDUAnnounced$ = this.recyclePDUAnnouncedSource.asObservable();

  private recycleSelectedSocketsAnnouncedSource = new Subject<PDUToRecycle>();
  recycleSelectedSocketsAnnounced$ = this.recycleSelectedSocketsAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService) { }

  recyclePDU(pduID: string, pduIPAddress: string, socketCount: number) {
    let pdu: PDUToRecycle = new PDUToRecycle();
    pdu.id = pduID;
    pdu.ip = pduIPAddress;
    pdu.socketCount = socketCount;
    this.recyclePDUAnnouncedSource.next(pdu);
  }

  recycleSelectedSockets(pduID: string, pduIPAddress: string, sockets: number[]) {
    let pdu: PDUToRecycle = new PDUToRecycle();
    pdu.id = pduID;
    pdu.ip = pduIPAddress;
    pdu.sockets = sockets;
    this.recycleSelectedSocketsAnnouncedSource.next(pdu);
  }

  resetAuthFormErrors(): any {
    let AuthFormErrors = {
      'username': '',
      'password': ''
    }
    return AuthFormErrors;
  }

  resetSocketFormErrors(): any {
    let SocketFormErrors = {
      'invalidSocketSelection': ''
    }
    return SocketFormErrors;
  }

  validationMessages = {
    'username': {
      'required': 'This field is required'
    },
    'password': {
      'required': 'This field is required'
    },
    'invalidSocketSelection': {
      'notselcted': 'Select atleast one outlet to recycle',
      'bothselected': 'Socket selection is invalid. Select either ALL SOCKETS or INDIVIDUAL SOCKETS, but not both'
    },
  }

  buildPDUAuthForm(pdu: PDUToRecycle): FormGroup {
    this.resetAuthFormErrors();
    return this.builder.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required],
      'ip_address': [pdu.ip],
    });
  }

  buildPDUSocketForm(pdu: PDUToRecycle): FormGroup {
    this.resetSocketFormErrors();
    return this.builder.group({
      'all_outlets': [false],
      'outlets': this.builder.array([])
    }, { validators: outletValidator('all_outlets', 'outlets') });
  }

  validateSocketForm(form: FormGroup, validationMessages: any, formErrors: any) {
    for (const field in formErrors) {
      formErrors[field] = '';
      const messages = validationMessages[field];
      if (form.errors) {
        for (const key in form.errors) {
          formErrors[field] = messages[key];
        }
      }
    }
    return formErrors;
  }

  checkPDUAuth(pdu: PDUToRecycle, data: PDUSocketAuthType): Observable<string> {
    return this.http.post<string>(CHECK_PDU_AUTHENTICATION(pdu.id), data);
  }

  recyclePDUSockets(pdu: PDUToRecycle, data: PDUSocketRecycleType): Observable<any> {
    return this.http.post<CeleryTask>(RECYCLE_PDU(pdu.id), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 4).pipe(take(1))), take(1));
  }
}

export function outletValidator(allOutlets: string, outletList: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const all = control.get(allOutlets).value;
    const selectedList = control.get(outletList).value;
    if (all && selectedList.length) {
      return { 'bothselected': true };
    } else if (!all && !selectedList.length) {
      return { 'notselcted': true };
    }
    return null;
  }
}

export interface PDUSocketAuthType {
  username: string;
  password: string;
  ip_address: string;
}
export interface PDUSocketRecycleType extends PDUSocketAuthType {
  all_outlets?: boolean;
  outlets: number[];
}

export class DeviceConnectedPDUSocket {
  socketNumber: number;
  socketId: number;
  constructor() { }
}

export class PDUToRecycle {
  id: string;
  ip: string;
  socketCount?: number;
  sockets: number[] = [];
}
