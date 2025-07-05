const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Instagram Public API endpoints that don't require login
const INSTAGRAM_PUBLIC_API = {
  userInfo: 'https://www.instagram.com/api/v1/users/web_profile_info/?username=',
  search: 'https://www.instagram.com/web/search/topsearch/?query='
};

// Helper to make requests with proper headers
async function makeInstagramRequest(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error(`Public API error: ${error.message}`);
    return null;
  }
}

// Get user info without login
async function getUserInfoPublic(username) {
  try {
    // Try the public API endpoint
    const data = await makeInstagramRequest(INSTAGRAM_PUBLIC_API.userInfo + username);
    
    if (data && data.data && data.data.user) {
      const user = data.data.user;
      return {
        username: user.username,
        fullName: user.full_name,
        bio: user.biography,
        followers: user.edge_followed_by?.count || 0,
        following: user.edge_follow?.count || 0,
        posts: user.edge_owner_to_timeline_media?.count || 0,
        isPrivate: user.is_private,
        isVerified: user.is_verified,
        profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url,
        externalUrl: user.external_url,
        category: user.category_name,
        businessEmail: user.business_email,
        businessPhone: user.business_phone_number,
        businessAddress: user.business_address_json,
        isBusinessAccount: user.is_business_account
      };
    }
  } catch (error) {
    console.error(`Failed to get public info for ${username}: ${error.message}`);
  }
  
  return null;
}

// Search Instagram without login
async function searchInstagramPublic(query) {
  try {
    const data = await makeInstagramRequest(INSTAGRAM_PUBLIC_API.search + encodeURIComponent(query));
    
    if (data && data.users) {
      return data.users.map(user => ({
        username: user.user.username,
        fullName: user.user.full_name,
        isPrivate: user.user.is_private,
        isVerified: user.user.is_verified,
        profilePicUrl: user.user.profile_pic_url
      }));
    }
  } catch (error) {
    console.error(`Search failed for "${query}": ${error.message}`);
  }
  
  return [];
}

// Hybrid approach - try public API first, then fallback to scraping
async function getInstagramDataHybrid(username, scraperFallback) {
  // First try public API
  const publicData = await getUserInfoPublic(username);
  
  if (publicData && !publicData.isPrivate) {
    console.log(`✅ Got data from public API for ${username}`);
    return {
      username: publicData.username,
      url: `https://instagram.com/${username}`,
      bio: publicData.bio,
      email: publicData.businessEmail,
      phone: publicData.businessPhone,
      followers: publicData.followers,
      isVerified: publicData.isVerified,
      category: publicData.category,
      externalUrl: publicData.externalUrl,
      source: 'public_api'
    };
  }
  
  // If public API fails or account is private, try scraper
  if (scraperFallback) {
    console.log(`🔄 Falling back to scraper for ${username}`);
    return await scraperFallback(username);
  }
  
  return null;
}

module.exports = {
  getUserInfoPublic,
  searchInstagramPublic,
  getInstagramDataHybrid
}; 