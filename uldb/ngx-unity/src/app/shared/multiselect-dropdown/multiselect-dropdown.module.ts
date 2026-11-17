import { NgModule } from '@angular/core';
import { AppCoreModule } from '../../app-core/app-core.module';
import { AppDirectivesModule } from '../../app-directives/app-directives.module';
import { MultiselectDropdownComponent, MultiSelectSearchFilter } from './multiselect-dropdown.component';

@NgModule({
  imports: [AppCoreModule, AppDirectivesModule],
  declarations: [MultiselectDropdownComponent, MultiSelectSearchFilter],
  exports: [MultiselectDropdownComponent, MultiSelectSearchFilter]
})
export class MultiselectDropdownModule { }
