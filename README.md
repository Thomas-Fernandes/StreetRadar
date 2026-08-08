# StreetRadar

StreetRadar is a Next.js web application that aims to display all coverage areas from existing Street View platforms on a single unified map. The application allows users to:

- Visualize coverage areas by provider
- Access statistics on coverage areas by provider

**Disclaimer:** This application has no commercial or advertising objectives, but serves purely informational purposes to provide data that is not readily available elsewhere.

## 🚀 Live Demo

The application is available at **[streetradar.app](https://streetradar.app)**

## 📋 Coverage Statistics

| Provider           | Coverage Display | Panorama Detection | Direct Links | Statistics |
| ------------------ | ---------------- | ------------------ | ------------ | ---------- |
| Google Street View | ✅               | ✅                 | ✅           | ❌         |
| Apple Look Around  | ✅               | ⚠️ Alpha           | ✅           | ✅         |
| Bing Streetside    | ✅               | ✅                 | ✅           | ❌         |
| Yandex Panoramas   | ⚠️ Alpha         | ⚠️ Alpha           | ⚠️ Alpha     | ❌         |
| Naver Street View  | ✅               | ❌                 | ✅           | ❌         |
| Já 360             | ✅               | ❌                 | ❌           | ❌         |
| Baidu Panorama     | ❌               | ❌                 | ❌           | ❌         |
| Kakao Road View    | ❌               | ❌                 | ❌           | ❌         |
| Mapillary          | ❌               | ❌                 | ❌           | ❌         |
| Mapy.cz Panorama   | ❌               | ❌                 | ❌           | ❌         |

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
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Homepage with provider showcase
│   │   ├── map/              # Interactive map page
│   │   └── analytics/        # Analytics dashboard
│   ├── components/           # React components
│   │   ├── map/              # Map-specific components
│   │   ├── charts/           # Data visualization components
│   │   └── ui/               # Reusable UI components
│   ├── services/             # Provider logic and APIs
│   │   ├── streetViewService.ts      # Provider tile URLs
│   │   ├── panoramaService.ts        # Panorama detection
│   │   └── appleLookAroundService.ts # Apple-specific logic
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and configurations
│   ├── styles/               # Global styles and themes
│   └── types/                # TypeScript definitions
├── public/
│   ├── images/               # Static assets and provider logos
│   └── data/                 # Geospatial data files
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/Thomas-Fernandes/StreetRadar.git
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

## 🚧 Roadmap

_Coming soon..._

## 🙏 Acknowledgments

This project draws significant inspiration from:

- **[streetlevel](https://github.com/sk-zk/streetlevel)** by sk-zk - Essential reference for understanding Street View APIs and coverage data structures
- **[Leaflet](https://leafletjs.com/)** - The leading open-source mapping library
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Community-driven map data

Special thanks to the open-source community and all contributors who make projects like this possible.

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
