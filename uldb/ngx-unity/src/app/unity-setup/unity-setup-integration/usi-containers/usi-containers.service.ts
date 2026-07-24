import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GET_DOCKER_CONTROLLERS, KUBERNETES_ACCOUNTS } from 'src/app/shared/api-endpoint.const';
import { ContainerControllerType } from 'src/app/shared/SharedEntityTypes/container-contoller.type';

@Injectable()
export class UsiContainersService {

  constructor(private http: HttpClient) { }

  getDockerControllers(): Observable<ContainerControllerType[]> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<ContainerControllerType[]>(GET_DOCKER_CONTROLLERS(), { params: params });
  }

  getKubernetesAccounts(): Observable<any> {
    let params: HttpParams = new HttpParams().set('page_size', 0);
    return this.http.get<any>(KUBERNETES_ACCOUNTS(), { params: params });
  }
}
