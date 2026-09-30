import { ApiRecord } from '../data/types';

// How a value renders inside a table cell.
export type CellType =
  | 'text'      // plain result[name]
  | 'mono'      // monospaced (ids, ip addresses, codes)
  | 'link'      // navigates to a detail route (uriPrefix + row[idField])
  | 'fk'        // inline foreign-key object -> show row[name][subfield]
  | 'choice'    // enum value shown as-is
  | 'badge'     // enum value shown as a colored status pill (badgeMap)
  | 'boolean'   // check / cross icon
  | 'multiple'  // array of {subfield} rendered as chips
  | 'datetime'  // ISO string formatted
  | 'number';   // right-aligned numeric

// How a field renders inside the create/edit form.
export type InputType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'password'
  | 'email'
  | 'choices'      // <select> from choices[]
  | 'obj_choices'  // <select> of {value,label}
  | 'multiple'     // multi-select from an async/loaded resource
  | 'typeahead'    // async single foreign-key lookup
  | 'boolean'      // true/false select or switch
  | 'datetime'
  | 'file';        // <input type="file"> - saved as multipart/form-data

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

// The atomic field unit - shared by the list column AND the form input, mirroring
// the legacy ULDBService2 field object contract.
export interface FieldDef {
  name: string;                 // data key: row[name], payload[name]
  label: string;                // column header + form label
  cell?: CellType;              // table rendering (default 'text')
  input?: InputType;            // form widget (default derived: 'text')
  accept?: string;              // input='file' only: the accept attribute
  maxSizeKb?: number;           // input='file' only: reject larger uploads
  required?: boolean;           // form validation; when false the field is omitted from the form
  hideInList?: boolean;         // hide from the table
  hideInForm?: boolean;         // hide from the form entirely
  hideOnEdit?: boolean;         // hide from the form only in edit mode
  sortable?: boolean;           // column sorting (default true for scalar cells)

  // link / fk
  subfield?: string;            // nested prop to display for fk/multiple (default 'name')
  uriPrefix?: string;           // app route prefix for link cells (e.g. '/organization/')
  idField?: string;             // id key used to build the link (default 'id')

  // choices / enums
  choices?: (string | number | boolean)[];
  objChoices?: { value: string | number | boolean; label: string }[];
  boolLabels?: [string, string]; // [trueLabel, falseLabel] for boolean cells

  // typeahead / multiple (async lookups against another resource)
  lookupUri?: string;           // resource uri to query for options
  lookupAccessor?: string;      // display prop of an option (default 'name')
  /* Composed option label, for lookups whose records have no single display
     field. Zabbix customer/instance pairs are the case: the record holds
     `customer` and `zabbix_instance` objects and no flat name, so the legacy
     search built "<customer> - <instance>" itself (uldb-utils.js
     search_zabbix_instance). Used for display AND for type-ahead filtering. */
  lookupLabel?: (option: ApiRecord) => string;
  lookupIdProp?: string;        // id prop of an option (default 'id')

  // presentation
  badgeMap?: Record<string, BadgeTone>;
  width?: string;               // column width hint, e.g. '160px'
  align?: 'left' | 'center' | 'right';
  placeholder?: string;
  help?: string;
  format?: (value: unknown, row: ApiRecord) => string; // custom text formatter

  /* Value transforms for fields whose STORED shape differs from what the form
     edits. Monitoring configuration is the case that needs them: the API stores
     each device class as { zabbix: bool, observium: bool } but the legacy form
     edited it as a single choice, flattening the object to the selected key
     (orgMonitoringConfigToolNameFilter). Without these, RecordForm would seed a
     select with an object and submit one back. */
  toInput?: (value: unknown, row: ApiRecord) => unknown;   // record -> form value
  fromInput?: (value: unknown, values: ApiRecord) => unknown; // form value -> payload

  /* Field that lives inside a nested object on the payload rather than at the top
     level. The form edits it flat and RecordForm folds every field sharing a group
     back into `payload[group]` on submit. Zabbix template definitions need it: the
     twelve metric keys are all properties of one `item_key` object. */
  group?: string;

