import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DOWNLOAD_REPORT } from 'src/app/shared/api-endpoint.const';

/**
 * Provides API access, form construction, and data mapping helpers for Report Management Preview.
 */
@Injectable()
export class ReportManagementPreviewService {
  constructor(private http: HttpClient) {}

  /**
   * Executes the download workflow for Report Management Preview Service.
   *
   * @param uuid - Identifier used to target the uuid.
   * @returns The value produced by the workflow.
   */
  download(uuid: string) {
    // Keep preview download behavior aligned with the report list action.
    return this.http.get<{ data: string }>(DOWNLOAD_REPORT(uuid));
  }
}
