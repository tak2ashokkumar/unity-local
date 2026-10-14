export interface StatusToggleConfig {
    /** Value in the row field that represents "on" (e.g. 'Enabled', true) */
    activeValue: any;
    /** Value in the row field that represents "off" (e.g. 'Disabled', false) */
    inactiveValue: any;
    activeLabel?: string;   // default 'Enable'
    inactiveLabel?: string; // default 'Disable'
    /** Row field to check for disabling the control (e.g. 'taskId' being truthy) */
    disabledField?: string;
}

export interface TableColumn {
    key: string;
    label: string;
    widthClass?: string;
    align?: 'left' | 'center' | 'right';
    locked?: boolean;
    toggleable?: boolean;
    field?: string;
    formatter?: (value: any, row: any) => string;
    cellClass?: string;
    statusToggle?: StatusToggleConfig;
    iconCell?: IconCellConfig;
    sortable?: boolean;
    sortField?: string;
}

export interface IconCellOption {
    /** CSS class for a font icon (e.g. 'fas fa-check-circle') OR an image URL, depending on isImage. */
    icon: string;
    isImage?: boolean;
    /** Applied to both icon and label, e.g. 'text-success', 'text-danger'. */
    colorClass?: string;
    /** Overrides the displayed text. Defaults to the column's own formatted value. */
    label?: string;
}

export interface IconCellConfig {
    /** Field used to pick which IconCellOption applies. Defaults to the column's own field/key. */
    keyField?: string;
    /** Map of raw values → display options. '__default__' is used as a fallback when no exact match. */
    options: Record<string, IconCellOption>;
    iconPosition?: 'left' | 'right' | 'only';
    asBadge?: boolean;
}

export interface HeaderAction {
    id: string;
    label: string;
    icon?: string;
    btnClass?: string;     // e.g. 'btn-warning'
    visible?: boolean;
}

export interface FilterOption {
    label: string;
    value: any;
}

export interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
}

export interface PageChangeEvent {
    pageNo: number;
    pageSize: number;
}

export type SelectedFilters = { [key: string]: any[] };

export type Density = 'default' | 'compact';

export interface TableSettings {
    density: Density;
    visibleColumnKeys: string[];
}

/** Hard cap on total visible columns (locked + toggled-on) at once. */
export const MAX_VISIBLE_COLUMNS = 8;

export interface CellDisplay {
    primary: string;
    extra: string[];
    extraTooltip: string;
    isArray: boolean;
}

export interface StatusToggleEvent {
    row: any;
    index: number;
    value: boolean;
    column: TableColumn;
}

export interface BackButtonConfig {
    tooltip?: string;
    btnClass?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortEvent {
    /** The field actually sent to the API, e.g. 'name' or '-name'. */
    ordering: string;
    /** The raw field name without the '-' prefix. */
    field: string;
    direction: SortDirection;
    column: TableColumn;
}