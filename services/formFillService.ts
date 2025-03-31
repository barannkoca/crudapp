import { UseFormSetValue } from "react-hook-form";
import { UserRecordFormData } from "@/schemas/userRecordSchema";
import { ExtractedData } from "./textExtractionService";

export class FormFillService {
  constructor(private form: { setValue: UseFormSetValue<UserRecordFormData> }) {}

  private setDateValue(key: keyof UserRecordFormData, value: string, separator: string) {
    const [day, month, year] = value.split(separator).map((part: string) => part.trim());
    if (day && month && year) {
      const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      if (!isNaN(date.getTime())) {
        this.form.setValue(key, date);
      }
    }
  }

  public fillForm(extractedData: ExtractedData) {
    Object.entries(extractedData).forEach(([key, value]) => {
      if (value) {
        if (key === 'dogum_tarihi') {
          this.setDateValue('dogum_tarihi', value, '/');
        } else if (key === 'kayit_tarihi') {
          this.setDateValue('kayit_tarihi', value, '.');
        } else {
          this.form.setValue(key as keyof UserRecordFormData, value);
        }
      }
    });
  }
} 