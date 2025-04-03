import { Record } from "@/types/Record";
import { IFilter } from "./IFilter";

export class DurumFilter implements IFilter {
  constructor(private durum: string) {}

  apply(records: Record[]): Record[] {
    if (!this.durum || this.durum === "all") {
      return records;
    }
    return records.filter(
      (record) => record.durum === this.durum
    );
  }
} 