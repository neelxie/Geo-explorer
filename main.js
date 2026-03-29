/* =============================================
   GeoExplorer Uganda — main.js
   All 6 Phases of Leaflet + GIS Learning

   PHASE 1 — Map init, tile layers, events
   PHASE 2 — Markers, popups, tooltips, icons
   PHASE 3 — GeoJSON layers, feature styling
   PHASE 4 — Layer groups, layer control
   PHASE 5 — Choropleth, data-driven styling
   PHASE 6 — Search/geocoder, geolocation, click events
   ============================================= */

// ─────────────────────────────────────────────
//  SHARED STATE
// ─────────────────────────────────────────────

let currentPhase = 1;
const activeLayers = [];   // tracks what's on the map so we can clean up

// ─────────────────────────────────────────────
//  PHASE 1 — MAP INIT & TILE LAYERS
// ─────────────────────────────────────────────
//
// Core concepts:
//   L.map(id, options)        — create map bound to a DOM element
//   map.setView([lat,lng], z) — set center + zoom
//   L.tileLayer(url, opts)    — raster background tiles
//   map.on(event, handler)    — listen for map events
//
// Coordinate system: WGS84 (EPSG:4326)
//   Latitude  → north/south  (-90 to +90)
//   Longitude → east/west   (-180 to +180)
//   Uganda sits at roughly [1.37°N, 32.29°E]

const map = L.map('map', {
  zoomControl: true,
  attributionControl: true,
});

map.setView([1.3733, 32.2903], 7);

// Tile layer definitions
// {z}/{x}/{y} are filled in by Leaflet per tile request
const TILES = {
  osm: L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }
  ),
  topo: L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    { attribution: '© OpenTopoMap', maxZoom: 17 }
  ),
  satellite: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri', maxZoom: 19 }
  ),
  dark: L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    { attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>', maxZoom: 20 }
  ),
};

let activeTile = TILES.osm;
activeTile.addTo(map);
let activeTileName = 'osm';

// Coordinate tracker — fires on every mouse move
const coordsEl = document.getElementById('mapCoords');
map.on('mousemove', (e) => {
  coordsEl.textContent = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
});
map.on('mouseout', () => { coordsEl.textContent = 'Hover map for coords'; });

// ─────────────────────────────────────────────
//  PHASE 2 — MARKERS, POPUPS, TOOLTIPS, ICONS
// ─────────────────────────────────────────────
//
// Core concepts:
//   L.marker([lat, lng])         — default blue pin marker
//   L.circleMarker([lat, lng])   — circle-based marker (scalable, no image needed)
//   L.divIcon({...})             — custom HTML marker icon
//   marker.bindPopup(html)       — attach a popup to a marker
//   marker.bindTooltip(text)     — attach a hover tooltip
//   L.layerGroup([...markers])   — group markers together

// Kampala points of interest
const KAMPALA_POIS = [
  {
    name: 'Makerere University',
    latlng: [0.3347, 32.5680],
    type: 'Education',
    desc: 'Uganda\'s oldest and most prestigious university, founded 1922.',
    color: '#4a9960',
  },
  {
    name: 'Entebbe International Airport',
    latlng: [0.0424, 32.4433],
    type: 'Transport',
    desc: 'Main international gateway to Uganda, on the shores of Lake Victoria.',
    color: '#4a80c4',
  },
  {
    name: 'Kampala Central Business District',
    latlng: [0.3163, 32.5822],
    type: 'Urban',
    desc: 'The economic and commercial heart of Kampala city.',
    color: '#e8a020',
  },
  {
    name: 'Kasubi Tombs',
    latlng: [0.3271, 32.5565],
    type: 'Heritage',
    desc: 'UNESCO World Heritage Site. Royal burial grounds of the Buganda kings.',
    color: '#c45c1a',
  },
  {
    name: 'Owino Market',
    latlng: [0.3138, 32.5703],
    type: 'Commerce',
    desc: 'One of East Africa\'s largest open-air markets.',
    color: '#9960c4',
  },
  {
    name: 'Lake Victoria Shore (Ggaba)',
    latlng: [0.2498, 32.6254],
    type: 'Nature',
    desc: 'Kampala\'s access point to Africa\'s largest lake.',
    color: '#20a0c8',
  },
];

