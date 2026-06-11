import { Observable } from "rxjs";

export interface IMultiSelectOption {
    id: any;
    name: string;
    isLabel?: boolean;
    parentId?: any;
    params?: any;
}

export interface IMultiSelectSettings {
    pullRight?: boolean;
    enableSearch?: boolean;
    checkedStyle?: 'checkboxes' | 'glyphicon' | 'fontawesome';
    buttonClasses?: string;
    itemClasses?: string;
    containerClasses?: string;
    selectionLimit?: number;
    closeOnSelect?: boolean;
    autoUnselect?: boolean;
    showCheckAll?: boolean;
    showUncheckAll?: boolean;
    fixedTitle?: boolean;
    dynamicTitleMaxItems?: number;
    maxHeight?: string;
    width?: string;
    displayAllSelectedText?: boolean;
    keyToSelect?: string;
    lableToDisplay?: string;
    isSimpleArray?: boolean;
    selectAsObject?: boolean;
    groupBy?: boolean;
    appendToBody?: boolean;

    enableServerFiltering?: boolean; // Property to enable/disable server-side filtering
    serverFilterFn?: (searchText: string) => Observable<Array<any>>;
}

export interface IMultiSelectTexts {
    checkAll?: string;
    uncheckAll?: string;
    checked?: string;
    checkedPlural?: string;
    searchPlaceholder?: string;
    defaultTitle?: string;
    allSelected?: string;
}