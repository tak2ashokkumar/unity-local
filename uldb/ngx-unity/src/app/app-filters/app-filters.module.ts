import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallbackPipe, AppSecToDaysPipe, FileSizePipe, BandWidthPipe, ControlRequiredPipe, FileSizeConversionPipe } from './pipes';
import { MultiSelectSearchFilter } from './search-filter.pipe';
import { ClientSideSearchPipe } from './client-side-search.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    CallbackPipe,
    AppSecToDaysPipe,
    FileSizePipe,
    BandWidthPipe,
    ControlRequiredPipe,
    FileSizeConversionPipe,
    MultiSelectSearchFilter,
    ClientSideSearchPipe
  ],
  exports: [
    CallbackPipe,
    AppSecToDaysPipe,
    FileSizePipe,
    BandWidthPipe,
    ControlRequiredPipe,
    FileSizeConversionPipe,
    MultiSelectSearchFilter,
    ClientSideSearchPipe
  ]
})
export class AppFiltersModule {}