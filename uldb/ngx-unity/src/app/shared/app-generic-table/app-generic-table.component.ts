import {
  AfterContentInit, Component, ContentChildren, ElementRef, EventEmitter, HostListener,
  Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild
} from '@angular/core';
import {
  BackButtonConfig,
  CellDisplay, Density, FilterConfig, FilterOption, HeaderAction, MAX_VISIBLE_COLUMNS,
  SelectedFilters, SortDirection, SortEvent, StatusToggleEvent, TableColumn, TableSettings
} from './app-generic-table.type';
import { CtCellTemplateDirective } from './app-generic-table-cell.directive';

@Component({
  selector: 'app-generic-table',
  templateUrl: './app-generic-table.component.html',
  styleUrls: ['./app-generic-table.component.scss']
})
export class AppGenericTableComponent implements OnInit, OnChanges, AfterContentInit {
  // Row 1
  @Input() title = '';
  @Input() count = 0;
  @Input() headerActions: HeaderAction[] = [];
  @Output() headerActionClick = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();
  @Input() showBackButton = false;
  @Input() backButtonConfig: BackButtonConfig = {};
  @Output() back = new EventEmitter<void>();

  // Row 2
  @Input() searchValue = '';
  @Output() searched = new EventEmitter<string>();
  @Input() filters: FilterConfig[] = [];
  @Output() filtersApplied = new EventEmitter<SelectedFilters>();
  @Input() pageSizeOptions: number[] = [10, 25, 100];
  @Input() pageSize = 10;
  @Output() pageSizeChange = new EventEmitter<number>();

  // View settings (density + field visibility)
  @Input() density: Density = 'default';
  @Output() densityChange = new EventEmitter<Density>();
  @Output() settingsChanged = new EventEmitter<TableSettings>();

  // Row 3 & 4
  @Input() columns: TableColumn[] = [];
  @Output() sortChanged = new EventEmitter<SortEvent>();
  @Input() activeSortField: string | null = null;
  @Input() activeSortDirection: SortDirection = null;

  /** Accepts a paginated API response ({ results: [...] }), a plain array, or a single object. */
  @Input() set data(value: any) {
    this._rawData = value;
  }
  get data(): any {
    return this._rawData;
  }
  private _rawData: any = null;

  @Input() emptyMessage = 'No records were found.';

  @ContentChildren(CtCellTemplateDirective) cellTemplateDirectives!: QueryList<CtCellTemplateDirective>;
  cellTemplateMap = new Map<string, CtCellTemplateDirective['templateRef']>();

  // Status toggle (built-in Enable/Disable pill cell)
  @Output() statusToggle = new EventEmitter<StatusToggleEvent>();

  // Footer
  @Input() pageNo = 1;
  @Input() totalCount = 0;
  @Output() pageChange = new EventEmitter<number>();

  isFilterOpen = false;
  activeFilterKey: string | null = null;
  filterSearchValue = '';
  /** Currently-applied filters, driven by the parent (e.g. restored from query params
   *  or persisted state) so the panel shows the right checked options on load. */
  @Input() selectedFilters: SelectedFilters = {};
  pendingFilters: SelectedFilters = {};

  jumpToPage: number | null = null;

  isSettingsOpen = false;
  visibleColumnKeys = new Set<string>();
  private columnsInitialized = false;

