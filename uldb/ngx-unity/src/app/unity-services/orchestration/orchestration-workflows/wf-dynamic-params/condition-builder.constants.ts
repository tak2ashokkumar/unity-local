import { ConditionGroup, ConditionRule } from "./wf-dynamic-params.component";

export type DataType =
    | 'STRING'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'DATETIME'
    | 'ARRAY'
    | 'OBJECT'
    | 'NULL_EMPTY';

export type ConditionType = 'STATIC' | 'DYNAMIC';

export interface SelectOption {
    value: string | number;
    label: string;
}

/** Metadata shape returned by the dynamic field API (AIML filters, etc.) */
export interface DynamicFieldMeta {
    label: string;
    value: string;
    data_type: string; // may come in any casing from the API
    options: SelectOption[];
}

/* ------------------------------------------------------------------ */
/* 1. Sub-field config (label/placeholder/width) — the "common JSON"   */
/*    structure that replaces what used to live in the backend schema  */
/*    for the field / data_type / operator / value controls.           */
/* ------------------------------------------------------------------ */
export const CONDITION_SUB_FIELDS_CONFIG = {
    field: {
        key: 'field',
        label: 'Field',
        width: 'full',
        placeholder: 'Enter field',
        clearable: true,
        required: true
    },
    data_type: {
        key: 'data_type',
        label: 'Data Type',
        width: 'half',
        required: true
    },
    operator: {
        key: 'operator',
        label: 'Operator',
        width: 'half',
        required: true
    },
    value: {
        key: 'value',
        label: 'Value',
        width: 'full',
        required: true,
        placeholders: {
            text: 'Enter value',
            number: 'Enter number',
            datetime: 'Select datetime',
            dropdown: 'Select value'
        }
    }
};

/* ------------------------------------------------------------------ */
/* 2. Data Type options — used verbatim for STATIC mode's dropdown,    */
/*    and as the canonical set to normalise whatever the dynamic API   */
/*    sends back (case-insensitive match).                             */
/* ------------------------------------------------------------------ */
export const DATA_TYPE_OPTIONS: SelectOption[] = [
    { value: 'STRING', label: 'String' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'BOOLEAN', label: 'Boolean' },
    { value: 'DATETIME', label: 'Date & Time' },
    { value: 'ARRAY', label: 'Array' },
    { value: 'OBJECT', label: 'Object' },
    { value: 'NULL_EMPTY', label: 'Null / Empty' }
];

export function normalizeDataType(raw: string | undefined | null): DataType {
    const upper = (raw || '').toUpperCase();
    const match = DATA_TYPE_OPTIONS.find(o => o.value === upper);
    return (match ? match.value : 'STRING') as DataType;
}

/* ------------------------------------------------------------------ */
/* 3. Operators per Data Type — shared by BOTH static and dynamic      */
/*    modes. Dynamic mode only ever supplies data_type; operators      */
/*    always come from this map.                                       */
/* ------------------------------------------------------------------ */
export const OPERATORS_BY_DATA_TYPE: Record<DataType, SelectOption[]> = {
    STRING: [
        { value: 'EQUALS', label: 'equals' },
        { value: 'NOT_EQUALS', label: 'not equals' },
        { value: 'CONTAINS', label: 'contains' },
        { value: 'NOT_CONTAINS', label: 'not contains' },
        { value: 'STARTS_WITH', label: 'starts with' },
        { value: 'ENDS_WITH', label: 'ends with' },
        { value: 'REGEX_MATCH', label: 'regex match' },
        { value: 'NOT_REGEX_MATCH', label: 'not regex match' }
    ],
    NUMBER: [
        { value: 'EQUALS', label: 'equals' },
        { value: 'NOT_EQUALS', label: 'not equals' },
        { value: 'GREATER_THAN', label: 'greater than' },
        { value: 'GREATER_THAN_OR_EQUAL', label: 'greater than or equal' },
        { value: 'LESS_THAN', label: 'less than' },
        { value: 'LESS_THAN_OR_EQUAL', label: 'less than or equal' }
    ],
    BOOLEAN: [
        { value: 'IS_TRUE', label: 'is true' },
        { value: 'IS_FALSE', label: 'is false' }
    ],
    DATETIME: [
        { value: 'IS', label: 'is' },
        { value: 'IS_NOT', label: 'is not' },
        { value: 'IS_BEFORE', label: 'is before' },
        { value: 'IS_ON_OR_BEFORE', label: 'is on or before' },
        { value: 'IS_AFTER', label: 'is after' },
        { value: 'IS_ON_OR_AFTER', label: 'is on or after' }
    ],
    ARRAY: [
        { value: 'CONTAINS', label: 'contains' },
        { value: 'NOT_CONTAINS', label: 'does not contain' },
        { value: 'LENGTH_EQUALS', label: 'length equal to' },
        { value: 'LENGTH_GREATER_THAN', label: 'length greater than' },
        { value: 'LENGTH_LESS_THAN', label: 'length less than' }
    ],
    OBJECT: [
        { value: 'HAS_KEY', label: 'has key' },
        { value: 'NOT_HAS_KEY', label: 'does not have key' }
    ],
    NULL_EMPTY: [
        { value: 'IS_NULL', label: 'is null' },
        { value: 'IS_NOT_NULL', label: 'is not null' },
        { value: 'IS_EMPTY', label: 'is empty' },
        { value: 'IS_NOT_EMPTY', label: 'is not empty' }
    ]
};

