import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UnityRelease } from './unity-release.type';
import { mapTo, map } from 'rxjs/operators';
import { GET_UNITY_RELEASES_DOC } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class UnityReleasesService {

  constructor(private http: HttpClient) { }

  getCurrentRelease() {
    return this.getRelease('active_release').pipe(map((releases: UnityRelease[]) => releases[0]));
  }

  getPreviousReleases() {
    return this.getRelease('previous_release');
  }

  private getRelease(releaseType: string) {
    return this.http.get<UnityRelease[]>(GET_UNITY_RELEASES_DOC(releaseType));
  }
}
