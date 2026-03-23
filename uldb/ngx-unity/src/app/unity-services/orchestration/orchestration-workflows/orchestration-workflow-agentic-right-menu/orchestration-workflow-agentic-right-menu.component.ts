import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostBinding, Inject, OnInit, Output, Renderer2 } from '@angular/core';

@Component({
  selector: 'orchestration-workflow-agentic-right-menu',
  templateUrl: './orchestration-workflow-agentic-right-menu.component.html',
  styleUrls: ['./orchestration-workflow-agentic-right-menu.component.scss']
})
export class OrchestrationWorkflowAgenticRightMenuComponent implements OnInit {

  @Output() closeSidebar = new EventEmitter<void>();

  openAccordionIndex: number | null = null;
  openSubAccordion: { [key: string]: number | null } = {};
  @HostBinding('style.width.px')
  hostWidth = 430;

  @HostBinding('style.position')
  hostPosition = 'absolute';

  @HostBinding('style.right.px')
  right = 0;

  @HostBinding('style.top.px')
  top = 0;

  @HostBinding('style.height')
  height = '100%';

  minWidth = 300;
  maxWidth = 700;

  private isResizing = false;
  private removeMouseMove?: () => void;
  private removeMouseUp?: () => void;

  constructor(@Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  startResize(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;

    this.removeMouseMove = this.renderer.listen(
      this.document,
      'mousemove',
      (e: MouseEvent) => this.onResize(e)
    );

    this.removeMouseUp = this.renderer.listen(
      this.document,
      'mouseup',
      () => this.stopResize()
    );
  }

  onResize(event: MouseEvent) {
    if (!this.isResizing) return;

    const newWidth = window.innerWidth - event.clientX;

    if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
      this.hostWidth = newWidth;
    }
  }

  stopResize() {
    this.isResizing = false;
    this.removeMouseMove?.();
    this.removeMouseUp?.();
  }

  helpSections = [
    {
      title: 'Get familiar with the nodes and components.',
      items: [
        {
          subtitle: 'What is a workflow?',
          description: `A workflow is a structured set of connected nodes (tasks, AI, conditions, outputs) to achieve an automation goal. <br><br><strong>Common Fields</strong>
          <ul>
              <li><strong>Name:</strong> Name of  the Node (Unique).</li>
              <li><strong>Settings:</strong> Controls retries & timeouts.</li>
              <li><strong>Input Parameters:</strong> You can add multiple parameters with  Name, type and default value.</li>
              <li><strong>Output:</strong> Defines output of a specific node (param name, expression type, expression).</li>
            </ul>
          `
        },
        {
          subtitle: 'Trigger Nodes',
          description: `
            Define how workflows begin:
            <ul>
              <li><strong>Manual Trigger:</strong> User runs the workflow manually.</li>
              <li><strong>Schedule Trigger:</strong> Workflow runs on the scheduled time.</li>
              <li><strong>On Chat Trigger:</strong> LLM or the Agent starts flow from user prompt.</li>
            </ul>
          `
        },
        {
          subtitle: 'Advanced AI Node',
          description: `
            Brings intelligence into workflows:
            <ul>
              <li><strong>AI Agent:</strong> Executes tasks autonomously based on Private LLM prompts, memory, and tools.</li>
              <li><strong>LLM Chain:</strong> Uses LLM for text analysis, generation, or insights.</li>
            </ul>
          `
        },
        {
          subtitle: 'Task Nodes',
          description: `
            Run scripts/operations like Python, Ansible, Terraform, etc.<br>
            <ul>
              <li>Ideal for automation, data processing, infra configs.</li>
            </ul>  
          `
        },
        {
          subtitle: 'Condition Nodes',
          description: `
            Control workflow branching:
            <ul>
              <li><strong>If Condition:</strong> Run a particular task only if a condition is satisfied or run another.</li>
              <li><strong>Switch Case:</strong> Branches into multiple paths depending on value.</li>
            </ul>
          `
        },
        {
          subtitle: 'Output Nodes',
          description: `
            Define end results:
            <ul>
              <li><strong>Email:</strong> Sends email to the recipient (to, subject, body).</li>
              <li><strong>Chart:</strong> Based on coordinates, it will generate different type of charts on execute of a workflow.</li>
            </ul>
          `
        },
        {
          subtitle: 'Source Nodes',
          description: `
            Connect workflows with external APIs/systems. Retrieve Data, Trigger actions or sync with third-part platforms.
          `
        }
      ]
    },
    {
      title: 'How to build a workflow?',
      steps: [
        `<strong>Step 1 - Add Trigger Node –</strong> Start with manual, schedule, or chat trigger.`,
        `<strong>Step 2 - Add Other Nodes –</strong> Insert tasks, AI, sources, conditions, or outputs.`,
        `<strong>Step 3 - Connect Nodes –</strong> Link them to define flow logic.`,
        `<strong>Step 4 - Edit/Delete Nodes –</strong> Use hover icons to update or remove.`,
        `<strong>Step 5 - Save Workflow –</strong> Click <strong>Save Changes</strong> to save the workflow. Workflow is processed and added to the workflow list.`,
        `<strong>Step 6 - Run or Manage –</strong> Execute, edit, delete, or schedule from the list.`,
      ]
    }
  ];

  toggleAccordion(index: number): void {
    this.openAccordionIndex = this.openAccordionIndex === index ? null : index;
  }

  toggleSubAccordion(sectionIndex: number, itemIndex: number): void {
    const key = `${sectionIndex}`;

    if (this.openSubAccordion[key] === undefined) this.openSubAccordion[key] = null;

    this.openSubAccordion[key] =
      this.openSubAccordion[key] === itemIndex ? null : itemIndex;
  }


  isSubAccordionOpen(sectionIndex: number, itemIndex: number): boolean {
    return this.openSubAccordion[`${sectionIndex}`] === itemIndex;
  }

  onClose() {
    this.closeSidebar.emit();
  }

}
