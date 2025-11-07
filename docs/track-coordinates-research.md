# F1 Track Coordinates Research Reference

This document tracks the latitude and longitude coordinates for each F1 track location that need to be researched and added to the data structure.

## Track Locations to Research

### 2025 F1 Calendar Tracks

| Round | Track ID | Track Name | Location | Status |
|-------|----------|------------|----------|--------|
| 1 | australia | Albert Park Circuit | Melbourne, Australia | ⏳ To Research |
| 2 | china | Shanghai International Circuit | Shanghai, China | ⏳ To Research |
| 3 | japan | Suzuka | Suzuka, Japan | ⏳ To Research |
| 4 | bahrain | Bahrain International Circuit | Sakhir, Bahrain | ⏳ To Research |
| 5 | saudi-arabia | Jeddah Corniche Circuit | Jeddah, Saudi Arabia | ⏳ To Research |
| 6 | miami | Miami International Autodrome | Miami, USA | ⏳ To Research |
| 7 | emilia-romagna | Imola | Imola, Italy | ⏳ To Research |
| 8 | monaco | Circuit de Monaco | Monte Carlo, Monaco | ⏳ To Research |
| 9 | spain | Circuit de Barcelona-Catalunya | Barcelona, Spain | ⏳ To Research |
| 10 | canada | Circuit Gilles Villeneuve | Montreal, Canada | ⏳ To Research |
| 11 | austria | Red Bull Ring | Spielberg, Austria | ⏳ To Research |
| 12 | great-britain | Silverstone Circuit | Silverstone, UK | ⏳ To Research |
| 13 | belgium | Circuit de Spa-Francorchamps | Spa-Francorchamps, Belgium | ⏳ To Research |
| 14 | hungary | Hungaroring | Budapest, Hungary | ⏳ To Research |
| 15 | netherlands | Circuit Zandvoort | Zandvoort, Netherlands | ⏳ To Research |
| 16 | italy | Autodromo Nazionale Monza | Monza, Italy | ⏳ To Research |
| 17 | azerbaijan | Baku City Circuit | Baku, Azerbaijan | ⏳ To Research |
| 18 | singapore | Marina Bay Street Circuit | Singapore | ⏳ To Research |
| 19 | united-states | Circuit of the Americas | Austin, USA | ⏳ To Research |
| 20 | mexico | Autódromo Hermanos Rodríguez | Mexico City, Mexico | ⏳ To Research |
| 21 | brazil | Interlagos | São Paulo, Brazil | ⏳ To Research |
| 22 | las-vegas | Las Vegas Street Circuit | Las Vegas, USA | ⏳ To Research |
| 23 | qatar | Lusail International Circuit | Lusail, Qatar | ⏳ To Research |
| 24 | abu-dhabi | Yas Marina Circuit | Yas Marina, UAE | ⏳ To Research |

## Research Sources

1. **Official F1 Website**: Track information pages
2. **Google Maps**: Search for track name + location
3. **OpenStreetMap**: Geographic data
4. **FastF1 Library**: May contain location data in session metadata
5. **Track Official Websites**: Often have contact/location information
6. **Wikipedia**: Track pages often include coordinates

## Data Format

Once researched, coordinates should be added in this format:

```json
{
  "id": "australia",
  "coordinates": {
    "latitude": -37.8497,
    "longitude": 144.9680
  },
  "city": "Melbourne",
  "country": "Australia"
}
```

## Coordinate System

- **Format**: Decimal degrees (WGS84)
- **Latitude**: -90 to +90 (negative = South, positive = North)
- **Longitude**: -180 to +180 (negative = West, positive = East)
- **Precision**: 4-6 decimal places recommended (accuracy ~10-100 meters)

## Example Coordinates (Reference)

### Albert Park Circuit, Melbourne
- **Latitude**: -37.8497
- **Longitude**: 144.9680

### Circuit de Monaco, Monte Carlo
- **Latitude**: 43.7347
- **Longitude**: 7.4206

### Silverstone Circuit, UK
- **Latitude**: 52.0786
- **Longitude**: -1.0169

*Note: These are examples and should be verified during research phase.*

## Validation Checklist

For each track, verify:
- [ ] Coordinates are accurate (within ~100m of actual track location)
- [ ] City name matches calendar data
- [ ] Country is correct
- [ ] Coordinates are in correct format (decimal degrees)
- [ ] No typos in coordinate values

