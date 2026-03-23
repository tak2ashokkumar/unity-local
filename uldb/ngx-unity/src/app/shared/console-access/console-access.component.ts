import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleAccessService } from './console-access.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CheckAuthService, ConsoleAccessInput, AuthType, TerminalInput } from 'src/app/shared/check-auth/check-auth.service';
import { StorageService, StorageType } from '../app-storage/storage.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';

@Component({
  selector: 'console-access',
  templateUrl: './console-access.component.html',
  styleUrls: ['./console-access.component.scss'],
  providers: [ConsoleAccessService]
})
export class ConsoleAccessComponent implements OnInit, OnDestroy {
  input: ConsoleAccessInput;
  termData: TerminalInput = null;
  private ngUnsubscribe = new Subject();
  @Output() inputLoaded = new EventEmitter<ConsoleAccessInput>();

  closed: boolean = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private consoleService: ConsoleAccessService,
    private spinner: AppSpinnerService,
    private authService: CheckAuthService,
    private notification: AppNotificationService,
    private storage: StorageService) {
  }

  ngOnInit() {
    this.loadInput();
    if (this.input && !this.input.managementIp) {
      this.getDetails();
    } else if (this.input && this.input.managementIp) {
      setTimeout(() => {
        this.checkAuthentication();
      }, 0);
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('console', StorageType.SESSIONSTORAGE);
  }

  loadInput() {
    this.input = this.storage.extractByKey('console', StorageType.LOCALSTORAGE);
    if (this.input) {
      this.storage.put('console', this.input, StorageType.SESSIONSTORAGE);
    } else {
      this.input = this.storage.getByKey('console', StorageType.SESSIONSTORAGE);
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  getDetails() {
    this.spinner.start('main');
    this.consoleService.getDetails(this.input.deviceType, this.input.deviceId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (res: any) => {
          this.input.managementIp = res;
          this.spinner.stop('main');
          this.checkAuthentication();
        },
        err => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Error while fetching VM details. Please contact support'));
          this.goBack();
        }
      );
  }

  checkAuthentication() {
    this.inputLoaded.emit(this.input);
    this.authService.checkAuth(this.input).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res != null) {
          this.termData = Object.assign(res, { uuid: this.input.deviceId });
        } else {
          this.closed = true;
          // closed modal without login, need to test for open in new tab
          if (!this.input.newTab) {
            this.goBack();
          } else {
            window.close();
          }
        }
      });
  }

}