'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Project } from '@/app/data/mockData';

interface PortfolioMapProps {
  projects: Project[];
  selectedProjectId?: string | null;
  onSelectProject: (projectId: string) => void;
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

export default function PortfolioMap({ projects, selectedProjectId, onSelectProject }: PortfolioMapProps) {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-lg">
      <MapContainer
        className="h-full w-full"
        scrollWheelZoom={false}
        zoomControl={true}
        center={[39.5, -98.35]}
        zoom={4}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds projects={projects} />
        {projects.map((project) => {
          const isSelected = project.id === selectedProjectId;
          const color = isSelected ? 'var(--ef-jade)' : '#0f766e';
          const radius = isSelected ? 12 : 8;

          return (
            <CircleMarker
              key={project.id}
              center={[project.latitude, project.longitude]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectProject(project.id),
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
