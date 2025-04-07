import { z } from 'zod';

export const corporateFormSchema = z.object({
  name: z.string().min(2, "Şirket adı en az 2 karakter olmalıdır"),
  logo: z.any().optional(), // File nesnesi veya null olabilir
});

export type CorporateFormData = z.infer<typeof corporateFormSchema>;
