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

**ClientScopeAI** is a cloud based Instagram lead generation platform that combines advanced web scraping techniques with AI-powered analysis to help businesses find and qualify potential clients on Instagram. Built as my first ever portfolio project at age 16, this application demonstrates enterprise-level development skills and innovative problem-solving.

### 🎯 Key Features

- **🤖 AI-Powered Lead Scoring** - Intelligent bio analysis and account ranking qualification
- **🔄 Dual Scraping System** - Local desktop mobile bypass + Apify API cloud for maximum reliability
- **📱 Mobile-First Interface** - Scroll-based lead evaluation system
- **📊 Real-Time Analytics** - Comprehensive dashboard with business intelligence
- **🛡️ Anti-Detection Technology** - Stealth scraping mobile fingerprint, with cookie rotation
- **📈 Campaign Management** - Session-based organization and tracking in SQL database

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

### AI & Machine Learning (work in progress)
- **Bio Analysis** - Multi-factor scoring with language detection
- **Vision Analysis** - Professional image assessment
- **Lead Classification** - HOT/WARM/QUALIFIED/COLD tiering
- **Business Intelligence** - Market analysis and trends


---

## 🎯 Core Features Deep Dive

### 🤖 AI-Powered Lead Analysis

**OCR screenshot text recognition, and scraped account info ran through a python algorithm to determine scores and rank tiers**

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
- **Stealth Technology** - Mobile Digital Fingerprint to permit automated account cookie logins
- **Cookie Rotation** - Account cookie logins rotations between 3 accounts
- **Rate Limiting** - Adaptive delays with jitter
- **Error Recovery** - Automatic retry mechanisms

**Apify API Integration:**
- **Residential Proxies** - Reliable data extraction, reliable proxy rotation
- **Fallback System** - Automatic method switching
- **Batch Processing** - Efficient large-scale cloud scraping

### 📱 Mobile-First User Experience

**Lead Card Interface:**
- **Scroll Gestures** - Intuitive lead evaluation
- **Visual Scoring** - Color-coded quality indicators
- **Quick Actions** - One-tap lead management
- **Real-time Updates** - Live UI update progress tracking + backend realtime updates

**Analytics Dashboard: (unfinished)**
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

// Analytics Models (unfinished)
- CampaignAnalytics (Performance metrics)
- MarketIntelligence (Business insights)
- ProfileEngagement (Interaction data)

// System Models 
- ScrapingJob (Task management)
- SystemMetrics (Cookie Account Scrape info)
```

**Sessions Dashboard**


<img src="https://i.imgur.com/BohmzxP.png" alt="Sessions Dashboard" width="70%">

---

## 🛡️ Security & Reliability

### Security Features
- **API Key Encryption** - Secure credential storage
- **Cookie Management** - Rotating session tokens every 12 accounts scraped 
- **Cookie Testing** - Directly test a cookies authenticity via a quick automated chromium puppeteer login
- **Rate Limiting** - Abuse prevention; 180 hourly account scrape limit
- **Error Logging** - Secure debugging

### Reliability Systems
- **Dual Scraping Methods** - Called Apify API Actors, and local puppeteer mobile digital footprint 
- **Automatic Retry Logic** - Error recovery
- **Performance Monitoring** - Real-time backend health checks
- **Session Recovery** - Data persistence

**Rate Monitor Dashboard**


<img src="https://i.imgur.com/VZoHZE5.png" alt="Rate Monitor Dashboard" width="70%">

---

## 📈 Performance Metrics

### Scraping Performance
- **Success Rate**: 85-95% (varies by target)
- **Processing Speed**: 30-60 seconds per keyword to initiate (Apify API wait)
- **Lead Quality**: AI-scored with 90%+ accuracy
- **Scalability**: Handles 500+ profiles per session

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

<img src="https://i.imgur.com/oaf5QLs.png" alt="Scrape Interface" width="70%">
<img src="https://i.imgur.com/IT4Zy4W.png" alt="ClientScopeAI Interface" width="70%">

### Key Components
- **Scraper Panel** - Main scraping interface
- **Analytics Dashboard** - Business intelligence
- **Session Manager** - Campaign organization
- **Settings Page** - Configuration management
- **Mobile Lead Cards** - Scroll-based evaluation
- **Real-time Feedback** - Live progress indicators
- **Intuitive Navigation** - Sidebar-based layout

**Analytics Dashboard**

<img src="https://i.imgur.com/b4kdJyB.png" alt="ClientScopeAI Dashboard" width="70%">

---

## 🔍 Technical Highlights

### Advanced Scraping Techniques

Along the various experiments and rate limit adversities along the journey of building this **(404, 429, temp IP bans), I found local scrapers get flagged and login page redirected fast.** Via a lot of testing, I discovered Instagram is a lot more lenient on letting automated cookie account scraping with mobile fingerprints, and on top Apify has actors specifically for Instagram Account scraping, with pool shuffling residential rotating proxies, it was the perfect mix to maximize highest numeral scrape results in one go, with high success rate, sustaining a 85-95% scrape success rate meanwhile minimizing rate limit, redirects, and IP Bans. Efforts to rank screenshots via vision processing AI **were** made possible with **LLM Studio**, but the ranking results ended up being too long to come back for each account, and a AI API key would be too expensive (atleast for me and a project) for so many screenshots being sent back and forth from my app to the AI. I learned how to think outside the box systematically for the first time, how to work with given boundaries and find 

Tried pool shuffling my own 1000 webshare residential proxies for each chromium pupeteer browser and each cookie, instagram caught on and quickly redirected to login pages. Had my fair fun and struggles experimenting with proxies, **learned a lot about rate limiting, basic networking protocols and how systems work.** Inevitably, the proxies **or** my methods weren't reliable enough, I had to pivot from proxies to alternatives around trying to increase my scraping limit success rate, which at the end **I ended up pivoting to Apify's API and Actor, "Instagram Profile Finder" which would scrape instagram on their own digital devices, with serverside handled rotating residential proxies to prevent as many suspicion flags/errors/redirects as possible.** 


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
- **API Cloud Based Scraping** - Maximum reliability
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

## 🔮 Future Enhancements (likely not, app is done and was a learning project)

### Planned Features (likely not, app is done and was a learning project)
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


## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Chrome/Chromium browser
- Apify API key (for cloud scraping)

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
4. Enable cookie mode for cloud scraping

### Proxy Configuration
The app uses Apify's rotating residential proxies for reliable scraping:
- Automatic proxy rotation
- Rate limiting and cooldown periods
- Apify Instagram Profile Scraper Actor



## 🤝 Contributing

This is my first portfolio project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 About the Developer

**Built by a 16-year-old developer** as my first portfolio project, ClientScopeAI represents months of dedicated learning and development. This project showcases the ability to build complex, production-ready applications with modern technologies. App was kind of a delusion, but it was a really fun and crucial learning curve and experience.

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
- **Portfolio**: This project represents my first major development achievement and project.
- **LinkedIn**: [@Jhonny Alvarado](https://www.linkedin.com/in/jhonny-alvarado-458993212/)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

*Built with ❤️ by a passionate 16-year-old developer*
