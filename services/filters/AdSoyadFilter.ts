import { Record } from "@/types/Record";
import { IFilter } from "./IFilter";

export class AdSoyadFilter implements IFilter {
  constructor(private adSoyad: string) {}

  apply(records: Record[]): Record[] {
    if (!this.adSoyad) {
      return records;
    }
    const searchTerm = this.adSoyad.toLowerCase();
    return records.filter(
      (record) => 
        `${record.adi} ${record.soyadi}`.toLowerCase().includes(searchTerm)
    );
  }
} 