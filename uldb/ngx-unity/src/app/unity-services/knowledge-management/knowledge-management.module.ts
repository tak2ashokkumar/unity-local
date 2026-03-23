import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KnowledgeManagementRoutingModule } from './knowledge-management-routing.module';
import { KnowledgeManagementComponent } from './knowledge-management.component';
import { KnowledgeManagementCrudComponent } from './knowledge-management-crud/knowledge-management-crud.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppCoreModule } from 'src/app/app-core/app-core.module';
import { EchartsxModule } from 'echarts-for-angular';
import { NgxFileDropModule } from 'ngx-file-drop';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    KnowledgeManagementComponent,
    KnowledgeManagementCrudComponent
  ],
  imports: [
    AppCoreModule,
    CommonModule,
    KnowledgeManagementRoutingModule,
    SharedModule,
    EchartsxModule,
    NgxFileDropModule,
    NgSelectModule
  ]
})
export class KnowledgeManagementModule { }
