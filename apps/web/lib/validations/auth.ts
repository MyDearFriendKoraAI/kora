import { z } from 'zod';

// Schema per login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email è obbligatoria')
    .email('Inserisci un\'email valida'),
  password: z
    .string()
    .min(1, 'La password è obbligatoria'),
  rememberMe: z.boolean().optional().default(false),
});

// Schema per password con regole avanzate
const passwordSchema = z
  .string()
  .min(8, 'La password deve contenere almeno 8 caratteri')
  .regex(/[A-Z]/, 'La password deve contenere almeno una lettera maiuscola')
  .regex(/[0-9]/, 'La password deve contenere almeno un numero');

// Schema per registrazione
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Il nome deve contenere almeno 2 caratteri')
    .max(50, 'Il nome non può superare i 50 caratteri')
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Il nome può contenere solo lettere e spazi'),
  lastName: z
    .string()
    .min(2, 'Il cognome deve contenere almeno 2 caratteri')
    .max(50, 'Il cognome non può superare i 50 caratteri')
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Il cognome può contenere solo lettere e spazi'),
  email: z
    .string()
    .min(1, 'L\'email è obbligatoria')
    .email('Inserisci un\'email valida'),
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Devi accettare i termini e condizioni',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Le password non corrispondono',
  path: ['confirmPassword'],
});

// Schema per recupero password
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email è obbligatoria')
    .email('Inserisci un\'email valida'),
});

// Schema per reset password
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Le password non corrispondono',
  path: ['confirmPassword'],
});

// Schema per aggiornamento profilo
export const updateProfileSchema = z.object({
  nome: z
    .string()
    .min(2, 'Il nome deve contenere almeno 2 caratteri')
    .max(50, 'Il nome non può superare i 50 caratteri'),
  cognome: z
    .string()
    .min(2, 'Il cognome deve contenere almeno 2 caratteri')
    .max(50, 'Il cognome non può superare i 50 caratteri'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\+]?[0-9\s\-\(\)]{6,20}$/.test(val), {
      message: 'Numero di telefono non valido',
    }),
  bio: z
    .string()
    .max(500, 'La biografia non può superare i 500 caratteri')
    .optional(),
  avatarUrl: z.string().optional(),
});

// Tipi TypeScript 
export type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;