# Requirements Document

## Introduction

The GR Cup Real-Time Analytics Platform is a comprehensive race analytics and strategy tool designed for the Toyota GR Cup Series. The platform transforms raw race telemetry, timing, and weather data into actionable insights that help drivers improve performance and teams make informed strategic decisions. The system simulates real-time race conditions using historical data, providing an interactive dashboard that visualizes live race progression, performance metrics, and strategic recommendations.

## Hackathon Submission Details

**Primary Category:** Real-Time Analytics

**Secondary Category:** Driver Training & Insights

**Datasets Used:**

- Barber Motorsports Park (Race 1 & 2)
- Circuit of the Americas (Race 1 & 2)
- Road America (Race 1 & 2)
- Sebring International Raceway (Race 1 & 2)
- Sonoma Raceway (Race 1 & 2)
- Virginia International Raceway (Race 1 & 2)
- Track maps from Maps folder

**Key Innovation:** Combines real-time race simulation with post-race driver training insights, providing both strategic decision-making tools for race engineers and performance improvement analysis for drivers.

## Glossary

- **Platform**: The GR Cup Real-Time Analytics Platform system
- **Dashboard**: The web-based user interface displaying race analytics
- **Telemetry Data**: Vehicle sensor data including speed, acceleration, braking, GPS position, and steering angle
- **Lap Data**: Timing information for each lap including sector times and lap completion timestamps
- **Strategy Engine**: The algorithmic component that calculates pit stop windows and tire strategy recommendations
- **Race Simulation**: The process of streaming historical race data sequentially to simulate live race conditions
- **Timeline Control**: The user interface component allowing navigation through race progression
- **Track Map**: The visual representation of the race circuit with car positions and racing lines
- **Timing Tower**: The live leaderboard showing current race positions and gaps
- **Sector**: A segment of the race track used for detailed timing analysis
- **Backend API**: The FastAPI server providing data processing and WebSocket services
- **Frontend Application**: The React-based web application providing the user interface

## Requirements

### Requirement 1

**User Story:** As a race engineer, I want to load and view race data from multiple tracks and races, so that I can analyze performance across different events

#### Acceptance Criteria

1. WHEN THE Platform receives a request for available races, THE Platform SHALL return a list of all tracks and races in the dataset
2. WHEN THE Platform receives a request for specific race data, THE Platform SHALL load and return lap timing data, telemetry data, weather data, and race results for that race
3. WHEN THE Platform encounters missing or corrupted data files, THE Platform SHALL log the error and return an appropriate error message to the user
4. THE Platform SHALL support data from all six tracks: Barber, COTA, Road America, Sebring, Sonoma, and VIR
5. THE Platform SHALL cache processed race data to improve subsequent load times

### Requirement 2

**User Story:** As a race engineer, I want to see real-time race progression with live timing and positions, so that I can monitor the race as it unfolds

#### Acceptance Criteria

1. WHEN THE Race Simulation is active, THE Dashboard SHALL update the current lap number, elapsed time, and flag status every simulation interval
2. WHEN THE Race Simulation progresses to a new lap, THE Dashboard SHALL update all driver positions and gap times within 100 milliseconds
3. WHEN a driver completes a lap, THE Timing Tower SHALL display the lap time and update the driver's position in the leaderboard
4. THE Timing Tower SHALL display gap to leader and gap to car ahead for each driver with precision to 0.001 seconds
5. WHEN THE user selects a driver from the Timing Tower, THE Dashboard SHALL highlight that driver across all visualization components

### Requirement 3

**User Story:** As a driver, I want to see my racing line overlaid on the track map with speed visualization, so that I can identify where I can improve my lap times

#### Acceptance Criteria

1. WHEN THE Track Map loads, THE Track Map SHALL display the official track map image from the dataset Maps folder as the base layer
2. WHEN THE Track Map renders GPS data, THE Track Map SHALL overlay the racing line on top of the official track map image using GPS coordinates from telemetry data
3. WHEN THE user selects a driver, THE Track Map SHALL display that driver's racing line colored by speed from slowest (red) to fastest (green) using a continuous color scale overlaid on the track map
4. WHEN THE user hovers over a point on the racing line, THE Track Map SHALL display a tooltip showing speed, gear, throttle position, and brake pressure at that location
5. THE Track Map SHALL update car positions every simulation interval showing all cars on track with car number labels positioned on the track map
6. WHEN THE user compares two drivers, THE Track Map SHALL overlay both racing lines with distinct colors for visual comparison on the track map background
7. THE Track Map SHALL provide zoom and pan controls to allow detailed inspection of specific track sections on the map image

