# F1 Corner Analysis

A web application for analyzing Formula 1 corner telemetry data. This project provides interactive visualizations and detailed analysis of F1 session data, including corner-by-corner performance metrics, track layouts, and driver comparisons.

## Features

- **Interactive 3D Globe Track Selector**: Navigate F1 circuits on an interactive 3D Earth globe
- **Corner-by-Corner Telemetry Analysis**: Automatic corner detection with detailed metrics:
  - Entry, apex, and exit speeds
  - Corner times and distances
  - Braking and acceleration zones
  - Track corner matching
- **Track Visualization**: SVG track layouts with corner markers and telemetry overlays
  - Interactive corner performance overlays with color-coded metrics
  - Hover tooltips showing detailed corner statistics
  - Clickable corners for detailed analysis
- **Corner Performance Analysis**: Advanced corner-by-corner analysis tools
  - Corner performance overlay with speed differentials
  - Aggregated corner metrics (average, best times, lap counts)
  - Corner delta charts comparing driver performance
  - Visual corner indicators on track SVG
- **Driver Comparison Tools**: Compare lap times, sector times, and corner performance across drivers
- **Session Data Management**: Support for Practice, Qualifying, Sprint Qualifying, and Race sessions
- **Real-time Telemetry Processing**: FastF1 integration for automatic data fetching and processing

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- FastF1 library (installed via pip)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Thespaceblade/F1-Corner-Analysis.git
cd F1-Corner-Analysis
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Install Python dependencies

```bash
pip install fastf1 pandas numpy
```

Note: `pandas` and `numpy` are required for corner detection and telemetry processing.

### 4. Install additional frontend dependencies

The globe component requires an additional package:

```bash
npm install react-globe.gl
```

### 5. Environment variables (optional)

For database-backed data storage, create a `.env` file in the root directory:

```env
DATA_SOURCE=database
DATABASE_URL=your_neon_database_url
```

If not using a database, the application will use file-based data from `public/data/sessions/`.

## Usage

### Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Fetching F1 Data

Before using the application, you need to fetch F1 session data using the Python scripts.

#### Single Session

Fetch data for a specific session:

```bash
python scripts/fetch_fastf1_data.py --year 2025 --round bahrain --session Q
```

Optional: Filter by specific drivers:

```bash
python scripts/fetch_fastf1_data.py --year 2025 --round bahrain --session Q --drivers VER PER
```

#### Bulk Fetch

Fetch data for multiple sessions across multiple rounds:

```bash
python scripts/bulk_fetch_fastf1_data.py --year 2025 --sessions Q R
```

Fetch specific tracks only:

