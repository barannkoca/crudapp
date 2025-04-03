import { Record } from "@/types/Record";
import { IFilter } from "./IFilter";

export class IlFilter implements IFilter {
  constructor(private il: string) {}

  apply(records: Record[]): Record[] {
    if (!this.il || this.il === "all") {
      return records;
    }
    return records.filter(
      (record) => record.kayit_ili === this.il
    );
  }
} 