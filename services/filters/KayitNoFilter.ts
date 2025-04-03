import { Record } from "@/types/Record";
import { IFilter } from "./IFilter";

export class KayitNoFilter implements IFilter {
  constructor(private kayitNo: string) {}

  apply(records: Record[]): Record[] {
    if (!this.kayitNo) {
      return records;
    }
    return records.filter(
      (record) => record.kayit_numarasi.includes(this.kayitNo)
    );
  }
} 