// Custom divIcon factory — creates an HTML pin with a color dot
function makeDivIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:14px; height:14px;
        background:${color};
        border:2px solid rgba(255,255,255,0.6);
        border-radius:50%;
        box-shadow: 0 0 0 3px ${color}44, 0 2px 8px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

// Build the markers layer group
const markersGroup = L.layerGroup(
  KAMPALA_POIS.map((poi) => {
    const marker = L.marker(poi.latlng, { icon: makeDivIcon(poi.color) });

    // Popup — full HTML content shown on click
    marker.bindPopup(`
      <div class="popup-title">${poi.name}</div>
      <div class="popup-tag">${poi.type}</div>
      <div class="popup-body">${poi.desc}</div>
      <div class="popup-coord">${poi.latlng[0].toFixed(4)}°N, ${poi.latlng[1].toFixed(4)}°E</div>
    `, { maxWidth: 220 });

    // Tooltip — lightweight label shown on hover
    marker.bindTooltip(poi.name, { direction: 'top', offset: [0, -8] });

    return marker;
  })
);

// ─────────────────────────────────────────────
//  PHASE 3 — GEOJSON LAYERS
// ─────────────────────────────────────────────
//
// Core concepts:
//   GeoJSON — standard format for geographic data (RFC 7946)
//     Types: Point, LineString, Polygon, MultiPolygon, Feature, FeatureCollection
//   L.geoJSON(data, options) — renders GeoJSON on a Leaflet map
//   style option             — function(feature) returning path style object
//   onEachFeature option     — function(feature, layer) for bindings per feature
//   pointToLayer option      — custom rendering for Point features
//
// In production you'd fetch() a .geojson file.
// Here we define inline GeoJSON to keep it self-contained.

// Simplified Uganda regional boundaries (GeoJSON Polygons)
// Source: Simplified from Natural Earth / GADM data
const UGANDA_REGIONS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Central Region', capital: 'Kampala', area_km2: 61403, pop_est: 9500000 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[29.58,0.00],[32.90,-1.50],[34.00,-1.00],[34.20,0.50],[33.00,1.20],[31.00,1.50],[30.00,1.00],[29.58,0.00]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Northern Region', capital: 'Gulu', area_km2: 85392, pop_est: 7200000 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[30.00,1.50],[31.00,1.50],[33.00,1.20],[34.20,0.50],[34.50,2.00],[34.00,3.50],[33.00,4.20],[31.00,3.80],[29.60,3.00],[29.58,2.00],[30.00,1.50]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Eastern Region', capital: 'Mbale', area_km2: 39479, pop_est: 10800000 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[33.00,1.20],[34.20,0.50],[35.00,0.00],[35.00,-1.50],[34.00,-1.00],[32.90,-1.50],[33.00,1.20]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Western Region', capital: 'Mbarara', area_km2: 55285, pop_est: 8900000 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[29.58,0.00],[30.00,1.00],[31.00,1.50],[30.00,1.50],[29.58,2.00],[29.60,3.00],[28.80,3.00],[29.00,1.50],[29.60,-1.50],[29.58,0.00]]]
      }
    },
  ]
};

// Color palette for regions
const REGION_COLORS = {
  'Central Region':  '#e8a020',
  'Northern Region': '#4a9960',
  'Eastern Region':  '#4a80c4',
  'Western Region':  '#c45c1a',
};

const geojsonLayer = L.geoJSON(UGANDA_REGIONS_GEOJSON, {
  // style() returns a path options object for each feature
  style: (feature) => ({
    fillColor: REGION_COLORS[feature.properties.name] || '#aaa',
    fillOpacity: 0.25,
    color: REGION_COLORS[feature.properties.name] || '#aaa',
    weight: 2,
    dashArray: '4 4',
    opacity: 0.8,
  }),

  // onEachFeature() runs once per feature — good for popups & hover effects
  onEachFeature: (feature, layer) => {
    const p = feature.properties;

    layer.bindPopup(`
      <div class="popup-title">${p.name}</div>
      <div class="popup-tag">Region</div>
      <div class="popup-body">
        <b>Capital:</b> ${p.capital}<br/>
        <b>Area:</b> ${p.area_km2.toLocaleString()} km²<br/>
        <b>Population (est.):</b> ${p.pop_est.toLocaleString()}
      </div>
    `);

    layer.bindTooltip(p.name, { sticky: true, direction: 'center' });

    // Hover highlight effect
    layer.on('mouseover', () => {
      layer.setStyle({ fillOpacity: 0.55, weight: 3 });
    });
    layer.on('mouseout', () => {
      geojsonLayer.resetStyle(layer);
    });
  }
});

