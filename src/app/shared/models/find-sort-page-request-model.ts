// TODO: Update any to a proper type
export interface Page {
    offSet: number;
    size: number;
}

export interface SortFields {
    fieldName: string;
    sortOrder: string;
}

export interface SortField {
    page: Page;
    sortField: SortFields;
}

export interface DataRequest {
    keyword: string;
    sortField: SortField;
}


export class VPage {
    // The number of elements in the page
    size = 0;
    // The total number of elements
    totalElements = 0;
    // The total number of pages
    totalPages = 0;
    // The current page number
    pageNumber = 0;
}

export class PagedData<T> {
    data = new Array<T>();
    page = new VPage();
}




