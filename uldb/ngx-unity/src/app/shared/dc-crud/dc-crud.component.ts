import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { DcCrudService, OfflineLocationDetails } from './dc-crud.service';
import { Subject } from 'rxjs';
import { MapService } from 'src/app/map.service';

@Component({
  selector: 'dc-crud',
  templateUrl: './dc-crud.component.html',
  styleUrls: ['./dc-crud.component.scss']
})
export class DcCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<{ type: CRUDActionTypes, dcId?: string }>();

  private ngUnsubscribe = new Subject();
  dcId: string;
  actionMessage: 'Add' | 'Edit';

  @ViewChild('create') create: ElementRef;
  createModalRef: BsModalRef;
  datacenterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';

  isOnline = navigator.onLine;
  locationSuggestions: OfflineLocationDetails[] = [];
  showSuggestions = false;

  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  constructor(private crudService: DcCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService,
    private mapSvc: MapService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dcId => {
      this.dcId = dcId;
      this.actionMessage = this.dcId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.createModalRef = null;
      this.buildForm(dcId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dcId => {
      this.dcId = dcId;
      this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    })
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    document.querySelectorAll('.pac-container').forEach(el => el.remove());
  }

  buildForm(dcId: string) {
    this.nonFieldErr = '';
    this.crudService.buildForm(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.datacenterForm = form;
      this.formErrors = this.crudService.resetFormErrors();
      this.validationMessages = this.crudService.validationMessages;
      this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
      this.initLocation();
    });
  }

  initLocation() {
    if (this.isOnline) {
      this.mapSvc.loadMap().then(() => {
        const input = document.getElementById('location') as HTMLInputElement;
        if (!input) return;
        let autocomplete = new google.maps.places.Autocomplete(input, { types: [] });
        autocomplete.setFields(['geometry', 'formatted_address']);
        autocomplete.addListener('place_changed', () => {
          let place = autocomplete.getPlace();
          this.datacenterForm.get('searchlocation').setValue(place.formatted_address);
          this.datacenterForm.get('location').setValue(place.formatted_address);
          this.datacenterForm.get('lat').setValue(place.geometry.location.lat());
          this.datacenterForm.get('long').setValue(place.geometry.location.lng());
        });
      });
    } else {
      this.crudService.getOfflineLocations().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    }
  }

  onLocationInput(value: string) {
    if (!value || value.length < 2) {
      this.locationSuggestions = [];
      this.showSuggestions = false;
      return;
    }
    const lower = value.toLowerCase();
    this.crudService.getOfflineLocations().pipe(takeUntil(this.ngUnsubscribe)).subscribe(cities => {
      this.locationSuggestions = cities
        .filter(c =>
          c.name.toLowerCase().includes(lower) ||
          c.country.toLowerCase().includes(lower) ||
          (c.state && c.state.toLowerCase().includes(lower))
        )
        .slice(0, 10);
      this.showSuggestions = this.locationSuggestions.length > 0;
    });
  }

  selectLocation(loc: OfflineLocationDetails) {
    const display = `${loc.name}, ${loc.state}, ${loc.country}`;
    this.datacenterForm.get('searchlocation').setValue(display);
    this.datacenterForm.get('location').setValue(display);
    this.datacenterForm.get('lat').setValue(loc.lat);
    this.datacenterForm.get('long').setValue(loc.lng);
    this.locationSuggestions = [];
    this.showSuggestions = false;
  }

  onLocationBlur() {
    setTimeout(() => { this.showSuggestions = false; }, 200);
  }

  handleError(err: any) {
    this.formErrors = this.crudService.resetFormErrors();
    if (err && err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.datacenterForm) {
          this.datacenterForm[field] = err[field][0];
        }
      }
    } else {
      this.createModalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  onSubmit() {
    if (this.datacenterForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.datacenterForm, this.validationMessages, this.formErrors);
      this.datacenterForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.datacenterForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.datacenterForm.removeControl('searchlocation');
      this.spinnerService.start('main');
      if (this.actionMessage === 'Add') {
        this.crudService.saveDatacenter(null, <DataCenter>this.datacenterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.createModalRef.hide();
            document.querySelectorAll('.pac-container').forEach(el => el.remove());
            this.notificationService.success(new Notification('Datacenter added successfully'));
            this.onCrud.emit({ type: CRUDActionTypes.ADD, dcId: res.uuid });
            this.spinnerService.stop('main');
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
            this.datacenterForm.addControl('searchlocation', new FormControl(this.datacenterForm.get('location').value, Validators.required));
          });
      } else {
        this.crudService.saveDatacenter(this.dcId, <DataCenter>this.datacenterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.createModalRef.hide();
            document.querySelectorAll('.pac-container').forEach(el => el.remove());
            this.notificationService.success(new Notification('Datacenter updated successfully'));
            this.onCrud.emit({ type: CRUDActionTypes.UPDATE });
            this.spinnerService.stop('main');
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
            this.datacenterForm.addControl('searchlocation', new FormControl(this.datacenterForm.get('location').value, Validators.required));
          });
      }
    }
  }

  deleteDatacenter(dcId: string) {
    this.dcId = dcId;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.spinnerService.start('main');
    this.crudService.delete(this.dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      this.onCrud.emit({ type: CRUDActionTypes.DELETE });
      this.dcId = null;
      this.notificationService.success(new Notification('Datacenter deleted succesfully'));
    }, err => {
      this.dcId = null;
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Error while deleting Datacenter'));
    });
  }

  onModalClose() {
    this.createModalRef.hide();
    document.querySelectorAll('.pac-container').forEach(el => el.remove());
    this.locationSuggestions = [];
    this.showSuggestions = false;
  }
}
