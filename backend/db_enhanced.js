const { PrismaClient } = require('@prisma/client');

// Create Prisma client for enhanced schema
const prisma = new PrismaClient({
  datasourceUrl: 'file:./enhanced.db',
  log: ['error'], // Reduced logging to avoid spam
});

// Enhanced Database Manager for new schema
class EnhancedDatabaseManager {
  constructor() {
    this.prisma = prisma;
  }

  // ===== ENHANCED LEAD MANAGEMENT =====
  async saveLeads(leads, sessionId = null) {
    try {
      const savedLeads = await Promise.all(
        leads.map(async lead => {
          // First, create or update the profile
          const profileData = {
            username: lead.username,
            displayName: lead.displayName || lead.username,
            fullName: lead.fullName || lead.displayName,
            followers: lead.followers || 0,
            following: lead.following || 0,
            posts: lead.posts || 0,
            isVerified: lead.isVerified || false,
            isPrivate: lead.isPrivate || false,
            isBusiness: lead.isBusinessAccount || false,
            bio: lead.bio || '',
            externalUrl: lead.externalUrl,
            profilePicUrl: lead.profilePicUrl,
            businessCategory: lead.businessCategory,
            highlightsCount: lead.highlightsCount || 0,
            recentPostsCount: lead.recentPostsCount || 0,
            externalLinks: lead.externalLinks ? JSON.stringify(lead.externalLinks) : null,
            locationInfo: lead.locationInfo ? JSON.stringify(lead.locationInfo) : null,
          };

          const profile = await this.prisma.profile.upsert({
            where: { username: lead.username },
            update: { ...profileData, lastSeen: new Date() },
            create: profileData,
          });

          // Create profile snapshot for historical tracking
          await this.prisma.profileSnapshot.create({
            data: {
              profileId: profile.id,
              followers: lead.followers || 0,
              following: lead.following || 0,
              posts: lead.posts || 0,
              bio: lead.bio || '',
              isVerified: lead.isVerified || false,
              isBusiness: lead.isBusinessAccount || false,
              avgLikes: lead.avgLikes,
              avgComments: lead.avgComments,
              storyActive: lead.hasActiveStory || false,
              campaign: lead.campaign || 'unknown',
            },
          });

          // Create the enhanced lead record
          const leadData = {
            profileId: profile.id,
            sessionId: sessionId || 'temp-session',
            bioScore: lead.bioScore?.pitch_score || null,
            visionScore: lead.visionScore?.professional_score || null,
            leadTier: this.determineLadTier(lead),
            leadPriority: this.determineLeadPriority(lead),
            bioAnalysis: lead.bioScore ? JSON.stringify(lead.bioScore) : null,
            businessType: lead.bioScore?.business_type || lead.businessCategory,
            urgencyLevel: lead.bioScore?.urgent || 'no',
            pitchScore: lead.bioScore?.pitch_score || 0,
            temperature: this.determineTemperature(lead),
            searchKeyword: lead.searchKeyword || 'unknown',
            campaign: lead.campaign || 'unknown',
            screenshotPath: lead.screenshot,
          };

          return await this.prisma.lead.create({
            data: leadData,
            include: { profile: true },
          });
        })
      );

      console.log(`✅ Enhanced: Saved ${savedLeads.length} leads with profiles`);
      return savedLeads;
    } catch (error) {
      console.error('❌ Enhanced: Error saving leads:', error);
      // Fallback: Return empty array to prevent app crash
      return [];
    }
  }

  // Helper functions for lead classification
  determineLadTier(lead) {
    const bioScore = lead.bioScore?.pitch_score || 0;
    const urgencyScore = lead.bioScore?.urgency_score || 0;
    
    if (bioScore >= 8 && urgencyScore >= 7) return 'HOT';
    if (bioScore >= 6 || urgencyScore >= 6) return 'WARM';
    if (bioScore >= 4) return 'QUALIFIED';
    return 'COLD';
  }

  determineLeadPriority(lead) {
    const tier = this.determineLadTier(lead);
    if (tier === 'HOT') return 'HIGH';
    if (tier === 'WARM') return 'MEDIUM';
    return 'LOW';
  }

  determineTemperature(lead) {
    const bioScore = lead.bioScore?.pitch_score || 0;
    if (bioScore >= 8) return 'HOT';
    if (bioScore >= 5) return 'WARM';
    return 'COLD';
  }

