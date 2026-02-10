import { useState } from 'react'
import { fromGeo, toGeo } from '@bte-germany/terraconvert'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import './App.css'
import 'leaflet/dist/leaflet.css'

function LocationMarker({ position, setPosition, onPositionChange }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng]
      setPosition(newPos)
      onPositionChange(newPos)
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        Lat: {position[0].toFixed(6)}<br />
        Lon: {position[1].toFixed(6)}
      </Popup>
    </Marker>
  )
}

function App() {
  // State for conversion mode
  const [mode, setMode] = useState('geoToMC') // 'geoToMC' or 'mcToGeo'
  
  // State for Geo coordinates
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  
  // State for Minecraft coordinates
  const [mcX, setMcX] = useState('')
  const [mcZ, setMcZ] = useState('')
  
  // State for results
  const [result, setResult] = useState(null)
  
  // State for map
  const [mapPosition, setMapPosition] = useState([51.1657, 10.4515]) // Center of Germany

  const handleMapClick = (position) => {
    setLatitude(position[0].toFixed(6))
    setLongitude(position[1].toFixed(6))
  }

  const convertGeoToMC = () => {
    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)
    
    if (isNaN(lat) || isNaN(lon)) {
      alert('Bitte gültige Koordinaten eingeben')
      return
    }
    
    const [x, z] = fromGeo(lat, lon)
    const regionX = Math.floor(x / 512)
    const regionZ = Math.floor(z / 512)
    
    setResult({
      mcX: Math.round(x),
      mcZ: Math.round(z),
      regionFile: `r.${regionX}.${regionZ}.mca`
    })
    
    // Update map position
    setMapPosition([lat, lon])
  }
  
  const convertMCToGeo = () => {
    const x = parseFloat(mcX)
    const z = parseFloat(mcZ)
    
    if (isNaN(x) || isNaN(z)) {
      alert('Bitte gültige Minecraft-Koordinaten eingeben')
      return
    }
    
    const [lat, lon] = toGeo(x, z)
    const regionX = Math.floor(x / 512)
    const regionZ = Math.floor(z / 512)
    
    setResult({
      latitude: lat.toFixed(6),
      longitude: lon.toFixed(6),
      regionFile: `r.${regionX}.${regionZ}.mca`
    })
    
    // Update map position
    setMapPosition([lat, lon])
  }

  return (
    <div className="app-container">
      <header>
        <h1>🌍 BTE Koordinaten Konverter</h1>
        <p>Konvertiere zwischen Real-Life und Minecraft Koordinaten</p>
      </header>

      <div className="converter-section">
        <div className="mode-selector">
          <button 
            className={mode === 'geoToMC' ? 'active' : ''}
            onClick={() => {
              setMode('geoToMC')
              setResult(null)
            }}
          >
            Real → Minecraft
          </button>
          <button 
            className={mode === 'mcToGeo' ? 'active' : ''}
            onClick={() => {
              setMode('mcToGeo')
              setResult(null)
            }}
          >
            Minecraft → Real
          </button>
        </div>

        {mode === 'geoToMC' ? (
          <div className="input-section">
            <h2>Real-Life Koordinaten</h2>
            <div className="input-group">
              <label>
                Breitengrad (Latitude):
                <input 
                  type="number" 
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="z.B. 52.520008"
                />
              </label>
              <label>
                Längengrad (Longitude):
                <input 
                  type="number" 
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="z.B. 13.404954"
                />
              </label>
            </div>
            <button className="convert-btn" onClick={convertGeoToMC}>
              Konvertieren
            </button>
            
            {result && (
              <div className="result">
                <h3>Minecraft Koordinaten:</h3>
                <p><strong>X:</strong> {result.mcX}</p>
                <p><strong>Z:</strong> {result.mcZ}</p>
                <p><strong>Region-Datei:</strong> {result.regionFile}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="input-section">
            <h2>Minecraft Koordinaten</h2>
            <div className="input-group">
              <label>
                X-Koordinate:
                <input 
                  type="number" 
                  step="any"
                  value={mcX}
                  onChange={(e) => setMcX(e.target.value)}
                  placeholder="z.B. 3788273"
                />
              </label>
              <label>
                Z-Koordinate:
                <input 
                  type="number" 
                  step="any"
                  value={mcZ}
                  onChange={(e) => setMcZ(e.target.value)}
                  placeholder="z.B. -5234896"
                />
              </label>
            </div>
            <button className="convert-btn" onClick={convertMCToGeo}>
              Konvertieren
            </button>
            
            {result && (
              <div className="result">
                <h3>Real-Life Koordinaten:</h3>
                <p><strong>Breitengrad:</strong> {result.latitude}</p>
                <p><strong>Längengrad:</strong> {result.longitude}</p>
                <p><strong>Region-Datei:</strong> {result.regionFile}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="map-section">
        <h2>Karte</h2>
        <p className="map-hint">Klicke auf die Karte, um Koordinaten auszuwählen</p>
        <MapContainer 
          center={mapPosition} 
          zoom={6} 
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={mapPosition} 
            setPosition={setMapPosition}
            onPositionChange={handleMapClick}
          />
        </MapContainer>
      </div>

      <footer>
        <p>Verwendet <a href="https://www.npmjs.com/package/@bte-germany/terraconvert" target="_blank">@bte-germany/terraconvert</a></p>
      </footer>
    </div>
  )
}

export default App
