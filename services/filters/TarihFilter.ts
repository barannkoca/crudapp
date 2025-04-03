import { Record } from "@/types/Record";
import { IFilter } from "./IFilter";

export class TarihFilter implements IFilter {
  constructor(
    private baslangicTarihi: string,
    private bitisTarihi: string
  ) {}

  apply(records: Record[]): Record[] {
    let filtered = [...records];

    if (this.baslangicTarihi) {
      filtered = filtered.filter(
        (record) => new Date(record.kayit_tarihi) >= new Date(this.baslangicTarihi)
      );
    }

    if (this.bitisTarihi) {
      filtered = filtered.filter(
        (record) => new Date(record.kayit_tarihi) <= new Date(this.bitisTarihi)
      );
    }

    return filtered;
  }
} 