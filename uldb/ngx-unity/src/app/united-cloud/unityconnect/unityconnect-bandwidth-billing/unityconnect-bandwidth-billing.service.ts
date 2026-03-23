import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GET_BANDWIDTH_BILLING_INFO } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class UnityconnectBandwidthBillingService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getBillingInfo(): Observable<BandwidthBillingInfo[]> {
    return this.http.get<BandwidthBillingInfo[]>(GET_BANDWIDTH_BILLING_INFO());
  }

  convertToViewData(bills: BandwidthBillingInfo[]): BillsViewData[] {
    let viewData: BillsViewData[] = [];
    bills.map((bill: BandwidthBillingInfo) => {
      let a: BillsViewData = new BillsViewData();
      a.billName = bill.bill_name;
      a.cdr = bill.bill_cdr;
      a.rate95th = bill.rate_95th;
      a.rate95thIn = bill.rate_95th_in;
      a.rate95thOut = bill.rate_95th_out;
      a.overUsage = bill.overusage;
      a.overUsageClass = bill.overusage > 0 ? 'btn-danger' : 'btn-success';
      a.rateAverage = bill.rate_average;
      a.rateAverageIn = bill.rate_average_in;
      a.rateAverageOut = bill.rate_average_out;
      a.overUsedPercent = bill.overused_percent + '%';
      a.overUsedPercentClass = bill.overused_percent > 0 ? 'bg-danger' : 'bg-success';
      a.billingPeriod = bill.billing_period;
      a.billLastCalculatedOn = bill.bill_last_calc ? this.utilSvc.toUnityOneDateFormat(bill.bill_last_calc) : 'N/A';;
      a.billingFees = bill.billing_fees;
      a.unUsedPercent = (100 - bill.overused_percent) + '%';

      viewData.push(a);
    });
    return viewData;
  }
}

export class BillsViewData {
  billName: string;
  cdr: number;
  rate95th: number;
  rate95thIn: number;
  rate95thOut: number;
  overUsage: number;
  overUsageClass: string;
  rateAverage: number;
  rateAverageIn: number;
  rateAverageOut: number;
  overUsedPercent: string;
  overUsedPercentClass: string;
  unUsedPercent: string;
  billingPeriod: string;
  billLastCalculatedOn: string;
  billingFees: number;
}