// ─────────────────────────────────────────────
//  PHASE 4 — LAYER GROUPS & LAYER CONTROL
// ─────────────────────────────────────────────
//
// Core concepts:
//   L.layerGroup([layers])        — groups layers, toggle as one unit
//   L.featureGroup([layers])      — like layerGroup but supports getBounds()
//   L.control.layers(base, over)  — built-in toggle UI for layers
//     baseLayers   — radio buttons (only one active at a time)
//     overlayLayers — checkboxes (multiple can be active)
//
// The layer control lets users switch tile layers and show/hide data.

// Base layers object (for the layer control)
const BASE_LAYERS = {
  'OpenStreetMap': TILES.osm,
  'Topographic':   TILES.topo,
  'Satellite':     TILES.satellite,
  'Dark':          TILES.dark,
};

// Major Ugandan lakes as a separate overlay layer
const LAKES_DATA = [
  { name: 'Lake Victoria', latlng: [0.0, 33.0], radius: 50000, color: '#20a0c8' },
  { name: 'Lake Albert', latlng: [1.6, 30.9], radius: 22000, color: '#4a80c4' },
  { name: 'Lake Edward', latlng: [-0.3, 29.6], radius: 15000, color: '#4a80c4' },
  { name: 'Lake Kyoga', latlng: [1.5, 33.0], radius: 18000, color: '#20a0c8' },
];

const lakesGroup = L.layerGroup(
  LAKES_DATA.map((lake) =>
    L.circle(lake.latlng, {
      radius: lake.radius,
      fillColor: lake.color,
      fillOpacity: 0.3,
      color: lake.color,
      weight: 1.5,
    })
    .bindTooltip(lake.name)
    .bindPopup(`<div class="popup-title">${lake.name}</div><div class="popup-tag">Lake</div>`)
  )
);

// Major cities layer
const CITIES_DATA = [
  { name: 'Kampala',   latlng: [0.3476, 32.5825], pop: 3631000 },
  { name: 'Gulu',      latlng: [2.7748, 32.2990], pop: 153000  },
  { name: 'Lira',      latlng: [2.2499, 32.8998], pop: 119000  },
  { name: 'Mbarara',   latlng: [-0.6072,30.6545], pop: 195000  },
  { name: 'Jinja',     latlng: [0.4478, 33.2026], pop: 93000   },
  { name: 'Mbale',     latlng: [1.0830, 34.1751], pop: 96000   },
  { name: 'Masaka',    latlng: [-0.3393,31.7357], pop: 103000  },
  { name: 'Entebbe',   latlng: [0.0581, 32.4632], pop: 68000   },
];

const citiesGroup = L.layerGroup(
  CITIES_DATA.map((city) => {
    // Scale circle radius by population
    const r = Math.sqrt(city.pop) * 3;
    return L.circleMarker(city.latlng, {
      radius: Math.max(5, Math.min(r / 100, 16)),
      fillColor: '#e8a020',
      color: '#0f0e0c',
      weight: 1.5,
      fillOpacity: 0.85,
    })
    .bindTooltip(`${city.name} — pop. ${city.pop.toLocaleString()}`, { direction: 'top' })
    .bindPopup(`
      <div class="popup-title">${city.name}</div>
      <div class="popup-tag">City</div>
      <div class="popup-body">Population (est.): <b>${city.pop.toLocaleString()}</b></div>
      <div class="popup-coord">${city.latlng[0].toFixed(4)}°, ${city.latlng[1].toFixed(4)}°</div>
    `);
  })
);

// Build the layer control (rendered onto map in phase 4)
const layerControl = L.control.layers(BASE_LAYERS, {
  'Regions': geojsonLayer,
  'Major Lakes': lakesGroup,
  'Cities': citiesGroup,
  'Kampala POIs': markersGroup,
}, { collapsed: false, position: 'topright' });

