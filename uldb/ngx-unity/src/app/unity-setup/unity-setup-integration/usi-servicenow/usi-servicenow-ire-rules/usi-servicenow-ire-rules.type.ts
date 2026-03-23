export interface IREIdentifierRule {
    independent: string;
    name: string;
    entry_attributes: IRERuleEntryAttribute[];
    refresh_rules: IRERefreshRule[];
    applies_to: string;
    applies_label: string;
    sys_id: string;
    reconciliation_rules: IREReconciliationRule[];
    active: string;
    description: string;

    //custom fileds for UI
    isOpen: boolean;
    target: string;
    details: boolean;
}
export interface IRERuleEntryAttribute {
    allow_null_attribute: string;
    sys_id: string;
    table: string;
    active: string;
    attributes: string;
    order: string;
    identifier_value: string;
}

export interface IRERefreshRule {
    name: string;
    discovery_source: string;
    sys_id: string;
    applies_to: string;
    duration: string;
    active: string;
}
export interface IREReconciliationRule {
    null_update: string;
    reconciliation_definitions: IREReconciliationDefinitions[];
    is_inherited: boolean;
    active: string;
    attributes: string;
    mapped_tile: string;
    applies_to: string;
    label: string;

    //custom fields for UI
    discoverySourcePriority: string;
}
export interface IREReconciliationDefinitions {
    priority: number;
    sys_id: string;
    discovery_source: string;
}