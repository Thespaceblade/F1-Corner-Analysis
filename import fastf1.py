import fastf1
from fastf1 import plotting
from fastf1.core import Laps

# Enable local caching (creates a "cache" folder automatically)
fastf1.Cache.enable_cache('cache')

# Load session (change year and track as needed)
session = fastf1.get_session(2024, 'Monaco', 'Q')
session.load()

# Select Verstappen’s fastest lap
lap = session.laps.pick_driver('VER').pick_fastest()

# Extract telemetry data with distance info
tel = lap.get_car_data().add_distance()

# Print a preview
print(tel.head())