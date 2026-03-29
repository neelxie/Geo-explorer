# 🗺️ GeoExplorer Uganda

An interactive GIS learning project built with [Leaflet.js](https://leafletjs.com/), centered on Uganda.
Six progressive phases each teach a core Leaflet/GIS concept — all in a single deployable app.

## 🚀 Live Demo

> Add your Vercel URL here after deployment

## 📚 What Each Phase Teaches

| Phase | Concept | What's on the map |
|-------|---------|-------------------|
| 1 | Map init, tile layers, events | Uganda base map + tile switcher |
| 2 | Markers, popups, tooltips, divIcon | 6 Kampala POIs with custom icons |
| 3 | GeoJSON layers, feature styling, hover | Uganda's 4 regions as polygons |
| 4 | Layer groups, L.control.layers | All layers + built-in toggle UI |
| 5 | Choropleth, data-driven color, legend | Regions shaded by population density |
| 6 | Geocoding, geolocation, click events | Full interactive map |

## 🛠️ Tech Stack

- **[Leaflet.js 1.9.4](https://leafletjs.com/)** — open-source interactive maps
- **[Leaflet Control Geocoder](https://github.com/perliedman/leaflet-control-geocoder)** — geocoding plugin
- **[Nominatim](https://nominatim.org/)** — OpenStreetMap geocoding API (free, no key needed)
- **[ESRI / Stadia / OpenTopoMap](https://leaflet-extras.github.io/leaflet-providers/preview/)** — tile providers
- **Vanilla HTML/CSS/JS** — no framework, maximum learning clarity

## 📁 Project Structure

```
geoexplorer-uganda/
├── index.html       # App shell — loads Leaflet, fonts, scripts
├── style.css        # All styles for UI + Leaflet overrides
├── js/
│   └── main.js      # All 6 phases of Leaflet logic (heavily commented)
└── README.md
```

## 🏃 Running Locally

**Recommended: VS Code Live Server**
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → **Open with Live Server**

**Alternative: Node.js**
```bash
npx serve .
# then open http://localhost:3000
```

> ⚠️ Always use a local server — never open `index.html` directly as `file://`.
> Tile providers and the Nominatim search API will be blocked by the browser otherwise.

## 🌐 Deploying to Vercel

This is a **static site** — no build step required.

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "feat: GeoExplorer Uganda — all 6 phases"
git remote add origin https://github.com/YOUR_USERNAME/geoexplorer-uganda.git
git push -u origin main

# 2. Import on Vercel
# → vercel.com → New Project → Import from GitHub
# → Leave all build settings blank
# → Click Deploy ✅
```

## 📖 Leaflet API Quick Reference

```js
// Core
L.map('id').setView([lat, lng], zoom)
L.tileLayer(url, { attribution, maxZoom }).addTo(map)
map.on('event', handler)          // click, mousemove, zoomend, locationfound…

// Markers
L.marker([lat, lng]).addTo(map)
L.circleMarker([lat, lng], { radius, fillColor }).addTo(map)
L.divIcon({ html, iconSize, iconAnchor })   // custom HTML icon

// Popups & Tooltips
marker.bindPopup('<b>HTML</b>')
marker.bindTooltip('Hover text')
L.popup().setLatLng(latlng).setContent('...').openOn(map)

// GeoJSON
L.geoJSON(data, { style, onEachFeature }).addTo(map)

// Layer management
L.layerGroup([...]).addTo(map)
L.control.layers(baseLayers, overlays).addTo(map)

// Navigation
map.flyTo([lat, lng], zoom)
map.flyToBounds(bounds)

// Geolocation
map.locate({ setView: true, maxZoom: 14 })
map.on('locationfound', e => { /* e.latlng, e.accuracy */ })
```

## 🗺️ Data Sources

- Region boundaries: Simplified from Natural Earth / GADM (illustrative, not exact)
- City data: Approximate population figures from public sources
- Geocoding: OpenStreetMap Nominatim (free, no API key required)
- Tile layers: OpenStreetMap, OpenTopoMap, ESRI World Imagery, Stadia Maps

---

Built as a Leaflet GIS learning project • Kampala, Uganda 🇺🇬
