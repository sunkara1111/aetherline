# Aetherline

**Industrial Signal Narrative Workbench**

A browser-based industrial automation monitoring platform featuring real-time signal visualization, intelligent alarm pattern recognition, automated runbook generation, and comprehensive compliance event tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🎯 Features

### Live Signal Canvas
- **Real-time Sparkline Charts** - Visualize signal trends with smooth, responsive sparklines
- **Intelligent Alarm Bands** - Color-coded alarm states with severity indicators
- **Multi-tag Monitoring** - Track reactor temperature, pressure, flow, valve positions, motor speeds, and more
- **Quality Indicators** - Real-time signal quality monitoring (good/bad/uncertain)

### Automation Runbook Generator
- **Pattern Recognition** - Automatically detects alarm patterns and correlations
- **Context-Aware Procedures** - Generates step-by-step response procedures
- **Safety Annotations** - Highlights critical safety considerations
- **Export Capabilities** - Download runbooks as formatted text files

### Compliance Event Timeline
- **Comprehensive Logging** - Tracks all alarms, acknowledgments, actions, and shift changes
- **Multiple Export Formats** - Export to JSON (machine-readable) or HTML (printable)
- **Audit Trail** - Complete chronological record for regulatory compliance
- **Advanced Filtering** - Filter by event type, severity, or time range

### Technical Highlights
- **100% Client-Side** - No server required, no API keys needed
- **Rich Mock Data** - Realistic PLC/SCADA tag simulations
- **Fully Static** - Exports to static HTML for GitHub Pages deployment
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Industrial HUD Aesthetic** - Dark theme optimized for control room environments

## 🚀 Live Demo

Visit the live application: **[https://sunkara1111.github.io/aetherline/](https://sunkara1111.github.io/aetherline/)**

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Pages (Static Export)
- **Build System**: Next.js Static Export

## 📦 Installation

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/sunkara1111/aetherline.git
cd aetherline

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:3000` to see the application.

## 📖 Usage

### Monitoring Signals
- The Signal Canvas automatically updates every second with new data points
- Alarm bands flash when signals exceed safe operating limits
- Click the **PAUSE/RESUME** button to control simulation

### Generating Runbooks
- Runbooks auto-generate when alarm patterns are detected
- Click any runbook card to view detailed response procedures
- Use the **DOWNLOAD** button to export runbook as text

### Exporting Compliance Data
- Use **EXPORT JSON** for machine-readable audit logs
- Use **EXPORT HTML** for printable compliance reports
- Filter events by type before exporting for targeted reports

## 🏭 Mock Plant Data

Aetherline simulates a realistic industrial process with the following tags:

| Tag ID | Description | Unit | Range |
|--------|-------------|------|-------|
| R101_TEMP | Reactor-101 Temperature | °C | 0-300 |
| R101_PRESS | Reactor-101 Pressure | bar | 0-50 |
| FCV_201_POS | Flow Control Valve Position | % | 0-100 |
| FLOW_301 | Coolant Flow Rate | L/min | 0-500 |
| MTR_401_SPEED | Pump Motor Speed | RPM | 0-3600 |
| LVL_501 | Tank Level | % | 0-100 |
| VLV_601_STAT | Safety Valve State | state | 0-1 |
| COND_701 | Process Conductivity | µS/cm | 0-1000 |

## 🧩 Architecture

```
aetherline/
├── app/                   # Next.js App Router
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── SignalCanvas.tsx  # Live signal visualization
│   ├── RunbookPanel.tsx  # Runbook generator UI
│   └── EventTimeline.tsx # Compliance event log
├── lib/                  # Core libraries
│   ├── types.ts          # TypeScript definitions
│   ├── mockData.ts       # Mock PLC/SCADA generator
│   └── runbook.ts        # Runbook generation logic
├── docs/                 # Documentation
└── public/               # Static assets
```

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 📋 Legal Notices

- [COPYRIGHT.md](COPYRIGHT.md) - Copyright information
- [NOTICE](NOTICE) - Third-party notices and disclaimers
- [PATENT_NOTICE.md](PATENT_NOTICE.md) - Patent status (no patents filed or granted)

## ⚠️ Disclaimer

**This software is for educational and training purposes only.**

Aetherline is NOT certified for use in production industrial control systems. All simulated data is fictional and does not represent any real facility or process. Do not use this software for actual process control or safety-critical applications.

## 👤 Author

**Dineshgopi Sunkara**  
Senior Controls Engineer · Automation Engineer

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔧 Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Preview production build
npm run start
```

## 📊 Project Status

- ✅ Core functionality complete
- ✅ GitHub Pages deployment configured
- ✅ Full TypeScript coverage
- ✅ Responsive design
- ✅ Documentation complete

## 🎓 Educational Use Cases

- **Training**: Operator training for alarm response procedures
- **Visualization**: Demonstrating SCADA concepts and HMI design
- **Documentation**: Generating sample runbooks and compliance reports
- **Research**: Testing alarm management methodologies

---

**Built with ❤️ by Dineshgopi Sunkara**

*Advancing industrial automation through innovative software solutions*
