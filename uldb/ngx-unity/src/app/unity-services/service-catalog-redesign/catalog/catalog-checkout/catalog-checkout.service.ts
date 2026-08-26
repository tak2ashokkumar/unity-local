import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartCheckoutResponse, CartItemUpdatePayload, CheckoutSubmitPayload } from './catalog-checkout.type';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CatalogCheckoutService {

  constructor(
    private http: HttpClient,
    private builder: FormBuilder
  ) { }

  getCheckout(): Observable<CartCheckoutResponse> {
    return this.http.get<CartCheckoutResponse>('/api/service_catalog/v1/checkout/');
  }

  submitCheckout(payload: CheckoutSubmitPayload): Observable<any> {
    return this.http.post('/api/service_catalog/v1/checkout/', payload);
  }

  updateCartItem(itemUuid: string, payload: CartItemUpdatePayload): Observable<any> {
    return this.http.patch(`/api/service_catalog/v1/cart_items/${itemUuid}/`, payload);
  }

  deleteCartItem(itemUuid: string): Observable<void> {
    return this.http.delete<void>(`/api/service_catalog/v1/cart_items/${itemUuid}/`);
  }

  buildForm(existing?: CheckoutSubmitPayload): FormGroup {
    return this.builder.group({
      purpose: [existing?.purpose || '', [Validators.required]],
      notes: [existing?.notes || '', [Validators.required]],
      priority: [existing?.priority || 'Normal', [Validators.required]]
    });
  }

  resetFormErrors(): { [key: string]: string } {
    return {
      purpose: '',
      notes: '',
      priority: ''
    };
  }

  formValidationMessages = {
    purpose: {
      required: 'Project / purpose is required.'
    },
    notes: {
      required: 'Business justification is required.'
    },
    priority: {
      required: 'Priority is required.'
    }
  };
}
