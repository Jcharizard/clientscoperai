const { PrismaClient } = require('@prisma/client');

// Create Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Database helper functions
class DatabaseManager {
  constructor() {
    this.prisma = prisma;
  }

  // ===== LEAD MANAGEMENT =====
  async saveLeads(leads, sessionId = null) {
    try {
      const savedLeads = await Promise.all(
        leads.map(async lead => {
          // Convert complex objects to JSON strings
          const leadData = {
            username: lead.username,
            displayName: lead.displayName || lead.username,
            bio: lead.bio || '',
            followers: lead.followers || 0,
            following: lead.following || 0,
            posts: lead.posts || 0,
            isVerified: lead.isVerified || false,
            isPrivate: lead.isPrivate || false,
            url: lead.url || `https://instagram.com/${lead.username}`,
            profilePicUrl: lead.profilePicUrl,
            externalUrl: lead.externalUrl,
            businessCategory: lead.businessCategory,
            isBusinessAccount: lead.isBusinessAccount || false,
            screenshot: lead.screenshot,
            sessionId: sessionId,
            
            // AI Analysis - convert objects to JSON strings
            bioScore: lead.bioScore ? JSON.stringify(lead.bioScore) : null,
            visionScore: lead.visionScore ? JSON.stringify(lead.visionScore) : null,
            leadScore: lead.leadScore,
            leadTier: lead.leadTier,
            leadPriority: lead.leadPriority,
            leadAction: lead.leadAction,
            leadConfidence: lead.leadConfidence,
            leadFactors: lead.leadFactors ? JSON.stringify(lead.leadFactors) : null,
            
            // Enhanced fields
            contactInfo: lead.contactInfo ? JSON.stringify(lead.contactInfo) : null,
            activityData: lead.activityData ? JSON.stringify(lead.activityData) : null,
          };

          // Use upsert to handle duplicates
          return await this.prisma.lead.upsert({
            where: { username: lead.username },
            update: leadData,
            create: leadData,
          });
        })
      );

      console.log(`✅ Saved ${savedLeads.length} leads to database`);
      return savedLeads;
    } catch (error) {
      console.error('❌ Error saving leads:', error);
      throw error;
    }
  }

  async getAllLeads() {
    try {
      const leads = await this.prisma.lead.findMany({
        orderBy: { scrapedAt: 'desc' },
      });

      // Convert JSON strings back to objects
      return leads.map(lead => ({
        ...lead,
        bioScore: lead.bioScore ? JSON.parse(lead.bioScore) : null,
        visionScore: lead.visionScore ? JSON.parse(lead.visionScore) : null,
        leadFactors: lead.leadFactors ? JSON.parse(lead.leadFactors) : null,
        contactInfo: lead.contactInfo ? JSON.parse(lead.contactInfo) : null,
        activityData: lead.activityData ? JSON.parse(lead.activityData) : null,
      }));
    } catch (error) {
      console.error('❌ Error fetching leads:', error);
      throw error;
    }
  }

  async getLeadsBySession(sessionId) {
    try {
      const leads = await this.prisma.lead.findMany({
        where: { sessionId },
        orderBy: { scrapedAt: 'desc' },
      });

      return leads.map(lead => ({
        ...lead,
        bioScore: lead.bioScore ? JSON.parse(lead.bioScore) : null,
        visionScore: lead.visionScore ? JSON.parse(lead.visionScore) : null,
        leadFactors: lead.leadFactors ? JSON.parse(lead.leadFactors) : null,
        contactInfo: lead.contactInfo ? JSON.parse(lead.contactInfo) : null,
        activityData: lead.activityData ? JSON.parse(lead.activityData) : null,
      }));
    } catch (error) {
      console.error('❌ Error fetching leads by session:', error);
      throw error;
    }
  }

  // ===== SESSION MANAGEMENT =====
  async createSession(name, keyword) {
    try {
      return await this.prisma.session.create({
        data: { name, keyword },
      });
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw error;
    }
  }