### Requirement 4

**User Story:** As a race engineer, I want to receive pit stop strategy recommendations based on current race conditions, so that I can make informed decisions about when to pit

#### Acceptance Criteria

1. WHEN THE Race Simulation is active, THE Strategy Engine SHALL calculate the optimal pit stop window based on tire degradation and fuel consumption every lap
2. WHEN THE current lap falls within the optimal pit window, THE Strategy Panel SHALL display a recommendation to pit with justification
3. WHEN THE Strategy Engine detects a pace advantage over competitors, THE Strategy Panel SHALL calculate and display the predicted track position after a pit stop
4. THE Strategy Engine SHALL estimate tire degradation using lap time delta analysis with a maximum error of 5 percent
5. WHEN THE race conditions change (caution flag, weather), THE Strategy Engine SHALL recalculate pit strategy within 2 seconds

### Requirement 5

**User Story:** As a driver, I want to compare my current lap performance against my best lap in real-time, so that I can see where I am gaining or losing time

#### Acceptance Criteria

1. WHEN THE Race Simulation is active and a driver has completed at least one lap, THE Performance Charts SHALL display the current lap time trace overlaid with the best lap time trace
2. WHEN THE current lap is slower than the best lap at any sector, THE Performance Charts SHALL highlight that sector in red
3. WHEN THE current lap is faster than the best lap at any sector, THE Performance Charts SHALL highlight that sector in green
4. THE Performance Charts SHALL display the cumulative time delta between current lap and best lap with updates every 0.5 seconds
5. WHEN THE driver completes the current lap, THE Dashboard SHALL indicate whether it was a personal best lap

### Requirement 6

**User Story:** As a race analyst, I want to scrub through the race timeline to review specific moments, so that I can analyze key events and decisions

#### Acceptance Criteria

1. WHEN THE user drags the Timeline Control scrubber, THE Dashboard SHALL update all components to display data for the selected lap
2. WHEN THE user clicks play on the Timeline Control, THE Race Simulation SHALL resume from the current lap position
3. THE Timeline Control SHALL provide playback speed options of 1x, 2x, 5x, and 10x normal speed
4. WHEN THE user clicks on a key moment marker (pit stop, fastest lap), THE Dashboard SHALL jump to that lap immediately
5. THE Timeline Control SHALL display visual markers for all pit stops, fastest laps, and flag changes on the timeline

### Requirement 7

**User Story:** As a driver, I want to see detailed telemetry traces for throttle, brake, and steering inputs, so that I can understand my driving technique

#### Acceptance Criteria

1. WHEN THE user selects a lap, THE Performance Charts SHALL display throttle position as a percentage from 0 to 100 over the lap distance
2. WHEN THE user selects a lap, THE Performance Charts SHALL display brake pressure in bar for front and rear brakes over the lap distance
3. WHEN THE user selects a lap, THE Performance Charts SHALL display steering angle in degrees over the lap distance
4. THE Performance Charts SHALL synchronize all telemetry traces on the same distance axis for easy comparison
5. WHEN THE user hovers over any point on a telemetry trace, THE Performance Charts SHALL display a vertical line across all traces showing values at that distance

### Requirement 8

**User Story:** As a race engineer, I want to see sector time analysis for all drivers, so that I can identify which drivers are fastest in which parts of the track

#### Acceptance Criteria

1. WHEN THE Dashboard displays sector analysis, THE Dashboard SHALL show sector times for all three sectors for each driver
2. WHEN THE Dashboard displays sector analysis, THE Dashboard SHALL highlight the fastest sector time in each sector across all drivers in green
3. WHEN THE user selects a driver, THE Dashboard SHALL display that driver's sector time improvement or degradation compared to their best sectors
4. THE Dashboard SHALL calculate and display average sector times across all laps for consistency analysis
5. WHEN THE user compares two drivers, THE Dashboard SHALL display side-by-side sector time comparison with delta values

### Requirement 9

**User Story:** As a team manager, I want to see performance consistency metrics for drivers, so that I can evaluate driver performance beyond just lap times

#### Acceptance Criteria

1. WHEN THE Dashboard calculates consistency metrics, THE Dashboard SHALL compute the standard deviation of lap times excluding pit laps and outliers
2. WHEN THE Dashboard displays driver performance, THE Dashboard SHALL show a consistency score from 0 to 100 where higher values indicate more consistent performance
3. THE Dashboard SHALL calculate pace rating as the percentage difference from the field average lap time
4. THE Dashboard SHALL display improvement rate showing lap time trend across the session
5. WHEN THE user views driver comparison, THE Dashboard SHALL display all consistency metrics side-by-side for easy evaluation