  @ViewChild('filterControl') filterControl?: ElementRef<HTMLElement>;
  @ViewChild('settingsControl') settingsControl?: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.jumpToPage = this.pageNo;
  }

  ngAfterContentInit(): void {
    this.rebuildCellTemplateMap();
    this.cellTemplateDirectives.changes.subscribe(() => this.rebuildCellTemplateMap());
  }

  private rebuildCellTemplateMap(): void {
    this.cellTemplateMap = new Map(
      this.cellTemplateDirectives.map(d => [d.columnKey, d.templateRef] as const)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] && this.columns?.length && !this.columnsInitialized) {
      const locked = this.columns.filter(c => c.locked).map(c => c.key);
      const toggleable = this.columns.filter(c => !c.locked && c.toggleable !== false).map(c => c.key);
      const max = Math.max(0, MAX_VISIBLE_COLUMNS - locked.length);
      const initial = toggleable.slice(0, max);
      this.visibleColumnKeys = new Set([...locked, ...initial]);
      this.columnsInitialized = true;
    }
    if (changes['pageNo']) {
      this.jumpToPage = this.pageNo;
    }
    // Keep pendingFilters (used for checkbox state) mirrored to whatever the parent
    // currently considers "applied" — this is what makes previously selected filter
    // options show as checked when returning to the page after restoring from a URL.
    if (changes['selectedFilters'] && !this.isFilterOpen) {
      this.pendingFilters = JSON.parse(JSON.stringify(this.selectedFilters || {}));
    }
  }

  /** Normalizes `data` into a flat row array, regardless of shape passed in. */
  get rows(): any[] {
    const value = this._rawData;
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.results)) return value.results;
    if (value && typeof value === 'object') return [value];
    return [];
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }
  get activeFilter(): FilterConfig | undefined {
    return this.filters.find(f => f.key === this.activeFilterKey);
  }
  get filteredOptions(): FilterOption[] {
    const filter = this.activeFilter;
    if (!filter) return [];
    if (!this.filterSearchValue) return filter.options;
    return filter.options.filter(o => o.label.toLowerCase().includes(this.filterSearchValue.toLowerCase()));
  }
  get appliedFilterCount(): number {
    return Object.values(this.selectedFilters).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  }
  get pageNumbers(): number[] {
    const total = this.totalPages, current = this.pageNo, delta = 2;
    const start = Math.max(1, current - delta), end = Math.min(total, current + delta);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
  get isJumpTargetValid(): boolean {
    return this.jumpToPage != null &&
      Number.isInteger(this.jumpToPage) &&
      this.jumpToPage >= 1 &&
      this.jumpToPage <= this.totalPages &&
      this.jumpToPage !== this.pageNo;
  }

  get toggleableColumns(): TableColumn[] {
    return this.columns.filter(c => !c.locked && c.toggleable !== false);
  }
  get lockedColumns(): TableColumn[] {
    return this.columns.filter(c => c.locked);
  }
  get visibleColumns(): TableColumn[] {
    return this.columns.filter(c => c.locked || this.visibleColumnKeys.has(c.key));
  }

  /** Max number of non-locked columns that can be toggled on at once, given how many are locked. */
  get maxToggleableVisible(): number {
    return Math.max(0, MAX_VISIBLE_COLUMNS - this.lockedColumns.length);
  }
  get visibleToggleableCount(): number {
    return this.toggleableColumns.filter(c => this.visibleColumnKeys.has(c.key)).length;
  }
  isColumnToggleDisabled(key: string): boolean {
    return !this.visibleColumnKeys.has(key) && this.visibleToggleableCount >= this.maxToggleableVisible;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (!this.filterControl?.nativeElement.contains(target)) {
      this.isFilterOpen = false;
    }
    if (!this.settingsControl?.nativeElement.contains(target)) {
      this.isSettingsOpen = false;
    }
  }

  toggleFilterPanel() {
    this.isFilterOpen = !this.isFilterOpen;
    if (this.isFilterOpen) {
      this.isSettingsOpen = false;
      this.pendingFilters = JSON.parse(JSON.stringify(this.selectedFilters));
      this.activeFilterKey = this.filters[0]?.key || null;
      this.filterSearchValue = '';
    }
  }
  selectFilterCategory(key: string) { this.activeFilterKey = key; this.filterSearchValue = ''; }
  isOptionChecked(key: string, value: any): boolean {
    return !!this.pendingFilters[key]?.some(v => v === value);
  }
  toggleOption(key: string, value: any) {
    const current = this.pendingFilters[key] || [];
    const idx = current.findIndex(v => v === value);
    idx > -1 ? current.splice(idx, 1) : current.push(value);
    this.pendingFilters = { ...this.pendingFilters, [key]: [...current] };
  }
  categorySelectedCount(key: string): number { return this.pendingFilters[key]?.length || 0; }
  clearActiveCategory() { if (this.activeFilterKey) this.pendingFilters = { ...this.pendingFilters, [this.activeFilterKey]: [] }; }
  clearAllFilters() { this.pendingFilters = {}; }
  applyFilters() {
    this.selectedFilters = JSON.parse(JSON.stringify(this.pendingFilters));
    this.isFilterOpen = false;
    this.filtersApplied.emit(this.selectedFilters);
  }

  trackByFilterKey(_index: number, item: FilterConfig): string { return item.key; }
  trackByOptionValue(_index: number, item: FilterOption): any { return item.value; }
  trackByColumnKey(_index: number, item: TableColumn): string { return item.key; }
  trackByRow(_index: number, row: any): any { return row?.uuid ?? row?.id ?? _index; }

  toggleSettingsPanel() {
    this.isSettingsOpen = !this.isSettingsOpen;
    if (this.isSettingsOpen) {
      this.isFilterOpen = false;
    }
  }
  isColumnChecked(key: string): boolean {
    return this.visibleColumnKeys.has(key);
  }
  toggleColumnVisibility(key: string) {
    const isCurrentlyOn = this.visibleColumnKeys.has(key);
    if (!isCurrentlyOn && this.visibleToggleableCount >= this.maxToggleableVisible) {
      return;
    }
    const next = new Set(this.visibleColumnKeys);
    isCurrentlyOn ? next.delete(key) : next.add(key);
    this.visibleColumnKeys = next;
    this.emitSettingsChanged();
  }
  setDensity(d: Density) {
    if (this.density === d) return;
    this.density = d;
    this.densityChange.emit(this.density);
    this.emitSettingsChanged();
  }
  private emitSettingsChanged() {
    this.settingsChanged.emit({ density: this.density, visibleColumnKeys: Array.from(this.visibleColumnKeys) });
  }

  onSearch(value: string) { this.searched.emit(value); }
  onPageSizeChange(size: number) { this.pageSize = +size; this.pageSizeChange.emit(this.pageSize); }
  onHeaderActionClick(id: string) { this.headerActionClick.emit(id); }
  onRefresh() { this.refresh.emit(); }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.pageNo) return;
    this.pageChange.emit(page);
  }
  goToPrev() { this.goToPage(this.pageNo - 1); }
  goToNext() { this.goToPage(this.pageNo + 1); }
  jumpTo() {
    if (this.isJumpTargetValid) {
      this.goToPage(this.jumpToPage!);
    }
  }

  // --- Dynamic cell value resolution ---

  private getValue(row: any, path: string): any {
    if (!path) return undefined;
    return path.split('.').reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), row);
  }

  private stringifyPrimitive(v: any): string {
    if (v == null) return '';
    if (typeof v === 'object') return v.name ?? v.label ?? v.title ?? JSON.stringify(v);
    return String(v);
  }

  cellDisplay(row: any, col: TableColumn): CellDisplay {
    const raw = this.getValue(row, col.field || col.key);
    if (Array.isArray(raw)) {
      const strs = raw.map(v => this.stringifyPrimitive(v));
      return {
        primary: strs[0] ?? '',
        extra: strs.slice(1),
        extraTooltip: strs.slice(1).join(', '),
        isArray: true
      };
    }
    const formatted = col.formatter ? col.formatter(raw, row) : raw;
    const primary = formatted != null && formatted !== '' ? String(formatted) : '—';
    return { primary, extra: [], extraTooltip: '', isArray: false };
  }

  // --- Status toggle (built-in Enable/Disable pill) ---

  isStatusActive(row: any, col: TableColumn): boolean {
    if (!col.statusToggle) return false;
    const raw = this.getValue(row, col.field || col.key);
    return raw === col.statusToggle.activeValue;
  }

  isStatusInactive(row: any, col: TableColumn): boolean {
    if (!col.statusToggle) return false;
    const raw = this.getValue(row, col.field || col.key);
    return raw === col.statusToggle.inactiveValue;
  }

  isStatusToggleDisabled(row: any, col: TableColumn): boolean {
    const field = col.statusToggle?.disabledField;
    if (!field) return false;
    return !!this.getValue(row, field);
  }

  onStatusToggleClick(row: any, index: number, value: boolean, col: TableColumn) {
    if (this.isStatusToggleDisabled(row, col)) return;
    this.statusToggle.emit({ row, index, value, column: col });
  }

  getIconCellDisplay(row: any, col: TableColumn): { icon: string; isImage: boolean; colorClass: string; label: string } | null {
    if (!col.iconCell) return null;
    const keyField = col.iconCell.keyField || col.field || col.key;
    const rawKey = this.getValue(row, keyField);
    const opt = col.iconCell.options[rawKey] ?? col.iconCell.options['__default__'];
    if (!opt) return null;

    const label = opt.label !== undefined
      ? opt.label
      : (col.iconCell.iconPosition === 'only' ? '' : this.cellDisplay(row, col).primary);

    return { icon: opt.icon, isImage: !!opt.isImage, colorClass: opt.colorClass || '', label };
  }

  onBack() { this.back.emit(); }

  isColumnSorted(col: TableColumn): SortDirection {
    const field = col.sortField || col.key;
    return this.activeSortField === field ? this.activeSortDirection : null;
  }

  onSortClick(col: TableColumn) {
    if (!col.sortable) return;
    const field = col.sortField || col.key;

    let nextDirection: SortDirection;
    if (this.activeSortField !== field) {
      nextDirection = 'asc';
    } else if (this.activeSortDirection === 'asc') {
      nextDirection = 'desc';
    } else if (this.activeSortDirection === 'desc') {
      nextDirection = null;
    } else {
      nextDirection = 'asc';
    }

    this.activeSortField = nextDirection ? field : null;
    this.activeSortDirection = nextDirection;

    const ordering = nextDirection === 'desc' ? `-${field}` : (nextDirection === 'asc' ? field : '');

    this.sortChanged.emit({ ordering, field, direction: nextDirection, column: col });
  }
}