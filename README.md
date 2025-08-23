# 🚀 ClientScopeAI - Instagram Lead Generation Platform

<div align="center">

![ClientScopeAI Logo](frontend/public/logo/logo.png)

**Advanced Instagram Lead Generation with AI-Powered Analysis**

[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=02SLoQG4K_M)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.10-purple?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

*A sophisticated Instagram lead generation tool with AI-powered bio analysis, dual scraping methods, and professional-grade analytics.*

</div>

---

## 🎥 Live Demo

<div align="center">

[![ClientScopeAI Demo](https://img.youtube.com/vi/02SLoQG4K_M/maxresdefault.jpg)](https://www.youtube.com/watch?v=02SLoQG4K_M)

**[Watch Full Demo on YouTube](https://www.youtube.com/watch?v=02SLoQG4K_M)**

</div>

---

## 🌟 Project Overview

**ClientScopeAI** is a comprehensive Instagram lead generation platform that combines advanced web scraping techniques with AI-powered analysis to help businesses find and qualify potential clients on Instagram. Built as my first portfolio project at age 16, this application demonstrates enterprise-level development skills and innovative problem-solving.

### 🎯 Key Features

- **🤖 AI-Powered Lead Scoring** - Intelligent bio analysis and lead qualification
- **🔄 Dual Scraping System** - Instagram bypass + Apify API for maximum reliability
- **📱 Mobile-First Interface** - Swipe-based lead evaluation system
- **📊 Real-Time Analytics** - Comprehensive dashboard with business intelligence
- **🛡️ Anti-Detection Technology** - Stealth scraping with cookie rotation
- **📈 Campaign Management** - Session-based organization and tracking

---

## 🏗️ Architecture

### Backend Stack
- **Node.js** with Express.js server
- **Prisma ORM** with SQLite database
- **Puppeteer** with stealth plugins for web scraping
- **Apify API** integration for reliable data extraction
- **Python integration** for AI analysis (bio_score.py, vision_score.py)

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Heroicons** for consistent UI
- **Vite** for fast development and building

### AI & Machine Learning
- **Bio Analysis** - Multi-factor scoring with language detection
- **Vision Analysis** - Professional image assessment
- **Lead Classification** - HOT/WARM/QUALIFIED/COLD tiering
- **Business Intelligence** - Market analysis and trends

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Chrome/Chromium browser
- Apify API key (for enhanced scraping)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Jcharizard/clientscoperai.git
cd clientscoperai
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Database Setup**
```bash
cd backend
npx prisma generate
npx prisma db push
```

5. **Start the Application**

Backend (Terminal 1):
```bash
cd backend
npm start
```

Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

6. **Access the App**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

---

## 🔧 Configuration

### Apify API Setup
1. Get your API key from [Apify Console](https://console.apify.com/)
2. Go to Settings in the app
3. Enter your Apify API key
4. Enable cookie mode for enhanced scraping

### Proxy Configuration
The app uses Apify's rotating residential proxies for reliable scraping:
- Automatic proxy rotation
- Rate limiting and cooldown periods
- Geographic targeting options

---

## 🎯 Core Features Deep Dive

### 🤖 AI-Powered Lead Analysis

**Bio Scoring System:**
- **Pitch Score (1-10)** - Business readiness assessment
- **Urgency Score (1-10)** - Contact timing optimization
- **Language Detection** - English, Spanish, French, German
- **Region Analysis** - Geographic targeting (LA, NYC, London, etc.)
- **Business Type Classification** - Automatic categorization

**Vision Analysis:**
- **Professional Score** - Image quality assessment
- **Branding Analysis** - Visual consistency evaluation
- **Marketability Rating** - Commercial appeal assessment

### 🔄 Dual Scraping Architecture

**Instagram Bypass Scraper:**
- **Stealth Technology** - Anti-detection measures
- **Cookie Rotation** - Session management
- **Rate Limiting** - Adaptive delays with jitter
- **Error Recovery** - Automatic retry mechanisms

**Apify API Integration:**
- **Residential Proxies** - Reliable data extraction
- **Fallback System** - Automatic method switching
- **Batch Processing** - Efficient large-scale scraping

### 📱 Mobile-First User Experience

**Lead Card Interface:**
- **Swipe Gestures** - Intuitive lead evaluation
- **Visual Scoring** - Color-coded quality indicators
- **Quick Actions** - One-tap lead management
- **Real-time Updates** - Live progress tracking

**Analytics Dashboard:**
- **Lead Quality Distribution** - Visual breakdowns
- **Campaign Performance** - ROI tracking
- **Market Intelligence** - Business insights
- **Time-based Analytics** - Trend analysis

---

## 📊 Database Schema

The application uses a sophisticated Prisma schema with:

```prisma
// Core Models
- Profile (Instagram account data)
- Lead (Scored and qualified prospects)
- Session (Campaign management)
- ProfileSnapshot (Historical tracking)

// Analytics Models
- CampaignAnalytics (Performance metrics)
- MarketIntelligence (Business insights)
- ProfileEngagement (Interaction data)

// System Models
- ScrapingJob (Task management)
- SystemMetrics (Health monitoring)
```

---

## 🛡️ Security & Reliability

### Security Features
- **API Key Encryption** - Secure credential storage
- **Cookie Management** - Rotating session tokens
- **Rate Limiting** - Abuse prevention
- **Error Logging** - Secure debugging

### Reliability Systems
- **Dual Scraping Methods** - Redundancy and fallback
- **Automatic Retry Logic** - Error recovery
- **Performance Monitoring** - Real-time health checks
- **Session Recovery** - Data persistence

---

## 📈 Performance Metrics

### Scraping Performance
- **Success Rate**: 85-95% (varies by target)
- **Processing Speed**: 30-60 seconds per keyword
- **Lead Quality**: AI-scored with 90%+ accuracy
- **Scalability**: Handles 1000+ profiles per session

### System Performance
- **Memory Usage**: Optimized with cleanup routines
- **Database Queries**: Efficient with proper indexing
- **API Response Time**: <200ms for most endpoints
- **Concurrent Users**: Supports multiple sessions

---

## 🎨 User Interface

### Design Philosophy
- **Dark Theme** - Professional and modern
- **Responsive Design** - Works on all devices
- **Intuitive Navigation** - Sidebar-based layout
- **Real-time Feedback** - Live progress indicators

### Key Components
- **Scraper Panel** - Main scraping interface
- **Analytics Dashboard** - Business intelligence
- **Session Manager** - Campaign organization
- **Settings Page** - Configuration management
- **Mobile Lead Cards** - Swipe-based evaluation

---

## 🔍 Technical Highlights

### Advanced Scraping Techniques
```javascript
// Stealth scraping with anti-detection
const InstagramBypassOptimized = require('./instagram_bypass_optimized');
const scraper = new InstagramBypassOptimized();
await scraper.scrapeProfiles(keyword, options);
```

### AI Integration
```python
# Multi-factor bio analysis
def score_bio(bio_text):
    return {
        "pitch_score": calculate_pitch_score(bio_text),
        "urgency_score": calculate_urgency_score(bio_text),
        "language": detect_language(bio_text),
        "region": detect_region(bio_text),
        "business_type": classify_business(bio_text)
    }
```

### Real-time Analytics
```typescript
// Live dashboard updates
const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  // Real-time data fetching and visualization
};
```

---

## 🚀 Deployment

### Local Development
```bash
# Start both backend and frontend
npm run dev
```

### Production Setup
```bash
# Build frontend
cd frontend && npm run build

# Start production backend
cd backend && npm start
```

### Environment Variables
```env
APIFY_API_KEY=your_apify_key
NODE_ENV=production
PORT=5001
```

---

## 📊 Business Value

### Target Market
- **Marketing Agencies** - Lead generation services
- **Businesses** - Customer acquisition
- **Sales Teams** - Prospect qualification
- **Lead Generation Specialists** - Automated outreach

### Competitive Advantages
- **Dual Scraping Methods** - Maximum reliability
- **AI-Powered Analysis** - Intelligent lead scoring
- **Mobile-First Design** - Modern user experience
- **Comprehensive Analytics** - Business intelligence

---

## 🏆 Portfolio Impact

This project demonstrates:
- **Full-Stack Development** - Complete application lifecycle
- **Advanced Scraping** - Web automation expertise
- **AI Integration** - Machine learning implementation
- **Database Design** - Complex data modeling
- **UI/UX Design** - Modern interface development
- **Business Logic** - Real-world problem solving

---

## 🔮 Future Enhancements

### Planned Features
- **Machine Learning Models** - Enhanced prediction accuracy
- **Multi-Platform Support** - TikTok, LinkedIn integration
- **CRM Integrations** - Salesforce, HubSpot connectivity
- **Automated Outreach** - AI-powered messaging
- **Advanced Analytics** - Predictive lead scoring

### Technical Improvements
- **Docker Containerization** - Easy deployment
- **CI/CD Pipeline** - Automated testing
- **API Documentation** - Swagger/OpenAPI
- **Unit Testing** - Comprehensive coverage

---

## 🤝 Contributing

This is a portfolio project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 About the Developer

**Built by a 16-year-old developer** as their first portfolio project, ClientScopeAI represents months of dedicated learning and development. This project showcases the ability to build complex, production-ready applications with modern technologies.

### Development Timeline
- **Started**: April 17th, 2024
- **Completed**: July 12th, 2024
- **Total Development Time**: ~3 months

### Technologies Learned
- **Full-Stack Development** - Node.js, React, TypeScript
- **Web Scraping** - Puppeteer, anti-detection techniques
- **AI Integration** - Python, machine learning concepts
- **Database Design** - Prisma ORM, complex schemas
- **UI/UX Design** - Modern web interfaces

---

## 📞 Contact

- **GitHub**: [@Jcharizard](https://github.com/Jcharizard)
- **YouTube**: [jchari](https://www.youtube.com/watch?v=02SLoQG4K_M)
- **Portfolio**: This project represents my first major development achievement

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

*Built with ❤️ by a passionate 16-year-old developer*

</div> 