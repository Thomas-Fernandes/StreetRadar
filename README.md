# StreetRadar

A worldwide interactive map centralizing street view coverage from multiple providers (Google, Bing, Apple, and more).

## 🚀 Current Features

- **Interactive Map Interface**: Basic Leaflet.js integration with OpenStreetMap
- **Multiple Street View Providers**:
  - Google Street View coverage visualization
  - Bing Streetside coverage visualization
- **Layer Controls**: Toggle street view coverage layers
- **Multiple Base Maps**: OpenStreetMap and Satellite imagery

## 🛠️ Technology Stack

- **Frontend**: React.js with Next.js 15 framework
- **Map Visualization**: Leaflet.js and React-Leaflet
- **Styling**: Tailwind CSS
- **Data**: MongoDB (planned for future implementation)

## 📦 Project Structure

```
streetradar/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   │   └── map/        # Map-related components
│   └── services/       # Service layer for data fetching
├── .env.example        # Environment variables example
└── README.md           # Project documentation
```

## 💻 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/streetradar.git
   cd streetradar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚧 In Development

We're actively working on:
- Implementing more street view providers (Apple, etc.)
- Adding search and filtering functionality
- Enhancing map controls and interactivity
- Building out the backend API with MongoDB integration

## 🙏 Acknowledgments

This project draws significant inspiration from:
- [streetlevel](https://github.com/sk-zk/streetlevel) by sk-zk - A crucial reference for understanding street view coverage data structures and visualization techniques.

We're grateful to the open-source community for providing tools and knowledge that make this project possible.

## 📄 License

This project is licensed under the [MIT License](LICENSE).