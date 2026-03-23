import { NgModule } from '@angular/core';
import { AppBreadcrumbComponent } from './app-breadcrumb/app-breadcrumb.component';
import { AppBreadcrumbService } from './app-breadcrumb.service';
import { ReportAnIssueComponent } from './report-an-issue/report-an-issue.component';
import { AppCoreModule } from '../app-core/app-core.module';

@NgModule({
  declarations: [AppBreadcrumbComponent, ReportAnIssueComponent],
  exports: [AppBreadcrumbComponent, ReportAnIssueComponent],
  imports: [
    AppCoreModule
  ],
  providers: [AppBreadcrumbService]
})
export class AppBreadcrumbModule { }
