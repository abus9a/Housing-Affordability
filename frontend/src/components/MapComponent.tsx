"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { District } from "@/lib/types";

const RISK_COLORS = {
  safe: "#22C55E",
  moderate: "#F59E0B",
  dangerous: "#EF4444",
};

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface Props {
  districts: District[];
  selectedDistrict: District | null;
  onDistrictSelect: (d: District) => void;
  center: [number, number];
  zoom: number;
}

export default function MapComponent({ districts, selectedDistrict, onDistrictSelect, center, zoom }: Props) {
  const mapRef = useRef(null);

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <RecenterMap center={center} zoom={zoom} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {districts.map((district) => {
        const isSelected = selectedDistrict?.id === district.id;
        const color = RISK_COLORS[district.risk_level];
        return (
          <CircleMarker
            key={district.id}
            center={[district.lat, district.lng]}
            radius={isSelected ? 22 : 16}
            fillColor={color}
            color={isSelected ? "#FFFFFF" : color}
            weight={isSelected ? 3 : 1.5}
            fillOpacity={isSelected ? 1 : 0.75}
            eventHandlers={{ click: () => onDistrictSelect(district) }}
          >
            <Popup>
              <div className="text-sm font-medium" style={{ color: "#F8FAFC", minWidth: 160 }}>
                <div className="font-bold mb-1" style={{ fontSize: 14 }}>{district.name}</div>
                <div style={{ color: "#94A3B8", fontSize: 12 }}>
                  Rent 1BR: <span style={{ color: color }}>{district.avg_rent_1br.toLocaleString()} KZT</span>
                </div>
                <div style={{ color: "#94A3B8", fontSize: 12 }}>
                  Avg salary: {district.avg_salary.toLocaleString()} KZT
                </div>
                <div style={{ color: "#94A3B8", fontSize: 12 }}>
                  Ratio: <span style={{ color: color, fontWeight: 700 }}>{(district.affordability_ratio * 100).toFixed(1)}%</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
