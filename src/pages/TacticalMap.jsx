import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, Polygon, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Flame, MapPin, RefreshCw, Filter, ShieldAlert, Layers, Maximize2, Award, ShieldCheck } from 'lucide-react';
import CaseHeader from '../components/CaseHeader';
import { useCase } from '../context/CaseContext';
import { api } from '../api/client';

/* ─────────────────────────────────────────────────────────────
   CHANDIGARH UNION TERRITORY PERIMETER BOUNDARY POLYGON
   Official UT Administrative Border separating Punjab & Haryana
───────────────────────────────────────────────────────────── */
const CHANDIGARH_UT_PERIMETER = [
  [30.7725, 76.7720], // North — Capitol Complex & Sukhna Reserve
  [30.7620, 76.8180], // North-East — IT Park & Kishangarh
  [30.7280, 76.8380], // East — Manimajra / Panchkula Border
  [30.6980, 76.8050], // South-East — Industrial Area Phase I/II
  [30.6820, 76.7600], // South — Sector 48 / Mohali Border
  [30.7080, 76.7220], // South-West — Sector 52 / 56 Mohali Border
  [30.7450, 76.7380], // West — Sector 38 / Dhanas Lake
  [30.7680, 76.7520], // North-West — PGIMER / Sector 12 Border
];

/* Individual Sector & Precinct Boundary Polygons */
const SECTOR_BOUNDARIES = [
  {
    name: 'Sector 17 Precinct (City Centre)',
    polygon: [
      [30.7440, 76.7780], [30.7440, 76.7880], [30.7340, 76.7880], [30.7340, 76.7780]
    ],
    color: '#DC2626',
  },
  {
    name: 'Sector 22-C Precinct (Suspect Hub)',
    polygon: [
      [30.7360, 76.7680], [30.7360, 76.7760], [30.7260, 76.7760], [30.7260, 76.7680]
    ],
    color: '#DC2626',
  },
  {
    name: 'Sector 34-A Precinct (Commercial)',
    polygon: [
      [30.7270, 76.7630], [30.7270, 76.7720], [30.7170, 76.7720], [30.7170, 76.7630]
    ],
    color: '#D97706',
  },
  {
    name: 'Sector 19-B Precinct (Victim Hub)',
    polygon: [
      [30.7350, 76.7840], [30.7350, 76.7920], [30.7250, 76.7920], [30.7250, 76.7840]
    ],
    color: '#16A34A',
  },
  {
    name: 'Mohali Precinct (Phase 7)',
    polygon: [
      [30.7150, 76.7100], [30.7150, 76.7260], [30.6950, 76.7260], [30.6950, 76.7100]
    ],
    color: '#D97706',
  },
  {
    name: 'Panchkula Precinct (Sector 5)',
    polygon: [
      [30.7020, 76.8500], [30.7020, 76.8700], [30.6860, 76.8700], [30.6860, 76.8500]
    ],
    color: '#D97706',
  },
];