```bash
python scripts/bulk_fetch_fastf1_data.py --year 2025 --sessions Q --tracks monaco bahrain
```

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
F1-Corner-Analysis/
├── app/                    # Next.js app directory
│   ├── api/               # API routes for session data
│   ├── page.tsx           # Main page component
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── GlobeTrackSelector.tsx  # 3D globe track selector
│   ├── TrackPanel.tsx     # Track SVG visualization with corner overlays
│   ├── CornerTable.tsx    # Corner analysis table with aggregated metrics
│   ├── CornerPerformanceOverlay.tsx  # Interactive corner performance visualization
│   ├── CornerTooltip.tsx  # Detailed corner statistics tooltip
│   ├── CornerDeltaChart.tsx  # Corner-by-corner delta comparison charts
│   ├── ChartPanel.tsx     # Data visualization panels
│   ├── ClientPage.tsx     # Main client-side page component
│   └── ...
├── lib/                   # Utility libraries
│   ├── db.ts             # Database client (Neon)
│   ├── sessionDataClient.ts  # Session data fetching
│   ├── cornerPerformanceAggregator.ts  # Corner performance data aggregation
│   ├── cornerPositionCalculator.ts     # Corner position calculations
│   ├── trackSvgLoader.ts # Track SVG loading utilities
│   └── ...
├── scripts/               # Python data processing scripts
│   ├── fastf1_pipeline/  # Core pipeline modules
│   │   ├── fetch.py      # FastF1 data fetching
│   │   ├── transforms.py # Data transformation
│   │   └── corners.py    # Corner detection and analysis
│   ├── fetch_fastf1_data.py      # Single session fetcher
│   └── bulk_fetch_fastf1_data.py # Bulk fetcher
├── public/                # Static assets
│   ├── data/             # Generated session JSON files
│   ├── Tracks/           # Track SVG files
│   └── ...
└── cache/                 # FastF1 cache directory
```

## Data Pipeline

The application uses a Python-based data pipeline to process FastF1 telemetry:

1. **Fetch**: Downloads session data and telemetry from FastF1 API
2. **Transform**: Processes telemetry into normalized JSON format
3. **Corner Detection**: Automatically identifies corners using speed drop heuristic:
   - Detects corners when speed drops ≥18 km/h
   - Identifies apex as local minimum
   - Detects corner end when speed recovers ≥10 km/h
   - Calculates entry/apex/exit speeds, corner times, and distances
   - Matches detected corners to track corner definitions
4. **Output**: Generates JSON files with lap data and corner metrics consumed by the frontend

Data is cached locally in the `cache/` directory to minimize API calls.

### Corner Metrics

For each detected corner, the pipeline calculates:
- **Speeds**: Entry speed, apex speed, exit speed, minimum speed
- **Times**: Corner time (entry to exit)
- **Distances**: Entry distance, apex distance, exit distance, braking distance, acceleration distance
- **Matching**: Corner number and type (slow/medium/fast) from track definitions

## API Endpoints

### List Available Sessions

```
GET /api/sessions
```

Returns a list of all available sessions with metadata.

### Get Session Data

```
GET /api/sessions/[year]/[round]/[session]
```

Parameters:
- `year`: Championship year (e.g., 2025)
- `round`: Round slug (e.g., "bahrain", "monaco")
- `session`: Session code (e.g., "Q", "R", "FP1")

Optional query parameters:
- `drivers`: Comma-separated driver codes (e.g., "VER,PER")

## Development

### TypeScript

The frontend is written in TypeScript. Type checking:

```bash
npm run lint
```

### Python Code Style

The Python pipeline follows PEP 8 conventions. Consider using a formatter like `black` or `ruff` for consistency.

### Adding New Tracks

1. Add track SVG to `public/Tracks/`
2. Add track metadata to `public/data/tracks.json`
3. Update calendar data in `public/data/calendar[year].json`

## Troubleshooting

### FastF1 Cache Issues

If data fetching fails, try clearing the FastF1 cache:

```bash
rm -rf cache/fastf1/raw/*
```

### Missing Telemetry Data

Some sessions may not have complete telemetry data available. Check the FastF1 documentation for data availability by session type.

### Globe Component Not Loading

Ensure `react-globe.gl` is installed:

```bash
npm install react-globe.gl
```

The component uses dynamic imports to avoid SSR issues, so it should work in both development and production builds.

## Features in Detail

### Corner Performance Visualization

The application provides detailed corner-by-corner analysis:

- **Performance Overlay**: Visual indicators on track SVG showing corner performance metrics
  - Color-coded performance indicators based on selected filter
  - Real-time updates when changing corner filter mode
- **Corner Tooltips**: Hover over corners to see detailed statistics including:
  - Average entry/apex/exit speeds
  - Best corner time and lap number
  - Number of valid laps analyzed
  - Driver comparisons
  - Filtered data based on current selection (segment/lap/average)
- **Corner Table**: Aggregated corner metrics table showing:
  - Corner type (slow/medium/fast)
  - Average speeds per driver
  - Best corner times
  - Lap counts
  - Filtered metrics based on qualifying segment or lap selection
- **Corner Filtering**: Advanced filtering options for detailed analysis:
  - **Qualifying Segments**: View corner performance from fastest lap in Q1, Q2, or Q3
  - **Lap Selection**: Analyze corners from a specific lap number
  - **Average Mode**: View average corner performance across all valid laps (race sessions)
  - **All Corners**: Comprehensive view of all corner data

### Data Visualization

- **Lap Time Charts**: Interactive charts for race and qualifying sessions
  - Race event markers: Pit stops, safety car periods, yellow/red flags, race start
  - Smart event label positioning: Automatic overlap prevention with priority-based labeling
  - Event priority system: Critical events (red flags, race start) displayed prominently
  - Safety car and VSC period visualization with labeled start/end markers
  - Outlier filtering for in-laps, out-laps, and safety car periods
- **Corner Filtering**: Advanced corner analysis filtering
  - Filter by qualifying segment (Q1, Q2, Q3) - shows fastest lap from selected segment
  - Filter by specific lap number
  - Average mode for race sessions (averages across all valid laps)
  - All corners mode for comprehensive analysis
- **Corner Delta Charts**: Visual comparison of corner performance between drivers
- **Track Overlays**: Real-time telemetry overlays on track SVG
  - Interactive corner markers with hover tooltips
  - Performance-based color coding
  - Fixed corner hover detection for all corners
- **Driver Selection**: Team-based and individual driver filtering

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Visualization**: Recharts, react-globe.gl
- **Data Processing**: Python 3.8+, FastF1, Pandas, NumPy
- **Database**: Neon (PostgreSQL) with JSON file fallback
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- TypeScript: Follow Next.js and React best practices
- Python: Follow PEP 8 conventions
- Use meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

## Acknowledgments

- [FastF1](https://github.com/theOehrly/Fast-F1) for F1 data access
- [react-globe.gl](https://github.com/vasturiano/react-globe.gl) for 3D globe visualization
- Formula 1 for providing official data through their API

