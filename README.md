# F1 Corner Analysis

A web application for analyzing Formula 1 corner telemetry data. This project provides interactive visualizations and detailed analysis of F1 session data, including corner-by-corner performance metrics, track layouts, and driver comparisons.

## Features

- **Interactive 3D Globe Track Selector**: Navigate F1 circuits on an interactive 3D Earth globe with smooth animations
- **Corner-by-Corner Telemetry Analysis**: Automatic corner detection with detailed metrics:
  - Entry, apex, and exit speeds
  - Corner times and distances
  - Braking and acceleration zones
  - Track corner matching
  - Advanced corner detection using throttle/brake signals for fast corners
- **Track Visualization**: SVG track layouts with corner markers and telemetry overlays
  - Interactive corner performance overlays with color-coded metrics
  - Hover tooltips showing detailed corner statistics
  - Clickable corners for detailed analysis
  - Fixed corner hover detection for all corners
- **Corner Performance Analysis**: Advanced corner-by-corner analysis tools
  - Corner performance overlay with speed differentials
  - Aggregated corner metrics (average, best times, lap counts)
  - Corner delta charts comparing driver performance
  - Visual corner indicators on track SVG
  - Corner difficulty analysis
  - Corner entry/exit speed analysis
- **Advanced Analysis Panels**: Comprehensive analysis tools
  - **Corner Entry/Exit Analysis**: Analyze corner entry speeds, exit speeds, and braking points
  - **Stint Analysis**: Analyze performance across stints and tyre life
  - **Corner Difficulty Analysis**: Identify the most challenging corners based on speed variance
  - **Data Export**: Export analysis data for further processing
- **Lap Time Visualization**: Interactive charts for race and qualifying sessions
  - Race event markers: Pit stops, safety car periods, yellow/red flags, race start
  - Smart event label positioning with automatic overlap prevention
  - Event priority system for critical events
  - Safety car and VSC period visualization
  - Outlier filtering for in-laps, out-laps, and safety car periods
- **AI-Powered Chatbot**: Natural language interface for querying F1 data
  - Ask questions about corner performance, driver statistics, and session data
  - Context-aware responses based on current track, session, and drivers
  - Powered by Google Gemini AI
  - Integrated with session data and corner analysis
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

### 4. Environment variables (optional)

For database-backed data storage, create a `.env` file in the root directory:

```env
DATA_SOURCE=database
DATABASE_URL=your_neon_database_url
```

If not using a database, the application will use file-based data from `public/data/sessions/`.

**For Chatbot Feature** (optional):
```env
GEMINI_API_KEY=your_google_gemini_api_key
```

