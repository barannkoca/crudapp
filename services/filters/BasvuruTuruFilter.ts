import { Record } from "@/types/Record";
import { IFilter } from "./IFilter";

export class BasvuruTuruFilter implements IFilter {
  constructor(private basvuruTuru: string) {}

  apply(records: Record[]): Record[] {
    if (!this.basvuruTuru || this.basvuruTuru === "all") {
      return records;
    }
    return records.filter(
      (record) => record.yapilan_islem === this.basvuruTuru
    );
  }
} 