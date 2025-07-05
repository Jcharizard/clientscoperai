// ===== LEAD TYPES =====
export interface BioScore {
  pitch_score?: number;
  urgency_score?: number;
  business_type?: string;
  urgent?: string;
  pitch?: number;
  language?: string;
  region?: string;
  [key: string]: any;
}

export interface VisionScore {
  professional_score?: number;
  quality_score?: number;
  brand_strength?: number;
  visual_appeal?: number;
  [key: string]: any;
}

export interface ContactInfo {
  emails: string[];
  phones: string[];
  websites: string[];
  messagingApps: string[];
  bookingPlatforms: string[];
  contactScore: number;
  hasDirectContact: boolean;
}

export interface ActivityData {
  isActive: boolean;
  daysSinceLastPost: number;
  hasActiveStory: boolean;
  isVerified: boolean;
  activityScore: number;
}

export interface EngagementData {
  engagementRate: number;
  engagementTier: 'Excellent' | 'Good' | 'Average' | 'Low' | 'Unknown';
  avgLikes: number;
  avgComments: number;
  isHighEngagement: boolean;
}

export interface LeadScore {
  score: number;
  tier: 'Premium' | 'High' | 'Medium' | 'Low';
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  confidence: number;
  factors: string[];
}

export interface Lead {
  id?: string;
  username: string;
  displayName: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
  isVerified: boolean;
  isPrivate: boolean;
  url: string;
  profilePicUrl?: string;
  externalUrl?: string;
  businessCategory?: string;
  isBusinessAccount: boolean;
  screenshot?: string;
  scrapedAt: Date;
  sessionId?: string;
  
  // AI Analysis
  bioScore?: BioScore;
  visionScore?: VisionScore;
  leadScore?: number;
  leadTier?: LeadTier;
  leadPriority?: LeadPriority;
  leadAction?: string;
  leadConfidence?: number;
  leadFactors?: string[];
  
  // Enhanced fields
  contactInfo?: ContactInfo;
  activityData?: ActivityData;
  
  // Legacy fields for backward compatibility
  email?: string;
  fullName?: string;
  campaign?: string;
  createdAt?: Date;
  
  // Additional properties used in components
  score?: number;
  temperature?: 'HOT' | 'WARM' | 'COLD';
  followersCount?: number;
  postsCount?: number;
  website?: string;
  phone?: string;
  businessType?: string;
  revenueScore?: number;
  contactReadiness?: number;
}

// ===== SESSION TYPES =====
export interface Session {
  id: string;
  name: string;
  keyword: string;
  createdAt: Date;
  updatedAt: Date;
  leads?: Lead[];
}

export interface SessionData {
  sessions: Session[];
  totalLeads: number;
  totalSessions: number;
}

// ===== SCRAPING TYPES =====
export interface ScrapingConfig {
  keyword: string;
  sessionName: string;
  pages: number;
  delay: number;
  useProxies: boolean;
  maxConcurrency: number;
  enableVision: boolean;
  enableAI: boolean;
  scraperType: 'apify' | 'bypass' | 'hybrid';
  searchFocus: 'recent' | 'top' | 'people' | 'mixed';
  qualityMode: 'speed' | 'quality' | 'balanced';
}

export interface ScrapingResult {
  success: boolean;
  leads: Lead[];
  message: string;
  sessionId?: string;
  errors?: any[];
  stats?: ScrapingStats;
}

export interface ScrapingStats {
  totalProcessed: number;
  totalFound: number;
  avgProcessingTime: number;
  successRate: number;
  errorCount: number;
  qualityScore: number;
}

export interface ScrapingProgress {
  isRunning: boolean;
  currentPage: number;
  totalPages: number;
  leadsFound: number;
  currentProfile: string;
  timeElapsed: number;
  estimatedRemaining: number;
  phase: 'initialization' | 'scraping' | 'processing' | 'complete' | 'error';
}

