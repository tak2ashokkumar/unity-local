import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { OrchestrationAgenticWorkflowAimlTriggerService } from './orchestration-agentic-workflow-aiml-trigger.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'orchestration-agentic-workflow-aiml-trigger',
  templateUrl: './orchestration-agentic-workflow-aiml-trigger.component.html',
  styleUrls: ['./orchestration-agentic-workflow-aiml-trigger.component.scss'],
  providers: [OrchestrationAgenticWorkflowAimlTriggerService]
})
export class OrchestrationAgenticWorkflowAimlTriggerComponent implements OnInit {

  private ngUnsubscribe = new Subject();
  aimlTriggerForm: FormGroup;
  aimlTriggerFormErrors: any;
  aimlTriggerFormValidationMessage: any;
  workflowId: string;
  workflowName: string;
  aimlData: any[] = [];
  isDropdownOpen = false;
  isLoading = false;
  hasNextPage = true;
  page = 1;
  pageSize = 10;
  selectedItem: any;
  aimlParams: any;

  constructor(private svc: OrchestrationAgenticWorkflowAimlTriggerService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private router: Router, private eRef: ElementRef) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.workflowId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.getWebhookDetails();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // getAIMLData(param: any) {
  //   const obj = { aiml_type: param.config.aiml_type, event_type: param.config.event_type, filter: param.config.filter }
  //   this.svc.getAIMLData(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.aimlData = res.results.map(item => ({
  //       ...item,
  //       status: item.status === 0 ? "Open" : item.status === 1 ? "Resolved" : item.status
  //     }));
  //   }, () => {
  //     this.notification.error(new Notification('Failed to load AIML Data'));
  //   });
  // }

  getAIMLData() {
    if (this.isLoading || !this.hasNextPage) return;

    this.isLoading = true;

    const obj = {
      aiml_type: this.aimlParams.config.aiml_type,
      event_type: this.aimlParams.config.event_type,
      filter: this.aimlParams.config.filter
    };

    this.svc.getAIMLData(this.page, this.pageSize, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {

      const newData = res.results.map(item => ({
        ...item,
        status: item.status === 0 ? "Open" : item.status === 1 ? "Resolved" : item.status
      }));

      this.aimlData = [...(this.aimlData || []), ...newData];
      this.hasNextPage = !!res.next;
      this.page++;
      this.isLoading = false;
      this.spinner.stop('main');

    }, () => {
      this.isLoading = false;
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load AIML Data'));
    });
  }

  onScroll(event: any) {
    const element = event.target;

    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 10;

    if (atBottom) {
      this.getAIMLData();
    }
  }

  openDropdown() {
    this.page = 1;
    this.hasNextPage = true;
    this.aimlData = [];

    this.getAIMLData();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen && this.aimlData.length === 0) {
      this.openDropdown();
    }
  }

  selectItem(item: any) {
    this.selectedItem = item;
    this.aimlTriggerForm.patchValue({ id: item.id });
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  getWebhookDetails() {
    this.spinner.start('main');
    this.svc.getAIMLTriggerDetails(this.workflowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
      this.workflowName = param.name;
      this.buildWebhookForm(param);
      this.aimlParams = param;
      this.getAIMLData();
    }, err => {
      this.notification.error(new Notification('Error while fetching AIML Trigger Inputs. Please try again!!'));
    });
  }

  buildWebhookForm(param: any) {
    this.aimlTriggerForm = this.svc.buildAIMLTriggerForm(param);
    this.aimlTriggerFormErrors = this.svc.resetAIMLFormErrors();
    this.aimlTriggerFormValidationMessage = this.svc.aimlFormValidationMessages;
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.aimlTriggerForm.invalid) {
      this.aimlTriggerFormErrors = this.utilService.validateForm(this.aimlTriggerForm, this.aimlTriggerFormValidationMessage, this.aimlTriggerFormErrors);
      this.aimlTriggerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.aimlTriggerFormErrors = this.utilService.validateForm(this.aimlTriggerForm, this.aimlTriggerFormValidationMessage, this.aimlTriggerFormErrors);
      });
      return;
    } else {
      this.spinner.start('main');
      const obj = { aiml_data: this.aimlTriggerForm.getRawValue() }
      this.svc.sendAIMLTriggerDetails(this.workflowId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.goBack();
        this.notification.success(new Notification('AIML trigger execution started successfully'));
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('AIML trigger execution failed'));
      });
    }
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
