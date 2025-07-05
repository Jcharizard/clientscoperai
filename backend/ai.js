import fs from 'fs';
import path from 'path';

export function encodeImageToBase64(filename) {
  const imagePath = path.join(process.cwd(), 'screenshots', filename);
  if (!fs.existsSync(imagePath)) return null;
  const imageData = fs.readFileSync(imagePath);
  return imageData.toString('base64');
}


import fetch from 'node-fetch';

const LM_STUDIO_URL = 'http://localhost:8009/v1/completions';

export async function analyzeWithAI(bio) {
  console.log('📨 Sending to LM Studio:', bio); // <- logs every bio being sent

  const prompt = `Given the following Instagram bio, analyze the tone, urgency, and recommend what to pitch this person:\n\n"${bio}"\n\nRespond in JSON like this:\n{\n  "pitchability": 0-100,\n  "urgency": true/false,\n  "tone": "casual | professional | hype | chill",\n  "suggestion": "What to pitch this profile"\n}`;

  try {
    const res = await fetch(LM_STUDIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        temperature: 0.7,
        max_tokens: 300,
        stop: null,
        n: 1
      })
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.text;

    const json = JSON.parse(raw.trim());
    return {
      pitchability: json.pitchability || 0,
      urgency: json.urgency || false,
      tone: json.tone || 'unknown',
      suggestion: json.suggestion || 'N/A'
    };
  } catch (err) {
    console.error('❌ AI failed:', err.message);
    return {
      pitchability: 0,
      urgency: false,
      tone: 'unknown',
      suggestion: 'N/A'
    };
  }
}

export async function calculateLeadScore(profileData) {
  try {
    let totalScore = 50; // Base score
    const factors = [];

    // Existing scoring logic
    if (profileData.isBusinessAccount) {
      totalScore += 15;
      factors.push("✅ Business Account (+15)");
    }

    if (profileData.isVerified) {
      totalScore += 10;
      factors.push("✅ Verified Account (+10)");
    }

    if (profileData.followersCount) {
      const followers = parseInt(profileData.followersCount.toString().replace(/[^0-9]/g, ''));
      if (followers > 10000) {
        totalScore += 15;
        factors.push(`✅ Large Following: ${followers.toLocaleString()} (+15)`);
      } else if (followers > 1000) {
        totalScore += 8;
        factors.push(`✅ Good Following: ${followers.toLocaleString()} (+8)`);
      }
    }

    // 🔥 NEW: Advanced engagement scoring
    if (profileData.engagementRate) {
      const engagementNum = parseFloat(profileData.engagementRate.replace('%', ''));
      if (engagementNum > 3) {
        totalScore += 20;
        factors.push(`🔥 High Engagement: ${profileData.engagementRate} (+20)`);
      } else if (engagementNum > 1.5) {
        totalScore += 10;
        factors.push(`📈 Good Engagement: ${profileData.engagementRate} (+10)`);
      } else if (engagementNum > 0.5) {
        totalScore += 5;
        factors.push(`📊 Fair Engagement: ${profileData.engagementRate} (+5)`);
      }
    }

    // 🔥 NEW: Business contact bonus
    if (profileData.businessContacts && profileData.businessContacts.length > 0) {
      const contactBonus = Math.min(15, profileData.businessContacts.length * 5);
      totalScore += contactBonus;
      const contactTypes = profileData.businessContacts.map(c => c.type).join(', ');
      factors.push(`📞 Business Contacts (${contactTypes}) (+${contactBonus})`);
    }

    // 🔥 NEW: Content activity scoring
    if (profileData.avgLikesPerPost && profileData.avgCommentsPerPost) {
      const avgEngagement = profileData.avgLikesPerPost + profileData.avgCommentsPerPost;
      if (avgEngagement > 500) {
        totalScore += 15;
        factors.push(`🎯 High Post Engagement (+15)`);
      } else if (avgEngagement > 100) {
        totalScore += 8;
        factors.push(`📈 Good Post Performance (+8)`);
      }
    }

    // 🔥 NEW: Category-specific scoring
    if (profileData.suggestedCategory) {
      const categoryScores = {
        'Business': 15,
        'Restaurant/Food': 12,
        'Fitness': 10,
        'Fashion': 10,
        'Beauty': 8,
        'Influencer': 5
      };
      const categoryScore = categoryScores[profileData.suggestedCategory] || 0;
      if (categoryScore > 0) {
        totalScore += categoryScore;
        factors.push(`🏷️ ${profileData.suggestedCategory} Category (+${categoryScore})`);
      }
    }

    // 🔥 NEW: Hashtag strategy bonus
    if (profileData.bioHashtags && profileData.bioHashtags.length > 0) {
      const hashtagBonus = Math.min(5, profileData.bioHashtags.length);
      totalScore += hashtagBonus;
      factors.push(`#️⃣ Strategic Hashtags (+${hashtagBonus})`);
    }

    // 🔥 NEW: Business opportunity scoring from link analysis
    if (profileData.businessOpportunityScore && profileData.businessOpportunityScore > 0) {
      const linkBonus = Math.min(20, Math.round(profileData.businessOpportunityScore * 0.2));
      totalScore += linkBonus;
      factors.push(`🔗 Business Links (+${linkBonus})`);
      
      // Add specific business indicators
      if (profileData.businessIndicators && profileData.businessIndicators.length > 0) {
        profileData.businessIndicators.forEach(indicator => {
          factors.push(`   └ ${indicator}`);
        });
      }
    }

    // 🔥 NEW: Geographic location bonus
    if (profileData.geographicInsights && profileData.geographicInsights.isLocalBusiness) {
      const locationBonus = Math.min(10, profileData.geographicInsights.locationStrength);
      totalScore += locationBonus;
      factors.push(`📍 Local Business: ${profileData.geographicInsights.primaryLocation} (+${locationBonus})`);
    }

    // Ensure score doesn't exceed 100
    totalScore = Math.min(100, totalScore);

    // 🤖 PREDICTIVE AI ENHANCEMENT
    const predictiveInsights = await generatePredictiveInsights(profileData, totalScore);

    return {
      score: totalScore,
      grade: totalScore >= 80 ? 'A' : totalScore >= 65 ? 'B' : totalScore >= 50 ? 'C' : 'D',
      factors: factors,
      recommendation: totalScore >= 80 ? 'High Priority Lead' : 
                     totalScore >= 65 ? 'Good Prospect' : 
                     totalScore >= 50 ? 'Worth Following Up' : 'Low Priority',
      predictiveInsights: predictiveInsights
    };
  } catch (err) {
    console.error('❌ Error calculating lead score:', err.message);
    return {
      score: 0,
      grade: 'N/A',
      factors: [],
      recommendation: 'N/A',
      predictiveInsights: null
    };
  }
}

