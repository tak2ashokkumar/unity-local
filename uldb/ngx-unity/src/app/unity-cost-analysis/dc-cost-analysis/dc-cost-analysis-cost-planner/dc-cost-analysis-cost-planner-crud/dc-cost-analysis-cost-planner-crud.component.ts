import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { PDUCRUDPowerCircuit } from 'src/app/shared/pdu-crud/pdu-crud.type';
import { DatacenterCostPlannerDataType } from '../dc-cost-analysis-cost-planner.type';
import { DcCostAnalysisCostPlannerCrudService } from './dc-cost-analysis-cost-planner-crud.service';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'MMM DD, YYYY',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
}

@Component({
  selector: 'dc-cost-analysis-cost-planner-crud',
  templateUrl: './dc-cost-analysis-cost-planner-crud.component.html',
  styleUrls: ['./dc-cost-analysis-cost-planner-crud.component.scss'],
  providers: [DcCostAnalysisCostPlannerCrudService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }]
})
export class DcCostAnalysisCostPlannerCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pId: string;

  datacenters: DatacenterFast[] = [];
  powercircuits: PDUCRUDPowerCircuit[] = [];
  planner: DatacenterCostPlannerDataType;

  plannerForm: FormGroup;
  plannerFormErrors: any;
  plannerValidationMessages: any;
  nonFieldErr: string = '';

  datacenterListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  constructor(private dcCostAnalysisCostPlannerCrudService: DcCostAnalysisCostPlannerCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe(params => this.pId = params.get('pId'));
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getFilterDropdownData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getFilterDropdownData() {
    this.dcCostAnalysisCostPlannerCrudService.getFilterDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res[0]) {
        this.datacenters = res[0];
      } else {
        this.datacenters = [];
        this.notification.error(new Notification('Failed to get Datacenters. Tryagain later.'));
      }

      if (res[1]) {
        this.powercircuits = res[1];
      } else {
        this.powercircuits = [];
        this.notification.error(new Notification('Failed to get powercircuits. Tryagain later.'));
      }
      this.addOrEditCostPlanner();
    })
  }

  addOrEditCostPlanner() {
    if (this.pId) {
      this.dcCostAnalysisCostPlannerCrudService.getCostPlannerData(this.pId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.planner = data;
        this.buildPlannerForm(data);
        data.power.forEach(element => {
          this.plannerFormErrors.power.push(this.dcCostAnalysisCostPlannerCrudService.getPowerFormErrors());
        });
        this.spinner.stop('main');
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
        this.spinner.stop('main');
      })
    }
    else {
      this.planner = null;
      this.buildPlannerForm(this.planner);
      this.spinner.stop('main');
    }
  }

  buildPlannerForm(data: DatacenterCostPlannerDataType) {
    this.plannerForm = this.dcCostAnalysisCostPlannerCrudService.buildForm(data);
    this.plannerFormErrors = this.dcCostAnalysisCostPlannerCrudService.resetPlannerFormErrors();
    for (let index = 0; index < this.powers.length - 1; index++) {
      this.plannerFormErrors.power.push(this.dcCostAnalysisCostPlannerCrudService.getPowerFormErrors());
    }
    this.plannerValidationMessages = this.dcCostAnalysisCostPlannerCrudService.plannerValidationMessages;
  }

  get powers(): FormArray {
    return this.plannerForm.get('power') as FormArray;
  }

  addPowerEntity(index: number) {
    let formGroup = <FormGroup>this.powers.at(index);
    if (formGroup.invalid) {
      this.plannerFormErrors.power[index] = this.utilService.validateForm(formGroup, this.plannerValidationMessages.power, this.plannerFormErrors.power[index]);
      formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.plannerFormErrors.power[index] = this.utilService.validateForm(formGroup, this.plannerValidationMessages.power, this.plannerFormErrors.power[index]);
        });
    }
    else {
      const pg = this.builder.group({
        entity: ['Power', [Validators.required]],
        entity_type: ['', Validators.required],
        unit_cost: [, Validators.required],
        pdu_redundant_flag: [false],
        pdu_redundant_cost: [],
      });
      this.plannerFormErrors.power.push(this.dcCostAnalysisCostPlannerCrudService.getPowerFormErrors());
      this.powers.push(pg);
    }
  }

  removePowerEntity(index: number) {
    this.powers.removeAt(index);
    this.plannerFormErrors.power.splice(index, 1);
  }

  reset() {
    if (this.pId) {
      this.buildPlannerForm(this.planner);
    } else {
      if (this.plannerForm) {
        this.plannerForm.reset();
      }
    }
  }

  handleError(err: any) {
    this.plannerFormErrors = this.dcCostAnalysisCostPlannerCrudService.resetPlannerFormErrors();
    for (let index = 0; index < this.powers.length - 1; index++) {
      this.plannerFormErrors.power.push(this.dcCostAnalysisCostPlannerCrudService.getPowerFormErrors());
    }
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.plannerForm.controls) {
          this.plannerFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmitPlannerForm() {
    if (this.plannerForm.invalid) {
      this.plannerFormErrors = this.utilService.validateForm(this.plannerForm, this.plannerValidationMessages, this.plannerFormErrors);
      this.plannerForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.plannerFormErrors = this.utilService.validateForm(this.plannerForm, this.plannerValidationMessages, this.plannerFormErrors);
        });
    } else {
      if (this.planner) {
        this.spinner.start('main');
        this.dcCostAnalysisCostPlannerCrudService.updateCostplanner(this.pId, this.plannerForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Cost Planner updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.spinner.start('main');
        this.dcCostAnalysisCostPlannerCrudService.createCostPlanner(this.plannerForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Cost Planner created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }

    }
  }

  goBack() {
    if (this.pId) {
      this.router.navigate(['../../', 'cost-planners'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../', 'cost-planners'], { relativeTo: this.route });
    }
  }

}


