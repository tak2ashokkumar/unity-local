import { Component, OnInit } from '@angular/core';
import { UnityoneItsmTicketCrudService } from './unityone-itsm-ticket-crud.service';
import { forkJoin, Subject } from 'rxjs';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'unityone-itsm-ticket-crud',
  templateUrl: './unityone-itsm-ticket-crud.component.html',
  styleUrls: ['./unityone-itsm-ticket-crud.component.scss'],
  providers: [UnityoneItsmTicketCrudService]
})
export class UnityoneItsmTicketCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject<void>();
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  tableId: string;;
  recordUuid: string = '121e8b75-84e0-47d9-8d61-a2a1515c1316';
  action: 'Create' | 'Update';
  refernce: any;
  currentCriteria: SearchCriteria;

  commentForms: { [fieldName: string]: FormGroup } = {};
  comments: any[] = [];
  hasCommentField = false;
  activityCount: number;

  isLoading = false;
  hasMore = true;
  ticketId: string;


  constructor(private svc: UnityoneItsmTicketCrudService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.tableId = params.get('tableUuid');
      this.recordUuid = params.get('recordUuid');
      this.action = this.recordUuid ? 'Update' : 'Create';
    });
  }

  ngOnInit(): void {
    if (this.recordUuid) {
      this.getUpdateUnityOne()
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUpdateUnityOne() {
    forkJoin({
      meta: this.svc.getUnityOneData(this.tableId),
      record: this.svc.getUpdateUnityOne(this.tableId, this.recordUuid)
    })
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ meta, record }) => {
        const fieldsMeta = meta?.fields || [];
        this.form = this.svc.buildFieldsFormFromMetadata(fieldsMeta, this.fb);
        this.formErrors = this.svc.resetFormErrors(this.fields.length);
        this.formValidationMessages = this.svc.formValidationMessages;

        this.fields.controls.forEach((fg: FormGroup) => {
          if ((fg.get('field_type')?.value) === 'COMMENTS') {
            const ctrl = fg.get('value');
            ctrl?.clearValidators();
            ctrl?.updateValueAndValidity();
          }
        });

        this.hasCommentField = this.fields.controls.some(
          f => (f.get('field_type')?.value || '') === 'COMMENTS'
        );

        this.form.addControl('ticket_id', this.fb.control({ value: '', disabled: true }));

        const recordPayload = record || {};
        this.populateFormWithRecord(recordPayload);

        if (this.recordUuid && this.hasCommentField) {
          this.initCommentForms();
          this.loadComments();
        }
      },
        err => {
          console.error('error loading metadata or record', err);
        });
  }


  buildForm() {
    this.svc.getUnityOneData(this.tableId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      const fieldsMeta = data?.fields || [];
      this.form = this.svc.buildFieldsFormFromMetadata(fieldsMeta, this.fb);
      this.formErrors = this.svc.resetFormErrors(this.fields.length);
      this.formValidationMessages = this.svc.formValidationMessages;

      this.fields.controls.forEach((fg: FormGroup) => {
        const type = fg.get('field_type')?.value;
        if (type === 'COMMENTS') {
          fg.get('value')?.disable();
        }
      });

      const referenceField = fieldsMeta.find(
        f => (f.field_type || '') === 'REFERENCE' && f.reference_table
      );

      if (referenceField?.reference_table) {
        this.ticketId = referenceField.reference_table;
        this.getRefernce();
      }

      // this.hasCommentField = this.fields.controls.some(
      //   f => (f.get('field_type')?.value || '') === 'COMMENTS'
      // );

      // this.initCommentForms();
      // this.loadComments();
    });
  }


  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  // Get field type for rendering decisions
  getFieldType(i: number): string {
    return (this.fields.at(i).get('field_type').value || '');
  }

  // options FormArray for dropdown
  optionsAt(i: number) {
    return this.fields.at(i).get('options') as FormArray;
  }

  populateFormWithRecord(record: { [key: string]: any }) {
    if (!this.form) return;
    this.form.get('ticket_id')?.patchValue(record.ticket_id);
    const fieldsArr = this.fields;

    for (let i = 0; i < fieldsArr.length; i++) {
      const fg = fieldsArr.at(i);
      const fieldName = fg.get('field_name')?.value;
      const fieldType = (fg.get('field_type')?.value || 'TEXT');
      const valueControl = fg.get('value');
      const referenceTable = fg.get('reference_table')?.value;

      if (!fieldName || !valueControl) continue;

      if (Object.prototype.hasOwnProperty.call(record, fieldName)) {
        const raw = record[fieldName];
        const converted = this.convertValueByType(fieldType, raw);

        if (fieldType === 'DROPDOWN') {
          const optionsArr = fg.get('options') as FormArray;
          if (optionsArr && optionsArr.controls) {
            const exists = optionsArr.controls.some(c => c.value === converted);
            if (!exists && converted !== null && converted !== undefined && converted !== '') {
              optionsArr.push(this.fb.control(converted));
            }
          }
        }

        if (fieldType === 'REFERENCE' && referenceTable) {
          this.ticketId = referenceTable;
          this.getRefernce();
          const refUuid = raw && typeof raw === 'object' ? raw.uuid : raw;
          valueControl.setValue(refUuid);
          continue;
        }

        try {
          valueControl.setValue(converted);
        } catch (e) {
          valueControl.patchValue(converted);
        }
      }
    }
  }

  /**
   * Convert raw record value to the expected value for the form control depending on field type.
   */
  convertValueByType(fieldType: string, rawValue: any) {
    if (rawValue === null || rawValue === undefined) {
      if (fieldType === 'NUMBER') return null;
      if (fieldType === 'BOOLEAN') return false;
      return '';
    }

    switch (fieldType) {
      case 'BOOLEAN':
        if (typeof rawValue === 'boolean') return rawValue;
        if (typeof rawValue === 'number') return rawValue === 1;
        if (typeof rawValue === 'string') {
          const v = rawValue.toLowerCase();
          return v === 'true' || v === '1' || v === 'yes';
        }
        return false;

      case 'NUMBER':
        if (typeof rawValue === 'number') return rawValue;
        const asNum = Number(rawValue);
        return isNaN(asNum) ? null : asNum;

      case 'DATE':
        if (typeof rawValue === 'string') {
          return rawValue.length >= 10 ? rawValue.slice(0, 10) : rawValue;
        }
        return rawValue;

      case 'DATETIME':
        if (typeof rawValue === 'string') {
          const d = new Date(rawValue);
          return isNaN(d.getTime()) ? null : d;
        }
        if (rawValue instanceof Date) {
          return rawValue;
        }
        return null;

      case 'JSON':
        if (rawValue === null || rawValue === undefined) {
          return '';
        }
        return typeof rawValue === 'object' ? JSON.stringify(rawValue, null, 2) : rawValue;


      default:
        return rawValue;
    }
  }

  initCommentForms() {
    this.commentForms = {};

    this.fields.controls.forEach((fg: FormGroup) => {
      const fieldType = (fg.get('field_type')?.value || '');

      if (fieldType === 'COMMENTS') {
        const fieldName = fg.get('field_name')?.value;
        if (fieldName) {
          this.commentForms[fieldName] = this.svc.buildCommentForm(fieldName);
        }
      }
    });
  }


  getRefernce() {
    this.svc.getReference(this.ticketId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.refernce = param.results;
    });
  }

  confirmTicketCreate() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.spinner.start('main');
      const fieldsArr = this.form.value.fields || [];
      const payload: { [k: string]: any } = {};

      fieldsArr.forEach((f: any) => {
        const key = f.field_name;
        if (!key) return; // skip if no field_name

        let val = f.value;
        const type = (f.field_type || '');

        if (type === 'NUMBER') {
          if (val === '' || val === null || typeof val === 'undefined') {
            val = null;
          } else {
            const num = Number(val);
            val = isNaN(num) ? null : num;
          }
        } else if (type === 'BOOLEAN') {
          val = !!val;
        } else if (type === 'DATETIME') {
          val = val instanceof Date ? val.toISOString() : val || null;
        }
        else if (type === 'DATE') {
          val = val || null;
        }
        else if (type === 'JSON') {
          if (typeof val === 'string') {
            try {
              const parsed = JSON.parse(val);
              val = parsed;
            } catch (e) {
            }
          }
        } else {
          if (val === '') val = null;
        }

        payload[key] = val;
      });

      if (this.recordUuid) {
        const rawFormValue = this.form.getRawValue();
        if (rawFormValue.ticket_id) {
          payload.ticket_id = rawFormValue.ticket_id;
        }
        this.svc.updateUnityOne(this.tableId, this.recordUuid, payload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Ticket is updated.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Ticket failed to Update'));
        });
      } else {
        this.svc.createUnityOne(this.tableId, payload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Ticket is created.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Ticket failed to Create'));
        });
      }
    }
  }

  postComment(fieldName: string) {
    const form = this.commentForms[fieldName];
    if (form.invalid) {
      return;
    }

    const payload = form.value;

    this.svc.createComment(this.tableId, this.recordUuid, payload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      form.get('comment')?.reset();
      this.currentCriteria.pageNo = 1;
      this.hasMore = true;
      this.comments = [];
      this.loadComments();
    });
  }

  loadComments(isLazyLoad = false) {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;

    this.svc.getComment(this.tableId, this.recordUuid, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.activityCount = res.count;
      const newResults = (res.results || []).map((comment: any) => ({
        ...comment,
        timestamp: this.utilService.toUnityOneDateFormat(comment.timestamp)
      }));

      if (isLazyLoad) {
        this.comments = [...this.comments, ...newResults];
      } else {
        this.comments = newResults;
      }
      if (this.comments.length >= this.activityCount) {
        this.hasMore = false;
      }
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  onActivityScroll(event: Event) {
    const el = event.target as HTMLElement;

    const reachedBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

    if (reachedBottom && !this.isLoading && this.hasMore) {
      this.currentCriteria.pageNo += 1;
      this.loadComments(true);
    }
  }

  getDisplayValue(val: any): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      return val.display_value || '';
    }
    return val;
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').filter(Boolean).map(n => n[0].toUpperCase()).slice(0, 2).join('');
  }


  goBack() {
    if (this.recordUuid) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
