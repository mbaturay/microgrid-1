'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RefreshCcw } from 'lucide-react';
import type { Project } from '@/app/data/mockData';

interface PortfolioMapProps {
  projects: Project[];
  selectedProjectId?: string | null;
  hoveredProjectId?: string | null;
  onSelectProject: (projectId: string) => void;
  onHoverProject: (projectId: string | null) => void;
}

function FitBounds({ projects }: { projects: Project[] }) {
  const map = useMap();
  const bounds = useMemo(() => {
    if (!projects.length) {
      return null;
    }

    return L.latLngBounds(projects.map((project) => [project.latitude, project.longitude]));
  }, [projects]);

  useEffect(() => {
    if (!bounds) {
      return;
    }

    map.fitBounds(bounds, { padding: [40, 40] });
  }, [bounds, map]);

  return null;
}

const legendStages = [
  { label: 'Proposed', color: 'bg-gray-300' },
  { label: 'Analysis', color: 'bg-blue-500' },
  { label: 'Green Ink', color: 'bg-[var(--ef-jade)]' },
  { label: 'Construction', color: 'bg-[var(--ef-yellow)]' },
  { label: 'Complete', color: 'bg-green-500' },
];

export default function PortfolioMap({
  projects,
  selectedProjectId,
  hoveredProjectId,
  onSelectProject,
  onHoverProject,
}: PortfolioMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const bounds = useMemo(() => {
    if (!projects.length) {
      return null;
    }

    return L.latLngBounds(projects.map((project) => [project.latitude, project.longitude]));
  }, [projects]);

  useEffect(() => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [bounds]);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <div className="absolute left-3 top-3 z-[500] rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
        <div className="text-[11px] font-semibold text-gray-500 mb-2">Stages</div>
        <div className="space-y-1">
          {legendStages.map((stage) => (
            <div key={stage.label} className="flex items-center gap-2 text-gray-600">
              <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
              <span>{stage.label}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="absolute right-3 top-3 z-[500] inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-600 shadow-sm transition hover:text-[var(--ef-jade)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ef-jade)]"
        onClick={() => {
          if (mapRef.current && bounds) {
            mapRef.current.fitBounds(bounds, { padding: [40, 40] });
          }
        }}
        aria-label="Reset view"
      >
        <RefreshCcw className="h-4 w-4" />
      </button>
      <MapContainer
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={false}
        center={[39.5, -98.35]}
        zoom={4}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds projects={projects} />
        {projects.map((project) => {
          const isSelected = project.id === selectedProjectId;
          const isHovered = project.id === hoveredProjectId;
          const isActive = isSelected || isHovered;
          const color = isSelected ? 'var(--ef-jade)' : isHovered ? 'var(--ef-teal)' : '#0f766e';
          const radius = isSelected ? 12 : isHovered ? 10 : 8;

          return (
            <CircleMarker
              key={project.id}
              center={[project.latitude, project.longitude]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: isActive ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectProject(project.id),
                mouseover: () => onHoverProject(project.id),
                mouseout: () => onHoverProject(null),
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold text-[var(--ef-black)]">{project.name}</div>
                  <div className="text-xs text-gray-500">{project.stage}</div>
                  <div className="text-xs text-gray-600">ROI: {project.roi}%</div>
                  <div className="text-xs text-gray-600">Payback: {project.payback} yrs</div>
                  <div className="text-xs text-gray-600">Capacity: {project.capacity} MW</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
