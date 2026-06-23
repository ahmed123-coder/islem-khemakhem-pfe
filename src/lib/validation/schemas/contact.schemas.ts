import { z } from 'zod'

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres'),
  email: z
    .string()
    .email('Format d\'email invalide')
    .toLowerCase()
    .trim(),
  company: z
    .string()
    .max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères'),
})

export type ContactFormData = z.infer<typeof contactSchema>