const CHANDIGARH_HIERARCHY = {
  "Chandigarh UT Baseline": {
    center: [30.7333, 76.7794],
    zoom: 13,
    sectors: []
  },
  "Sector 17 Precinct (City Centre)": {
    center: [30.7390, 76.7820],
    zoom: 15,
    sectors: [
      { name: "Sec 17 Plaza Sector", coords: [30.7390, 76.7820], zoom: 16, crime: "Phishing Auto-Debit Scam", severity: "high" },
      { name: "Sec 17 Bank Square", coords: [30.7410, 76.7850], zoom: 16, crime: "UPI Redirection Transfer", severity: "high" }
    ]
  },
  "Sector 22-C Precinct (Suspect Hub)": {
    center: [30.7310, 76.7720],
    zoom: 15,
    sectors: [
      { name: "Sec 22-C Market Node", coords: [30.7310, 76.7720], zoom: 16, crime: "Suspect SIM Cell Tower Spike", severity: "high" },
      { name: "Sec 22 Mobile Market", coords: [30.7290, 76.7740], zoom: 16, crime: "Burner SIM Activation", severity: "high" }
    ]
  },
  "Sector 34-A Precinct (Commercial)": {
    center: [30.7220, 76.7680],
    zoom: 15,
    sectors: [
      { name: "Sec 34-A Sub-City Centre", coords: [30.7220, 76.7680], zoom: 16, crime: "Accomplice Wallet Cashout", severity: "medium" },
      { name: "Sec 34 ATM Hub", coords: [30.7240, 76.7660], zoom: 16, crime: "ATM Off-ramp Anomaly", severity: "medium" }
    ]
  },
  "Sector 19-B Precinct (Victim Hub)": {
    center: [30.7300, 76.7880],
    zoom: 15,
    sectors: [
      { name: "Sec 19-B Residential", coords: [30.7300, 76.7880], zoom: 16, crime: "Victim Portal Click Event", severity: "low" }
    ]
  },
  "Mohali (SAS Nagar / Phase 7)": {
    center: [30.7046, 76.7179],
    zoom: 14,
    sectors: [
      { name: "Phase 7 Industrial Area", coords: [30.7046, 76.7179], zoom: 16, crime: "UPI Mandate Impersonation", severity: "high" },
      { name: "Phase 3B2 Sector", coords: [30.7120, 76.7220], zoom: 16, crime: "Crypto Transit Hop-3", severity: "medium" }
    ]
  },
  "Panchkula (Sector 5 Precinct)": {
    center: [30.6942, 76.8606],
    zoom: 14,
    sectors: [
      { name: "Panchkula Sec 5 Hub", coords: [30.6942, 76.8606], zoom: 16, crime: "Crypto Transit Hop-2 Node", severity: "medium" }
    ]
  }
};

const CHANDIGARH_BOUNDS = [
  [30.60, 76.60],
  [30.85, 76.95]
];

