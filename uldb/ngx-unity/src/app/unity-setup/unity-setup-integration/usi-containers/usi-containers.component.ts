import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsiContainersService } from './usi-containers.service';

@Component({
  selector: 'usi-containers',
  templateUrl: './usi-containers.component.html',
  styleUrls: ['./usi-containers.component.scss'],
  providers: [UsiContainersService]
})
export class UsiContainersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  addtooltipMsg: string;
  viewtooltipMsg: string;
  containers = {
    kubernetes: { icon: 'cfa-kubernetes', color: '#326CE5', length: 0 },
    docker: { icon: 'fab fa-docker', color: '#2496ED', length: 0 }
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private svc: UsiContainersService) { }

  ngOnInit(): void {
    this.addtooltipMsg = 'Integrate';
    this.viewtooltipMsg = 'View Details';
    this.getContainersList();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getContainersList() {
    forkJoin({
      docker: this.svc.getDockerControllers(),
      kubernetes: this.svc.getKubernetesAccounts()
    }).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      let dockerList = Array.isArray(res.docker) ? res.docker : (res.docker && res.docker.results ? res.docker.results : []);
      this.containers.docker.length = dockerList.length;
      let kubernetesList = Array.isArray(res.kubernetes) ? res.kubernetes : (res.kubernetes && res.kubernetes.results ? res.kubernetes.results : []);
      this.containers.kubernetes.length = kubernetesList.length;
    });
  }

  goToAddKubernetes() {
    this.router.navigate(['containers', 'kubernetes', 'create'], { relativeTo: this.route });
  }

  goToAddDocker() {
    this.router.navigate(['containers', 'docker', 'create'], { relativeTo: this.route });
  }

  goToKubernetesList() {
    this.router.navigate(['containers', 'kubernetes'], { relativeTo: this.route });
  }

  goToDockerList() {
    this.router.navigate(['containers', 'docker'], { relativeTo: this.route });
  }
}
