import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { defer, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import {
  CUSTOM_DASHBOARD_DEVICE_SELECTION, CUSTOM_DASHBOARD_DEVICE_STATUS, CUSTOM_DASHBOARD_ITEM_VALUE_TYPES, CUSTOM_DASHBOARD_MAX_DEVICES,
  CUSTOM_DASHBOARD_MAX_METRICS, CUSTOM_DASHBOARD_MAX_SOURCES, CUSTOM_DASHBOARD_SOURCE_KINDS, parseCustomDashboardPublicCloudDeviceType
} from '../app-custom-dashboards.const';
import {
  CustomDashboardDataScopeChange, CustomDashboardDataSource, CustomDashboardDevice, CustomDashboardDeviceType, CustomDashboardDeviceTypeOption,
  CustomDashboardItem, CustomDashboardMetricCategory, CustomDashboardMetricGroup, CustomDashboardMetricOption, CustomDashboardPagedResults,
  CustomDashboardScope, CustomDashboardScopeGroup, CustomDashboardSelectedDevice, CustomDashboardSelectedDeviceType,
  CustomDashboardSelectedMetricGroup, CustomDashboardSourceNode
} from '../app-custom-dashboards.type';
import { AppCustomDashboardDataScopeService } from './app-custom-dashboard-data-scope.service';

const ITEMS_DEBOUNCE_MS = 400;

// Data Scope tab of the panel editor: Data Source tree -> Device Types -> Devices ->
// Metrics (moved to Selected). It owns its lookups and tells the panel editor which
// sources and metrics the selection resolves to.
@Component({
  selector: 'app-custom-dashboard-data-scope',
  templateUrl: './app-custom-dashboard-data-scope.component.html',
  styleUrls: ['./app-custom-dashboard-data-scope.component.scss'],
  providers: [AppCustomDashboardDataScopeService]
})
export class AppCustomDashboardDataScopeComponent implements OnInit, OnDestroy {
  @Input() sources: CustomDashboardDataSource[] = [];
  @Input() metrics: CustomDashboardMetricOption[] = [];
  @Input() submitted = false;
  @Output() scopeChange = new EventEmitter<CustomDashboardDataScopeChange>();
  private readonly ngUnsubscribe = new Subject<void>();
  deviceSearch = '';
  deviceStatus = 'all';
  deviceTypeFilter = 'all';
  deviceSelectionFilter = 'all';
  metricSearch = '';
  metricCategory = 'all';

  private readonly loadDeviceTypes$ = new Subject<void>();
  private readonly loadDevices$ = new Subject<void>();
  private readonly loadItems$ = new Subject<void>();
  // What was last reported to the panel editor (sources + metric keys / labels).
  private lastSignature: string;
  private lastLabels: string;
  // Changes only count as edits once the user has touched the tab; until then they come
  // from loading the saved selection.
  private interacted = false;

  sourceNodes: CustomDashboardSourceNode[] = [];
  selectedScopeIds: string[] = [];
  private scopeKinds: { [scopeId: string]: string } = {};
  // Public Cloud account -> provider (aws / azure / gcp / oci), to call that provider's APIs.
  private scopeProviders: { [scopeId: string]: string } = {};

  deviceTypeOptions: CustomDashboardDeviceTypeOption[] = [];
  selectedDeviceTypes: CustomDashboardSelectedDeviceType[] = [];
  deviceTypesLoading = false;
  private deviceTypesByScope: { [scopeId: string]: CustomDashboardDeviceType[] } = {};
  // Display names of Public Cloud resource types (their device_type is "<provider>:<id>").
  private deviceTypeLabels: { [deviceType: string]: string } = {};

  deviceStatuses = CUSTOM_DASHBOARD_DEVICE_STATUS;
  deviceSelections = CUSTOM_DASHBOARD_DEVICE_SELECTION;
  deviceOptions: CustomDashboardDevice[] = [];
  filteredDevices: CustomDashboardDevice[] = [];
  devicesCount = 0;
  devicesTruncated = false;
  devicesLoading = false;
  selectedDevices: CustomDashboardSelectedDevice[] = [];

  // Several panel editors can be open at once, so radio names / ids must be unique.
  metricRadioName = `cdMetricCategory${Math.random().toString(36).slice(2, 8)}`;
  metricGroups: CustomDashboardMetricGroup[] = [];
  metricCategories: CustomDashboardMetricCategory[] = [];
  availableGroups: CustomDashboardMetricGroup[] = [];
  remainingCount = 0;
  checkedGroupKeys: string[] = [];
  itemsLoading = false;
  itemsFailed = false;
  itemsTruncated = false;
  detailsGroup: CustomDashboardMetricGroup;
  private loadedItemsFor: string = null;

  selectedGroups: CustomDashboardSelectedMetricGroup[] = [];
  checkedSelectedKeys: string[] = [];
  // Saved metrics are kept as they are until the item list has loaded once and they can
  // be matched to the metrics shown in the lists.
  metricsHydrated = false;
  currentMetrics: CustomDashboardMetricOption[] = [];

  maxSources = CUSTOM_DASHBOARD_MAX_SOURCES;
  maxDevices = CUSTOM_DASHBOARD_MAX_DEVICES;
  maxMetrics = CUSTOM_DASHBOARD_MAX_METRICS;

  constructor(private svc: AppCustomDashboardDataScopeService,
    private notificationSvc: AppNotificationService) { }

  ngOnInit(): void {
    this.hydrateSelection();
    this.currentMetrics = [...(this.metrics || [])];
    this.metricsHydrated = !this.currentMetrics.length;
    this.lastSignature = this.getSignature(this.sources || [], this.currentMetrics);
    this.bindLoaders();
    this.loadScopes();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // Panel-level rule for the Data Scope tab; empty when the tab is valid.
  getValidationError(): string {
    if (!this.selectedScopeIds.length) {
      return 'Select at least one data source.';
    }
    if (!this.selectedDeviceTypes.length) {
      return 'Select at least one device type.';
    }
    if (!this.selectedDevices.length) {
      return 'Select at least one device.';
    }
    if (!this.currentMetrics.length) {
      return this.selectedGroups.length
        ? 'None of the selected devices report the selected metrics. Select other devices or metrics.'
        : 'Move at least one metric to Selected.';
    }
    if (this.currentMetrics.length > this.maxMetrics) {
      return `This panel resolves to ${this.currentMetrics.length} metric series (devices x metrics); the limit is ${this.maxMetrics}. Select fewer devices or metrics.`;
    }
    return '';
  }

  getSelectedCount(): number {
    return this.metricsHydrated ? this.selectedGroups.length : this.currentMetrics.length;
  }

  getKindLabel(kind: string): string {
    const option = CUSTOM_DASHBOARD_SOURCE_KINDS.find(k => k.value === kind);
    return option ? option.label : kind;
  }

  getDeviceTypeLabel(deviceType: string): string {
    return this.deviceTypeLabels[deviceType] || this.svc.getDeviceTypeLabel(deviceType);
  }

  // ---------- Data Source tree ----------

  isScopeSelectable(scope: CustomDashboardScope): boolean {
    return this.svc.isScopeSelectable(scope);
  }

  isScopeSelected(scope: CustomDashboardScope): boolean {
    return this.selectedScopeIds.includes(scope.id);
  }

  getScopeTooltip(scope: CustomDashboardScope): string {
    if (!this.isScopeSelectable(scope)) {
      return scope.device_catalog_reason || 'This data source is not available.';
    }
    return scope.parent ? `${this.getKindLabel(scope.parent.kind)}: ${scope.parent.name}` : '';
  }

  getSelectableScopes(scopes: CustomDashboardScope[]): CustomDashboardScope[] {
    return scopes.filter(s => this.isScopeSelectable(s));
  }

  getNodeScopes(node: CustomDashboardSourceNode): CustomDashboardScope[] {
    return this.getSelectableScopes(node.groups.reduce((all, g) => all.concat(g.scopes), [] as CustomDashboardScope[]));
  }

  getAllScopes(): CustomDashboardScope[] {
    return this.sourceNodes.reduce((all, n) => all.concat(this.getNodeScopes(n)), [] as CustomDashboardScope[]);
  }

  areAllSelected(scopes: CustomDashboardScope[]): boolean {
    return scopes.length > 0 && scopes.every(s => this.isScopeSelected(s));
  }

  areSomeSelected(scopes: CustomDashboardScope[]): boolean {
    return scopes.some(s => this.isScopeSelected(s)) && !this.areAllSelected(scopes);
  }

  toggleAllScopes(target: HTMLInputElement): void {
    if (target.checked) {
      this.sourceNodes.forEach(n => n.expanded = true);
    }
    this.toggleScopes(this.getAllScopes(), target.checked);
  }

  toggleNode(node: CustomDashboardSourceNode, target: HTMLInputElement): void {
    if (target.checked) {
      node.expanded = true;
    }
    this.toggleScopes(this.getNodeScopes(node), target.checked);
  }

  toggleScopes(scopes: CustomDashboardScope[], checked: boolean): void {
    this.interacted = true;
    scopes.forEach(scope => {
      const index = this.selectedScopeIds.indexOf(scope.id);
      if (checked && index === -1) {
        this.selectedScopeIds.push(scope.id);
      } else if (!checked && index > -1) {
        this.selectedScopeIds.splice(index, 1);
      }
    });
    this.pruneSelection();
    this.buildDeviceTypeOptions();
    this.loadDeviceTypes$.next();
    this.emitChange();
  }

  // ---------- Device types ----------

  hasMultipleKinds(): boolean {
    return new Set(this.deviceTypeOptions.map(t => t.kind)).size > 1;
  }

  isDeviceTypeSelected(option: CustomDashboardDeviceTypeOption): boolean {
    return this.selectedDeviceTypes.some(t => this.svc.getDeviceTypeKey(t) === option.key);
  }

  areAllDeviceTypesSelected(): boolean {
    const available = this.deviceTypeOptions.filter(t => t.available);
    return available.length > 0 && available.every(t => this.isDeviceTypeSelected(t));
  }

  toggleAllDeviceTypes(target: HTMLInputElement): void {
    this.interacted = true;
    const available = this.deviceTypeOptions.filter(t => t.available);
    if (target.checked && available.length > this.maxSources) {
      target.checked = false;
      this.notificationSvc.error(new Notification(`You can select up to ${this.maxSources} device types per panel.`));
      return;
    }
    this.selectedDeviceTypes = target.checked ? available.map(t => ({ kind: t.kind, device_type: t.device_type })) : [];
    this.onDeviceTypesChanged();
  }

  toggleDeviceType(option: CustomDashboardDeviceTypeOption, target: HTMLInputElement): void {
    this.interacted = true;
    if (!target.checked) {
      this.selectedDeviceTypes = this.selectedDeviceTypes.filter(t => this.svc.getDeviceTypeKey(t) !== option.key);
    } else if (this.selectedDeviceTypes.length >= this.maxSources) {
      target.checked = false;
      this.notificationSvc.error(new Notification(`You can select up to ${this.maxSources} device types per panel.`));
      return;
    } else {
      this.selectedDeviceTypes = [...this.selectedDeviceTypes, { kind: option.kind, device_type: option.device_type }];
    }
    this.onDeviceTypesChanged();
  }

  // ---------- Devices ----------

  isDeviceSelected(deviceId: string): boolean {
    return this.selectedDevices.some(d => d.device_id === deviceId);
  }

  areAllDevicesSelected(): boolean {
    return this.filteredDevices.length > 0 && this.filteredDevices.every(d => this.isDeviceSelected(d.device_id));
  }

  areSomeDevicesSelected(): boolean {
    return this.filteredDevices.some(d => this.isDeviceSelected(d.device_id)) && !this.areAllDevicesSelected();
  }

  // "Data Center - DC-West", "Public Cloud - AWS - <account>".
  getDeviceLocation(device: CustomDashboardDevice): string {
    if (!device.scope) {
      return '';
    }
    const scopeName = device.scope.name || this.getScopeName(device.scope.id);
    return device.scope.kind === 'public_cloud'
      ? `${this.getKindLabel(device.scope.kind)} - ${device.category} - ${scopeName}`
      : `${this.getKindLabel(device.scope.kind)} - ${scopeName}`;
  }

  onDeviceFilterChange(): void {
    this.refreshDevices();
  }

  // The status filter is also saved on each source.
  onDeviceStatusChange(): void {
    this.interacted = true;
    this.refreshDevices();
    this.emitChange();
  }

  clearDeviceSearch(): void {
    this.deviceSearch = '';
    this.refreshDevices();
  }

  toggleDevice(device: CustomDashboardDevice, target: HTMLInputElement): void {
    this.interacted = true;
    if (!target.checked) {
      this.selectedDevices = this.selectedDevices.filter(d => d.device_id !== device.device_id);
    } else if (this.selectedDevices.length >= this.maxDevices) {
      target.checked = false;
      this.notificationSvc.error(new Notification(`You can select up to ${this.maxDevices} devices per panel.`));
      return;
    } else {
      this.selectedDevices = [...this.selectedDevices, this.toSelectedDevice(device)];
    }
    this.onDevicesChanged();
  }

  // Header checkbox: (un)selects the devices the filters currently show.
  toggleAllDevices(target: HTMLInputElement): void {
    this.interacted = true;
    if (!target.checked) {
      const visibleIds = this.filteredDevices.map(d => d.device_id);
      this.selectedDevices = this.selectedDevices.filter(d => !visibleIds.includes(d.device_id));
    } else {
      const toAdd = this.filteredDevices.filter(d => !this.isDeviceSelected(d.device_id));
      const room = Math.max(this.maxDevices - this.selectedDevices.length, 0);
      if (toAdd.length > room) {
        this.notificationSvc.error(new Notification(
          `You can select up to ${this.maxDevices} devices per panel, so ${toAdd.length - room} of them were not selected.`));
      }
      this.selectedDevices = [...this.selectedDevices, ...toAdd.slice(0, room).map(d => this.toSelectedDevice(d))];
    }
    this.onDevicesChanged();
    target.checked = this.areAllDevicesSelected();
  }

  // ---------- Metrics ----------

  onMetricFilterChange(): void {
    this.refreshMetricList();
  }

  clearMetricSearch(): void {
    this.metricSearch = '';
    this.refreshMetricList();
  }

  isGroupChecked(group: CustomDashboardMetricGroup): boolean {
    return this.checkedGroupKeys.includes(group.key);
  }

  toggleGroupCheck(group: CustomDashboardMetricGroup, checked: boolean): void {
    this.checkedGroupKeys = checked ? [...this.checkedGroupKeys, group.key] : this.checkedGroupKeys.filter(k => k !== group.key);
  }

  areAllVisibleGroupsChecked(): boolean {
    const visible = this.availableGroups.filter(g => g.selectable);
    return visible.length > 0 && visible.every(g => this.isGroupChecked(g));
  }

  toggleAllVisibleGroups(checked: boolean): void {
    const visibleKeys = this.availableGroups.filter(g => g.selectable).map(g => g.key);
    const others = this.checkedGroupKeys.filter(k => !visibleKeys.includes(k));
    this.checkedGroupKeys = checked ? [...others, ...visibleKeys] : others;
  }

  getGroupDeviceCount(groupKey: string): number {
    const group = this.metricGroups.find(g => g.key === groupKey);
    return group ? group.items.filter(i => i.selectable !== false && this.isDeviceSelected(i.device_id)).length : 0;
  }

  getGroupDeviceNames(group: CustomDashboardMetricGroup): string {
    return group.items.map(i => this.getDeviceName(i.device_id)).join(', ');
  }

  getValueTypeLabel(valueType: number): string {
    return CUSTOM_DASHBOARD_ITEM_VALUE_TYPES[valueType] || '-';
  }

  toggleDetails(group: CustomDashboardMetricGroup): void {
    this.detailsGroup = this.detailsGroup === group ? null : group;
  }

  closeDetails(): void {
    this.detailsGroup = null;
  }

  // Moves the checked metrics to Selected; each one applies to every selected device
  // that reports it, so the move is refused when it would exceed the series limit.
  moveRight(): void {
    const groups = this.metricGroups.filter(g => g.selectable && this.isGroupChecked(g));
    if (!groups.length) {
      return;
    }
    const next = [...this.selectedGroups, ...groups.map(g => this.toSelectedGroup(g))];
    const total = this.expandGroups(next).length;
    if (total > this.maxMetrics) {
      this.notificationSvc.error(new Notification(
        `A panel can show up to ${this.maxMetrics} metric series (devices x metrics). This selection needs ${total}.`));
      return;
    }
    this.interacted = true;
    this.selectedGroups = next.sort((a, b) => a.name.localeCompare(b.name));
    this.checkedGroupKeys = [];
    this.metricSearch = '';
    this.refreshMetricList();
    this.emitChange();
  }

  // ---------- Selected ----------

  isSelectedChecked(group: CustomDashboardSelectedMetricGroup): boolean {
    return this.checkedSelectedKeys.includes(group.key);
  }

  toggleSelectedCheck(group: CustomDashboardSelectedMetricGroup, checked: boolean): void {
    this.checkedSelectedKeys = checked ? [...this.checkedSelectedKeys, group.key] : this.checkedSelectedKeys.filter(k => k !== group.key);
  }

  areAllSelectedChecked(): boolean {
    return this.selectedGroups.length > 0 && this.selectedGroups.every(g => this.isSelectedChecked(g));
  }

  toggleAllSelectedChecks(checked: boolean): void {
    this.checkedSelectedKeys = checked ? this.selectedGroups.map(g => g.key) : [];
  }

  moveLeft(): void {
    if (!this.checkedSelectedKeys.length) {
      return;
    }
    this.interacted = true;
    this.selectedGroups = this.selectedGroups.filter(g => !this.isSelectedChecked(g));
    this.checkedSelectedKeys = [];
    this.refreshMetricList();
    this.emitChange();
  }

  clearAll(): void {
    this.interacted = true;
    this.selectedGroups = [];
    this.checkedSelectedKeys = [];
    // Saved metrics that were never matched to the lists are dropped too.
    this.metricsHydrated = true;
    this.refreshMetricList();
    this.emitChange();
  }

  onAggregationChange(group: CustomDashboardSelectedMetricGroup, aggregation: string): void {
    this.interacted = true;
    group.aggregation = aggregation;
    this.emitChange();
  }

  trackByNode(_index: number, node: CustomDashboardSourceNode): string {
    return node.kind;
  }

  trackByScopeGroup(_index: number, group: CustomDashboardScopeGroup): string {
    return group.label;
  }

  trackByScope(_index: number, scope: CustomDashboardScope): string {
    return scope.id;
  }

  trackByDeviceType(_index: number, option: CustomDashboardDeviceTypeOption): string {
    return option.key;
  }

  trackByDevice(_index: number, device: CustomDashboardDevice): string {
    return device.device_id;
  }

  trackByCategory(_index: number, category: CustomDashboardMetricCategory): string {
    return category.device_type;
  }

  trackByGroup(_index: number, group: { key: string }): string {
    return group.key;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ---------- private helpers ----------

  // Edit mode: rebuild the selection from the saved sources.
  private hydrateSelection(): void {
    (this.sources || []).forEach(source => {
      const publicCloud = parseCustomDashboardPublicCloudDeviceType(source.device_type);
      (source.scope_ids || []).forEach(id => {
        this.scopeKinds[id] = source.kind;
        if (publicCloud) {
          this.scopeProviders[id] = publicCloud.provider;
        }
        if (!this.selectedScopeIds.includes(id)) {
          this.selectedScopeIds.push(id);
        }
      });
      if (!this.selectedDeviceTypes.some(t => t.kind === source.kind && t.device_type === source.device_type)) {
        this.selectedDeviceTypes.push({ kind: source.kind, device_type: source.device_type });
      }
      (source.device_ids || []).filter(id => !this.isDeviceSelected(id)).forEach(id =>
        this.selectedDevices.push({ kind: source.kind, device_type: source.device_type, device_id: id }));
    });
    const first = (this.sources || [])[0];
    this.deviceStatus = first && first.status ? first.status : 'all';
  }

  // Each lookup cancels the one still running before it, so quick clicks never apply a
  // stale response.
  private bindLoaders(): void {
    this.loadDeviceTypes$.pipe(switchMap(() => this.requestDeviceTypes()), takeUntil(this.ngUnsubscribe))
      .subscribe(complete => this.onDeviceTypesLoaded(complete));
    this.loadDevices$.pipe(switchMap(() => this.requestDevices()), takeUntil(this.ngUnsubscribe))
      .subscribe(res => this.onDevicesLoaded(res));
    this.loadItems$.pipe(debounceTime(ITEMS_DEBOUNCE_MS), switchMap(() => this.requestItems()), takeUntil(this.ngUnsubscribe))
      .subscribe(res => this.onItemsLoaded(res.result, res.signature, res.failed));
  }

  // Data Center / Private Cloud scopes come from the metadata API (which does not list
  // Public Cloud); Public Cloud scopes are the accounts of the existing Public Cloud APIs.
  private loadScopes(): void {
    this.sourceNodes = CUSTOM_DASHBOARD_SOURCE_KINDS.map(k => ({
      kind: k.value,
      label: k.label,
      expanded: false,
      loading: true,
      groups: []
    }));
    const requests = this.sourceNodes.map(node => {
      const request$ = node.kind === 'public_cloud' ? this.svc.getPublicCloudScopes() : this.svc.getScopes(node.kind);
      return request$.pipe(map(res => ({ node, res })), catchError(() => of({ node, res: null })));
    });
    forkJoin(requests).pipe(takeUntil(this.ngUnsubscribe)).subscribe(results => {
      const loadedKinds: string[] = [];
      const loadedIds: string[] = [];
      results.forEach(({ node, res }) => {
        node.loading = false;
        if (!res) {
          return;
        }
        res.results.forEach(scope => {
          this.scopeKinds[scope.id] = scope.kind || node.kind;
          if (node.kind === 'public_cloud' && scope.provider) {
            this.scopeProviders[scope.id] = scope.provider.id;
          }
          loadedIds.push(scope.id);
        });
        if (!res.truncated) {
          loadedKinds.push(node.kind);
        }
        node.groups = this.svc.getScopeGroups(node.kind, res.results);
        node.expanded = res.results.some(s => this.isScopeSelected(s));
      });
      if (results.some(r => !r.res)) {
        this.notificationSvc.error(new Notification('Failed to fetch data sources.'));
      }
      // A saved scope that is no longer listed cannot be used any more.
      const before = this.selectedScopeIds.length;
      this.selectedScopeIds = this.selectedScopeIds.filter(id => !loadedKinds.includes(this.scopeKinds[id]) || loadedIds.includes(id));
      if (before !== this.selectedScopeIds.length) {
        this.pruneSelection();
      }
      this.loadDeviceTypes$.next();
      this.emitChange();
    });
  }

  // Device types are cached per scope; only scopes not read yet are requested. Data Center /
  // Private Cloud ask the metadata API per scope; Public Cloud reads the resource types once
  // per provider and gives them to every account of that provider.
  private requestDeviceTypes(): Observable<boolean> {
    return defer(() => {
      const missing = this.selectedScopeIds.filter(id => !this.deviceTypesByScope[id] && this.scopeKinds[id]);
      const metadataIds = missing.filter(id => this.scopeKinds[id] !== 'public_cloud');
      const providers = missing.filter(id => this.scopeKinds[id] === 'public_cloud' && this.scopeProviders[id])
        .map(id => this.scopeProviders[id])
        .filter((provider, index, all) => all.indexOf(provider) === index);
      const requests: Observable<boolean>[] = [
        ...metadataIds.map(id => this.svc.getDeviceTypes(this.scopeKinds[id], id).pipe(
          map(res => {
            this.deviceTypesByScope[id] = (res && res.results) || [];
            return true;
          }),
          catchError(() => of(false)))),
        ...providers.map(provider => this.svc.getPublicCloudDeviceTypes(provider).pipe(
          map(types => {
            Object.keys(this.scopeProviders).filter(id => this.scopeProviders[id] === provider).forEach(id => this.deviceTypesByScope[id] = types);
            return true;
          }),
          catchError(() => of(false))))
      ];
      if (!requests.length) {
        return of(true);
      }
      this.deviceTypesLoading = true;
      return forkJoin(requests).pipe(map(results => results.every(r => r)), finalize(() => this.deviceTypesLoading = false));
    });
  }

  private onDeviceTypesLoaded(complete: boolean): void {
    if (!complete) {
      this.notificationSvc.error(new Notification('Failed to fetch some device types.'));
    }
    this.pruneSelection();
    this.buildDeviceTypeOptions();
    this.loadDevices$.next();
    this.emitChange();
  }

  private onDeviceTypesChanged(): void {
    this.pruneSelection();
    if (this.deviceTypeFilter !== 'all' && !this.selectedDeviceTypes.some(t => this.svc.getDeviceTypeKey(t) === this.deviceTypeFilter)) {
      this.deviceTypeFilter = 'all';
    }
    this.loadDevices$.next();
    this.emitChange();
  }

  // Union of the device types offered by the selected scopes, per source kind. Saved
  // device types stay listed while their scope lists are still unknown.
  private buildDeviceTypeOptions(): void {
    const options: CustomDashboardDeviceTypeOption[] = [];
    this.selectedScopeIds.forEach(id => {
      const kind = this.scopeKinds[id];
      (this.deviceTypesByScope[id] || []).forEach(t => {
        if (t.label) {
          this.deviceTypeLabels[t.device_type] = t.label;
        }
        const key = this.svc.getDeviceTypeKey({ kind, device_type: t.device_type });
        const existing = options.find(o => o.key === key);
        if (existing) {
          existing.available = existing.available || t.available;
          return;
        }
        options.push({
          key,
          kind,
          device_type: t.device_type,
          label: this.getDeviceTypeLabel(t.device_type),
          category: t.category,
          available: t.available,
          reason: t.reason
        });
      });
    });
    this.selectedDeviceTypes.filter(t => !options.some(o => o.key === this.svc.getDeviceTypeKey(t))).forEach(t => options.push({
      key: this.svc.getDeviceTypeKey(t),
      kind: t.kind,
      device_type: t.device_type,
      label: this.getDeviceTypeLabel(t.device_type),
      category: '',
      available: true,
      reason: null
    }));
    this.deviceTypeOptions = options.sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label));
  }

  // Data Center / Private Cloud device types use one grouped metadata call; each Public
  // Cloud resource type lists its resources in the selected accounts of its provider.
  private requestDevices(): Observable<CustomDashboardPagedResults<CustomDashboardDevice>> {
    return defer(() => {
      const sources = this.selectedDeviceTypes
        .map(t => ({ kind: t.kind, device_type: t.device_type, scope_ids: this.getScopeIdsFor(t) }))
        .filter(s => s.scope_ids.length);
      const metadataSources = sources.filter(s => s.kind !== 'public_cloud');
      const requests: Observable<CustomDashboardPagedResults<CustomDashboardDevice>>[] = [
        ...(metadataSources.length ? [this.svc.getDevices(metadataSources)] : []),
        ...sources.filter(s => s.kind === 'public_cloud').map(s => this.svc.getPublicCloudDevices(s.device_type, s.scope_ids))
      ].map(request$ => request$.pipe(catchError(() => of(null))));
      if (!requests.length) {
        return of({ results: [], count: 0, truncated: false });
      }
      this.devicesLoading = true;
      return forkJoin(requests).pipe(
        map(lists => {
          if (lists.some(list => !list)) {
            this.notificationSvc.error(new Notification('Failed to fetch some devices.'));
          }
          return this.svc.mergePagedResults(lists);
        }),
        finalize(() => this.devicesLoading = false));
    });
  }

  private onDevicesLoaded(res: CustomDashboardPagedResults<CustomDashboardDevice>): void {
    if (res) {
      this.deviceOptions = res.results;
      this.devicesCount = res.count;
      this.devicesTruncated = res.truncated;
      // Selected devices that are no longer listed are dropped (only when the full list is known).
      if (!res.truncated) {
        this.selectedDevices = this.selectedDevices.filter(d => this.deviceOptions.some(o => o.device_id === d.device_id));
      }
    }
    this.refreshDevices();
    this.queueItemsLoad();
    this.emitChange();
  }

  private onDevicesChanged(): void {
    this.refreshDevices();
    this.queueItemsLoad();
    this.emitChange();
  }

  private refreshDevices(): void {
    const search = (this.deviceSearch || '').trim().toLowerCase();
    this.filteredDevices = this.deviceOptions.filter(d =>
      (!search || (d.name || '').toLowerCase().includes(search)) &&
      (this.deviceStatus === 'all' || d.status === this.deviceStatus) &&
      (this.deviceTypeFilter === 'all' || this.svc.getDeviceTypeKey(this.toSelectedDevice(d)) === this.deviceTypeFilter) &&
      (this.deviceSelectionFilter === 'all' || (this.deviceSelectionFilter === 'selected') === this.isDeviceSelected(d.device_id)));
  }

  private queueItemsLoad(): void {
    if (this.getDevicesSignature() !== this.loadedItemsFor) {
      this.loadItems$.next();
    }
  }

  // Data Center / Private Cloud devices use one multi-device metadata call; each Public Cloud
  // resource lists its own Zabbix items.
  private requestItems(): Observable<{ result: CustomDashboardPagedResults<CustomDashboardItem>, signature: string, failed: boolean }> {
    return defer(() => {
      const signature = this.getDevicesSignature();
      const devices = this.selectedDevices.slice(0, this.maxDevices);
      const metadataDevices = devices.filter(d => !this.svc.isPublicCloudDeviceType(d.device_type));
      const requests: Observable<CustomDashboardPagedResults<CustomDashboardItem>>[] = [
        ...(metadataDevices.length ? [this.svc.getItems(metadataDevices)] : []),
        ...devices.filter(d => this.svc.isPublicCloudDeviceType(d.device_type)).map(d => this.svc.getPublicCloudItems(d))
      ].map(request$ => request$.pipe(catchError(() => of(null))));
      if (!requests.length) {
        return of({ result: { results: [], count: 0, truncated: false }, signature, failed: false });
      }
      this.itemsLoading = true;
      return forkJoin(requests).pipe(
        map(lists => {
          const failed = lists.some(list => !list);
          if (failed) {
            this.notificationSvc.error(new Notification('Failed to fetch metrics for some devices.'));
          }
          return { result: this.svc.mergePagedResults(lists), signature, failed };
        }),
        finalize(() => this.itemsLoading = false));
    });
  }

  // A failed load keeps the previous lists, so the panel does not lose its metrics. Saved
  // metrics are only matched to the lists once a load had no failures.
  private onItemsLoaded(res: CustomDashboardPagedResults<CustomDashboardItem>, signature: string, failed: boolean): void {
    this.itemsFailed = failed || !res;
    if (!res) {
      return;
    }
    this.loadedItemsFor = failed ? null : signature;
    this.itemsTruncated = res.truncated;
    this.metricGroups = this.svc.buildMetricGroups(res.results);
    if (!this.metricsHydrated && !failed) {
      this.hydrateSelectedGroups(res.results);
      this.metricsHydrated = true;
    }
    this.pruneSelectedGroups();
    this.refreshMetricList();
    this.emitChange();
  }

  // Saved metrics -> the metrics they belong to in the list.
  private hydrateSelectedGroups(items: CustomDashboardItem[]): void {
    this.currentMetrics.forEach(m => {
      const item = items.find(i => i.device_id === m.metric.device_id && Number(i.item_id) === Number(m.metric.item_id));
      if (!item) {
        return;
      }
      const key = this.svc.getMetricGroupKey(item);
      if (this.selectedGroups.some(g => g.key === key)) {
        return;
      }
      const group = this.metricGroups.find(g => g.key === key);
      this.selectedGroups.push({
        key,
        device_type: item.device_type,
        name: item.name,
        unit: item.unit,
        aggregation: m.metric.aggregation,
        aggregations: group ? group.aggregations : (item.aggregations || [])
      });
    });
    this.selectedGroups.sort((a, b) => a.name.localeCompare(b.name));
  }

  private refreshMetricList(): void {
    const selectedKeys = this.selectedGroups.map(g => g.key);
    const remaining = this.metricGroups.filter(g => !selectedKeys.includes(g.key));
    this.remainingCount = remaining.length;
    const categories: CustomDashboardMetricCategory[] = [];
    this.metricGroups.forEach(g => {
      let category = categories.find(c => c.device_type === g.device_type);
      if (!category) {
        category = { device_type: g.device_type, label: this.getDeviceTypeLabel(g.device_type), count: 0 };
        categories.push(category);
      }
      if (!selectedKeys.includes(g.key)) {
        category.count++;
      }
    });
    this.metricCategories = categories.sort((a, b) => a.label.localeCompare(b.label));
    if (this.metricCategory !== 'all' && !this.metricCategories.some(c => c.device_type === this.metricCategory)) {
      this.metricCategory = 'all';
    }
    const search = (this.metricSearch || '').trim().toLowerCase();
    this.availableGroups = remaining.filter(g =>
      (this.metricCategory === 'all' || g.device_type === this.metricCategory) &&
      (!search || g.name.toLowerCase().includes(search) || (g.itemKey || '').toLowerCase().includes(search)));
    this.checkedGroupKeys = this.checkedGroupKeys.filter(k => remaining.some(g => g.key === k));
    this.checkedSelectedKeys = this.checkedSelectedKeys.filter(k => selectedKeys.includes(k));
    if (this.detailsGroup && !remaining.includes(this.detailsGroup)) {
      this.detailsGroup = null;
    }
  }

  // Keeps every level consistent with the one above it: device types need a selected
  // scope of their kind that offers them, devices need their device type (and scope).
  private pruneSelection(): void {
    this.selectedDeviceTypes = this.selectedDeviceTypes.filter(t => this.getScopeIdsFor(t).length > 0);
    this.selectedDevices = this.selectedDevices.filter(d => {
      if (!this.selectedDeviceTypes.some(t => t.kind === d.kind && t.device_type === d.device_type)) {
        return false;
      }
      const device = this.deviceOptions.find(o => o.device_id === d.device_id);
      return !device || !device.scope || this.selectedScopeIds.includes(device.scope.id);
    });
    this.pruneSelectedGroups();
    this.refreshDevices();
  }

  // Selected metrics of a device type that is no longer selected cannot resolve.
  private pruneSelectedGroups(): void {
    const deviceTypes = this.selectedDeviceTypes.map(t => t.device_type);
    this.selectedGroups = this.selectedGroups.filter(g => deviceTypes.includes(g.device_type));
    this.refreshMetricList();
  }

  // Selected scopes of the device type's kind that offer it (unknown lists count as offering).
  // A Public Cloud resource type only belongs to accounts of its own provider.
  private getScopeIdsFor(deviceType: CustomDashboardSelectedDeviceType): string[] {
    const publicCloud = parseCustomDashboardPublicCloudDeviceType(deviceType.device_type);
    return this.selectedScopeIds.filter(id => {
      if (this.scopeKinds[id] !== deviceType.kind) {
        return false;
      }
      if (publicCloud && this.scopeProviders[id] && this.scopeProviders[id] !== publicCloud.provider) {
        return false;
      }
      const types = this.deviceTypesByScope[id];
      return !types || types.some(t => t.device_type === deviceType.device_type);
    });
  }

  private buildSources(): CustomDashboardDataSource[] {
    return this.selectedDeviceTypes.map(t => ({
      kind: t.kind,
      device_type: t.device_type,
      scope_ids: this.getScopeIdsFor(t),
      device_ids: this.selectedDevices.filter(d => d.kind === t.kind && d.device_type === t.device_type).map(d => d.device_id),
      status: this.deviceStatus
    })).filter(s => s.scope_ids.length);
  }

  private expandGroups(groups: CustomDashboardSelectedMetricGroup[]): CustomDashboardMetricOption[] {
    const metrics: CustomDashboardMetricOption[] = [];
    groups.forEach(selected => {
      const group = this.metricGroups.find(g => g.key === selected.key);
      (group ? group.items : []).filter(i => i.selectable !== false && this.isDeviceSelected(i.device_id)).forEach(item => {
        const aggregation = (item.aggregations || []).includes(selected.aggregation)
          ? selected.aggregation : this.svc.getDefaultAggregation(item.aggregations);
        metrics.push(this.svc.toMetricOption(item, this.getDeviceName(item.device_id), aggregation, selected.key));
      });
    });
    return metrics;
  }

  // Reports the resolved sources and metrics when they (or their labels) changed.
  // userChange is false when only labels changed (e.g. saved metrics got their names) or
  // while the saved selection is still loading.
  private emitChange(): void {
    if (this.metricsHydrated) {
      this.currentMetrics = this.expandGroups(this.selectedGroups);
    } else {
      this.currentMetrics = this.currentMetrics.filter(m => this.isDeviceSelected(m.metric.device_id));
    }
    const sources = this.buildSources();
    const signature = this.getSignature(sources, this.currentMetrics);
    const labels = `${this.getSelectedCount()}#${this.currentMetrics.map(m => `${m.key}=${m.deviceName}|${m.itemName}`).join(';')}`;
    if (signature === this.lastSignature && labels === this.lastLabels) {
      return;
    }
    const userChange = this.interacted && signature !== this.lastSignature;
    this.lastSignature = signature;
    this.lastLabels = labels;
    this.scopeChange.emit({ sources, metrics: this.currentMetrics, selectedCount: this.getSelectedCount(), userChange });
  }

  private getSignature(sources: CustomDashboardDataSource[], metrics: CustomDashboardMetricOption[]): string {
    const sourceKeys = sources.map(s => [
      s.kind,
      s.device_type,
      [...(s.scope_ids || [])].sort().join(','),
      [...(s.device_ids || [])].sort().join(','),
      s.status || 'all'
    ].join(':')).sort().join(';');
    return `${sourceKeys}#${metrics.map(m => m.key).sort().join(',')}`;
  }

  private getDevicesSignature(): string {
    return this.selectedDevices.map(d => `${d.device_type}|${d.device_id}`).sort().join(',');
  }

  private getScopeName(scopeId: string): string {
    for (const node of this.sourceNodes) {
      for (const group of node.groups) {
        const scope = group.scopes.find(s => s.id === scopeId);
        if (scope) {
          return scope.name;
        }
      }
    }
    return scopeId;
  }

  private getDeviceName(deviceId: string): string {
    const device = this.deviceOptions.find(d => d.device_id === deviceId);
    return device ? device.name : deviceId;
  }

  private toSelectedDevice(device: CustomDashboardDevice): CustomDashboardSelectedDevice {
    return { kind: device.scope ? device.scope.kind : '', device_type: device.device_type, device_id: device.device_id };
  }

  private toSelectedGroup(group: CustomDashboardMetricGroup): CustomDashboardSelectedMetricGroup {
    return {
      key: group.key,
      device_type: group.device_type,
      name: group.name,
      unit: group.unit,
      aggregation: this.svc.getDefaultAggregation(group.aggregations),
      aggregations: group.aggregations
    };
  }
}
