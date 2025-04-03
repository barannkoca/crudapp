import { Record } from "@/types/Record";
import { PaginationState, PaginationOptions } from "@/types/Pagination";

export class PaginationService {
  private pageSize: number;
  private currentPage: number;

  constructor(options: PaginationOptions) {
    this.pageSize = options.pageSize;
    this.currentPage = options.currentPage;
  }

  paginate(records: Record[]): Record[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return records.slice(startIndex, endIndex);
  }

  getPaginationState(totalItems: number): PaginationState {
    return {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / this.pageSize)
    };
  }
} 