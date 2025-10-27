export interface Suggestion {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  category: 'Drag' | 'Downforce' | 'Regulations' | 'General';
}

export interface ScrutineeringInfraction {
  rule: string;
  description: string;
  penalty: number;
  type: 'Performance' | 'Safety' | 'General';
}

export interface ScrutineeringReport {
  basePoints: number;
  totalPenalty: number;
  finalScore: number;
  isEligibleForFastestCar: boolean;
  infractions: ScrutineeringInfraction[];
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  dragCoefficient: number;
  liftCoefficient: number; // Negative for downforce
  downforceNewtons: number;
  dragForceNewtons: number;
  liftToDragRatio: number;
  frontalAreaM2: number;
  suggestions: Suggestion[];
  // Physical properties for scrutineering
  weightGrams: number;
  totalLength: number;
  totalWidth: number;
  scrutineeringReport: ScrutineeringReport;
}

export interface User {
  email: string;
  name: string;
  nickname: string;
  role: 'manager' | 'engineer' | 'member';
  activeTheme?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  user: { nickname: string };
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
}

export interface Activity {
  type: 'aero_testing' | 'chat_message';
  timestamp: string;
  details?: {
    chatName?: string;
  };
}

export type ThemeColors = {
  '--color-primary': string;
  '--color-primary-hover': string;
  '--color-accent': string;
  '--color-background-primary': string;
  '--color-background-secondary': string;
  '--color-background-tertiary': string;
  '--color-text-primary': string;
  '--color-text-secondary': string;
  '--color-text-on-primary': string;
  '--color-border-color': string;
  '--color-success': string;
  '--color-warning': string;
  '--color-danger': string;
  '--color-danger-hover': string;
};


export interface Theme {
  name: string;
  isCustom?: boolean;
  colors: ThemeColors;
  backgroundImageUrl?: string;
}
