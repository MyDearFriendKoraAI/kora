import { z } from 'zod';

// Enum per sport
export const SportType = {
  CALCIO: 'CALCIO',
  BASKET: 'BASKET', 
  PALLAVOLO: 'PALLAVOLO',
  TENNIS: 'TENNIS',
  RUGBY: 'RUGBY',
  ALTRO: 'ALTRO',
} as const;

export type SportTypeEnum = keyof typeof SportType;

// Schema per colori team
export const teamColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Colore primario deve essere un hex valido'),
  secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Colore secondario deve essere un hex valido'),
});

// Schema per creazione team (multi-step)
export const createTeamStep1Schema = z.object({
  sport: z.enum(['CALCIO', 'BASKET', 'PALLAVOLO', 'TENNIS', 'RUGBY', 'ALTRO'], {
    required_error: 'Seleziona uno sport',
  }),
});

export const createTeamStep2Schema = z.object({
  name: z
    .string()
    .min(2, 'Il nome della squadra deve contenere almeno 2 caratteri')
    .max(50, 'Il nome della squadra non può superare i 50 caratteri')
    .trim(),
  category: z
    .string()
    .min(1, 'Seleziona una categoria')
    .max(30, 'La categoria non può superare i 30 caratteri'),
  season: z
    .string()
    .min(1, 'La stagione è obbligatoria')
    .default('2024/2025'),
});

export const createTeamStep3Schema = z.object({
  homeField: z
    .string()
    .max(100, 'Il campo casa non può superare i 100 caratteri')
    .optional(),
  colors: teamColorsSchema.optional(),
});

// Schema completo per creazione team
export const createTeamSchema = createTeamStep1Schema
  .merge(createTeamStep2Schema)
  .merge(createTeamStep3Schema);

// Schema per aggiornamento team
export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome della squadra deve contenere almeno 2 caratteri')
    .max(50, 'Il nome della squadra non può superare i 50 caratteri')
    .trim(),
  category: z
    .string()
    .min(1, 'Seleziona una categoria')
    .max(30, 'La categoria non può superare i 30 caratteri'),
  season: z
    .string()
    .min(1, 'La stagione è obbligatoria'),
  homeField: z
    .string()
    .max(100, 'Il campo casa non può superare i 100 caratteri')
    .optional(),
  colors: teamColorsSchema.optional(),
  logo: z.string().url('URL logo non valido').optional(),
});

// Schema per conferma eliminazione
export const deleteTeamSchema = z.object({
  confirmName: z.string().min(1, 'Inserisci il nome della squadra per confermare'),
});

// Tipi TypeScript
export type CreateTeamStep1Data = z.infer<typeof createTeamStep1Schema>;
export type CreateTeamStep2Data = z.infer<typeof createTeamStep2Schema>;
export type CreateTeamStep3Data = z.infer<typeof createTeamStep3Schema>;
export type CreateTeamFormData = z.infer<typeof createTeamSchema>;
export type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;
export type DeleteTeamFormData = z.infer<typeof deleteTeamSchema>;
export type TeamColors = z.infer<typeof teamColorsSchema>;

// Helper per sport display
export const SPORT_LABELS: Record<SportTypeEnum, string> = {
  CALCIO: 'Calcio',
  BASKET: 'Basket', 
  PALLAVOLO: 'Pallavolo',
  TENNIS: 'Tennis',
  RUGBY: 'Rugby',
  ALTRO: 'Altro',
};

// Helper per categorie comuni
export const COMMON_CATEGORIES = [
  'Pulcini',
  'Esordienti', 
  'Giovanissimi',
  'Allievi',
  'Juniores',
  'Prima Squadra',
  'Veterani',
  'Amatori',
  'Agonisti',
  'Altro',
];

// Colori predefiniti per sport
export const SPORT_DEFAULT_COLORS: Record<SportTypeEnum, TeamColors> = {
  CALCIO: { primary: '#FF6B35', secondary: '#004E89' },
  BASKET: { primary: '#FF8500', secondary: '#8B0000' },
  PALLAVOLO: { primary: '#FFD700', secondary: '#1E90FF' },
  TENNIS: { primary: '#228B22', secondary: '#FFFFFF' },
  RUGBY: { primary: '#8B4513', secondary: '#F5DEB3' },
  ALTRO: { primary: '#6366F1', secondary: '#EC4899' },
};