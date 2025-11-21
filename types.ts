export interface DataPoint {
  x: number; // Dosage (mg)
  y: number; // Blood Pressure (mmHg)
  id: string;
}

export interface Coefficients {
  a: number; // x^2 coefficient (curvature)
  b: number; // x coefficient (linear slope at 0)
  c: number; // intercept (constant)
}

export enum AppState {
  IDLE = 'IDLE',
  TRAINING = 'TRAINING',
  TRAINED = 'TRAINED',
}

export type Language = 'zh' | 'en';
