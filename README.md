# BTE Coordinate Converter

Eine React-Webanwendung zur Konvertierung zwischen Real-Life-Koordinaten und Minecraft-Koordinaten für Build The Earth (BTE) Projekte.

## Features

- 🌍 **Real-Life zu Minecraft**: Konvertiere GPS-Koordinaten (Breitengrad/Längengrad) zu Minecraft-Koordinaten
- 🎮 **Minecraft zu Real-Life**: Konvertiere Minecraft-Koordinaten zurück zu GPS-Koordinaten
- 📁 **Region-Datei Berechnung**: Zeigt die entsprechende Minecraft Region-Datei (.mca) an
- 🗺️ **Interaktive Karte**: Klicke auf die Karte, um Koordinaten auszuwählen
- 📱 **Responsive Design**: Funktioniert auf Desktop und mobilen Geräten

## Technologie

- **React** - UI Framework
- **Vite** - Build Tool
- **@bte-germany/terraconvert** - Koordinaten-Konvertierung
- **Leaflet** - Interaktive Karten
- **GitHub Pages** - Deployment

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

Öffne [http://localhost:5173](http://localhost:5173) in deinem Browser.

## Build

```bash
npm run build
```

## Deployment

Die Anwendung wird automatisch über GitHub Actions auf GitHub Pages deployed, wenn Änderungen auf den `main` Branch gepusht werden.

## Verwendung

1. Wähle den Konvertierungsmodus (Real → Minecraft oder Minecraft → Real)
2. Gib die Koordinaten ein oder klicke auf die Karte
3. Klicke auf "Konvertieren"
4. Sieh dir die Ergebnisse und die Region-Datei an

## Beispiele

**Berlin (Brandenburger Tor)**
- Breitengrad: 52.516275
- Längengrad: 13.377704
- Minecraft X: ~3788400
- Minecraft Z: ~-5235000

## Lizenz

MIT

