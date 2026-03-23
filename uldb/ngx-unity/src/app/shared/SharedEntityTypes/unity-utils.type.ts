export interface EntityFastType {
    name: string;
    uuid: string;
}

export interface LabelValueType {
    label: string;
    value: string;
}

export interface KeyValueType {
    key: string;
    value: string;
}

export interface CustomDateRangeType {
    label?: string;
    value?: string;
    from?: string;
    to?: string;
    dateFormat?: string;
    valueAsFrequency?: string;
}

export interface TableColumnMapping {
    name: string;
    key: string;
    default: boolean;
    mandatory: boolean;
    type?: string,
    url?: string,
}

export interface UnityCustomObjType {
    label: string;
    value: string;
}

export interface UnityResourceType {
    label: string;
    value: string;

    // client side added for feasibility
    datatype?: string;
    defaultItems?: string[];
    defaultValues?: unityResourceDefaultValuesType[];
    attrs?: UnityResourceType[];
}

export interface unityResourceDefaultValuesType {
    name: string;
    value: unityResourceValueType | string;
}

export interface unityResourceValueType {
    id: string;
}