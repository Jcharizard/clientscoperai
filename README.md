# ClientScopeAI - Lead Generation Tool

A powerful Instagram lead scraping tool with AI-powered bio analysis and proxy management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Chrome/Chromium browser

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
```

2. **Frontend Setup**
```bash
cd frontend
npm install
```

3. **Start the Application**

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

4. **Access the App**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔧 Configuration

### Proxy Setup
Your Webshare residential proxy is pre-configured:
- Endpoint: `gateway.webshare.io:80`
- Username: `cwqmeinh-rotate`
- Password: `vd77k4jhsq9q`

### Python Dependencies
The app uses local Python scripts for AI scoring. No additional setup required.

## 📁 Project Structure

```
├── backend/
│   ├── index.cjs          # Main server
│   ├── scraper.js         # Core scraping logic
│   ├── start.js           # Startup script
│   ├── bio_score.py       # AI bio analysis
│   ├── vision_score.py    # Image analysis
│   ├── manual_proxies.json # Proxy configuration
│   └── logs/              # Error logs
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.jsx        # Main app
│   └── package.json
└── README.md
```

## 🛠 Features

- **Instagram Lead Scraping**: Extract profiles from Bing search results
- **AI Bio Analysis**: Score leads based on bio content
- **Proxy Management**: Residential proxy support with rotation
- **Session Management**: Save and organize scraping sessions
- **Campaign Tracking**: Group leads by campaigns
- **Export Functionality**: Export leads to various formats
- **Real-time Logging**: Monitor scraping progress and errors

## 🔍 Usage

1. **Start Scraping**
   - Go to Scraper tab
   - Enter keyword (e.g., "LA barber")
   - Set pages to scrape (1-10)
   - Click "Start Scrape"

2. **Manage Proxies**
   - Go to Proxies tab
   - Test proxy connectivity
   - Add additional proxies if needed

3. **View Results**
   - Go to Lead Explorer
   - Filter and sort leads
   - Export to CSV/JSON

## 🐛 Troubleshooting

### Common Issues

**"No healthy proxies available"**
- Check proxy credentials in `manual_proxies.json`
- Test proxy in Proxy Manager
- Ensure internet connection

**"Scraping failed"**
- Check error logs: `backend/logs/scrape_errors.log`
- Verify proxy is working
- Try reducing concurrent requests

**Frontend not loading**
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify frontend is on port 5173

### Debug Commands

```bash
# Check proxy status
curl http://localhost:5000/proxies/inuse

# View error logs
cat backend/logs/scrape_errors.log

# Test backend
curl http://localhost:5000/

# Clear logs
rm backend/logs/scrape_errors.log
```

## 📊 Performance Tips

- Use 1-3 pages for testing
- Increase delay between requests if getting blocked
- Monitor proxy health regularly
- Clear screenshots folder periodically

## 🔒 Security

- All data stays local
- No external API calls except proxy provider
- Screenshots stored locally
- No user data transmitted

## 📝 Logs

Error logs are automatically cleared on startup and stored in:
- `backend/logs/scrape_errors.log`

## 🆘 Support

If you encounter issues:
1. Check the error logs
2. Verify proxy connectivity
3. Ensure all dependencies are installed
4. Try restarting both backend and frontend

## 📄 License

Private use only. Not for redistribution. 