  async getAllSessions() {
    try {
      return await this.prisma.session.findMany({
        include: {
          leads: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      throw error;
    }
  }

  async deleteSession(sessionId) {
    try {
      // Delete associated leads first (cascade)
      await this.prisma.lead.deleteMany({
        where: { sessionId },
      });

      // Delete session
      return await this.prisma.session.delete({
        where: { id: sessionId },
      });
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      throw error;
    }
  }

  // ===== SAVED SESSION MANAGEMENT =====
  async saveSession(sessionData) {
    try {
      // For now, save to file system since we don't have a dedicated saved sessions table
      const fs = require('fs');
      const path = require('path');
      const sessionsFile = path.join(__dirname, 'saved', 'sessions.json');
      
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
      console.log(`✅ Session saved to file system: ${sessionData.sessionId}`);
      return sessionData;
    } catch (error) {
      console.error('❌ Error saving session:', error);
      throw error;
    }
  }

  async getSavedSessions(limit = 10) {
    try {
      const fs = require('fs');
      const path = require('path');
      const sessionsFile = path.join(__dirname, 'saved', 'sessions.json');
      
      if (fs.existsSync(sessionsFile)) {
        try {
          const sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
          return sessions.slice(-limit).reverse();
        } catch (e) {
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching saved sessions:', error);
      return [];
    }
  }

  // ===== SETTINGS MANAGEMENT =====
  async getSettings() {
    try {
      const settings = await this.prisma.appSettings.findFirst({
        orderBy: { updatedAt: 'desc' },
      });

      if (!settings) {
        // Create default settings
        return await this.createDefaultSettings();
      }

      return {
        apifyApiKey: settings.apifyApiKey || '',
        cookieMode: settings.cookieMode,
        cookies: settings.cookies ? JSON.parse(settings.cookies) : [],
      };
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      throw error;
    }
  }

  async saveSettings(settingsData) {
    try {
      // Delete old settings
      await this.prisma.appSettings.deleteMany();

      // Create new settings
      return await this.prisma.appSettings.create({
        data: {
          apifyApiKey: settingsData.apifyApiKey,
          cookieMode: settingsData.cookieMode,
          cookies: JSON.stringify(settingsData.cookies || []),
        },
      });
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      throw error;
    }
  }

  async createDefaultSettings() {
    try {
      return await this.prisma.appSettings.create({
        data: {
          apifyApiKey: '',
          cookieMode: true,
          cookies: JSON.stringify([]),
        },
      });
    } catch (error) {
      console.error('❌ Error creating default settings:', error);
      throw error;
    }
  }

  // ===== CAMPAIGN MANAGEMENT =====
  async createCampaign(campaignData) {
    try {
      return await this.prisma.campaign.create({
        data: campaignData,
      });
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      throw error;
    }
  }

  async updateCampaignProgress(campaignId, progress) {
    try {
      return await this.prisma.campaign.update({
        where: { id: campaignId },
        data: progress,
      });
    } catch (error) {
      console.error('❌ Error updating campaign progress:', error);
      throw error;
    }
  }

  // ===== BUSINESS INTELLIGENCE =====
  async generateBusinessIntelligence() {
    try {
      const leads = await this.getAllLeads();
      
      if (leads.length === 0) {
        return {
          totalLeads: 0,
          businessTypes: {},
          topPerformingType: null,
          avgConversionScore: 0,
        };
      }

      // Calculate business intelligence
      const businessTypes = {};
      let totalBioScore = 0;
      let bioScoreCount = 0;

      leads.forEach(lead => {
        // Count business types
        const businessType = lead.businessCategory || 'other';
        businessTypes[businessType] = (businessTypes[businessType] || 0) + 1;

        // Calculate average bio score
        if (lead.bioScore && lead.bioScore.business_score) {
          totalBioScore += lead.bioScore.business_score;
          bioScoreCount++;
        }
      });

      const topPerformingType = Object.entries(businessTypes)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

      const intelligence = {
        totalLeads: leads.length,
        businessTypes,
        topPerformingType,
        avgConversionScore: bioScoreCount > 0 ? totalBioScore / bioScoreCount : 0,
        marketSaturation: this.calculateMarketSaturation(leads),
        opportunities: this.identifyOpportunities(businessTypes),
        trends: this.calculateTrends(leads),
      };

      // Save to database
      await this.prisma.businessIntelligence.create({
        data: {
          totalLeads: intelligence.totalLeads,
          businessTypes: JSON.stringify(intelligence.businessTypes),
          topPerformingType: intelligence.topPerformingType,
          avgConversionScore: intelligence.avgConversionScore,
          marketSaturation: intelligence.marketSaturation,
          opportunities: JSON.stringify(intelligence.opportunities),
          trends: JSON.stringify(intelligence.trends),
          dataFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          dataTo: new Date(),
        },
      });

      return intelligence;
    } catch (error) {
      console.error('❌ Error generating business intelligence:', error);
      throw error;
    }
  }

  calculateMarketSaturation(leads) {
    // Simple saturation calculation based on follower counts
    const avgFollowers = leads.reduce((sum, lead) => sum + lead.followers, 0) / leads.length;
    return Math.min(avgFollowers / 100000, 1); // Normalize to 0-1
  }

  identifyOpportunities(businessTypes) {
    return Object.entries(businessTypes)
      .map(([type, count]) => ({
        niche: type,
        growth: count > 5 ? 'High' : 'Medium',
        opportunity: count < 3 ? 'Very High' : count < 10 ? 'High' : 'Medium',
        estimatedValue: count * 1000, // Simple calculation
        competition: count > 20 ? 'High' : count > 10 ? 'Medium' : 'Low',
      }))
      .sort((a, b) => b.estimatedValue - a.estimatedValue);
  }

  calculateTrends(leads) {
    // Simple trend calculation
    const recentLeads = leads.filter(lead => 
      new Date(lead.scrapedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    return {
      followerGrowth: recentLeads.length / leads.length,
      engagementTrends: 0.05, // Placeholder
      businessCategoryGrowth: {
        fitness: 0.12,
        beauty: 0.08,
        restaurant: 0.15,
      },
    };
  }

  // ===== UTILITY FUNCTIONS =====
  async clearAllData() {
    try {
      await this.prisma.lead.deleteMany();
      await this.prisma.session.deleteMany();
      await this.prisma.campaign.deleteMany();
      await this.prisma.businessIntelligence.deleteMany();
      console.log('✅ All data cleared from database');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const [leadCount, sessionCount, campaignCount] = await Promise.all([
        this.prisma.lead.count(),
        this.prisma.session.count(),
        this.prisma.campaign.count(),
      ]);

      return {
        leads: leadCount,
        sessions: sessionCount,
        campaigns: campaignCount,
        uptime: process.uptime(),
      };
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  }
}

// Create singleton instance
const db = new DatabaseManager();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = db; 