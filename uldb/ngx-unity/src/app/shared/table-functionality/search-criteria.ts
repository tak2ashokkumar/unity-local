export class SearchCriteria {
    pageNo?: number;
    pageSize?: PAGE_SIZES = 10;
    searchValue?: string;
    searchQuery?: string;
    sortColumn?: string;
    sortDirection?: '' | 'asc' | 'desc';
    groupBy?: string
    params?: [{ [key: string]: any }] | undefined;
    multiValueParam?: { [key: string]: any[] } | undefined;
}
export enum PAGE_SIZES {
    ZERO = 0,
    TEN = 10,
    FIFTEEN = 15,
    TWENTY = 20,
    THIRTY = 30,
    HUNDRED = 100,
    FIFTY = 50,
    DEFAULT_PAGE_SIZE = 10
}
