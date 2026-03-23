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
    checkedStyle?: 'checkboxes' | 'glyphicon' | 'fontawesome' | 'none';
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
    mandatoryLimit?: number; // showUncheckAll has to be set to false for this property
    enableTooltip?: boolean;

    enableServerFiltering?: boolean; // Property to enable/disable server-side filtering
    serverFilterFn?: (searchText: string) => Observable<Array<any>>;

    // this setting is only for credential list where only one option can be selected of the same credential type
    disableOptionsOfSameType?: boolean;

    disableOptionsOfDifferentTypes?:boolean; // Disables options whose `type` differs from the selected option’s `type`
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