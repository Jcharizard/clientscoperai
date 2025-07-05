const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * 🎨 IMAGE COMPOSER FOR ENHANCED LEAD VISUALIZATION
 * Creates composite images combining Instagram screenshots with profile pictures
 * Using Sharp for Windows compatibility
 */
class ImageComposer {
  constructor(screenshotsDir) {
    this.screenshotsDir = screenshotsDir || path.join(__dirname, 'screenshots');
  }

  /**
   * Create a side-by-side composite of screenshot + profile picture
   * @param {string} screenshotPath - Path to the main screenshot
   * @param {string} profilePicPath - Path to the profile picture
   * @param {string} username - Username for the output filename
   * @returns {string|null} - Path to the composite image or null if failed
   */
  async createComposite(screenshotPath, profilePicPath, username) {
    try {
      console.log(`[${new Date().toISOString()}] 🎨 Creating composite for ${username}`);
      
      // Check if files exist
      if (!fs.existsSync(screenshotPath)) {
        console.log(`[${new Date().toISOString()}] ❌ Screenshot not found: ${screenshotPath}`);
        return null;
      }
      
      if (!fs.existsSync(profilePicPath)) {
        console.log(`[${new Date().toISOString()}] ❌ Profile picture not found: ${profilePicPath}`);
        return null;
      }

      // Load and process the main screenshot
      const screenshot = sharp(screenshotPath);
      const screenshotMeta = await screenshot.metadata();
      
      // Load and process the profile picture
      const profilePic = sharp(profilePicPath);
      const profileMeta = await profilePic.metadata();
      
      console.log(`[${new Date().toISOString()}] 📊 Screenshot: ${screenshotMeta.width}x${screenshotMeta.height}`);
      console.log(`[${new Date().toISOString()}] 📊 Profile Pic: ${profileMeta.width}x${profileMeta.height}`);
      
      // Calculate dimensions for the composite
      const screenshotHeight = screenshotMeta.height;
      const profilePicWidth = Math.round(screenshotHeight * 0.25); // Profile pic is 25% of screenshot height
      const profilePicHeight = profilePicWidth; // Square profile pic
      
      const compositeWidth = screenshotMeta.width + profilePicWidth + 20; // 20px gap
      const compositeHeight = screenshotHeight;
      
      console.log(`[${new Date().toISOString()}] 📐 Composite dimensions: ${compositeWidth}x${compositeHeight}`);
      
      // Resize profile picture to fit nicely
      const resizedProfilePic = await profilePic
        .resize(profilePicWidth, profilePicHeight, { 
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toBuffer();
      
      // Create the composite image
      const compositeBuffer = await sharp({
        create: {
          width: compositeWidth,
          height: compositeHeight,
          channels: 3,
          background: { r: 0, g: 0, b: 0 } // Black background
        }
      })
      .composite([
        {
          input: screenshotPath,
          left: 0,
          top: 0
        },
        {
          input: resizedProfilePic,
          left: screenshotMeta.width + 10, // 10px gap from screenshot
          top: Math.round((compositeHeight - profilePicHeight) / 2) // Center vertically
        }
      ])
      .png()
      .toBuffer();
      
      // Save the composite image
      const outputPath = path.join(this.screenshotsDir, `${username}_composite.png`);
      await sharp(compositeBuffer).png().toFile(outputPath);
      
      console.log(`[${new Date().toISOString()}] ✅ Composite created: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.log(`[${new Date().toISOString()}] ❌ Composite creation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Create a simple overlay of profile picture on screenshot
   * @param {string} screenshotPath - Path to the main screenshot
   * @param {string} profilePicPath - Path to the profile picture
   * @param {string} username - Username for the output filename
   * @returns {string|null} - Path to the overlay image or null if failed
   */
  async createOverlay(screenshotPath, profilePicPath, username) {
    try {
      console.log(`[${new Date().toISOString()}] 🎨 Creating overlay for ${username}`);
      
      // Check if files exist
      if (!fs.existsSync(screenshotPath)) {
        console.log(`[${new Date().toISOString()}] ❌ Screenshot not found: ${screenshotPath}`);
        return null;
      }
      
      if (!fs.existsSync(profilePicPath)) {
        console.log(`[${new Date().toISOString()}] ❌ Profile picture not found: ${profilePicPath}`);
        return null;
      }

      // Load the main screenshot
      const screenshot = sharp(screenshotPath);
      const screenshotMeta = await screenshot.metadata();
      
      // Calculate profile picture size (10% of screenshot width)
      const profilePicSize = Math.round(screenshotMeta.width * 0.1);
      
      // Resize profile picture
      const resizedProfilePic = await sharp(profilePicPath)
        .resize(profilePicSize, profilePicSize, { 
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toBuffer();
      
      // Create overlay (top-right corner)
      const overlayBuffer = await screenshot
        .composite([
          {
            input: resizedProfilePic,
            left: screenshotMeta.width - profilePicSize - 10, // 10px from right edge
            top: 10 // 10px from top edge
          }
        ])
        .png()
        .toBuffer();
      
      // Save the overlay image
      const outputPath = path.join(this.screenshotsDir, `${username}_overlay.png`);
      await sharp(overlayBuffer).png().toFile(outputPath);
      
      console.log(`[${new Date().toISOString()}] ✅ Overlay created: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.log(`[${new Date().toISOString()}] ❌ Overlay creation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Create an enhanced profile card when no screenshot is available
   * @param {Object} profileData - Profile information
   * @param {string} username - Username
   * @returns {string|null} - Path to the generated card
   */
  async createProfileCard(profileData, username) {
    try {
      console.log(`🎨 Creating profile card for ${username}...`);

      const cardWidth = 600;
      const cardHeight = 400;
      const canvas = createCanvas(cardWidth, cardHeight);
      const ctx = canvas.getContext('2d');

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // Profile circle
      const centerX = cardWidth / 2;
      const profileY = 80;
      const radius = 60;

      // Profile picture placeholder
      const profileGradient = ctx.createRadialGradient(centerX, profileY, 0, centerX, profileY, radius);
      profileGradient.addColorStop(0, '#E4405F');
      profileGradient.addColorStop(1, '#FF6B6B');
      
      ctx.fillStyle = profileGradient;
      ctx.beginPath();
      ctx.arc(centerX, profileY, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Username initial
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(username.charAt(0).toUpperCase(), centerX, profileY);

      // Username
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(`@${username}`, centerX, profileY + 100);

      // Stats
      const statsY = profileY + 150;
      ctx.font = '16px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      
      const stats = [
        `${profileData.followers || '•••'} followers`,
        `${profileData.following || '•••'} following`,
        `${profileData.posts || '•••'} posts`
      ];
      
      const statSpacing = 150;
      const startX = centerX - statSpacing;
      
      stats.forEach((stat, i) => {
        ctx.fillText(stat, startX + (i * statSpacing), statsY);
      });

      // Bio snippet
      if (profileData.bio) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        const bioText = profileData.bio.substring(0, 80) + '...';
        ctx.fillText(bioText, centerX, statsY + 40);
      }

      // Save card
      const cardFilename = `${username}_profile_card.png`;
      const cardPath = path.join(this.screenshotsDir, cardFilename);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(cardPath, buffer);

      console.log(`🎨 ✅ Profile card created: ${cardFilename}`);
      return cardPath;

    } catch (error) {
      console.log(`❌ Profile card creation failed for ${username}: ${error.message}`);
      return null;
    }
  }
}

module.exports = ImageComposer; 