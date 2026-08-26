import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CatalogOrderApi,
  CatalogOrdersApiResponse,
  Order,
  OrdersResponse
} from './orders.type';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly ordersUrl = '/api/service_catalog/v1/catalog_orders/';

  constructor(private http: HttpClient) { }

  getOrders(): Observable<OrdersResponse> {
    return this.http.get<CatalogOrdersApiResponse>(this.ordersUrl).pipe(
      map(response => ({
        results: (response.results || []).map(order => this.mapOrder(order))
      }))
    );
  }

  private mapOrder(order: CatalogOrderApi): Order {
    const currency = this.normalizeCurrency(order.currency);

    return {
      ...order,
      currency,
      requested_by: order.requested_by || '',
      catalog_snapshot: order.catalog_snapshot || {},
      pricing_snapshot: order.pricing_snapshot || {},
      cost_breakdown: order.cost_breakdown || [],
      approval_meta: order.approval_meta || {}
    };
  }

  private normalizeCurrency(currency?: string): string {
    const value = (currency || '').trim().toUpperCase();
    const aliases: { [key: string]: string } = {
      '$': 'USD',
      'US$': 'USD',
      'DOLLAR': 'USD',
      'DOLLARS': 'USD',
      '€': 'EUR',
      'EURO': 'EUR',
      'EUR': 'EUR',
      'EUROS': 'EUR',
      '£': 'GBP',
      'POUND': 'GBP',
      'POUNDS': 'GBP',
      '₹': 'INR',
      'RUPEE': 'INR',
      'RUPEES': 'INR'
    };

    if (aliases[value]) {
      return aliases[value];
    }

    return /^[A-Z]{3}$/.test(value) ? value : 'USD';
  }
}
