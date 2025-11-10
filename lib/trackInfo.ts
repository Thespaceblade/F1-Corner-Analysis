export type TrackInfo = {
  location: string
  elevationChange?: string
  funFacts?: string[]
  trackLength?: string
  firstGrandPrix?: number
}

export const trackInfo: Record<string, TrackInfo> = {
  'australia': {
    location: 'Melbourne, Australia',
    elevationChange: 'Minimal',
    trackLength: '5.278 km',
    firstGrandPrix: 1996,
    funFacts: [
      'The circuit runs around Albert Park Lake in the heart of Melbourne',
      'Temporary street circuit that uses public roads',
      'Known for its fast, flowing layout with few overtaking opportunities'
    ]
  },
  'china': {
    location: 'Shanghai, China',
    elevationChange: 'Minimal',
    trackLength: '5.451 km',
    firstGrandPrix: 2004,
    funFacts: [
      'Designed by Hermann Tilke, features the unique "snail" turn 1-2-3 complex',
      'One of the widest tracks on the calendar',
      'Track surface is extremely smooth, making it challenging for tire wear'
    ]
  },
  'japan': {
    location: 'Suzuka, Japan',
    elevationChange: '40 meters',
    trackLength: '5.807 km',
    firstGrandPrix: 1987,
    funFacts: [
      'Only figure-8 layout in Formula 1',
      'Famous for the challenging 130R corner and the Esses',
      'Drivers love this track for its technical difficulty and elevation changes'
    ]
  },
  'bahrain': {
    location: 'Sakhir, Bahrain',
    elevationChange: 'Minimal',
    trackLength: '5.412 km',
    firstGrandPrix: 2004,
    funFacts: [
      'First Middle Eastern country to host an F1 Grand Prix',
      'Races are held at night under floodlights',
      'Desert location creates challenging sand conditions'
    ]
  },
  'saudi-arabia': {
    location: 'Jeddah, Saudi Arabia',
    elevationChange: 'Minimal',
    trackLength: '6.174 km',
    firstGrandPrix: 2021,
    funFacts: [
      'Fastest street circuit in Formula 1',
      'Over 27 corners, the most of any circuit',
      'Raced at night along the Red Sea coastline'
    ]
  },
  'miami': {
    location: 'Miami, Florida, USA',
    elevationChange: 'Minimal',
    trackLength: '5.412 km',
    firstGrandPrix: 2022,
    funFacts: [
      'Built around Hard Rock Stadium',
      'Features a fake marina with yachts',
      'Combines street circuit elements with permanent sections'
    ]
  },
  'emilia-romagna': {
    location: 'Imola, Italy',
    elevationChange: '16 meters',
    trackLength: '4.909 km',
    firstGrandPrix: 1980,
    funFacts: [
      'Also known as Autodromo Enzo e Dino Ferrari',
      'Historic track with challenging chicanes',
      'Known for the Tamburello and Villeneuve corners'
    ]
  },
  'monaco': {
    location: 'Monte Carlo, Monaco',
    elevationChange: '40 meters',
    trackLength: '3.337 km',
    firstGrandPrix: 1950,
    funFacts: [
      'Shortest and slowest track on the calendar',
      'Most prestigious race, known as the "Jewel in the Crown"',
      'Tight, narrow streets with barriers inches from the track',
      'Qualifying is often more important than the race itself'
    ]
  },
  'spain': {
    location: 'Barcelona, Spain',
    elevationChange: '33 meters',
    trackLength: '4.675 km',
    firstGrandPrix: 1991,
    funFacts: [
      'Home to most F1 testing',
      'Known for the challenging final sector',
      'Combines high-speed and technical sections'
    ]
  },
  'canada': {
    location: 'Montreal, Canada',
    elevationChange: 'Minimal',
    trackLength: '4.361 km',
    firstGrandPrix: 1978,
    funFacts: [
      'Located on Île Notre-Dame, an artificial island',
      'Known as the "Wall of Champions" at the final chicane',
      'Often produces exciting races with multiple overtaking opportunities'
    ]
  },
  'austria': {
    location: 'Spielberg, Austria',
    elevationChange: '63 meters',
    trackLength: '4.318 km',
    firstGrandPrix: 1970,
    funFacts: [
      'Set in the Styrian mountains',
      'Shortest lap time on the calendar',
      'Only 10 corners but very fast and challenging'
    ]
  },
  'great-britain': {
    location: 'Silverstone, United Kingdom',
    elevationChange: '18 meters',
    trackLength: '5.891 km',
    firstGrandPrix: 1950,
    funFacts: [
      'Hosted the first ever Formula 1 World Championship race in 1950',
      'Former Royal Air Force bomber station',
      'Known for fast, flowing corners like Maggots, Becketts, and Chapel'
    ]
  },
  'belgium': {
    location: 'Spa-Francorchamps, Belgium',
    elevationChange: '102 meters',
    trackLength: '7.004 km',
    firstGrandPrix: 1950,
    funFacts: [
      'Longest circuit on the calendar',
      'Most elevation change of any track',
      'Famous for Eau Rouge and Raidillon - one of the most challenging corners in motorsport',
      'Often affected by unpredictable weather'
    ]
  },
  'hungary': {
    location: 'Budapest, Hungary',
    elevationChange: '14 meters',
    trackLength: '4.381 km',
    firstGrandPrix: 1986,
    funFacts: [
      'First Grand Prix behind the Iron Curtain',
      'Twisty, technical circuit with few overtaking opportunities',
      'Often produces processional races but tests car setup'
    ]
  },
  'netherlands': {
    location: 'Zandvoort, Netherlands',
    elevationChange: '7 meters',
    trackLength: '4.259 km',
    firstGrandPrix: 1952,
    funFacts: [
      'Located in the sand dunes by the North Sea',
      'Famous for banked corners, especially Turn 3 (Hugenholtzbocht)',
      'Returned to the calendar in 2021 after 36 years'
    ]
  },
  'italy': {
    location: 'Monza, Italy',
    elevationChange: '8 meters',
    trackLength: '5.793 km',
    firstGrandPrix: 1950,
    funFacts: [
      'Known as the "Temple of Speed"',
      'Fastest track on the calendar with average speeds over 260 km/h',
      'Historic track with the famous Parabolica corner',
      'Only circuit to host F1 every year since 1950'
    ]
  },
  'azerbaijan': {
    location: 'Baku, Azerbaijan',
    elevationChange: 'Minimal',
    trackLength: '6.003 km',
    firstGrandPrix: 2016,
    funFacts: [
      'Longest straight in Formula 1 at 2.2 km',
      'Combines tight, narrow castle section with wide, fast sections',
      'Known for unpredictable races and safety car periods'
    ]
  },
  'singapore': {
    location: 'Singapore',
    elevationChange: 'Minimal',
    trackLength: '5.063 km',
    firstGrandPrix: 2008,
    funFacts: [
      'First night race in Formula 1 history',
      'Physically demanding race due to heat and humidity',
      '23 corners make it one of the most technical tracks',
      'Raced around Marina Bay with stunning city views'
    ]
  },
  'united-states': {
    location: 'Austin, Texas, USA',
    elevationChange: '41 meters',
    trackLength: '5.513 km',
    firstGrandPrix: 2012,
    funFacts: [
      'Purpose-built Circuit of the Americas',
      'Features a replica of famous corners from other tracks',
      'Known for Turn 1, a steep uphill left-hander',
      'Popular with drivers and fans alike'
    ]
  },
  'mexico': {
    location: 'Mexico City, Mexico',
    elevationChange: 'Minimal',
    trackLength: '4.304 km',
    firstGrandPrix: 1963,
    funFacts: [
      'Highest altitude track at 2,285 meters above sea level',
      'Thin air affects engine performance and downforce',
      'Located in a public park',
      'Famous for its passionate fanbase'
    ]
  },
  'brazil': {
    location: 'São Paulo, Brazil',
    elevationChange: '43 meters',
    trackLength: '4.309 km',
    firstGrandPrix: 1973,
    funFacts: [
      'Also known as Interlagos',
      'Anti-clockwise layout, one of few on the calendar',
      'Known for unpredictable weather and exciting races',
      'Historic track that often decides championships'
    ]
  },
  'las-vegas': {
    location: 'Las Vegas, Nevada, USA',
    elevationChange: 'Minimal',
    trackLength: '6.201 km',
    firstGrandPrix: 2023,
    funFacts: [
      'Street circuit on the Las Vegas Strip',
      'Raced at night with the city lights as backdrop',
      'Longest straight on the calendar at 1.9 km',
      'Features tight sections around famous landmarks'
    ]
  },
  'qatar': {
    location: 'Lusail, Qatar',
    elevationChange: 'Minimal',
    trackLength: '5.419 km',
    firstGrandPrix: 2021,
    funFacts: [
      'Built for the 2022 FIFA World Cup',
      'Raced at night under floodlights',
      'Fast, flowing layout with multiple high-speed sections',
      'Located in the Lusail Sports Complex'
    ]
  },
  'abu-dhabi': {
    location: 'Abu Dhabi, United Arab Emirates',
    elevationChange: 'Minimal',
    trackLength: '5.281 km',
    firstGrandPrix: 2009,
    funFacts: [
      'Purpose-built Yas Marina Circuit',
      'Race starts in daylight and finishes at night',
      'Features the only hotel that spans the track',
      'Often hosts the season finale'
    ]
  }
}

