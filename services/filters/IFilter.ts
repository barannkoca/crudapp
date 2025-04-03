import { Record } from "@/types/Record";

export interface IFilter {
  apply(records: Record[]): Record[];
} 