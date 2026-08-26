import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ApprovalStep, CartCheckoutResponse, CartItem } from './catalog-checkout.type';
import { FormGroup } from '@angular/forms';
import { CatalogCheckoutService } from './catalog-checkout.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'catalog-checkout',
  templateUrl: './catalog-checkout.component.html',
  styleUrls: ['./catalog-checkout.component.scss']
})
export class CatalogCheckoutComponent implements OnInit {

  private ngUnsubscribe = new Subject<void>();

  loading = false;
  submitting = false;
  nonFieldErr = '';

  checkout: CartCheckoutResponse = null;
  expandedItemUuid: string = null;
  itemActions: { [uuid: string]: boolean } = {};
  private initializedExpansion = false;

  form: FormGroup;
  formErrors: { [key: string]: string } = {};

  readonly approvalSteps: ApprovalStep[] = [
    { label: 'Submit', state: 'done' },
    { label: 'Manager', state: 'current' },
    { label: 'Provision', state: 'pending' }
  ];

  constructor(
    private svc: CatalogCheckoutService,
    private router: Router,
    private notification: AppNotificationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.form = this.svc.buildForm();
    this.formErrors = this.svc.resetFormErrors();
    this.loadCheckout();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadCheckout(): void {
    this.loading = true;
    this.nonFieldErr = '';
    this.svc.getCheckout()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (res: CartCheckoutResponse) => {
          this.checkout = res;
          if (!this.initializedExpansion && res.items?.length) {
            this.expandedItemUuid = res.items[0].uuid;
            this.initializedExpansion = true;
          }
        },
        (err: HttpErrorResponse) => {
          this.nonFieldErr = err?.error?.detail || 'Unable to load your cart. Please try again.';
        }
      );
  }

  // ---------- Order items ----------

  toggleExpand(item: CartItem): void {
    this.expandedItemUuid = this.isExpanded(item) ? null : item.uuid;
  }

  isExpanded(item: CartItem): boolean {
    return this.expandedItemUuid === item.uuid;
  }

  get itemsCount(): number {
    return this.checkout?.total_items ?? this.checkout?.items?.length ?? 0;
  }

  get annualForecast(): number {
    return Number(this.checkout?.subtotal || 0) * 12;
  }

  get taxPercentage(): number {
    const subtotal = Number(this.checkout?.subtotal || 0);
    return subtotal ? (Number(this.checkout?.tax || 0) / subtotal) * 100 : 0;
  }

  billingSuffix(frequency: string): string {
    const value = (frequency || '').toLowerCase();
    if (value.includes('hour')) return 'hr';
    if (value.includes('day')) return 'day';
    if (value.includes('week')) return 'wk';
    if (value.includes('year') || value.includes('annual')) return 'yr';
    return 'mo';
  }

  onRemoveItem(item: CartItem): void {
    if (this.isItemActionPending(item)) {
      return;
    }

    this.setItemActionPending(item.uuid, true);
    this.svc.deleteCartItem(item.uuid)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.setItemActionPending(item.uuid, false))
      )
      .subscribe(
        () => {
          if (this.expandedItemUuid === item.uuid) {
            this.expandedItemUuid = null;
          }
          this.notification.success(new Notification(`${item.catalog?.name || 'Item'} removed from cart.`));
          this.loadCheckout();
        },
        (err: HttpErrorResponse) => {
          this.notification.error(new Notification(this.getErrorMessage(err, 'Unable to remove the item from your cart.')));
        }
      );
  }

  onQuantityChange(item: CartItem, delta: number): void {
    const quantity = item.quantity + delta;
    if (quantity < 1 || this.isItemActionPending(item)) {
      return;
    }

    this.setItemActionPending(item.uuid, true);
    this.svc.updateCartItem(item.uuid, { quantity })
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => this.setItemActionPending(item.uuid, false))
      )
      .subscribe(
        () => this.loadCheckout(),
        (err: HttpErrorResponse) => {
          this.notification.error(new Notification(this.getErrorMessage(err, 'Unable to update the item quantity.')));
        }
      );
  }

  isItemActionPending(item: CartItem): boolean {
    return !!this.itemActions[item.uuid];
  }

  private setItemActionPending(itemUuid: string, pending: boolean): void {
    this.itemActions[itemUuid] = pending;
  }

  // ---------- Request details form ----------
  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  clearForm(): void {
    this.form.reset({ purpose: '', notes: '', priority: 'Normal' });
    this.formErrors = this.svc.resetFormErrors();
    this.nonFieldErr = '';
  }

  submitForApproval(): void {
    if (this.form.invalid) {
      this.validateForm();
      return;
    }

    this.submitting = true;
    this.nonFieldErr = '';
    this.svc.submitCheckout(this.form.value).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.submitting = false)).subscribe(
      () => {
        this.notification.success(new Notification('Your request has been submitted successfully.'));
        this.router.navigate(['/services/service-catalog/redesign/catalog']);
      },
      (err: HttpErrorResponse) => {
        this.handleError(err.error);
      }
    );
  }

  private validateForm(): void {
    // Simple inline validation, following the same shape as UtilService.validateForm()
    // used elsewhere in the app -- swap this out for that shared helper if you have it.
    Object.keys(this.svc.formValidationMessages).forEach((controlName) => {
      const control = this.form.get(controlName);
      this.formErrors[controlName] = '';
      if (control && control.invalid) {
        const messages = (this.svc.formValidationMessages as any)[controlName];
        const errorKey = Object.keys(control.errors || {})[0];
        this.formErrors[controlName] = messages[errorKey] || 'Invalid value.';
      }
    });
  }

  private handleError(error: any): void {
    this.nonFieldErr = error?.detail || 'Something went wrong while submitting your order.';
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    return error?.error?.detail || error?.error?.message || fallback;
  }

}
