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
  role: 'manager' | 'engineer' | 'designer' | 'marketing' | 'member';
  activeTheme?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  user: { nickname: string };
  text: string;
  timestamp: string;
  reactions?: { [emoji: string]: string[] }; // emoji: array of nicknames
  replyTo?: string; // messageId
}

export interface Chat {
  id: string;
  name: string;
}

export type ActivityType = 
    'Task Created' | 'Task Completed' | 
    'Simulation Run' | 
    'Sponsor Added' | 'Sponsor Secured' |
    'Wiki Article Created' |
    'R&D Log Created' |
    'Transaction Added' |
    'Chat Message Sent';

export interface ActivityLogEntry {
  userNickname: string;
  type: ActivityType;
  details: string;
  timestamp: string;
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

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: string; // nickname
    dueDate: string; // ISO string
    isCompetitionMaterial?: boolean;
}

export type SponsorStatus = 'Potential' | 'Contacted' | 'Secured' | 'Rejected';

export interface Sponsor {
    id: string;
    name: string;
    contact: string;
    tier: string; // e.g., Gold, Silver, Bronze
    amount: number;
    status: SponsorStatus;
    notes: string;
}

export type TransactionCategory = 'Sponsorship' | 'Car Materials' | 'Pit Display' | 'Travel' | 'Marketing' | 'Other';
export type TransactionType = 'Income' | 'Expense';
export type TransactionStatus = 'Pending' | 'Approved' | 'Rejected';


export interface Transaction {
    id:string;
    date: string; // ISO string
    description: string;
    category: TransactionCategory;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    submittedBy: string; // nickname
    reviewedBy?: string; // nickname
}

export interface WikiArticle {
  id: string;
  title: string;
  content: string; // Markdown content
  lastModified: string; // ISO string
  author: string; // nickname
}

export interface Experiment {
  id: string;
  date: string; // ISO string
  author: string; // nickname
  component: string;
  hypothesis: string;
  materials: string;
  results: string;
  conclusion: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  unlockedAt?: string; // ISO string when unlocked
}

export type AppSection = 'projects' | 'sponsorship' | 'finance' | 'wiki' | 'rd' | 'socials';
export type PermissionLevel = 'read-only' | 'edit';
export type RolePermissions = Partial<Record<User['role'], Partial<Record<AppSection, PermissionLevel>>>>;


export interface Announcement {
    id: string;
    message: string;
    author: string; // nickname
    timestamp: string;
}

export interface Goal {
    id: string;
    userId: string; // user email
    description: string;
    dueDate: string;
    status: 'In Progress' | 'Completed';
}

export interface PerformanceNote {
    id: string;
    userId: string; // user email
    note: string;
    type: 'Kudos' | 'Feedback';
    author: string; // manager nickname
    timestamp: string;
}