// ===== SETTINGS TYPES =====
export interface CookieData {
  name: string;
  value: string;
  domain: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface AppSettings {
  apifyApiKey: string;
  cookieMode: boolean;
  cookies: CookieData[];
}

// ===== CAMPAIGN TYPES =====
export interface Campaign {
  id: string;
  name: string;
  keyword: string;
  status: CampaignStatus;
  targetLeads: number;
  maxPages: number;
  delayMs: number;
  useProxies: boolean;
  cookieMode: boolean;
  massMode: boolean;
  currentPage: number;
  leadsFound: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'failed';

// ===== BUSINESS INTELLIGENCE TYPES =====
export interface BusinessIntelligence {
  id: string;
  sessionId?: string;
  totalLeads: number;
  businessTypes: Record<string, number>;
  topPerformingType?: string;
  avgConversionScore?: number;
  marketSaturation?: number;
  opportunities?: BusinessOpportunity[];
  trends?: BusinessTrend[];
  generatedAt: Date;
  dataFrom: Date;
  dataTo: Date;
}

export interface BusinessOpportunity {
  type: string;
  score: number;
  description: string;
  potential: 'HIGH' | 'MEDIUM' | 'LOW';
  marketGap: boolean;
}

export interface BusinessTrend {
  category: string;
  growth: number;
  direction: 'UP' | 'DOWN' | 'STABLE';
  timeframe: string;
}

// ===== API TYPES =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SessionsResponse {
  sessions: Session[];
  total: number;
}

export interface StatsResponse {
  totalLeads: number;
  totalSessions: number;
  avgLeadsPerSession: number;
  topBusinessTypes: Array<{
    type: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    leads: number;
  }>;
}

// ===== UI TYPES =====
export interface TabConfig {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
}

export interface FilterOptions {
  minFollowers?: number;
  maxFollowers?: number;
  minBioScore?: number;
  businessType?: string;
  isVerified?: boolean;
  isBusinessAccount?: boolean;
  hasContactInfo?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields: string[];
  filters?: FilterOptions;
}

// ===== ERROR TYPES =====
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// ===== FORM TYPES =====
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ===== COMPONENT PROP TYPES =====
export interface LeadCardProps {
  lead: Lead;
  onSelect?: (lead: Lead) => void;
  onAction?: (lead: Lead, action: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  loading?: boolean;
}

export interface ScraperPanelProps {
  onLeadsFound?: (leads: Lead[]) => void;
  initialConfig?: Partial<ScrapingConfig>;
}

export interface FilterConfig {
  search: string;
  pitchScore: string;
  urgentOnly: boolean;
  campaign: string;
  dateFrom: string;
  dateTo: string;
  followersMin: string;
  followersMax: string;
  language: string;
  region: string;
  businessType: string;
  verified: boolean;
  hasContact: boolean;
  leadTier: LeadTier | '';
}

// ===== UTILITY TYPES =====
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: any;
}

// ===== ENUMS =====
export enum BusinessType {
  RESTAURANT = 'restaurant',
  FITNESS = 'fitness',
  BEAUTY = 'beauty',
  FASHION = 'fashion',
  TECH = 'tech',
  CONSULTING = 'consulting',
  HEALTHCARE = 'healthcare',
  OTHER = 'other'
}

export enum LeadTier {
  HOT = 'HOT',
  WARM = 'WARM',
  QUALIFIED = 'QUALIFIED',
  COLD = 'COLD'
}

export enum LeadPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum ScrapingMethod {
  APIFY = 'apify',
  BYPASS = 'bypass',
  HYBRID = 'hybrid'
}

// ===== EXPORT TYPES =====
export interface ExportConfig {
  format: 'csv' | 'json' | 'xlsx';
  fields: string[];
  filterConfig?: FilterConfig;
  includeAnalysis: boolean;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  recordCount: number;
  downloadUrl?: string;
} 