# StreetRadar 🗺️ <img src="public/images/logo_no_bg.png" alt="StreetRadar Logo" width="24" height="24">

**A worldwide interactive map centralizing Street View coverage from multiple providers in one unified interface.**

Discover and explore street-level imagery from Google Street View, Bing Streetside, Yandex Panoramas, and Apple Look Around through an intuitive, modern web application.

## 🚀 Live Demo

Visit **[streetradar.app](https://streetradar.app)** to explore the interactive map.

## 🛠️ Technology Stack

- **Frontend**: React 19 + Next.js 15 (App Router)
- **Mapping**: Leaflet.js with React-Leaflet
- **Styling**: Tailwind CSS with custom design system
- **Analytics**: Duckdb on another repo
- **Charts**: Chart.js with react-chartjs-2
- **Geospatial**: Vector tiles (MVT) processing with PBF (PMTiles)

## 📦 Project Architecture

```
streetradar/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Homepage with provider showcase
│   │   ├── map/               # Interactive map page
│   │   └── analytics/         # Analytics dashboard
│   ├── components/            # React components
│   │   ├── map/              # Map-specific components
│   │   ├── charts/           # Data visualization components
│   │   └── ui/               # Reusable UI components
│   ├── services/             # Business logic and APIs
│   │   ├── streetViewService.ts      # Provider tile URLs
│   │   ├── panoramaService.ts        # Panorama detection
│   │   ├── analyticsService.ts       # Usage tracking
│   │   └── appleLookAroundService.ts # Apple-specific logic
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and configurations
│   ├── styles/               # Global styles and themes
│   └── types/                # TypeScript definitions
├── public/
│   ├── images/               # Static assets and provider logos
│   └── data/                 # Geospatial data files
└── docs/                     # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/streetradar.git
   cd streetradar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🗺️ How It Works

### Reverse Engineering & Data Reconstruction
StreetRadar employs sophisticated reverse engineering techniques to extract panorama data from multiple Street View providers:

#### Data Collection Process
- **Panorama Discovery**: Systematic extraction of panorama locations and metadata from provider APIs and tile services
- **Geographic Reconstruction**: Converting scattered panorama points into coherent geographic datasets
- **Map Matching Algorithms**: Algorithms to reconstruct accurate linestrings representing street coverage
- **Data Normalization**: Harmonizing different provider data formats into a unified structure

#### Coverage Visualization
- **Google**: Reverse-engineered Street View tile endpoints and metadata extraction
- **Bing**: Processed Streetside coverage with quadkey system analysis  
- **Yandex**: Extracted panorama data from Yandex Maps tile services (Alpha)
- **Apple**: Vector tile (MVT/PMTiles) processing for Look Around coverage reconstruction

## 🚧 Roadmap & Development Status

## TODO

## 🙏 Acknowledgments

This project draws significant inspiration from:
- **[streetlevel](https://github.com/sk-zk/streetlevel)** by sk-zk - Essential reference for understanding Street View APIs and coverage data structures
- **[Leaflet](https://leafletjs.com/)** - The leading open-source mapping library
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Community-driven map data

Special thanks to the open-source community and all contributors who make projects like this possible.

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.