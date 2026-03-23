import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { KubernetesNodesService, KubernetesNodesViewdata } from './kubernetes-nodes.service';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { Subject, interval } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { tap, switchMap, takeWhile, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'kubernetes-nodes',
  templateUrl: './kubernetes-nodes.component.html',
  styleUrls: ['./kubernetes-nodes.component.scss'],
  providers: [KubernetesNodesService]
})
export class KubernetesNodesComponent implements OnInit, OnDestroy {
  count: number = 0;
  viewData: KubernetesNodesViewdata[] = [];
  controllerId: string;
  selectedNodeId: string;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  poll: boolean = false;

  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;

  constructor(private route: ActivatedRoute,
    private notification: AppNotificationService,
    private router: Router,
    private storageService: StorageService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private nodesService: KubernetesNodesService,
    private termService: FloatingTerminalService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'account_uuid': this.controllerId }] };
    });

    this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(this.controllerId ? environment.pollingInterval * 6 : environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.controllerId ? this.syncNodes() : this.getNodes());
  }
  ngOnInit() {
    if (this.controllerId) {
      this.syncNodes();
    } else {
      this.getNodes();
    }
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getNodes();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getNodes();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getNodes();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getNodes();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getNodes();
  }

  syncNodes() {
    this.spinnerService.start('main');
    this.nodesService.syncNodes(this.controllerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(status => {
      if (status.result.data) {
        this.spinnerService.stop('main');
        this.getNodes();
      } else {
        this.spinnerService.stop('main');
        this.notification.error(new Notification('Kubernetes connection failed. Please Contact administrator!'));
      }
    }, (err: Error) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching Nodes.'));
    });
  }

  getNodes() {
    this.nodesService.getNodes(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.nodesService.convertToViewdata(data.results);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification('Error while fetching Nodes.'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  consoleSameTab(view: KubernetesNodesViewdata) {
    if (!view.isSameTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.nodesService.getConsoleAccessInput(view);
    this.termService.openTerminal(obj);
  }

  consoleNewTab(view: KubernetesNodesViewdata) {
    if (!view.isNewTabEnabled) {
      return;
    }
    let obj: ConsoleAccessInput = this.nodesService.getConsoleAccessInput(view);
    obj.newTab = true;
    this.storageService.put('console', obj, StorageType.LOCALSTORAGE);
    window.open(view.newTabConsoleAccessUrl);
  }

}
