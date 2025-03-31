export interface ExtractedData {
  uyrugu: string;
  soyadi: string;
  adi: string;
  baba_adi: string;
  anne_adi: string;
  cinsiyeti: string;
  medeni_hali: string;
  dogum_tarihi: string;
  belge_turu: string;
  belge_no: string;
  yabanci_kimlik_no: string;
  kayit_numarasi: string;
  kayit_tarihi: string;
  telefon_no: string;
  eposta: string;
}

export class TextExtractionService {
  private lines: string[];

  constructor(text: string) {
    this.lines = text.split('\n');
  }

  private getLine(index: number): string {
    return this.lines[index]?.trim() || '';
  }

  private findInRange(start: number, end: number, pattern: RegExp): string | null {
    for (let i = start; i <= end; i++) {
      const line = this.getLine(i);
      const match = line.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return null;
  }

  private findInFirst100Lines(pattern: RegExp): string | null {
    const first100Lines = this.lines.slice(0, 100).join(' ').toLowerCase();
    const match = first100Lines.match(pattern);
    return match ? match[0] : null;
  }

  private findPhoneNumber(): string | null {
    const phonePattern = /5[0-9]{9}/;
    return this.findInRange(190, 210, phonePattern);
  }

  private findEmail(): string | null {
    const emailPattern = /[a-zA-Z0-9._%+-]+@gmail\.com/;
    const text = this.lines.join(' ');
    const match = text.match(emailPattern);
    return match ? match[0] : null;
  }

  private findMaritalStatus(): string {
    const first100Lines = this.lines.slice(0, 100).join(' ').toLowerCase();
    if (first100Lines.includes('bekar')) {
      return 'Bekar';
    } else if (first100Lines.includes('evli')) {
      return 'Evli';
    }
    return '';
  }

  private findRegistrationDate(): string {
    for (let i = 86; i <= 88; i++) {
      const line = this.getLine(i);
      const dateMatch = line.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (dateMatch) {
        const [_, day, month, year] = dateMatch;
        return `${day}.${month}.${year}`;
      }
    }
    return '';
  }

  public extractData(): ExtractedData {
    return {
      uyrugu: this.getLine(4),
      soyadi: this.getLine(8),
      adi: this.getLine(13),
      baba_adi: this.getLine(22),
      anne_adi: this.getLine(28),
      cinsiyeti: this.getLine(30),
      medeni_hali: this.findMaritalStatus(),
      dogum_tarihi: this.getLine(40),
      belge_turu: this.getLine(47),
      belge_no: this.getLine(49),
      yabanci_kimlik_no: this.findInFirst100Lines(/\b\d{11}\b/) || '',
      kayit_numarasi: this.findInFirst100Lines(/\d{4}-\d{2}-\d{7}/) || '',
      kayit_tarihi: this.findRegistrationDate(),
      telefon_no: this.findPhoneNumber() || '',
      eposta: this.findEmail() || ''
    };
  }
} 