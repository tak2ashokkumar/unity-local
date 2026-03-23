export interface BulkUpdateFieldType {    
    field_name: string;
    display_name: string;
    field_type: string;
    field_options?: FieldOptionsItem[];
    dependent_field?: string;
}

interface FieldOptionsItem {
    id?: number;
    name?: string;
    uuid?: string;
    ' name'?: string; //??
}