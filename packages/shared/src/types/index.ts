export type UserTier = "FREE" | "LEVEL1" | "PREMIUM";

export type SportType = "calcio" | "basket" | "volley" | "tennis" | "rugby" | "altro";

export interface User {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  tier: UserTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  nome: string;
  sport: SportType;
  descrizione?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  nome: string;
  cognome: string;
  dataNascita: Date;
  ruolo?: string;
  numeroMaglia?: number;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Training {
  id: string;
  titolo: string;
  descrizione?: string;
  data: Date;
  durata: number;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}