The chatbot feature requires a Google Gemini API key. You can get one from [Google AI Studio](https://makersuite.google.com/app/apikey). If not configured, the chatbot will display an error message when used.

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

### Deployment on Vercel

The application is configured for deployment on Vercel:

1. **Build Configuration**: Vercel automatically detects Next.js and runs `npm run build`
2. **API Routes**: API routes are marked as dynamic to prevent static generation issues
3. **Build Artifacts**: The `.next/` directory is excluded from git and built on Vercel
4. **Environment Variables**: Set any required environment variables in Vercel dashboard
5. **Public Data**: The `public/data/sessions/` directory is included in deployment

**Important Notes**:
- The `.next/` directory should NOT be committed to git (it's in `.gitignore`)
- Vercel will build the application from source during deployment
- If you encounter build issues, ensure all dependencies are in `package.json`
- API routes use `export const dynamic = 'force-dynamic'` to prevent static generation

## Project Structure

```
F1-Corner-Analysis/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── sessions/      # Session data API routes
│   │   └── chat/          # Chatbot API route
│   ├── page.tsx           # Main page component
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── TrackPanel.tsx     # Track SVG visualization with corner overlays
│   ├── CornerTable.tsx    # Corner analysis table with aggregated metrics
│   ├── CornerPerformanceOverlay.tsx  # Interactive corner performance visualization
│   ├── CornerTooltip.tsx  # Detailed corner statistics tooltip
│   ├── CornerDeltaChart.tsx  # Corner-by-corner delta comparison charts
│   ├── ChartPanel.tsx     # Data visualization panels with race events
│   ├── AnalysisPanel.tsx  # Advanced analysis panel container
│   ├── Chatbot.tsx        # AI-powered chatbot component
│   ├── ClientPage.tsx     # Main client-side page component
│   ├── Toolbar.tsx        # Session and driver selection toolbar
│   ├── TableOfContents.tsx # Navigation table of contents
│   ├── analyses/          # Analysis components
│   │   ├── CornerDifficultyAnalysis.tsx  # Corner difficulty metrics
│   │   ├── CornerEntryExitAnalysis.tsx   # Entry/exit speed analysis
│   │   ├── StintAnalysis.tsx             # Stint and tyre analysis
│   │   ├── ExportAnalysis.tsx            # Data export functionality
│   │   └── ... (additional analysis components)
│   └── ...
├── lib/                   # Utility libraries
│   ├── db.ts             # Database client (Neon)
│   ├── sessionDataClient.ts  # Session data fetching and types
│   ├── cornerPerformanceAggregator.ts  # Corner performance data aggregation
│   ├── cornerFilter.ts   # Corner filtering utilities
│   ├── trackSvgLoader.ts # Track SVG loading utilities
│   ├── teamData.ts       # Team and driver data utilities
│   ├── chatbot/          # Chatbot utilities
│   │   ├── queryClassifier.ts  # Query classification
│   │   ├── queryExecutor.ts    # Query execution
│   │   ├── responseGenerator.ts # Response generation
│   │   ├── prompts.ts          # AI prompts
│   │   └── types.ts            # TypeScript types
│   └── ...
├── scripts/               # Python data processing scripts
│   ├── fastf1_pipeline/  # Core pipeline modules
│   │   ├── fetch.py      # FastF1 data fetching
│   │   ├── transforms.py # Data transformation
│   │   └── corners.py    # Corner detection and analysis
│   ├── fetch_fastf1_data.py      # Single session fetcher
│   ├── bulk_fetch_fastf1_data.py # Bulk fetcher
│   ├── edit_corner_coordinates.py # Interactive corner coordinate editor
│   └── README-corner-editor.md    # Corner editor documentation
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
3. **Corner Detection**: Automatically identifies corners using multiple heuristics:
   - **Primary**: Speed drop heuristic (speed drops ≥18 km/h)
   - **Secondary**: Throttle/brake signal detection for fast corners
   - Identifies apex as local minimum
   - Detects corner end when speed recovers ≥10 km/h
   - Calculates entry/apex/exit speeds, corner times, and distances
   - Matches detected corners to track corner definitions
   - Supports fast corners that don't show significant speed drops
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

### Chatbot API

```
POST /api/chat
```

Request body:
```json
{
  "query": "Who was fastest at corner 5?",
  "context": {
    "track": "monaco",
    "year": 2025,
    "session": "Q",
    "drivers": ["VER", "NOR"]
  }
}
```

Returns a chatbot response with answer, data, and sources.

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

### Editing Corner Coordinates

Use the interactive corner coordinate editor to visually position corners on track maps:

```bash
python scripts/edit_corner_coordinates.py
```

**Features**:
- Visual track SVG display with corner markers
- Drag-and-drop corner positioning
- Track selector dropdown (edit all tracks in one session)
- Zoom and pan controls
- Delete corner functionality
- Saves directly to `tracks.json`

**Usage**:
1. Run the script (no arguments needed)
2. Select a track from the dropdown
3. Drag corners to correct positions on the track map
4. Delete extra corners if needed
5. Click "Save Changes" to update `tracks.json`

For detailed documentation, see `scripts/README-corner-editor.md`.

## Troubleshooting

### FastF1 Cache Issues

If data fetching fails, try clearing the FastF1 cache:

```bash
rm -rf cache/fastf1/raw/*
```

### Missing Telemetry Data

Some sessions may not have complete telemetry data available. Check the FastF1 documentation for data availability by session type.

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
- **Advanced Analysis Tools**:
  - **Corner Entry/Exit Analysis**: Visualize entry and exit speeds across corners
  - **Stint Analysis**: Analyze performance degradation and tyre life
  - **Corner Difficulty Analysis**: Identify challenging corners based on speed variance
  - **Data Export**: Export analysis results for further processing
- **Driver Selection**: Team-based and individual driver filtering

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Visualization**: Recharts, react-globe.gl
- **AI/ML**: Google Gemini AI (Generative AI)
- **Data Processing**: Python 3.8+, FastF1, Pandas, NumPy
- **Database**: Neon (PostgreSQL) with JSON file fallback
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Build Tools**: TypeScript, Webpack (via Next.js)

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

## Recent Updates

### Latest Features
- **Interactive Corner Coordinate Editor**: Visual GUI tool for editing corner positions on track maps
  - Drag-and-drop corner positioning
  - Track selector dropdown (edit all tracks in one session)
  - Direct SVG path rendering (no external dependencies)
  - Delete corner functionality with automatic renumbering
  - Zoom and pan controls
  - Saves directly to tracks.json
- **AI-Powered Chatbot**: Natural language interface for querying F1 data using Google Gemini AI
  - Improved error handling with user-friendly messages
  - Fallback response generation when AI API fails
  - Enhanced query classification with better driver/track name recognition
  - Context-aware responses based on current page state
- Advanced analysis panels with corner difficulty, entry/exit, and stint analysis
- Improved corner detection using throttle/brake signals for fast corners
- Enhanced race event visualization with smart label positioning
- Fixed corner hover detection issues
- Improved API route error handling
- Optimized Vercel deployment configuration
- Added Table of Contents navigation component
- Improved TypeScript type safety in analysis components

### Performance Improvements
- Removed build artifacts from repository (reduced repository size)
- Optimized build process for Vercel deployments
- Improved error handling for missing data

## Known Issues & TODO

For a comprehensive list of unfinished work, known issues, and planned improvements, see:
- **[TODO.md](TODO.md)** - Unfinished work and future improvements
- **[FIXME.md](FIXME.md)** - Known bugs and issues that need fixing
- **[docs/remaining-tasks.md](docs/remaining-tasks.md)** - Detailed task list

### Quick Summary of Outstanding Items
- ⚠️ **Verify deleted components**: GlobeTrackSelector and cornerPositionCalculator were removed - need to verify if functionality was replaced
- 🔧 **Corner coordinate validation**: Need to validate coordinates for all tracks
- 🧪 **Testing**: New AnalysisPanel and TableOfContents components need thorough testing
- 📊 **Data quality**: Improve corner detection accuracy and validation
- 🎨 **UI enhancements**: Various UI/UX improvements planned

