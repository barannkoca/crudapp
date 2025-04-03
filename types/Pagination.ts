export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationOptions {
  pageSize: number;
  currentPage: number;
} 