  async getAllLeads() {
    try {
      const leads = await this.prisma.lead.findMany({
        include: {
          profile: true,
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Convert to legacy format for compatibility
      return leads.map(lead => ({
        id: lead.id,
        username: lead.profile.username,
        displayName: lead.profile.displayName,
        bio: lead.profile.bio,
        followers: lead.profile.followers,
        following: lead.profile.following,
        posts: lead.profile.posts,
        isVerified: lead.profile.isVerified,
        isPrivate: lead.profile.isPrivate,
        isBusinessAccount: lead.profile.isBusiness,
        url: `https://instagram.com/${lead.profile.username}`,
        profilePicUrl: lead.profile.profilePicUrl,
        externalUrl: lead.profile.externalUrl,
        businessCategory: lead.profile.businessCategory,
        screenshot: lead.screenshotPath,
        bioScore: lead.bioAnalysis ? JSON.parse(lead.bioAnalysis) : {
          pitch_score: lead.bioScore || 0,
          business_type: lead.businessType,
          urgent: lead.urgencyLevel,
        },
        visionScore: { professional_score: lead.visionScore || 0 },
        leadScore: lead.bioScore || 0,
        leadTier: lead.leadTier,
        leadPriority: lead.leadPriority,
        scrapedAt: lead.createdAt,
        sessionId: lead.sessionId,
        campaign: lead.campaign,
        email: lead.profile.externalUrl?.includes('@') ? 
          lead.profile.externalUrl.match(/[\w\.-]+@[\w\.-]+\.\w+/)?.[0] : null,
      }));
    } catch (error) {
      console.error('❌ Enhanced: Error fetching leads:', error);
      return [];
    }
  }

  // ===== SESSION MANAGEMENT =====
  async createSession(name, keyword) {
    try {
      return await this.prisma.session.create({
        data: { 
          name, 
          keyword,
          campaign: name // Use name as campaign for now
        },
      });
    } catch (error) {
      console.error('❌ Enhanced: Error creating session:', error);
      // Return a dummy session to prevent crashes
      return { id: `temp-${Date.now()}`, name, keyword };
    }
  }

  async getAllSessions() {
    try {
      const sessions = await this.prisma.session.findMany({
        include: {
          leads: {
            include: { profile: true }
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Convert to legacy format
      return sessions.map(session => ({
        ...session,
        leads: session.leads.map(lead => ({
          username: lead.profile.username,
          displayName: lead.profile.displayName,
          bio: lead.profile.bio,
          followers: lead.profile.followers,
          screenshot: lead.screenshotPath,
          bioScore: { pitch_score: lead.bioScore || 0 },
        })),
      }));
    } catch (error) {
      console.error('❌ Enhanced: Error fetching sessions:', error);
      return [];
    }
  }

  // ===== SETTINGS COMPATIBILITY LAYER =====
  async getSettings() {
    try {
      // Try to get from file system as fallback since we don't have AppSettings table
      const fs = require('fs');
      const path = require('path');
      const settingsPath = path.join(__dirname, 'saved', 'settings.json');
      
      if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        return {
          apifyApiKey: settings.apifyApiKey || '',
          cookieMode: settings.cookieMode !== false, // Default to true
          cookies: settings.cookies || [],
        };
      }

      // Return defaults if no settings file
      return {
        apifyApiKey: '',
        cookieMode: true,
        cookies: [],
      };
    } catch (error) {
      console.error('❌ Enhanced: Error loading settings, using defaults:', error);
      return {
        apifyApiKey: '',
        cookieMode: true,
        cookies: [],
      };
    }
  }

  async saveSettings(settingsData) {
    try {
      // Save to file system for now
      const fs = require('fs');
      const path = require('path');
      const settingsPath = path.join(__dirname, 'saved', 'settings.json');
      
      // Ensure directory exists
      const settingsDir = path.dirname(settingsPath);
      if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
      }

      fs.writeFileSync(settingsPath, JSON.stringify(settingsData, null, 2));
      console.log('✅ Enhanced: Settings saved to file system');
      return settingsData;
    } catch (error) {
      console.error('❌ Enhanced: Error saving settings:', error);
      throw error;
    }
  }

  // ===== ANALYTICS SUPPORT =====
  async getAnalyticsData(dateRange = '7d') {
    try {
      const now = new Date();
      const startDate = new Date();
      
      switch(dateRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      const leads = await this.prisma.lead.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: now,
          },
        },
        include: { profile: true },
      });

      return {
        totalLeads: leads.length,
        hotLeads: leads.filter(l => l.leadTier === 'HOT').length,
        qualifiedLeads: leads.filter(l => l.leadTier === 'QUALIFIED').length,
        avgFollowers: leads.length > 0 ? 
          leads.reduce((sum, l) => sum + (l.profile.followers || 0), 0) / leads.length : 0,
        verifiedPercent: leads.length > 0 ?
          (leads.filter(l => l.profile.isVerified).length / leads.length) * 100 : 0,
        businessPercent: leads.length > 0 ?
          (leads.filter(l => l.profile.isBusiness).length / leads.length) * 100 : 0,
        leads: leads,
      };
    } catch (error) {
      console.error('❌ Enhanced: Error getting analytics data:', error);
      return {
        totalLeads: 0,
        hotLeads: 0,
        qualifiedLeads: 0,
        avgFollowers: 0,
        verifiedPercent: 0,
        businessPercent: 0,
        leads: [],
      };
    }
  }

  // ===== UTILITY FUNCTIONS =====
  async getStats() {
    try {
      const [totalProfiles, totalLeads, totalSessions] = await Promise.all([
        this.prisma.profile.count(),
        this.prisma.lead.count(),
        this.prisma.session.count(),
      ]);

      return {
        totalProfiles,
        totalLeads,
        totalSessions,
        databaseStatus: 'enhanced',
      };
    } catch (error) {
      console.error('❌ Enhanced: Error getting stats:', error);
      return {
        totalProfiles: 0,
        totalLeads: 0,
        totalSessions: 0,
        databaseStatus: 'error',
      };
    }
  }

  // ===== SESSION STORAGE =====
  async saveSession(sessionData) {
    try {
      if (this.prisma && this.prisma.session) {
        // Use Prisma if available
        const session = await this.prisma.session.create({
          data: {
            name: `Session_${sessionData.sessionId}`,
            keyword: JSON.stringify(sessionData.searchCriteria),
            campaign: `saved_session_${sessionData.sessionId}`,
            metadata: JSON.stringify({
              sessionId: sessionData.sessionId,
              timestamp: sessionData.timestamp,
              totalLeads: sessionData.totalLeads,
              searchCriteria: sessionData.searchCriteria,
              summary: sessionData.summary,
              leadCount: sessionData.leadCount,
              hotLeads: sessionData.hotLeads
            })
          }
        });
        console.log(`✅ Enhanced: Session saved to database: ${sessionData.sessionId}`);
        return session;
      } else {
        // File system fallback
        const fs = require('fs');
        const path = require('path');
        const sessionsFile = path.join(__dirname, 'saved', 'enhanced_sessions.json');
        
        let sessions = [];
        if (fs.existsSync(sessionsFile)) {
          try {
            sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
          } catch (e) {
            sessions = [];
          }
        }
        
        sessions.push(sessionData);
        
        // Ensure directory exists
        const sessionsDir = path.dirname(sessionsFile);
        if (!fs.existsSync(sessionsDir)) {
          fs.mkdirSync(sessionsDir, { recursive: true });
        }
        
        fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
        console.log(`✅ Enhanced: Session saved to file system: ${sessionData.sessionId}`);
        return sessionData;
      }
    } catch (error) {
      console.error('❌ Enhanced: Error saving session:', error);
      throw error;
    }
  }

  async getSavedSessions(limit = 10) {
    try {
      if (this.prisma && this.prisma.session) {
        const sessions = await this.prisma.session.findMany({
          where: {
            name: {
              startsWith: 'Session_'
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit
        });
        
        return sessions.map(session => {
          try {
            return JSON.parse(session.metadata);
          } catch (e) {
            return { sessionId: session.id, name: session.name };
          }
        });
      } else {
        // File system fallback
        const fs = require('fs');
        const path = require('path');
        const sessionsFile = path.join(__dirname, 'saved', 'enhanced_sessions.json');
        
        if (fs.existsSync(sessionsFile)) {
          try {
            const sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
            return sessions.slice(-limit).reverse();
          } catch (e) {
            return [];
          }
        }
        return [];
      }
    } catch (error) {
      console.error('❌ Enhanced: Error fetching saved sessions:', error);
      return [];
    }
  }

  async clearAllData() {
    try {
      await this.prisma.lead.deleteMany();
      await this.prisma.profileSnapshot.deleteMany();
      await this.prisma.profile.deleteMany();
      await this.prisma.session.deleteMany();
      console.log('✅ Enhanced: All data cleared');
    } catch (error) {
      console.error('❌ Enhanced: Error clearing data:', error);
    }
  }
}

// Export enhanced manager
const enhancedDb = new EnhancedDatabaseManager();

module.exports = enhancedDb; 