// ─────────────────────────────────────────────
//  PHASE 5 — CHOROPLETH (DATA-DRIVEN STYLING)
// ─────────────────────────────────────────────
//
// Core concepts:
//   Choropleth — map where areas are shaded by a data value
//   Color scale — map a numeric range to a color gradient
//   getColor()  — helper that picks a color bucket for a value
//   setStyle()  — update a layer's style after initial render
//
// We'll shade Uganda's regions by estimated population density.

// Population density data (people per km²) — approximate
const DENSITY_DATA = {
  'Central Region':  154.7,
  'Eastern Region':  273.6,
  'Northern Region':  84.4,
  'Western Region':  161.0,
};

// Color scale function: light → dark orange for low → high density
function getDensityColor(d) {
  return d > 250 ? '#7f0000'
       : d > 180 ? '#b30000'
       : d > 130 ? '#d7301f'
       : d >  80 ? '#ef6548'
       : d >  40 ? '#fc8d59'
       :            '#fdcc8a';
}

const choroLayer = L.geoJSON(UGANDA_REGIONS_GEOJSON, {
  style: (feature) => {
    const density = DENSITY_DATA[feature.properties.name] || 0;
    return {
      fillColor: getDensityColor(density),
      fillOpacity: 0.70,
      color: '#fff',
      weight: 1.5,
      opacity: 0.8,
    };
  },
  onEachFeature: (feature, layer) => {
    const p = feature.properties;
    const density = DENSITY_DATA[p.name] || '?';
    layer.bindPopup(`
      <div class="popup-title">${p.name}</div>
      <div class="popup-tag">Choropleth</div>
      <div class="popup-body">
        <b>Population density:</b> ${density} /km²<br/>
        <b>Area:</b> ${p.area_km2.toLocaleString()} km²
      </div>
    `);
    layer.bindTooltip(`${p.name}: ${density}/km²`, { sticky: true });
    layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.9, weight: 3 }));
    layer.on('mouseout', () => choroLayer.resetStyle(layer));
  }
});

// Choropleth legend control
const choroLegend = L.control({ position: 'bottomleft' });
choroLegend.onAdd = () => {
  const div = L.DomUtil.create('div');
  div.style.cssText = `
    background: rgba(15,14,12,0.92);
    border: 1px solid #3a3528;
    border-radius: 3px;
    padding: 10px 14px;
    font-family: 'Space Mono', monospace;
    font-size: 0.62rem;
    color: #8a8070;
    line-height: 2;
  `;
  const grades = [0, 40, 80, 130, 180, 250];
  div.innerHTML = '<b style="color:#e8a020;display:block;margin-bottom:6px">Density /km²</b>';
  grades.forEach((g, i) => {
    const next = grades[i + 1];
    div.innerHTML += `
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:12px;height:12px;background:${getDensityColor(g + 1)};border-radius:2px;flex-shrink:0"></div>
        ${g}${next ? '–' + next : '+'}
      </div>`;
  });
  return div;
};

// ─────────────────────────────────────────────
//  PHASE 6 — SEARCH, GEOLOCATION, CLICK EVENTS
// ─────────────────────────────────────────────
//
// Core concepts:
//   Geocoder          — convert an address string → lat/lng (and back)
//   Reverse geocoding — convert lat/lng → human-readable address
//   Geolocation API   — navigator.geolocation.getCurrentPosition()
//   map.on('click')   — fires with e.latlng on every map click
//   L.control.geocoder() — built-in geocoder widget (Leaflet Geocoder plugin)
//   L.popup()            — programmatic popup (not bound to a layer)
//   flyTo() / flyToBounds() — smooth animated pan + zoom

// Geocoder control (using OpenStreetMap Nominatim under the hood)
let geocoderControl = null;

// Click-to-identify handler (added in phase 6)
let clickHandler = null;

// Geolocation marker
let geoMarker = null;

