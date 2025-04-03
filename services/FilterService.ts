import { Record } from "@/types/Record";
import { IFilter } from "./filters/IFilter";
import { BasvuruTuruFilter } from "./filters/BasvuruTuruFilter";
import { IlFilter } from "./filters/IlFilter";
import { DurumFilter } from "./filters/DurumFilter";
import { TarihFilter } from "./filters/TarihFilter";
import { AdSoyadFilter } from "./filters/AdSoyadFilter";
import { KayitNoFilter } from "./filters/KayitNoFilter";

export interface FilterOptions {
  basvuruTuru: string;
  il: string;
  durum: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  adSoyad: string;
  kayitNo: string;
}

export class FilterService {
  private filters: IFilter[] = [];

  constructor(options: FilterOptions) {
    this.initializeFilters(options);
  }

  private initializeFilters(options: FilterOptions) {
    this.filters = [
      new BasvuruTuruFilter(options.basvuruTuru),
      new IlFilter(options.il),
      new DurumFilter(options.durum),
      new TarihFilter(options.baslangicTarihi, options.bitisTarihi),
      new AdSoyadFilter(options.adSoyad),
      new KayitNoFilter(options.kayitNo)
    ];
  }

  applyFilters(records: Record[]): Record[] {
    return this.filters.reduce((filteredRecords, filter) => {
      return filter.apply(filteredRecords);
    }, records);
  }
} 