export const DEFAULT_OPERATOR_BY_DATA_TYPE: Record<DataType, string> = {
    STRING: 'EQUALS',
    NUMBER: 'EQUALS',
    BOOLEAN: 'IS_TRUE',
    DATETIME: 'IS',
    ARRAY: 'CONTAINS',
    OBJECT: 'HAS_KEY',
    NULL_EMPTY: 'IS_NULL'
};

/* ------------------------------------------------------------------ */
/* 4. Value control resolution.                                        */
/*    'dropdown' is only ever chosen by the caller when the dynamic     */
/*    field metadata carries options.length > 0 — this map only        */
/*    decides the *input* kind for everything else.                    */
/* ------------------------------------------------------------------ */
export type ValueInputKind = 'text' | 'number' | 'datetime' | 'dropdown' | 'none';

const NO_VALUE_OPERATORS = [
    'IS_TRUE', 'IS_FALSE',
    'IS_NULL', 'IS_NOT_NULL', 'IS_EMPTY', 'IS_NOT_EMPTY'
];

const ARRAY_LENGTH_OPERATORS = [
    'LENGTH_EQUALS', 'LENGTH_GREATER_THAN', 'LENGTH_LESS_THAN'
];

/**
 * Resolve what kind of input the Value box should be, given a data_type
 * and operator. Does NOT know about dynamic option lists — the caller
 * (component) overrides this with 'dropdown' when the selected dynamic
 * field has options.
 */
export function getValueInputKind(dataType: DataType, operator: string): ValueInputKind {
    if (NO_VALUE_OPERATORS.includes(operator)) {
        return 'none';
    }
    switch (dataType) {
        case 'STRING':
        case 'OBJECT':
            return 'text';
        case 'NUMBER':
            return 'number';
        case 'ARRAY':
            return ARRAY_LENGTH_OPERATORS.includes(operator) ? 'number' : 'text';
        case 'DATETIME':
            return 'datetime';
        case 'BOOLEAN':
        case 'NULL_EMPTY':
        default:
            return 'none';
    }
}

export function getDefaultOperator(dataType: DataType): string {
    return DEFAULT_OPERATOR_BY_DATA_TYPE[dataType] || OPERATORS_BY_DATA_TYPE[dataType]?.[0]?.value as string;
}

/* ------------------------------------------------------------------ */
/* 5. Endpoint token resolution for dynamic field APIs.                 */
/*    Replaces every {token} in the endpoint string with a value from   */
/*    the supplied context map. Leaves unresolved tokens untouched      */
/*    (caller should validate before firing the request).               */
/* ------------------------------------------------------------------ */
export function resolveEndpointTemplate(template: string, context: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, token) => {
        return context && context[token] !== undefined && context[token] !== null
            ? String(context[token])
            : match;
    });
}

export const CONDITION_VALIDATION_MESSAGES: Record<'field' | 'data_type' | 'operator' | 'value', string> = {
    field: 'Field is required',
    data_type: 'Data type is required',
    operator: 'Operator is required',
    value: 'Value is required'
};

/**
 * A rule is valid when field/data_type/operator are filled,
 * and value is filled UNLESS the operator needs no value (e.g. IS_NULL, IS_TRUE).
 */
export function isRuleComplete(rule: ConditionRule): boolean {
    if (!rule.field || !rule.data_type || !rule.operator) {
        return false;
    }
    const kind = getValueInputKind(rule.data_type, rule.operator);
    if (kind === 'none') {
        return true;
    }
    return rule.value !== '' && rule.value !== null && rule.value !== undefined;
}

/** Recursively checks every rule in a group tree is complete. */
export function isGroupComplete(group: ConditionGroup): boolean {
    return group.children.every(child =>
        child.type === 'rule' ? isRuleComplete(child as ConditionRule) : isGroupComplete(child as ConditionGroup)
    );
}