export interface Engine {
  id: number;
  name: string;
  type: string;
  horsepower: number;
  additional_price: string | number;
}

export interface Color {
  id: number;
  name: string;
  hex: string;
  price: string | number;
  image_url?: string;
}

export interface CarModel {
  id: number;
  name: string;
  description: string;
  base_price: string | number;
  image_url: string;
  engines: Engine[];
  colors?: Color[];
}

export interface Optional {
  id: number;
  name: string;
  category: string;
  price: string | number;
  // Array popolati nel frontend dopo aver unito le tabelle pivot di compatibilità
  incompatibleWith?: number[]; // ID degli optional incompatibili con questo
  requires?: number[];         // ID degli optional obbligatori richiesti da questo
}

export interface Configuration {
  id: number;
  user_id: number;
  car_model_id: number;
  engine_id: number;
  color_id: number;
  total_price: string | number;
  status: 'pending' | 'saved';
  created_at?: string;
  updated_at?: string;
  // Relazioni caricate in Eager Loading dal backend
  car_model?: CarModel;
  engine?: Engine;
  color?: Color;
  optionals?: Optional[];
}

// ==========================================
// STRUTTURE DATI DI BACKEND (PIVOT TABLES)
// ==========================================

/**
 * Rappresenta la risposta del metodo getOptionals() del CarConfiguratorController
 */
export interface GetOptionalsResponse {
  optionals: Optional[];
  incompatibilities: BackendIncompatibility[];
  requirements: BackendRequirement[];
}

/**
 * Record della tabella 'optional_incompatibilities'
 */
export interface BackendIncompatibility {
  id: number;
  optional_a_id?: number;
  optional_b_id?: number;
  optional_id?: number;
  incompatible_with_id?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Record della tabella 'optional_requirements'
 */
export interface BackendRequirement {
  id: number;
  optional_id: number;
  required_optional_id?: number;
  requires_id?: number;
  created_at?: string;
  updated_at?: string;
}