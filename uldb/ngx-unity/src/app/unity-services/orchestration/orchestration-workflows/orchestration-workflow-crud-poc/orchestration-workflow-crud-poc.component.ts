import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { OrchestrationWorkflowCrudPocService } from './orchestration-workflow-crud-poc.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UnityWorkflowViewData, unityWorkflowTaskTypes } from '../orchestration-workflow-crud/orchestration-workflow-crud.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { BranchedStep, Definition, Designer, Properties, RootEditorContext, Step, StepEditorContext, StepsConfiguration, ToolboxConfiguration, Uid, ValidatorConfiguration } from 'sequential-workflow-designer';

@Component({
	selector: 'orchestration-workflow-crud-poc',
	templateUrl: './orchestration-workflow-crud-poc.component.html',
	styleUrls: ['./orchestration-workflow-crud-poc.component.scss'],
	providers: [OrchestrationWorkflowCrudPocService],
	encapsulation: ViewEncapsulation.None
})
export class OrchestrationWorkflowCrudPocComponent implements OnInit, OnDestroy {
	private ngUnsubscribe = new Subject();
	workFlowId: string;

	viewData: UnityWorkflowViewData = new UnityWorkflowViewData();
	taskTypes = unityWorkflowTaskTypes;

	//************************************************************************** */
	private designer?: Designer;


	public definition: Definition;
	public definitionJSON?: string;
	public selectedStepId: string | null = null;
	public isReadonly = false;
	public isToolboxCollapsed = false;
	public isEditorCollapsed = false;
	public isValid?: boolean;

	public toolboxConfiguration: ToolboxConfiguration;

	public stepsConfiguration: StepsConfiguration = {
		// iconUrlProvider: () => './assets/angular-icon.svg'
	};

	public readonly validatorConfiguration: ValidatorConfiguration = {
		step: (step: Step) => !!step.name && Number(step.properties['velocity']) >= 0,
		root: (definition: Definition) => Number(definition.properties['velocity']) >= 0
	};

	constructor(private svc: OrchestrationWorkflowCrudPocService,
		private router: Router,
		private route: ActivatedRoute,
		private spinner: AppSpinnerService,) {
		this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
			this.workFlowId = params.get('id');
			if (!this.workFlowId) {
				this.workFlowId = 'a2b75cbd-6e4a-446a-b691-35c133190fc7';
			}
		});
	}

	ngOnInit(): void {
		if (this.workFlowId) {
			this.getWorkflowDetails();
		} else {
			this.manageWorkflowDetails();
		}
	}

	ngOnDestroy(): void {
		this.spinner.stop('main');
		// if (this.modalRef) {
		//   this.modalRef.hide();
		// }
		// this.maximizeLeftPanel();
		// this.resetConnectors();
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	createJob(): Step {
		return {
			id: Uid.next(),
			componentType: 'task',
			name: 'Job',
			type: 'job',
			properties: { velocity: 0 }
		};
	}

	createIf(): BranchedStep {
		return {
			id: Uid.next(),
			componentType: 'switch',
			name: 'If',
			type: 'if',
			properties: { velocity: 10 },
			branches: {
				true: [],
				false: []
			}
		};
	}

	createDefinition(): Definition {
		return {
			properties: {
				workflow_name: 'Test workflow'
			},
			sequence: [this.createJob(), this.createIf()]
		};
	}

	getWorkflowDetails() {
		this.svc.getWorkflowDetails(this.workFlowId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
			// this.viewData = this.svc.convertToViewData(res);
			console.log('res : ', res);
			this.startDesign();
			this.spinner.stop('main');
		}, (err: HttpErrorResponse) => {
			// this.viewData = this.svc.convertToViewData();
			this.startDesign();
			this.spinner.stop('main');
		})
	}

	manageWorkflowDetails() {
		this.startDesign();
	}

	isDesignReady: boolean = false;
	startDesign() {
		this.definition = this.createDefinition();
		this.toolboxConfiguration = {
			isCollapsed: true,
			groups: [
				{
					name: '',
					steps: [this.createJob(), this.createIf()]
				}
			]
		}
		this.isDesignReady = true;
		this.updateDefinitionJSON();
	}

	public onDesignerReady(designer: Designer) {
		this.designer = designer;
		this.updateIsValid();
		console.log('designer ready', this.designer);
	}

	public onDefinitionChanged(definition: Definition) {
		this.definition = definition;
		this.updateIsValid();
		this.updateDefinitionJSON();
		console.log('definition has changed');
	}

	public onSelectedStepIdChanged(stepId: string | null) {
		this.selectedStepId = stepId;
	}

	public onIsToolboxCollapsedChanged(isCollapsed: boolean) {
		this.isToolboxCollapsed = isCollapsed;
	}

	public onIsEditorCollapsedChanged(isCollapsed: boolean) {
		this.isEditorCollapsed = isCollapsed;
	}

	public updateName(step: Step, event: Event, context: StepEditorContext) {
		step.name = (event.target as HTMLInputElement).value;
		context.notifyNameChanged();
	}

	public updateProperty(properties: Properties, name: string, event: Event, context: RootEditorContext | StepEditorContext) {
		properties[name] = (event.target as HTMLInputElement).value;
		context.notifyPropertiesChanged();
	}

	public reloadDefinitionClicked() {
		this.definition = this.createDefinition();
		this.updateDefinitionJSON();
	}

	public toggleReadonlyClicked() {
		this.isReadonly = !this.isReadonly;
	}

	public toggleSelectedStepClicked() {
		if (this.selectedStepId) {
			this.selectedStepId = null;
		} else if (this.definition.sequence.length > 0) {
			this.selectedStepId = this.definition.sequence[0].id;
		}
	}

	public toggleToolboxClicked() {
		this.isToolboxCollapsed = !this.isToolboxCollapsed;
	}

	public toggleEditorClicked() {
		this.isEditorCollapsed = !this.isEditorCollapsed;
	}

	private updateDefinitionJSON() {
		this.definitionJSON = JSON.stringify(this.definition, null, 2);
	}

	private updateIsValid() {
		this.isValid = this.designer?.isValid();
	}

	newJob() {
		console.log(this.definition.sequence.length)
		let def = Object.assign({}, this.definition);
		def.sequence.push(this.createJob());
		this.onDefinitionChanged(Object.assign({}, def));
	}

	newIf() {
		console.log(this.definition.sequence.length)
		let def = Object.assign({}, this.definition);
		def.sequence.push(this.createIf());
		this.onDefinitionChanged(Object.assign({}, def));
	}

}