// 🤖 PREDICTIVE AI SYSTEM
export async function generatePredictiveInsights(profileData, baseScore) {
  try {
    // Extract features for prediction
    const features = extractPredictiveFeatures(profileData);
    
    // Calculate predictions using simple ML-like approach
    const predictions = calculatePredictions(features, baseScore);
    
    return {
      conversionProbability: predictions.conversionProbability,
      responseRate: predictions.responseRate,
      estimatedValue: predictions.estimatedValue,
      personalizedSuggestion: predictions.personalizedSuggestion,
      riskFactors: predictions.riskFactors
    };
  } catch (err) {
    console.error('🤖 Predictive AI error:', err.message);
    return null;
  }
}

function extractPredictiveFeatures(profileData) {
  const followers = parseInt(profileData.followers?.toString().replace(/[^0-9]/g, '') || '0');
  const following = parseInt(profileData.following?.toString().replace(/[^0-9]/g, '') || '1');
  
  return {
    followerRatio: following > 0 ? followers / following : 0,
    engagementRate: parseFloat(profileData.engagementRate?.replace('%', '')) || 0,
    hasBusinessContacts: (profileData.businessContacts?.length || 0) > 0,
    businessOpportunityScore: profileData.businessOpportunityScore || 0,
    isLocalBusiness: profileData.geographicInsights?.isLocalBusiness || false,
    isVerified: profileData.isVerified || false,
    categoryRelevance: getCategoryScore(profileData.suggestedCategory)
  };
}

function getCategoryScore(category) {
  const scores = {
    'Business': 0.9, 'Restaurant/Food': 0.8, 'Fitness': 0.7, 
    'Fashion': 0.7, 'Beauty': 0.6, 'Influencer': 0.4
  };
  return scores[category] || 0.3;
}

function calculatePredictions(features, baseScore) {
  // Base conversion probability (8.5% average)
  let conversionProbability = 0.085;
  
  // Adjust based on features
  if (features.hasBusinessContacts) conversionProbability *= 1.8;
  if (features.isVerified) conversionProbability *= 1.4;
  if (features.engagementRate > 2) conversionProbability *= 1.6;
  if (features.businessOpportunityScore > 50) conversionProbability *= 1.5;
  
  // Ensure probability is realistic
  conversionProbability = Math.min(0.95, Math.max(0.01, conversionProbability));
  
  const responseRate = Math.min(0.8, conversionProbability * 3);
  const estimatedValue = features.categoryRelevance * features.businessOpportunityScore * 20;
  
  return {
    conversionProbability: Math.round(conversionProbability * 100),
    responseRate: Math.round(responseRate * 100),
    estimatedValue: Math.round(estimatedValue),
    personalizedSuggestion: generateSuggestion(features, conversionProbability),
    riskFactors: identifyRisks(features)
  };
}

function generateSuggestion(features, probability) {
  if (features.hasBusinessContacts) return "Direct contact available - reach out via email/phone";
  if (features.isLocalBusiness) return "Local business - mention local market expertise";
  if (features.engagementRate > 3) return "High engagement - audience is active and responsive";
  if (probability > 0.6) return "High conversion probability - prioritize immediate outreach";
  return "Standard outreach approach recommended";
}

function identifyRisks(features) {
  const risks = [];
  if (features.followerRatio < 0.1) risks.push("Low follower ratio may indicate bot activity");
  if (!features.hasBusinessContacts && features.businessOpportunityScore < 20) risks.push("Limited business indicators");
  return risks;
}
