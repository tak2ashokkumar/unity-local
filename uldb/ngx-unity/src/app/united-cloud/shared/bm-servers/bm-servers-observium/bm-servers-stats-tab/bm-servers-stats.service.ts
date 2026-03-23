import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CHASSIS_STATISTICS_BY_DEVICE_ID } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class BmServersStatsService {

  constructor(private http: HttpClient) { }

  getSensorStats(deviceId: string): Observable<BmServerStats[]> {
    return this.http.get(CHASSIS_STATISTICS_BY_DEVICE_ID(deviceId), { responseType: 'text' })
      .pipe(map(res => this.convertToStatsObject(res)),
        catchError((error: HttpErrorResponse) => {
          throw error;
        }));
  }

  convertToStatsObject(data: string): BmServerStats[] {
    let stats: BmServerStats[] = [];
    const arr = data.replace(/"/g, '').split("\\n");
    arr.map((ele: string) => {
      const objs = ele.split('|');
      if (objs[0] !== "") {
        let stat: BmServerStats = {
          sensor: objs[0].trim() || 'N/A',
          sensorId: objs[1].trim() || 'N/A',
          status: objs[2].trim() || 'N/A',
          entityId: objs[3].trim() || 'N/A',
          reading: objs[4].trim() || 'N/A'
        }
        stats.push(stat);
      }
    });
    return stats;
  }
}

export interface BmServerStats {
  sensor: string;
  sensorId: string;
  status: string;
  entityId: string;
  reading: string;
}