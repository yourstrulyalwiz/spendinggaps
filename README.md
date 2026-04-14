Map rendering — react-simple-maps
The entire map lives in artifacts/water-sector/src/pages/SpendingGapsSection.tsx. This is where ComposableMap, Geographies, Geography, and Annotation are imported from react-simple-maps. All region colors, spending data, the overlay card, and the interactive logic are in this one file.

Geographic data — artifacts/water-sector/public/

countries-regions.geojson — the file actually used by the map; 258 world countries, 113 of which have a region field that drives the coloring
wb-regions.geojson and world-land.geojson — earlier versions kept for reference
Styling — src/index.css
All the design tokens are defined here — colors like --econ-red and --econ-dark-blue, the fonts (Playfair Display, Nunito), and the Economist-style rule classes. If you want to change the visual theme, this is your first stop.

Entry point — src/App.tsx
Minimal — just renders SpendingGapsSection inside a container. If you wanted to add new sections back (like the budget chart), this is where you'd add them.

UI components — src/components/ui/
Pre-built Radix UI components (buttons, cards, dialogs, etc.). These aren't actively used in the current build but are available if you want to extend the app.