  /* CASCADING OPTIONS - this field's option source depends on another field.
     Two legacy cascades need it:
       user      org -> GET /rest/org/{id}/get_groups_roles/  (roles AND groups)
       zabbix    instance -> GET /rest/zabbix/instance/{id}/zabbix_templates/
     `lookupUriFrom` returns null while the dependency is unset, which renders the
     control disabled instead of fetching a nonsense URL; picking a new dependency
     clears this field, so a stale child value can never be submitted. */
  dependsOn?: string;                                       // sibling field name
  lookupUriFrom?: (dependencyValue: unknown) => string | null;
  lookupResultKey?: string;                                 // pick this key out of the response
}

// A tabbed list (legacy master_list_tab.html): one resource page whose rows come
// from a different endpoint per tab (e.g. Switches -> Cisco / Juniper).
export interface ResourceTab {
  label: string;
  uri: string;                  // endpoint for this tab, relative to /rest/
  fields?: FieldDef[];          // tab-specific columns; falls back to the resource's fields
  titleSingular?: string;       // used in Add/Edit/Delete copy while this tab is active
  /* Tab-specific row actions. Needed where one tab's rows support an action the
     others do not - the load-balancer proxy tabs can open a management console, the
     "All Load Balancers" tab cannot. Falls back to the resource's rowActions. */
  rowActions?: RowAction[];
}

/*
 * An extra per-row action, beyond the generic Edit and Delete.
 *
 * The legacy panel drove these from `$scope.additional_actions` (see
 * templates/snippets/model-results.html) and several lists relied on them - most
 * importantly the credential-rotation action that four monitoring/cloud account
 * lists exposed. The React table originally hard-coded Edit + Delete only, so
 * every one of those actions was unreachable.
 *
 * `kind` selects which flow the list page runs; add a new kind here when a new
 * flow is ported rather than widening this into a general-purpose callback.
 */
export type RowActionKind =
  | 'change-password'
  | 'view-content'
  | 'manage-terms'
  | 'open-proxy'
  /* POST to a sub-path of the ROW's own url and reload the list. The IPv4 block
     Split / Aggregate operations work this way (services/DjangoService.js:241). */
  | 'row-post'
  /* Navigate to another route, interpolating {field} placeholders from the row.
     The AWS account list uses it for Show Inventory / Virtual Machines. */
  | 'row-link';

export interface RowAction {
  kind: RowActionKind;
  label: string;
  icon: string;
  /* Endpoint the action posts to, relative to /rest/ - e.g.
     'observium/instance/change_password'. Not used by purely local actions
     such as kind='view-content'. */
  uri?: string;
  /* Row property sent as `entity_id` (legacy: $scope.change_password_entity).
     Defaults to the resource's idField. */
  entityIdField?: string;
  /* kind='view-content' only: the row property holding the text to display. */
  contentField?: string;
  /* Row property that must be truthy for this action to be offered. Legacy gated
     Split on `assignment.splittable`. */
  enabledField?: string;
  /* Confirmation copy for a destructive or structural action. */
  confirm?: string;
  /* kind='row-link' only: route template, e.g. '/aws/{id}/region/{region}'. */
  to?: string;
}

export interface ResourceConfig {
  key: string;                  // route + registry key (e.g. 'organization')
  uri: string;                  // endpoint under /rest/ (e.g. 'org')
  tabs?: ResourceTab[];         // when present the page renders a tab bar
  title: string;                // plural page title
  titleSingular: string;        // singular (used in Add/Edit/Delete copy)
  description?: string;         // page subtitle
  idField?: string;             // default 'id'
  icon?: string;                // menu/header icon name
  fields?: FieldDef[];          // when omitted, columns are auto-derived from data
  searchKeys?: string[];        // client-side search keys (default: all text-ish cells)
  defaultSort?: string;         // initial ordering field
  canCreate?: boolean;          // default true
  canEdit?: boolean;            // default true
  canDelete?: boolean;          // default true
  rowActions?: RowAction[];     // extra per-row actions, shown before Edit/Delete
  detailFields?: FieldDef[];    // properties shown on the detail page (default: all fields)
}
