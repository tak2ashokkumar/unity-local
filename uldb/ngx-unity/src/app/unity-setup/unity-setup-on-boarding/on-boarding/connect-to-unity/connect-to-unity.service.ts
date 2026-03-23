import { Injectable } from '@angular/core';
import { SharedOnboardingStatusService } from 'src/app/shared/shared-on-boarding/shared-on-boarding.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NoWhitespaceValidator, EmailValidator, MobileNumberValidator } from 'src/app/shared/app-utility/app-utility.service';
import { HttpClient } from '@angular/common/http';
import { GET_UNITY_CONSTANTS, CREATE_UNITY_VPN_REQUEST } from 'src/app/shared/api-endpoint.const';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { UNITY_CONNECT_VPN_METADATA } from 'src/app/shared/create-ticket.const';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';

@Injectable()
export class ConnectToUnityService {

  constructor(private sharedOnboardingService: SharedOnboardingStatusService,
    private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService,
    private userService: UserInfoService) { }

  getUnityConstants() {
    return this.http.get<UnityConstants>(GET_UNITY_CONSTANTS());
  }

  converToViewData(onbDetails: OnbDetails) {
    let viewData = new ConnectionRequestModalViewData();
    if (onbDetails.vpn_status) {
      viewData.message = 'Collector/VPN Connection setup is completed.';
      viewData.icon = 'cfa-checkmark';
      viewData.backgroundColor = 'bg-success';
    }
    else {
      viewData.message = 'Collector/VPN Connection setup is in progress.';
      viewData.icon = 'fa-exclamation-triangle';
      viewData.backgroundColor = 'bg-warning';
    }
    viewData.vpnBtnClass = this.sharedOnboardingService.getVPNBtnClass(onbDetails);
    viewData.connectionRequested = onbDetails.onb_status.vpn_req || onbDetails.vpn_status;
    return viewData;
  }

  resetFormErrors() {
    return {
      'cust_email': '',
      'cust_contact_number': '',
      'manufacturer': '',
      'model': '',
      'version': '',
      'peer_ip_addresses': '',
      'subnets': '',
      'auth_method': '',
      'pre_shared_secret': '',
      'dh_group_identifier': '',
      'ike_encryption_algorithm': '',
      'ike_security_lifetime': '',
      'ike_hash_algorithm': '',
      'ipsec_encryption_algorithm': '',
      'ipsec_security_lifetime': '',
      'ipsec_hash_algorithm': '',
      'ipsec_security_protocol': ''
    };
  }

  validationMessages = {
    'cust_email': {
      'required': 'Email is required',
      'invalidEmail': 'Enter valid email address'
    },
    'cust_contact_number': {
      'required': 'Contact nuumber is required',
      'invalidMobile': 'Enter valid mobile number'
    },
    'ipsec_security_lifetime': {
      'min': 'Value should be more than 460',
      'max': 'Value should be less than 28800'
    }
  }

  createForm(): FormGroup {
    return this.builder.group({
      'userEmail': [this.userService.userEmail],
      'cust_email': ['', [Validators.required, NoWhitespaceValidator, EmailValidator]],
      'cust_contact_number': ['', [Validators.required, NoWhitespaceValidator, MobileNumberValidator]],
      'manufacturer': ['', NoWhitespaceValidator],
      'model': ['', NoWhitespaceValidator],
      'version': ['', NoWhitespaceValidator],
      'peer_ip_addresses': ['', NoWhitespaceValidator],
      'subnets': ['', NoWhitespaceValidator],
      'auth_method': [{ value: 'Pre-Shared Secret', disabled: true }],
      'pre_shared_secret': [{ value: 'Will be shared in private by our support team.', disabled: true }],
      'dh_group_identifier': [''],
      'ike_encryption_algorithm': [{ value: 'AES-256', disabled: true }],
      'ike_security_lifetime': [{ value: '86400 secs', disabled: true }],
      'ike_hash_algorithm': [{ value: 'SHA', disabled: true }],
      'ipsec_encryption_algorithm': [{ value: 'AES-256', disabled: true }],
      'ipsec_security_lifetime': ['', [Validators.min(460), Validators.max(28800)]],
      'ipsec_hash_algorithm': [{ value: 'SHA', disabled: true }],
      'ipsec_security_protocol': [{ value: 'ESP', disabled: true }]
    });
  }

  private getFormdata(data: ConnectionRequest) {
    return { subject: 'Request for VPN Connectivity', description: UNITY_CONNECT_VPN_METADATA(data), system_type: 'Unity' };
  }

  submitRequest(data: ConnectionRequest) {
    const formData: { subject: string, description: string, system_type: string } = this.getFormdata(data);
    return this.http.post<CeleryTask>(CREATE_UNITY_VPN_REQUEST(), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id).pipe(take(1))), take(1));
  }
}

export class ConnectionRequestModalViewData {
  constructor() { }
  connectionRequested: boolean;
  backgroundColor: string;
  icon: string;
  message: string;
  vpnBtnClass: string;
}