### Requirement 10

**User Story:** As a developer, I want the backend API to provide efficient data access and real-time updates, so that the frontend can deliver a responsive user experience

#### Acceptance Criteria

1. WHEN THE Backend API receives a request for race data, THE Backend API SHALL respond within 500 milliseconds for cached data
2. WHEN THE Backend API establishes a WebSocket connection, THE Backend API SHALL stream lap updates at the configured simulation speed
3. THE Backend API SHALL validate all incoming requests and return appropriate HTTP status codes for errors
4. THE Backend API SHALL implement CORS middleware to allow requests from the frontend application
5. WHEN THE Backend API processes telemetry data, THE Backend API SHALL use vectorized operations to maintain processing time under 100 milliseconds per lap

### Requirement 11

**User Story:** As a user, I want the dashboard to be visually appealing and easy to navigate, so that I can quickly find the information I need

#### Acceptance Criteria

1. THE Dashboard SHALL use a dark theme with high contrast colors for readability
2. THE Dashboard SHALL use red for slow/danger indicators, green for fast/optimal indicators, and yellow for moderate/warning indicators
3. THE Dashboard SHALL display all timing data in monospace font for consistent alignment
4. THE Dashboard SHALL be responsive and functional on screen resolutions from 1920x1080 and above
5. WHEN THE user interacts with any component, THE Dashboard SHALL provide visual feedback within 50 milliseconds

### Requirement 12

**User Story:** As a race engineer, I want to export race data and insights, so that I can share findings with the team or use them in other tools

#### Acceptance Criteria

1. WHEN THE user requests to export lap data, THE Dashboard SHALL generate a CSV file containing all lap times, sector times, and positions
2. WHEN THE user requests to export telemetry data, THE Dashboard SHALL generate a CSV file containing all telemetry parameters for the selected lap
3. WHEN THE user requests to export a chart, THE Dashboard SHALL generate a PNG image of the current chart view
4. THE Dashboard SHALL include metadata in all exports including track name, race number, date, and driver information
5. WHEN THE export is complete, THE Dashboard SHALL trigger a browser download with an appropriately named file

### Requirement 13

**User Story:** As a developer, I want to run the entire platform locally without external dependencies, so that I can develop and demo the application offline

#### Acceptance Criteria

1. THE Platform SHALL run entirely on localhost without requiring internet connectivity or cloud services
2. THE Backend API SHALL read all race data directly from CSV files in the local dataset directory
3. THE Backend API SHALL process and cache data in memory without requiring an external database
4. WHEN THE Backend API starts, THE Backend API SHALL load race metadata and cache frequently accessed data within 5 seconds
5. THE Platform SHALL support running the backend on localhost port 8000 and frontend on localhost port 5173
6. THE Backend API SHALL implement efficient memory management to handle telemetry files by loading only requested lap data on demand
7. WHEN THE Platform processes large telemetry files, THE Platform SHALL filter data by lap number before loading into memory to minimize memory usage
8. THE Platform SHALL provide startup scripts that launch both backend and frontend servers with a single command for demo purposes

### Requirement 14

**User Story:** As a data scientist, I want all data preprocessing decisions to be documented and justified, so that the data integrity and analytical validity can be verified

#### Acceptance Criteria

1. WHEN THE Platform performs any data cleaning operation, THE Platform SHALL document the decision in a data preprocessing log file
2. WHEN THE Platform fills missing values or NaN values, THE Platform SHALL include inline code comments explaining the rationale for the chosen imputation method
3. THE Platform SHALL maintain a data_preprocessing_decisions.md file in the docs directory that documents all data cleaning strategies and their justifications
4. WHEN THE Platform removes outlier data points, THE Platform SHALL log the criteria used for outlier detection and the reasoning for removal versus retention
5. WHEN THE Platform applies interpolation or forward-fill methods, THE Platform SHALL justify why that method is appropriate for the specific data type and use case
6. THE Platform SHALL document why certain missing values are ignored versus filled, including the impact analysis on downstream analytics
7. WHEN THE Platform transforms or normalizes data, THE Platform SHALL explain the transformation method and why it preserves data integrity for the intended analysis
8. THE data preprocessing documentation SHALL include examples showing before and after states for each major cleaning operation