function createIncidentMarkerIcon(severity, isSelected) {
  const color = severity === 'high' ? '#DC2626' : severity === 'medium' ? '#D97706' : '#16A34A';
  const size = isSelected ? 18 : 14;
  const haloClass = severity === 'high' ? 'high-severity-pulsing-halo' : '';
  
  return L.divIcon({
    html: `<div class="incident-marker-dot ${haloClass}" style="
      background:${color};
      width:${size}px; height:${size}px;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 0 3px ${color}40, 0 2px 8px rgba(0,0,0,0.35);
      border-radius: 50%;
    "></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapFlyController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && target.coords) {
      map.flyTo(target.coords, target.zoom || 14, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [target, map]);
  return null;
}

export default function TacticalMap() {
  const [searchParams] = useSearchParams();
  const { filters, setFilters } = useCase();

  const selectedDistrictKey = filters.selectedDistrictKey || "Chandigarh UT Baseline";
  const selectedSector = filters.selectedSector || null;
  const mapFlyTarget = filters.mapFlyTarget || { coords: [30.7333, 76.7794], zoom: 13 };

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showBorders, setShowBorders] = useState(true);

  const [backendMapData, setBackendMapData] = useState(null);

  // Sync threat matrix data from backend if available
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await api.maps.getThreatMatrix();
        if (isMounted && res?.data) {
          setBackendMapData(res.data);
          console.debug('[TacticalMap] Live threat matrix synced from backend:', res.data);
        }
      } catch (err) {
        console.warn('[TacticalMap] Threat matrix backend sync deferred:', err.message);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const focusStr = searchParams.get('focus');
    if (latStr && lngStr && focusStr === 'true') {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        // Find matching precinct and sector
        let foundDistrict = "Chandigarh UT Baseline";
        let foundSector = null;
        
        for (const [distKey, distData] of Object.entries(CHANDIGARH_HIERARCHY)) {
          if (distData.sectors) {
            const match = distData.sectors.find(s => 
              Math.abs(s.coords[0] - lat) < 0.001 && Math.abs(s.coords[1] - lng) < 0.001
            );
            if (match) {
              foundDistrict = distKey;
              foundSector = match;
              break;
            }
          }
        }
        
        setFilters({
          selectedDistrictKey: foundDistrict,
          selectedSector: foundSector,
          mapFlyTarget: { coords: [lat, lng], zoom: 16 }
        });
      }
    }
  }, [searchParams, setFilters]);

  const currentDistrictData = CHANDIGARH_HIERARCHY[selectedDistrictKey] || CHANDIGARH_HIERARCHY["Chandigarh UT Baseline"];

  const handleDistrictChange = (key) => {
    const dist = CHANDIGARH_HIERARCHY[key];
    setFilters({
      selectedDistrictKey: key,
      selectedSector: null,
      mapFlyTarget: dist ? { coords: dist.center, zoom: dist.zoom } : { coords: [30.7333, 76.7794], zoom: 13 }
    });
  };

  const handleSectorChange = (sector) => {
    setFilters({
      selectedSector: sector,
      mapFlyTarget: sector && sector.coords ? { coords: sector.coords, zoom: sector.zoom || 16 } : mapFlyTarget
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <CaseHeader moduleName="Geo-Spatial Threat Matrix Dashboard" />

      {/* Sutral Net Control Toolbar */}
      <div className="shrink-0 px-5 py-2.5 flex items-center justify-between border-b flex-wrap gap-2 shadow-sm z-10"
           style={{ backgroundColor: 'var(--bg-workspace)', borderColor: 'var(--border-subtle)' }}>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Reset Baseline View Button */}
          <button
            onClick={() => handleDistrictChange("Chandigarh UT Baseline")}
            className="btn-premium flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            style={{ backgroundColor: 'var(--bg-workspace)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
          >
            <RefreshCw size={13} /> Reset View
          </button>

          {/* Precinct Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs border"
               style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-medium)' }}>
            <Filter size={13} style={{ color: '#DC2626' }} />
            <span className="font-extrabold uppercase text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Region:</span>
            <select
              value={selectedDistrictKey}
              onChange={e => handleDistrictChange(e.target.value)}
              className="bg-transparent outline-none font-bold cursor-pointer transition-colors duration-150 hover:text-red-500"
              style={{ color: 'var(--text-primary)' }}
            >
              {Object.keys(CHANDIGARH_HIERARCHY).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          {/* Small Area Selector */}
          {currentDistrictData.sectors && currentDistrictData.sectors.length > 0 && (
            <div className="flex items-center gap-2 pl-2 text-xs border-l-2"
                 style={{ borderColor: '#DC2626' }}>
              <Layers size={13} style={{ color: '#DC2626' }} />
              <span className="font-extrabold uppercase text-[10px]" style={{ color: '#DC2626' }}>Sector:</span>
              <select
                value={selectedSector ? selectedSector.name : ""}
                onChange={e => {
                  const sec = currentDistrictData.sectors.find(s => s.name === e.target.value);
                  handleSectorChange(sec || null);
                }}
                className="bg-transparent outline-none font-extrabold cursor-pointer transition-colors duration-150 hover:text-red-500"
                style={{ color: 'var(--text-primary)' }}
              >
                <option value="">-- All Local Sectors --</option>
                {currentDistrictData.sectors.map(sec => (
                  <option key={sec.name} value={sec.name}>{sec.name} ({sec.crime})</option>
                ))}
              </select>
            </div>
          )}

          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(h => !h)}
            className="btn-premium flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors duration-150 hover:opacity-90 cursor-pointer"
            style={showHeatmap
              ? { backgroundColor: '#D97706', color: '#FFFFFF', border: 'none' }
              : { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }
            }
          >
            <Flame size={13} /> Heatmap {showHeatmap ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Legend Strip */}
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase flex-wrap" style={{ color: 'var(--text-tertiary)' }}>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block" /> High Threat Area</span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="flex-1 min-h-0 relative w-full h-full">
        
        {/* Top-Right Official Spatial Verification Badge Overlay */}
        <div className="absolute top-4 right-4 z-[400] pointer-events-none flex items-center gap-2.5 px-3.5 py-2 rounded bg-slate-900/95 text-white border border-slate-700 shadow-xl">
          <img
            src="/khakhi_guard_logo.jpg"
            alt="Official Seal"
            className="w-6 h-6 rounded-full object-cover border border-[#F0A91E] shrink-0"
          />
          <div>
            <div className="flex items-center gap-1 text-[#F0A91E] text-[10px] font-extrabold uppercase tracking-wider">
              <Award size={12} /> Chandigarh Police · Geospatial Threat Mapping
            </div>
            <p className="text-[9px] text-slate-400 font-medium">Union Territory Cyber Crime Spatial Coordinates</p>
          </div>
        </div>

        <MapContainer
          center={currentDistrictData.center}
          zoom={currentDistrictData.zoom}
          minZoom={12}
          maxZoom={16}
          maxBounds={CHANDIGARH_BOUNDS}
          maxBoundsViscosity={0.9}
          style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 10 }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapFlyController target={mapFlyTarget} />

          {/* Render Sector Markers */}
          {Object.entries(CHANDIGARH_HIERARCHY).map(([distKey, distData]) => {
            if (distKey === "Chandigarh UT Baseline" || !distData.sectors) return null;

            return distData.sectors.map((sector, i) => {
              const isSelected = selectedSector?.name === sector.name;

              return (
                <React.Fragment key={`${distKey}-${i}`}>
                  {/* Concentric Heatmap Circle */}
                  {showHeatmap && sector.coords && (
                    <Circle
                      center={sector.coords}
                      radius={sector.severity === 'high' ? 500 : 300}
                      pathOptions={{
                        color: sector.severity === 'high' ? '#DC2626' : sector.severity === 'medium' ? '#D97706' : '#16A34A',
                        fillColor: sector.severity === 'high' ? '#DC2626' : sector.severity === 'medium' ? '#D97706' : '#16A34A',
                        fillOpacity: 0.25,
                        weight: 1,
                      }}
                    />
                  )}

                  {/* Incident Marker Pin */}
                  {showMarkers && sector.coords && (
                    <Marker
                      position={sector.coords}
                      icon={createIncidentMarkerIcon(sector.severity, isSelected)}
                      eventHandlers={{
                        click: () => {
                          setFilters({
                            selectedDistrictKey: distKey,
                            selectedSector: sector,
                            mapFlyTarget: sector.coords ? { coords: sector.coords, zoom: 16 } : mapFlyTarget
                          });
                        }
                      }}
                    >
                      <Popup className="tactical-leaflet-popup" closeButton={true}>
                        <div className="font-sans text-xs p-1 select-text" style={{ minWidth: '240px' }}>
                          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
                            <span className="font-mono text-[10px] font-bold text-[#F0A91E] tracking-wider uppercase">
                              {sector.name.includes('Sector 22-C') ? 'CASE KG-2026-0818' : 'INCIDENT COORD'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                                  style={{ color: sector.severity === 'high' ? '#FB7185' : '#FBBF24' }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sector.severity === 'high' ? '#FB7185' : '#FBBF24' }} />
                              {sector.severity === 'high' ? 'Priority 1 (High)' : 'Priority 2 (Standard)'}
                            </span>
                          </div>
                          <p className="font-bold text-sm text-slate-100 mb-0.5">{sector.name}</p>
                          <p className="text-xs text-red-400 font-semibold mb-2.5">{sector.crime}</p>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px] p-2 rounded bg-slate-900/90 border border-slate-700/60 mb-2">
                            <div>
                              <span className="text-slate-400 block">Precinct Division:</span>
                              <span className="text-slate-200 font-medium">{distKey}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Investigation Status:</span>
                              <span className="text-slate-200 font-medium">{sector.severity === 'high' ? 'Active Surveillance' : 'Under Investigation'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 font-mono text-[9px] text-slate-400">
                            <span>LAT: {sector.coords[0].toFixed(4)}° N</span>
                            <span>LNG: {sector.coords[1].toFixed(4)}° E</span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </React.Fragment>
              );
            });
          })}

          {/* Render Live Backend BTS Towers */}
          {showMarkers && backendMapData?.towers?.map((tower, idx) => (
            <Circle
              key={`b-tower-${idx}`}
              center={tower.coords}
              radius={200}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '3, 4'
              }}
            >
              <Popup className="tactical-leaflet-popup">
                <div className="font-sans text-xs p-1">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                    <span className="font-mono text-[10px] text-blue-400 font-bold uppercase">{tower.provider} BTS TOWER</span>
                    <span className="text-[9px] text-emerald-400 font-bold">{tower.activeSignals} active signals</span>
                  </div>
                  <p className="font-bold text-slate-100">{tower.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">LAT: {tower.coords[0]}° N · LNG: {tower.coords[1]}° E</p>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