function setupGeocoder() {
  if (!L.Control.Geocoder) return;
  geocoderControl = L.Control.geocoder({
    defaultMarkGeocode: true,
    position: 'topleft',
    placeholder: 'Search place…',
    collapsed: true,
  })
  .on('markgeocode', (e) => {
    const { center, name } = e.geocode;
    map.flyTo(center, 13, { duration: 1.2 });
    L.popup()
      .setLatLng(center)
      .setContent(`
        <div class="popup-title">${name}</div>
        <div class="popup-tag">Search Result</div>
        <div class="popup-coord">${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}</div>
      `)
      .openOn(map);
  })
  .addTo(map);
}

function setupClickIdentify() {
  clickHandler = (e) => {
    L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <div class="popup-title">📍 You clicked here</div>
        <div class="popup-coord">${e.latlng.lat.toFixed(6)}°N<br/>${e.latlng.lng.toFixed(6)}°E</div>
      `)
      .openOn(map);
  };
  map.on('click', clickHandler);
}

function locateUser() {
  map.locate({ setView: true, maxZoom: 14 });
  map.once('locationfound', (e) => {
    if (geoMarker) geoMarker.remove();
    geoMarker = L.circleMarker(e.latlng, {
      radius: 10,
      fillColor: '#4a9960',
      color: '#fff',
      weight: 2,
      fillOpacity: 0.9,
    })
    .bindPopup(`
      <div class="popup-title">📍 You are here</div>
      <div class="popup-body">Accuracy: ±${Math.round(e.accuracy)}m</div>
      <div class="popup-coord">${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}</div>
    `)
    .addTo(map)
    .openPopup();
  });
  map.once('locationerror', () => {
    alert('Location access denied or unavailable.');
  });
}

// ─────────────────────────────────────────────
//  PHASE PANEL CONTENT (UI text for each phase)
// ─────────────────────────────────────────────

const PANEL_CONTENT = {
  1: {
    title: 'Phase 1: Map Basics',
    sub: 'Tile layers, coordinates, zoom',
    html: () => `
      <div class="block">
        <div class="block-head">🧠 What you're learning</div>
        <div class="block-body">
          <ul>
            <li>Initializing a Leaflet map</li>
            <li>Setting view (lat/lng + zoom level)</li>
            <li>Adding tile layer providers</li>
            <li>Reading geographic coordinates</li>
            <li>Listening for map events</li>
          </ul>
        </div>
      </div>
      <div class="block">
        <div class="block-head">🗂️ Tile Layers</div>
        <div class="block-body">
          <div class="btn-grid" id="tileBtns">
            <button class="opt-btn ${activeTileName==='osm'?'active':''}" data-tile="osm">OpenStreetMap</button>
            <button class="opt-btn ${activeTileName==='topo'?'active':''}" data-tile="topo">Topographic</button>
            <button class="opt-btn ${activeTileName==='satellite'?'active':''}" data-tile="satellite">Satellite</button>
            <button class="opt-btn ${activeTileName==='dark'?'active':''}" data-tile="dark">Dark Mode</button>
          </div>
        </div>
      </div>
      <div class="block">
        <div class="block-head">📍 Current View</div>
        <div class="block-body">
          <span class="mono-val">Lat:  ${map.getCenter().lat.toFixed(4)}</span>
          <span class="mono-val">Lng:  ${map.getCenter().lng.toFixed(4)}</span>
          <span class="mono-val">Zoom: ${map.getZoom()}</span>
        </div>
      </div>
      <div class="block">
        <div class="block-head">💡 Key Code</div>
        <div class="block-body">
          <div class="code-block"><code>const map = L.map('map')
  .setView([1.37, 32.29], 7);

L.tileLayer(url, {
  attribution: '...',
  maxZoom: 19
}).addTo(map);

map.on('mousemove', e => {
  console.log(e.latlng);
});</code></div>
        </div>
      </div>
    `,
  },
  2: {
    title: 'Phase 2: Markers & Popups',
    sub: 'Custom icons, popups, tooltips',
    html: () => `
      <div class="block">
        <div class="block-head">🧠 What you're learning</div>
        <div class="block-body">
          <ul>
            <li>L.marker() — default & custom icons</li>
            <li>L.circleMarker() — shape-based markers</li>
            <li>L.divIcon() — HTML-based markers</li>
            <li>bindPopup() — click-to-open info panels</li>
            <li>bindTooltip() — hover labels</li>
            <li>L.layerGroup() — group markers</li>
          </ul>
        </div>
      </div>
      <div class="block">
        <div class="block-head">📌 Kampala POIs (${KAMPALA_POIS.length} locations)</div>
        <div class="block-body">
          ${KAMPALA_POIS.map(p => `
            <div class="legend-item">
              <div class="legend-swatch" style="background:${p.color}"></div>
              <span style="font-size:0.73rem">${p.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="block">
        <div class="block-head">💡 Key Code</div>
        <div class="block-body">
          <div class="code-block"><code>// Custom HTML icon
const icon = L.divIcon({
  html: '<div class="pin"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Marker with popup + tooltip
L.marker([lat, lng], { icon })
  .bindPopup('<b>Title</b><br>Info')
  .bindTooltip('Hover label')
  .addTo(map);</code></div>
        </div>
      </div>
    `,
  },
  3: {
    title: 'Phase 3: GeoJSON Layers',
    sub: 'Geographic data, feature styling',
    html: () => `
      <div class="block">
        <div class="block-head">🧠 What you're learning</div>
        <div class="block-body">
          <ul>
            <li>GeoJSON format — Points, Polygons, FeatureCollections</li>
            <li>L.geoJSON() — render geographic data</li>
            <li>style() — function-based feature styling</li>
            <li>onEachFeature() — bind events per feature</li>
            <li>Hover highlight with setStyle()</li>
          </ul>
        </div>
      </div>
      <div class="block">
        <div class="block-head">🗺️ Uganda Regions</div>
        <div class="block-body">
          ${Object.entries(REGION_COLORS).map(([name, color]) => `
            <div class="legend-item">
              <div class="legend-swatch" style="background:${color}55;border:2px solid ${color}"></div>
              <span style="font-size:0.73rem">${name}</span>
            </div>
          `).join('')}
          <p style="margin-top:8px;font-size:0.68rem;color:var(--text-muted)">Click a region for details. Hover to highlight.</p>
        </div>
      </div>
      <div class="block">
        <div class="block-head">💡 Key Code</div>
        <div class="block-body">
          <div class="code-block"><code>L.geoJSON(data, {
  style: feature => ({
    fillColor: getColor(
      feature.properties.name
    ),
    fillOpacity: 0.3,
    color: '#fff',
    weight: 2,
  }),
  onEachFeature: (feat, layer) => {
    layer.bindPopup(feat.properties.name);
    layer.on('mouseover', () => {
      layer.setStyle({ fillOpacity: 0.6 });
    });
  }
}).addTo(map);</code></div>
        </div>
      </div>
    `,
  },
  4: {
    title: 'Phase 4: Layer Control',
    sub: 'Layer groups, toggle overlays',
    html: () => `
      <div class="block">
        <div class="block-head">🧠 What you're learning</div>
        <div class="block-body">
          <ul>
            <li>L.layerGroup() — combine layers</li>
            <li>L.control.layers() — built-in toggle UI</li>
            <li>Base layers vs overlays</li>
            <li>Adding / removing layers programmatically</li>
          </ul>
        </div>
      </div>
      <div class="block">
        <div class="block-head">ℹ️ How to use</div>
        <div class="block-body">
          <p>Use the <b style="color:var(--accent)">layer control panel</b> (top-right of map) to toggle overlays on/off and switch the base tile layer.</p>
        </div>
      </div>
      <div class="block">
        <div class="block-head">📦 Available Layers</div>
        <div class="block-body">
          <div class="stat-row"><span class="stat-label">Base Layers</span><span class="stat-val">4</span></div>
          <div class="stat-row"><span class="stat-label">Regions overlay</span><span class="stat-val">4 polygons</span></div>
          <div class="stat-row"><span class="stat-label">Major Lakes</span><span class="stat-val">4 circles</span></div>
          <div class="stat-row"><span class="stat-label">Cities</span><span class="stat-val">${CITIES_DATA.length} markers</span></div>
          <div class="stat-row"><span class="stat-label">Kampala POIs</span><span class="stat-val">${KAMPALA_POIS.length} markers</span></div>
        </div>
      </div>
      <div class="block">
        <div class="block-head">💡 Key Code</div>
        <div class="block-body">
          <div class="code-block"><code>const bases = {
  'OpenStreetMap': osmLayer,
  'Satellite': satLayer,
};
const overlays = {
  'Cities': citiesGroup,
  'Lakes': lakesGroup,
};

L.control.layers(bases, overlays, {
  collapsed: false
}).addTo(map);</code></div>
        </div>
      </div>
    `,
  },
  5: {
    title: 'Phase 5: Choropleth Map',
    sub: 'Data-driven color styling',
    html: () => `
      <div class="block">
        <div class="block-head">🧠 What you're learning</div>
        <div class="block-body">
          <ul>
            <li>Choropleth = area shaded by data value</li>
            <li>Color scale functions (getColor)</li>
            <li>Mapping numeric data → visual encoding</li>
            <li>Custom map legend controls</li>
            <li>L.control() — build your own map widget</li>
          </ul>
        </div>
      </div>
      <div class="block">
        <div class="block-head">📊 Population Density /km²</div>
        <div class="block-body">
          ${Object.entries(DENSITY_DATA).map(([name, d]) => `
            <div class="legend-item">
              <div class="legend-swatch" style="background:${getDensityColor(d)}"></div>
              <span style="font-size:0.72rem">${name}: <b style="color:var(--accent)">${d}</b></span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="block">
        <div class="block-head">💡 Key Code</div>
        <div class="block-body">
          <div class="code-block"><code>function getColor(density) {
  return density > 250 ? '#7f0000'
       : density > 130 ? '#d7301f'
       : density > 80  ? '#ef6548'
       :                  '#fdcc8a';
}

L.geoJSON(data, {
  style: feat => ({
    fillColor: getColor(
      densityData[feat.properties.name]
    ),
    fillOpacity: 0.7,
  })
}).addTo(map);</code></div>
        </div>
      </div>
    `,
  },
  6: {
    title: 'Phase 6: Interactive Tools',
    sub: 'Search, geolocation, click events',
    html: () => `
      <div class="block">
        <div class="block-head">🧠 What you're learning</div>
        <div class="block-body">
          <ul>
            <li>Geocoding — address → coordinates</li>
            <li>Reverse geocoding — coords → address</li>
            <li>Browser Geolocation API</li>
            <li>map.locate() — Leaflet's location method</li>
            <li>map.on('click') — click-to-identify</li>
            <li>map.flyTo() — smooth animated navigation</li>
          </ul>
        </div>
      </div>
      <div class="block">
        <div class="block-head">🔍 Search a Place</div>
        <div class="block-body">
          <div class="search-wrap">
            <input type="text" id="searchInput" placeholder="e.g. Gulu, Uganda"/>
            <button class="search-btn" id="searchGoBtn">▶ FLY TO</button>
          </div>
        </div>
      </div>
      <div class="block">
        <div class="block-head">📡 Geolocation</div>
        <div class="block-body">
          <button class="search-btn" id="locateBtn">📍 Find My Location</button>
        </div>
      </div>
      <div class="block">
        <div class="block-head">🖱️ Click Identify</div>
        <div class="block-body">
          <p style="font-size:0.73rem;color:var(--text-muted)">Click anywhere on the map to see its exact coordinates in a popup.</p>
        </div>
      </div>
      <div class="block">
        <div class="block-head">💡 Key Code</div>
        <div class="block-body">
          <div class="code-block"><code>// Geolocation
map.locate({ setView: true });
map.on('locationfound', e => {
  L.marker(e.latlng).addTo(map);
});

// Click identify
map.on('click', e => {
  L.popup()
    .setLatLng(e.latlng)
    .setContent(e.latlng.toString())
    .openOn(map);
});

// flyTo for smooth navigation
map.flyTo([lat, lng], 13);</code></div>
        </div>
      </div>
    `,
  },
};

// ─────────────────────────────────────────────
//  PHASE SWITCHING — clean up & re-draw
// ─────────────────────────────────────────────

function clearMap() {
  // Remove all phase-added layers
  activeLayers.forEach((l) => {
    if (map.hasLayer(l)) map.removeLayer(l);
  });
  activeLayers.length = 0;

  // Remove layer control if present
  if (layerControl._map) layerControl.remove();

  // Remove legend if present
  if (choroLegend._map) choroLegend.remove();

  // Remove geocoder if present
  if (geocoderControl && geocoderControl._map) geocoderControl.remove();

  // Remove click handler
  if (clickHandler) {
    map.off('click', clickHandler);
    clickHandler = null;
  }

  // Close any open popups
  map.closePopup();
}

function renderPhasePanel(phase) {
  const content = PANEL_CONTENT[phase];
  document.getElementById('panelTitle').textContent = content.title;
  document.getElementById('panelSubtitle').textContent = content.sub;
  document.getElementById('panelBody').innerHTML = content.html();
  bindPanelEvents(phase);
}

function bindPanelEvents(phase) {
  if (phase === 1) {
    // Tile layer buttons
    document.querySelectorAll('#tileBtns .opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tileName = btn.dataset.tile;
        if (tileName === activeTileName) return;
        activeTile.removeFrom(map);
        activeTile = TILES[tileName];
        activeTile.addTo(map);
        activeTileName = tileName;
        document.querySelectorAll('#tileBtns .opt-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  if (phase === 6) {
    // Fly-to search
    document.getElementById('searchGoBtn')?.addEventListener('click', () => {
      const query = document.getElementById('searchInput')?.value.trim();
      if (!query) return;
      // Use Nominatim directly
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
        .then((r) => r.json())
        .then((results) => {
          if (!results.length) { alert('Place not found.'); return; }
          const { lat, lon, display_name } = results[0];
          const latlng = [parseFloat(lat), parseFloat(lon)];
          map.flyTo(latlng, 13, { duration: 1.5 });
          L.popup()
            .setLatLng(latlng)
            .setContent(`
              <div class="popup-title">🔍 ${display_name.split(',')[0]}</div>
              <div class="popup-tag">Search Result</div>
              <div class="popup-coord">${parseFloat(lat).toFixed(5)}°N, ${parseFloat(lon).toFixed(5)}°E</div>
            `)
            .openOn(map);
        })
        .catch(() => alert('Search failed. Check your connection.'));
    });

    // Enter key on search
    document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('searchGoBtn')?.click();
    });

    // Geolocation button
    document.getElementById('locateBtn')?.addEventListener('click', locateUser);
  }
}

function loadPhase(phase) {
  clearMap();
  currentPhase = phase;

  // Reset view to Uganda
  map.flyTo([1.3733, 32.2903], phase <= 2 ? (phase === 2 ? 11 : 7) : 7, { duration: 0.8 });

  switch (phase) {
    case 1:
      // Map is already set up. Nothing extra to add.
      break;

    case 2:
      markersGroup.addTo(map);
      activeLayers.push(markersGroup);
      map.flyTo([0.3163, 32.5822], 12, { duration: 1 });
      break;

    case 3:
      geojsonLayer.addTo(map);
      activeLayers.push(geojsonLayer);
      break;

    case 4:
      geojsonLayer.addTo(map);
      lakesGroup.addTo(map);
      citiesGroup.addTo(map);
      layerControl.addTo(map);
      activeLayers.push(geojsonLayer, lakesGroup, citiesGroup);
      break;

    case 5:
      choroLayer.addTo(map);
      choroLegend.addTo(map);
      activeLayers.push(choroLayer);
      break;

    case 6:
      // All layers visible for full interaction
      geojsonLayer.addTo(map);
      citiesGroup.addTo(map);
      lakesGroup.addTo(map);
      activeLayers.push(geojsonLayer, citiesGroup, lakesGroup);
      setupClickIdentify();
      break;
  }

  renderPhasePanel(phase);

  // Update phase buttons
  document.querySelectorAll('.phase-btn').forEach((b) => {
    b.classList.toggle('active', parseInt(b.dataset.phase) === phase);
  });
}

// ─────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────

// Wire phase nav buttons
document.getElementById('phaseNav').addEventListener('click', (e) => {
  const btn = e.target.closest('.phase-btn');
  if (!btn) return;
  loadPhase(parseInt(btn.dataset.phase));
});

// Load phase 1 on start
loadPhase(1);

console.log('🗺️ GeoExplorer Uganda — All 6 Phases Loaded');
