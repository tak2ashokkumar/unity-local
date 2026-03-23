import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KnowledgeManagementComponent } from './knowledge-management.component';
import { KnowledgeManagementCrudComponent } from './knowledge-management-crud/knowledge-management-crud.component';

const routes: Routes = [
  {
    path: '',
    component: KnowledgeManagementComponent,
    data: {
      // breadcrumb: {
      //   title: 'Knowledge Management',
      // },
    }
  },
  {
    path: 'create',
    component: KnowledgeManagementCrudComponent,
    data: {
      breadcrumb: {
        title: 'Create',
      },
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgeManagementRoutingModule { }
