import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { UnityconnectVxcService, VXCViewData, connectionTypes } from './unityconnect-vxc.service';
import { takeUntil, switchMap, mergeMap } from 'rxjs/operators';
import { Subject, from } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VXC_TICKET_SUBJECT, TICKET_DESC_BY_VXC_TYPE, CLOSE_VXC_TICKET_SUBJECT, TICKET_DESC_BY_VXC_TYPE_REGION } from 'src/app/shared/create-ticket.const';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TicketType } from 'src/app/shared/create-ticket/create-ticket.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';

@Component({
  selector: 'unityconnect-vxc',
  templateUrl: './unityconnect-vxc.component.html',
  styleUrls: ['./unityconnect-vxc.component.scss'],
  providers: [UnityconnectVxcService]
})
export class UnityconnectVxcComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  vxcViewData: VXCViewData[] = [];
  filteredviewData: VXCViewData[] = [];

  @ViewChild('buyVxcTemplate') buyVxcTemplate: ElementRef;
  createVxcTicketModalRef: BsModalRef;
  buyVxcForm: FormGroup;
  validationMessages: any;
  cloudRegion: Region[] = [];
  selectedRegion: string = '';
  connectionTypes = connectionTypes;


  @ViewChild('closeVxcTemplate') closeVxcTemplate: ElementRef;
  closeVxcTicketModalRef: BsModalRef;
  closeVxcForm: FormGroup;
  formErrors: any;

  currentCriteria: SearchCriteria;
  fieldsToFilterOn: string[] = ['requesterName', 'connectionType', 'ticketId'];

  constructor(private unityConnectService: UnityconnectVxcService,
    private spinnerService: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private notificationService: AppNotificationService,
    private userService: UserInfoService,
    private clientSideSearchPipe: ClientSideSearchPipe) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1 };
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinnerService.start('main');
    }, 0);
    this.getVXCs();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filteredviewData = this.clientSideSearchPipe.transform(this.vxcViewData, event, this.fieldsToFilterOn);
  }

  refreshData() {
    this.spinnerService.start('main');
    this.getVXCs();
  }

  getVXCs() {
    this.unityConnectService.getVXCs().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: PaginatedResult<VXC>) => {
      this.vxcViewData = this.unityConnectService.convertToViewData(data.results);
      this.filteredviewData = this.vxcViewData;
      this.spinnerService.stop('main');
      this.getConnectionStatus(data.results);
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
    });
  }

  getRegions(val: string) {
    this.unityConnectService.getRegions(val).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cloudRegion = res;
      this.spinnerService.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notificationService.error(new Notification('Problem in getting AWS accounts. Please tryagain later.'));
      this.spinnerService.stop('main');
    });
  }

  regionSelected(event: any) {
    this.selectedRegion = event.target.value;
    const vxc_value = this.buyVxcForm.get('vxcType').value;
    this.buyVxcForm.get('description').patchValue(TICKET_DESC_BY_VXC_TYPE_REGION(this.userService.userEmail, vxc_value, this.selectedRegion));
  }

  buyVxcFormChanges(): void {
    this.buyVxcForm.get('vxcType').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.buyVxcForm.get('subject').patchValue(VXC_TICKET_SUBJECT(val));
      this.buyVxcForm.get('description').patchValue(TICKET_DESC_BY_VXC_TYPE(this.userService.userEmail, val));
      this.cloudRegion = [];
      if (val != "Private") {
        this.buyVxcForm.addControl('region', new FormControl('', [Validators.required]));
        this.getRegions(val);
      }
      else {
        this.buyVxcForm.removeControl('region');
      }
    });
  }

  buyVxc(): void {
    this.formErrors = this.unityConnectService.resetFormErrors();
    this.validationMessages = this.unityConnectService.validationMessages;
    this.buyVxcForm = this.unityConnectService.buildForm(this.userService.userEmail);
    this.buyVxcFormChanges();
    this.createVxcTicketModalRef = this.modalService.show(this.buyVxcTemplate, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  createVxcTicket(): void {
    if (this.buyVxcForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.buyVxcForm, this.validationMessages, this.formErrors);
      this.buyVxcForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.buyVxcForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinnerService.start('main');
      this.formErrors = this.unityConnectService.resetFormErrors();
      const data = Object.assign(this.buyVxcForm.getRawValue(), { type: 'task' });
      this.unityConnectService.createTicket(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.getVXCs();
        this.createVxcTicketModalRef.hide();
        this.notificationService.success(new Notification('Ticket submitted successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you.'));
      }, err => {
        this.notificationService.error(new Notification('Error while creating ticket.'));
      }, () => {
        this.spinnerService.stop('main');
      });
    }
  }

  getConnectionStatus(connections: VXC[]) {
    from(connections).pipe(mergeMap(e => this.unityConnectService.getConnectionStatus(e.ticket_id)), takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          const key = res.keys().next().value;
          const index = this.vxcViewData.map(data => data.ticketId).indexOf(key);
          if (res.get(key) && res.get(key).result.request) {
            const value = res.get(key).result.request.status;
            this.vxcViewData[index].ticketStatus = value;
          } else {
            this.vxcViewData[index].ticketStatus = 'N/A';
          }
        },
        err => {
          console.log(err)
        },
        () => {
          //Do anything after everything done
        }
      );
  }

  closeVxc(vxcType: string, ticketId: number): void {
    this.formErrors = this.unityConnectService.resetCloseFormErrors();
    this.validationMessages = this.unityConnectService.validationCloseMessages;
    this.closeVxcForm = this.unityConnectService.buildCloseForm(this.userService.userEmail, vxcType, ticketId);
    this.closeVxcForm.get('subject').patchValue(CLOSE_VXC_TICKET_SUBJECT(vxcType));
    this.closeVxcTicketModalRef = this.modalService.show(this.closeVxcTemplate, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }
  closeVxcTicket(): void {
    if (this.closeVxcForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.closeVxcForm, this.validationMessages, this.formErrors);
      this.closeVxcForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.closeVxcForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinnerService.start('main');
      this.formErrors = this.unityConnectService.resetCloseFormErrors();
      const data = Object.assign(this.closeVxcForm.getRawValue(), { type: 'task' });
      this.unityConnectService.createCloseTicket(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.closeVxcTicketModalRef.hide();
        this.notificationService.success(new Notification('Ticket submitted successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you.'));
      }, err => {
        this.notificationService.error(new Notification('Error while creating ticket.'));
      }, () => {
        this.spinnerService.stop('main');
      });
    }
  }
}