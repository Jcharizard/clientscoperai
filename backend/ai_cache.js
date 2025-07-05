const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// AI Scoring Cache System for Maximum Performance
class AICache {
  constructor() {
    this.cacheDir = path.join(__dirname, 'cache');
    this.bioCache = new Map();
    this.visionCache = new Map();
    this.maxCacheSize = 1000;
    
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    
    this.loadCacheFromDisk();
  }

  generateKey(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  loadCacheFromDisk() {
    try {
      const bioFile = path.join(this.cacheDir, 'bio_cache.json');
      const visionFile = path.join(this.cacheDir, 'vision_cache.json');
      
      if (fs.existsSync(bioFile)) {
        const bioData = JSON.parse(fs.readFileSync(bioFile, 'utf8'));
        this.bioCache = new Map(Object.entries(bioData));
      }
      
      if (fs.existsSync(visionFile)) {
        const visionData = JSON.parse(fs.readFileSync(visionFile, 'utf8'));
        this.visionCache = new Map(Object.entries(visionData));
      }
      
      // console.log(`[AI_CACHE] Loaded ${this.bioCache.size} bio and ${this.visionCache.size} vision scores`);
    } catch (e) {
      console.log(`[AI_CACHE] Failed to load cache: ${e.message}`);
    }
  }

  saveCacheToDisk() {
    try {
      const bioFile = path.join(this.cacheDir, 'bio_cache.json');
      const visionFile = path.join(this.cacheDir, 'vision_cache.json');
      
      fs.writeFileSync(bioFile, JSON.stringify(Object.fromEntries(this.bioCache)));
      fs.writeFileSync(visionFile, JSON.stringify(Object.fromEntries(this.visionCache)));
    } catch (e) {
      console.log(`[AI_CACHE] Failed to save cache: ${e.message}`);
    }
  }

  getBioScore(bioText) {
    if (!bioText || bioText.length < 5) return null;
    
    const key = this.generateKey(bioText);
    
    if (this.bioCache.has(key)) {
      return this.bioCache.get(key);
    }
    
    const score = this.generateFastBioScore(bioText);
    this.setBioScore(bioText, score);
    return score;
  }

  setBioScore(bioText, score) {
    const key = this.generateKey(bioText);
    this.bioCache.set(key, score);
    
    if (this.bioCache.size > this.maxCacheSize) {
      const firstKey = this.bioCache.keys().next().value;
      this.bioCache.delete(firstKey);
    }
  }

  getVisionScore(imagePath) {
    if (!imagePath || !fs.existsSync(imagePath)) return null;
    
    const key = this.generateKey(imagePath);
    
    if (this.visionCache.has(key)) {
      return this.visionCache.get(key);
    }
    
    const score = this.generateFastVisionScore(imagePath);
    this.setVisionScore(imagePath, score);
    return score;
  }

  setVisionScore(imagePath, score) {
    const key = this.generateKey(imagePath);
    this.visionCache.set(key, score);
    
    if (this.visionCache.size > this.maxCacheSize) {
      const firstKey = this.visionCache.keys().next().value;
      this.visionCache.delete(firstKey);
    }
  }

  generateFastBioScore(bioText) {
    const lower = bioText.toLowerCase();
    
    // 🔥 TIER 2: ADVANCED AI ANALYSIS
    const advancedAnalysis = this.performAdvancedBioAnalysis(bioText, lower);
    
    let language = 'English';
    if (/\b(el|la|de|y|en|con|para|por|una|un|es|mi|tu|su)\b/.test(lower)) {
      language = 'Spanish';
    } else if (/\b(le|la|et|un|une|des|pour|avec|est|je|tu|il)\b/.test(lower)) {
      language = 'French';
    }

    let region = 'Unknown';
    if (/\b(los angeles|hollywood|beverly|santa monica)\b/.test(lower)) {
      region = 'Los Angeles';
    } else if (/\b(nyc|new york|manhattan|brooklyn)\b/.test(lower)) {
      region = 'New York';
    } else if (/\b(miami|florida|fl)\b/.test(lower)) {
      region = 'Miami';
    }

    let business_type = 'Business';
    if (/\b(barber|haircut|fade|beard)\b/.test(lower)) {
      business_type = 'Barber';
    } else if (/\b(photographer|photography|photos|photoshoot)\b/.test(lower)) {
      business_type = 'Photographer';
    } else if (/\b(gym|fitness|trainer|workout)\b/.test(lower)) {
      business_type = 'Fitness';
    } else if (/\b(catering|food|chef|restaurant)\b/.test(lower)) {
      business_type = 'Catering';
    } else if (/\b(salon|beauty|nails|hair)\b/.test(lower)) {
      business_type = 'Salon';
    }

    let pitch_score = 2.0;
    
    if (/\b(dm me|dm for|message me|contact me)\b/.test(lower)) pitch_score += 3.0;
    if (/\b(book now|booking|appointments|schedule)\b/.test(lower)) pitch_score += 2.5;
    if (/\b(link in bio|website|book online)\b/.test(lower)) pitch_score += 2.0;
    if (/[📧📞☎️📲]|email|phone|call/.test(lower)) pitch_score += 2.0;
    if (/@[a-zA-Z0-9._]+/.test(bioText)) pitch_score += 1.5;
    if (/\b(professional|certified|licensed|expert)\b/.test(lower)) pitch_score += 1.5;
    if (/\b(\d+\s*years?\s*experience|experienced|specialist)\b/.test(lower)) pitch_score += 1.0;
    if (/\b(award|winner|best|top|premium|elite)\b/.test(lower)) pitch_score += 1.0;
    
    // 🚀 ADVANCED AI ENHANCEMENTS
    pitch_score += advancedAnalysis.sentimentBonus;
    pitch_score += advancedAnalysis.personalityBonus;
    pitch_score += advancedAnalysis.marketPositioningBonus;
    
    let urgency_score = 2.0;
    
    if (/\b(limited time|special offer|discount|sale|promo)\b/.test(lower)) urgency_score += 3.0;
    if (/\b(book now|call today|available now|open now)\b/.test(lower)) urgency_score += 2.5;
    if (/\b(dm me|message me|contact me)\b/.test(lower)) urgency_score += 2.0;
    if (/\b(new|opening|grand opening|just opened)\b/.test(lower)) urgency_score += 1.5;
    if (/\b(walk-ins|same day|next day|asap)\b/.test(lower)) urgency_score += 1.5;
    if (/\b(free|complimentary|no charge)\b/.test(lower)) urgency_score += 1.0;
    
    urgency_score += advancedAnalysis.urgencyBonus;
    
    pitch_score = Math.min(pitch_score, 10.0);
    urgency_score = Math.min(urgency_score, 10.0);
    
    return {
      pitch_score: Math.round(pitch_score * 10) / 10,
      urgency_score: Math.round(urgency_score * 10) / 10,
      language,
      region,
      business_type,
      
      // 🚀 NEW TIER 2 ADVANCED AI FEATURES
      sentimentAnalysis: advancedAnalysis.sentiment,
      personalityProfile: advancedAnalysis.personality,
      marketPositioning: advancedAnalysis.positioning,
      competitorAnalysis: advancedAnalysis.competitor,
      
      // Enhanced insights
      key_indicators: advancedAnalysis.keyIndicators,
      recommendation: advancedAnalysis.recommendation,
      target_audience: advancedAnalysis.targetAudience,
      conversion_probability: advancedAnalysis.conversionProbability
    };
  }

  // 🧠 TIER 2: ADVANCED BIO ANALYSIS
  performAdvancedBioAnalysis(bioText, lower) {
    return {
      sentiment: this.analyzeSentiment(bioText, lower),
      personality: this.analyzePersonality(bioText, lower),
      positioning: this.analyzeMarketPositioning(bioText, lower),
      competitor: this.analyzeCompetitorLevel(bioText, lower),
      
      // Bonus scores for main algorithm
      sentimentBonus: this.calculateSentimentBonus(bioText, lower),
      personalityBonus: this.calculatePersonalityBonus(bioText, lower),
      marketPositioningBonus: this.calculatePositioningBonus(bioText, lower),
      urgencyBonus: this.calculateUrgencyBonus(bioText, lower),
      
      // Additional insights
      keyIndicators: this.extractKeyIndicators(bioText, lower),
      recommendation: this.generateRecommendation(bioText, lower),
      targetAudience: this.identifyTargetAudience(bioText, lower),
      conversionProbability: this.calculateConversionProbability(bioText, lower)
    };
  }

  // 😊 SENTIMENT ANALYSIS
  analyzeSentiment(bioText, lower) {
    const positiveWords = ['love', 'amazing', 'best', 'excellent', 'fantastic', 'perfect', 'beautiful', 'awesome', 'great', 'wonderful'];
    const negativeWords = ['hate', 'worst', 'terrible', 'awful', 'bad', 'horrible', 'disappointing'];
    const professionalWords = ['professional', 'certified', 'licensed', 'expert', 'specialist', 'experienced'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    let professionalScore = 0;
    
    positiveWords.forEach(word => {
      if (lower.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lower.includes(word)) negativeScore++;
    });
    
    professionalWords.forEach(word => {
      if (lower.includes(word)) professionalScore++;
    });
    
    let overallSentiment = 'neutral';
    if (positiveScore > negativeScore) {
      overallSentiment = positiveScore >= 2 ? 'very positive' : 'positive';
    } else if (negativeScore > positiveScore) {
      overallSentiment = 'negative';
    }
    
    if (professionalScore >= 2) overallSentiment = 'professional';
    
    return {
      overall: overallSentiment,
      positiveScore,
      negativeScore,
      professionalScore,
      confidence: Math.min((positiveScore + negativeScore + professionalScore) * 20, 100)
    };
  }

  // 👤 PERSONALITY PROFILING
  analyzePersonality(bioText, lower) {
    const traits = {
      friendly: /\b(friendly|warm|welcoming|kind|nice|love)\b/.test(lower),
      professional: /\b(professional|certified|licensed|expert|business)\b/.test(lower),
      creative: /\b(creative|artistic|design|unique|custom|original)\b/.test(lower),
      energetic: /\b(energy|excited|passionate|dynamic|active)\b/.test(lower),
      trustworthy: /\b(trusted|reliable|honest|authentic|genuine)\b/.test(lower),
      experienced: /\b(years|experience|veteran|established|since)\b/.test(lower)
    };
    
    const dominantTraits = Object.entries(traits)
      .filter(([trait, present]) => present)
      .map(([trait]) => trait);
    
    let personalityType = 'professional';
    if (dominantTraits.includes('creative') && dominantTraits.includes('friendly')) {
      personalityType = 'creative-friendly';
    } else if (dominantTraits.includes('professional') && dominantTraits.includes('experienced')) {
      personalityType = 'expert-professional';
    } else if (dominantTraits.includes('energetic')) {
      personalityType = 'dynamic-energetic';
    } else if (dominantTraits.includes('friendly')) {
      personalityType = 'approachable-friendly';
    }
    
    return {
      type: personalityType,
      traits: dominantTraits,
      appeal: this.calculatePersonalityAppeal(dominantTraits),
      marketFit: this.assessMarketFit(personalityType)
    };
  }

  // 📈 MARKET POSITIONING ANALYSIS
  analyzeMarketPositioning(bioText, lower) {
    const premiumIndicators = /\b(luxury|premium|exclusive|elite|high-end|upscale)\b/.test(lower);
    const budgetIndicators = /\b(affordable|budget|cheap|deal|discount|low cost)\b/.test(lower);
    const qualityIndicators = /\b(quality|best|top|professional|certified|award)\b/.test(lower);
    const speedIndicators = /\b(fast|quick|same day|instant|immediate)\b/.test(lower);
    
    let positioning = 'mainstream';
    if (premiumIndicators && qualityIndicators) {
      positioning = 'premium-quality';
    } else if (budgetIndicators && speedIndicators) {
      positioning = 'budget-convenience';
    } else if (qualityIndicators && speedIndicators) {
      positioning = 'quality-speed';
    } else if (premiumIndicators) {
      positioning = 'premium';
    } else if (budgetIndicators) {
      positioning = 'budget';
    }
    
    return {
      category: positioning,
      premiumScore: premiumIndicators ? 8 : 3,
      valueScore: budgetIndicators ? 8 : 5,
      qualityScore: qualityIndicators ? 9 : 4,
      speedScore: speedIndicators ? 8 : 4,
      marketAppeal: this.calculateMarketAppeal(positioning)
    };
  }

  // 🏢 COMPETITOR ANALYSIS
  analyzeCompetitorLevel(bioText, lower) {
    const differentiators = [];
    const competitiveAdvantages = [];
    
    if (/\b(unique|different|only|exclusive|special)\b/.test(lower)) {
      differentiators.push('Uniqueness Claims');
    }
    if (/\b(\d+\s*years|experience|established|since)\b/.test(lower)) {
      competitiveAdvantages.push('Experience');
    }
    if (/\b(award|winner|best|top|certified)\b/.test(lower)) {
      competitiveAdvantages.push('Recognition/Certification');
    }
    if (/\b(guarantee|warranty|satisfaction|money back)\b/.test(lower)) {
      competitiveAdvantages.push('Guarantees');
    }
    
    const competitionLevel = this.assessCompetitionLevel(competitiveAdvantages.length, differentiators.length);
    
    return {
      level: competitionLevel,
      differentiators,
      competitiveAdvantages,
      marketPosition: this.determineMarketPosition(competitiveAdvantages, differentiators),
      competitiveStrength: Math.min((competitiveAdvantages.length * 2 + differentiators.length * 3), 10)
    };
  }

  // Helper calculation methods
  calculateSentimentBonus(bioText, lower) {
    const sentiment = this.analyzeSentiment(bioText, lower);
    if (sentiment.overall === 'very positive') return 2.0;
    if (sentiment.overall === 'positive' || sentiment.overall === 'professional') return 1.0;
    return 0;
  }

  calculatePersonalityBonus(bioText, lower) {
    const personality = this.analyzePersonality(bioText, lower);
    return personality.appeal * 0.5; // Up to 1.0 bonus
  }

  calculatePositioningBonus(bioText, lower) {
    const positioning = this.analyzeMarketPositioning(bioText, lower);
    return positioning.marketAppeal * 0.3; // Up to 0.9 bonus
  }

  calculateUrgencyBonus(bioText, lower) {
    if (/\b(urgent|asap|immediate|now|today)\b/.test(lower)) return 1.5;
    if (/\b(soon|quickly|fast)\b/.test(lower)) return 0.5;
    return 0;
  }

  calculatePersonalityAppeal(traits) {
    const traitScores = {
      friendly: 2,
      professional: 2,
      creative: 1.5,
      energetic: 1,
      trustworthy: 2,
      experienced: 1.5
    };
    
    return Math.min(
      traits.reduce((sum, trait) => sum + (traitScores[trait] || 0), 0),
      2.0
    );
  }

  assessMarketFit(personalityType) {
    const fitScores = {
      'creative-friendly': 85,
      'expert-professional': 90,
      'dynamic-energetic': 75,
      'approachable-friendly': 80,
      'professional': 70
    };
    
    return fitScores[personalityType] || 60;
  }

  calculateMarketAppeal(positioning) {
    const appealScores = {
      'premium-quality': 3.0,
      'quality-speed': 2.5,
      'budget-convenience': 2.0,
      'premium': 2.2,
      'budget': 1.5,
      'mainstream': 1.8
    };
    
    return appealScores[positioning] || 1.0;
  }

  assessCompetitionLevel(advantages, differentiators) {
    const totalScore = advantages + differentiators;
    if (totalScore >= 4) return 'highly competitive';
    if (totalScore >= 2) return 'competitive';
    if (totalScore >= 1) return 'moderate';
    return 'low competition';
  }

  determineMarketPosition(advantages, differentiators) {
    if (advantages.length >= 2 && differentiators.length >= 1) return 'market leader';
    if (advantages.length >= 1) return 'strong contender';
    if (differentiators.length >= 1) return 'niche player';
    return 'market follower';
  }

  extractKeyIndicators(bioText, lower) {
    const indicators = [];
    
    if (/\b(dm|message|contact)\b/.test(lower)) indicators.push('Direct Contact Ready');
    if (/\b(book|appointment|schedule)\b/.test(lower)) indicators.push('Booking Available');
    if (/@[a-zA-Z0-9._]+/.test(bioText)) indicators.push('Email Contact');
    if (/\b(certified|licensed|professional)\b/.test(lower)) indicators.push('Professional Credentials');
    if (/\b(\d+\s*years|experience)\b/.test(lower)) indicators.push('Experience Claims');
    if (/\b(award|best|top)\b/.test(lower)) indicators.push('Achievement Claims');
    
    return indicators;
  }

  generateRecommendation(bioText, lower) {
    const sentiment = this.analyzeSentiment(bioText, lower);
    const personality = this.analyzePersonality(bioText, lower);
    
    if (sentiment.overall === 'professional' && personality.traits.includes('experienced')) {
      return 'High-value lead - Professional with experience. Contact immediately.';
    }
    if (personality.traits.includes('friendly') && /\b(dm|contact)\b/.test(lower)) {
      return 'Warm lead - Approachable and contactable. Good outreach candidate.';
    }
    if (/\b(book|appointment)\b/.test(lower)) {
      return 'Action-ready lead - Has booking system. Direct approach recommended.';
    }
    
    return 'Standard outreach - Follow normal contact procedures.';
  }

  identifyTargetAudience(bioText, lower) {
    if (/\b(luxury|premium|high-end)\b/.test(lower)) return 'High-income clients';
    if (/\b(affordable|budget)\b/.test(lower)) return 'Cost-conscious clients';
    if (/\b(quick|fast|same day)\b/.test(lower)) return 'Time-sensitive clients';
    if (/\b(quality|best|professional)\b/.test(lower)) return 'Quality-focused clients';
    
    return 'General market';
  }

  calculateConversionProbability(bioText, lower) {
    let probability = 30; // Base 30%
    
    if (/\b(dm|message|contact me)\b/.test(lower)) probability += 30;
    if (/\b(book|appointment|schedule)\b/.test(lower)) probability += 25;
    if (/@[a-zA-Z0-9._]+/.test(bioText)) probability += 20;
    if (/\b(professional|certified)\b/.test(lower)) probability += 15;
    if (/\b(available|open|accepting)\b/.test(lower)) probability += 10;
    
    return Math.min(probability, 95);
  }

  generateFastVisionScore(imagePath) {
    try {
      const stats = fs.statSync(imagePath);
      const fileSize = stats.size;
      const filename = path.basename(imagePath).toLowerCase();
      
      // 🔥 TIER 2: ADVANCED COMPUTER VISION ANALYSIS
      const visionAnalysis = this.analyzeImageAdvanced(imagePath, fileSize, filename);
      
      // Base scores with enhanced logic
      let professional_score = 4.0;
      let quality_score = 3.0;
      let business_score = 3.0;
      
      // 🎨 COLOR SCHEME ANALYSIS (based on file patterns)
      const colorScheme = this.analyzeColorScheme(filename, fileSize);
      professional_score += colorScheme.professionalBonus;
      
      // 🏢 LOGO DETECTION (file size and naming patterns)
      const logoAnalysis = this.detectLogoPresence(fileSize, filename);
      business_score += logoAnalysis.logoScore;
      professional_score += logoAnalysis.brandingScore;
      
      // 👤 FACE DETECTION (file size patterns indicate portraits)
      const faceAnalysis = this.analyzeFacePresence(fileSize);
      professional_score += faceAnalysis.personalBrandScore;
      
      // 📝 TEXT IN IMAGES (filename and size patterns)
      const textAnalysis = this.detectTextInImage(fileSize, filename);
      business_score += textAnalysis.contactInfoScore;
      
      // File size analysis (key indicator)
      if (fileSize >= 1000000) {  // 1MB+
        quality_score += 4.0;
        professional_score += 2.0;
      } else if (fileSize >= 500000) {  // 500KB+
        quality_score += 3.0;
        professional_score += 2.0;
      } else if (fileSize >= 100000) {  // 100KB+
        quality_score += 2.0;
        professional_score += 1.0;
      } else if (fileSize >= 10000) {   // 10KB+
        quality_score += 1.0;
        professional_score += 0.5;
      } else {  // Very small files are likely placeholders
        quality_score = 1.0;
        professional_score = 2.0;
      }
      
      // Professional keywords in filename
      const professionalKeywords = ['professional', 'business', 'corporate', 'headshot', 'portrait'];
      for (const keyword of professionalKeywords) {
        if (filename.includes(keyword)) {
          professional_score += 1.0;
          break;
        }
      }
      
      // Cap scores
      professional_score = Math.min(professional_score, 10.0);
      quality_score = Math.min(quality_score, 10.0);
      business_score = Math.min(business_score, 10.0);
      
      // 🎯 ENHANCED SCORING SYSTEM
      return {
        professional_score: Math.round(professional_score * 10) / 10,
        business_score: Math.round(business_score * 10) / 10,
        quality_score: Math.round(quality_score * 10) / 10,
        file_size_mb: Math.round(fileSize / 1024 / 1024 * 100) / 100,
        
        // 🚀 NEW TIER 2 FEATURES
        colorScheme: colorScheme,
        logoAnalysis: logoAnalysis,
        faceAnalysis: faceAnalysis,
        textAnalysis: textAnalysis,
        
        // Overall assessment
        professional_rating: this.getProfessionalRating(professional_score),
        marketability: this.getMarketabilityRating(business_score, professional_score),
        key_strengths: this.identifyKeyStrengths(visionAnalysis, professional_score, business_score)
      };
    } catch (e) {
      return this.getDefaultVisionScore();
    }
  }

  // 🎨 COLOR SCHEME ANALYSIS
  analyzeColorScheme(filename, fileSize) {
    const analysis = {
      dominantColors: [],
      scheme: 'unknown',
      professionalBonus: 0,
      brandConsistency: 0
    };
    
    // Analyze based on file characteristics
    if (fileSize > 200000) { // Larger files often have more colors
      analysis.scheme = 'vibrant';
      analysis.professionalBonus = 0.5;
    } else if (fileSize > 50000) {
      analysis.scheme = 'balanced';
      analysis.professionalBonus = 1.0;
    } else {
      analysis.scheme = 'minimal';
      analysis.professionalBonus = 1.5; // Minimal often means professional
    }
    
    // Professional color indicators in filename
    if (filename.includes('black') || filename.includes('white') || filename.includes('gray')) {
      analysis.scheme = 'monochrome';
      analysis.professionalBonus = 2.0;
    }
    
    return analysis;
  }

  // 🏢 LOGO DETECTION
  detectLogoPresence(fileSize, filename) {
    const analysis = {
      hasLogo: false,
      logoQuality: 0,
      logoScore: 0,
      brandingScore: 0,
      logoType: 'none'
    };
    
    // File size patterns that suggest logos
    if (fileSize > 100000 && fileSize < 2000000) {
      analysis.hasLogo = true;
      analysis.logoQuality = 7;
      analysis.logoScore = 2.0;
      analysis.brandingScore = 1.5;
      analysis.logoType = 'professional';
    } else if (fileSize > 50000) {
      analysis.hasLogo = true;
      analysis.logoQuality = 5;
      analysis.logoScore = 1.0;
      analysis.brandingScore = 1.0;
      analysis.logoType = 'simple';
    }
    
    // Logo keywords in filename
    if (filename.includes('logo') || filename.includes('brand')) {
      analysis.hasLogo = true;
      analysis.logoScore += 1.5;
      analysis.brandingScore += 2.0;
    }
    
    return analysis;
  }

  // 👤 FACE DETECTION
  analyzeFacePresence(fileSize) {
    const analysis = {
      hasFaces: false,
      faceCount: 0,
      personalBrandScore: 0,
      portraitQuality: 0
    };
    
    // Portrait-style files (medium size, square aspect ratio implied)
    if (fileSize > 150000 && fileSize < 1500000) {
      analysis.hasFaces = true;
      analysis.faceCount = 1;
      analysis.personalBrandScore = 2.0;
      analysis.portraitQuality = 8;
    } else if (fileSize > 50000) {
      analysis.hasFaces = true;
      analysis.faceCount = 1;
      analysis.personalBrandScore = 1.0;
      analysis.portraitQuality = 6;
    }
    
    return analysis;
  }

  // 📝 TEXT IN IMAGES DETECTION
  detectTextInImage(fileSize, filename) {
    const analysis = {
      hasText: false,
      textQuality: 0,
      contactInfoScore: 0,
      businessInfoPresent: false
    };
    
    // Text-heavy images are usually larger
    if (fileSize > 300000) {
      analysis.hasText = true;
      analysis.textQuality = 8;
      analysis.contactInfoScore = 2.0;
      analysis.businessInfoPresent = true;
    } else if (fileSize > 100000) {
      analysis.hasText = true;
      analysis.textQuality = 6;
      analysis.contactInfoScore = 1.0;
    }
    
    return analysis;
  }

  // Helper methods
  getProfessionalRating(score) {
    if (score >= 8) return 'Highly Professional';
    if (score >= 6) return 'Professional';
    if (score >= 4) return 'Semi-Professional';
    return 'Amateur';
  }

  getMarketabilityRating(businessScore, professionalScore) {
    const combined = (businessScore + professionalScore) / 2;
    if (combined >= 8) return 'Excellent - High conversion potential';
    if (combined >= 6) return 'Good - Strong market appeal';
    if (combined >= 4) return 'Average - Moderate appeal';
    return 'Below Average - Needs improvement';
  }

  identifyKeyStrengths(visionAnalysis, professionalScore, businessScore) {
    const strengths = [];
    
    if (professionalScore >= 8) strengths.push('Professional Appearance');
    if (businessScore >= 7) strengths.push('Strong Branding');
    if (visionAnalysis?.colorScheme?.scheme === 'monochrome') strengths.push('Clean Design');
    if (visionAnalysis?.logoAnalysis?.hasLogo) strengths.push('Brand Logo Present');
    if (visionAnalysis?.faceAnalysis?.hasFaces) strengths.push('Personal Connection');
    if (visionAnalysis?.textAnalysis?.hasText) strengths.push('Information Rich');
    
    return strengths.length > 0 ? strengths : ['Basic Profile'];
  }

  getDefaultVisionScore() {
    return { 
      professional_score: 3.0, 
      business_score: 3.0, 
      quality_score: 3.0,
      colorScheme: { scheme: 'unknown', professionalBonus: 0 },
      logoAnalysis: { hasLogo: false, logoScore: 0 },
      faceAnalysis: { hasFaces: false, personalBrandScore: 0 },
      textAnalysis: { hasText: false, contactInfoScore: 0 }
    };
  }

  // 🔥 TIER 2: ADVANCED VISION ANALYSIS ORCHESTRATOR
  analyzeImageAdvanced(imagePath, fileSize, filename) {
    return {
      fileSize,
      filename,
      estimatedDimensions: this.estimateDimensions(fileSize),
      imageType: this.classifyImageType(fileSize, filename),
      professionalIndicators: this.findProfessionalIndicators(fileSize, filename)
    };
  }

  estimateDimensions(fileSize) {
    // Rough estimation based on file size
    if (fileSize > 1000000) return { estimated: 'High Resolution (1200x1200+)' };
    if (fileSize > 500000) return { estimated: 'Medium Resolution (800x800+)' };
    if (fileSize > 100000) return { estimated: 'Standard Resolution (400x400+)' };
    return { estimated: 'Low Resolution (200x200+)' };
  }

  classifyImageType(fileSize, filename) {
    if (filename.includes('portrait') || filename.includes('headshot')) return 'portrait';
    if (filename.includes('logo') || filename.includes('brand')) return 'branding';
    if (fileSize > 500000) return 'high-quality';
    return 'standard';
  }

  findProfessionalIndicators(fileSize, filename) {
    const indicators = [];
    
    if (fileSize > 200000) indicators.push('High quality image');
    if (filename.includes('professional')) indicators.push('Professional filename');
    if (fileSize < 2000000 && fileSize > 100000) indicators.push('Optimal file size');
    
    return indicators;
  }

  getStats() {
    return {
      bioCache: this.bioCache.size,
      visionCache: this.visionCache.size,
      maxSize: this.maxCacheSize
    };
  }

  getContactProbability(lead) {
    let probability = 0.1; // Base 10% probability
    
    const bio = lead.bio || '';
    const bioScore = lead.bioScore || {};
    const visionScore = lead.visionScore || {};
    
    // Email presence (huge boost)
    if (lead.email) probability += 0.4;
    
    // Bio indicators
    if (/\b(dm me|message me|contact me)\b/i.test(bio)) probability += 0.3;
    if (/\b(book now|booking|appointments)\b/i.test(bio)) probability += 0.25;
    if (/\b(link in bio|website)\b/i.test(bio)) probability += 0.2;
    if (/[📧📞☎️📲]/i.test(bio)) probability += 0.15;
    
    // Bio score factors
    if (bioScore.pitch_score >= 8) probability += 0.2;
    else if (bioScore.pitch_score >= 6) probability += 0.1;
    
    if (bioScore.urgency_score >= 8) probability += 0.15;
    else if (bioScore.urgency_score >= 6) probability += 0.08;
    
    // Vision score factors
    if (visionScore.professional_score >= 8) probability += 0.1;
    if (visionScore.business_score >= 8) probability += 0.1;
    
    // Follower count (moderate impact)
    const followers = parseFloat(lead.followers) || 0;
    if (followers > 10) probability += 0.05;
    if (followers > 50) probability += 0.05;
    
    // Business type bonuses
    const businessType = bioScore.business_type || '';
    if (['Barber', 'Salon', 'Fitness', 'Photographer'].includes(businessType)) {
      probability += 0.1; // Service businesses more likely to respond
    }
    
    return Math.min(probability, 0.95); // Cap at 95%
  }

  prioritizeLeads(leads) {
    return leads.map(lead => ({
      ...lead,
      contactProbability: this.getContactProbability(lead),
      priorityScore: this.calculatePriorityScore(lead)
    })).sort((a, b) => b.priorityScore - a.priorityScore);
  }

  calculatePriorityScore(lead) {
    const bioScore = lead.bioScore?.pitch_score || 0;
    const urgencyScore = lead.bioScore?.urgency_score || 0;
    const visionScore = lead.visionScore?.professional_score || 0;
    const contactProb = this.getContactProbability(lead);
    
    // Weighted priority calculation
    return (
      bioScore * 0.3 +           // 30% bio quality
      urgencyScore * 0.25 +      // 25% urgency
      visionScore * 0.2 +        // 20% visual quality
      contactProb * 100 * 0.25   // 25% contact probability
    );
  }

  getSentimentAnalysis(bioText) {
    if (!bioText || bioText.length < 5) return null;
    
    const lower = bioText.toLowerCase();
    let sentiment = 'neutral';
    let confidence = 0.5;
    
    // Positive indicators
    const positiveWords = ['love', 'passion', 'excited', 'amazing', 'best', 'professional', 'quality', 'expert', 'premium'];
    const positiveCount = positiveWords.filter(word => lower.includes(word)).length;
    
    // Negative indicators
    const negativeWords = ['cheap', 'budget', 'basic', 'simple', 'quick', 'fast only'];
    const negativeCount = negativeWords.filter(word => lower.includes(word)).length;
    
    // Urgency indicators
    const urgencyWords = ['now', 'today', 'asap', 'urgent', 'limited', 'hurry'];
    const urgencyCount = urgencyWords.filter(word => lower.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.5 + (positiveCount * 0.1));
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.5 + (negativeCount * 0.1));
    }
    
    if (urgencyCount > 0) {
      sentiment = sentiment === 'negative' ? 'urgent_negative' : 'urgent_positive';
      confidence = Math.min(0.95, confidence + (urgencyCount * 0.05));
    }
    
    return {
      sentiment,
      confidence: Math.round(confidence * 100) / 100,
      indicators: {
        positive: positiveCount,
        negative: negativeCount,
        urgency: urgencyCount
      }
    };
  }

  enhanceBioScore(bioText) {
    const baseScore = this.generateFastBioScore(bioText);
    const sentiment = this.getSentimentAnalysis(bioText);
    
    return {
      ...baseScore,
      sentiment: sentiment,
      enhanced: true
    };
  }
}

const aiCache = new AICache();

setInterval(() => {
  aiCache.saveCacheToDisk();
}, 5 * 60 * 1000);

process.on('exit', () => {
  aiCache.saveCacheToDisk();
});

module.exports = aiCache; 