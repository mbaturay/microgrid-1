'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { RefreshCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Project } from '@/app/data/mockData';
import { STAGES, getStageTheme } from '@/app/lib/stageStyles';

interface PortfolioMapProps {
  projects: Project[];
  selectedProjectId?: string | null;
  hoveredProjectId?: string | null;
  onSelectProject: (projectId: string) => void;
  onHoverProject: (projectId: string | null) => void;
  onHoverSourceChange: (source: 'map' | 'list' | null) => void;
}

const DEFAULT_ZOOM = 5;
const MAX_AUTO_ZOOM = 6;

function EnableScrollOnClick({
  onEnable,
}: {
  onEnable: () => void;
}) {
  useMapEvent('click', () => {
    onEnable();
  });

  return null;
}

const legendStages = STAGES.filter((stage) => stage !== 'All');

export default function PortfolioMap({
  projects,
  selectedProjectId,
  hoveredProjectId,
  onSelectProject,
  onHoverProject,
  onHoverSourceChange,
}: PortfolioMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const initialFitDoneRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [isScrollZoomEnabled, setIsScrollZoomEnabled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const latestHoverRef = useRef<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const displayPositions = useMemo(() => {
    if (!projects.length) {
      return new Map<string, { latitude: number; longitude: number }>();
    }

    const groups = new Map<string, Project[]>();
    projects.forEach((project) => {
      const key = `${project.latitude.toFixed(5)},${project.longitude.toFixed(5)}`;
      const existing = groups.get(key);
      if (existing) {
        existing.push(project);
      } else {
        groups.set(key, [project]);
      }
    });

    const positions = new Map<string, { latitude: number; longitude: number }>();
    groups.forEach((group) => {
      if (group.length === 1) {
        const [project] = group;
        positions.set(project.id, { latitude: project.latitude, longitude: project.longitude });
        return;
      }

      const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id));
      const radius = 0.02;
      sorted.forEach((project, index) => {
        const angle = (2 * Math.PI * index) / sorted.length;
        positions.set(project.id, {
          latitude: project.latitude + Math.sin(angle) * radius,
          longitude: project.longitude + Math.cos(angle) * radius,
        });
      });
    });

    return positions;
  }, [projects]);
  const bounds = useMemo(() => {
    if (!projects.length) {
      return null;
    }

    return L.latLngBounds(projects.map((project) => [project.latitude, project.longitude]));
  }, [projects]);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  const fitAllProjects = (markInitial = false) => {
    if (!mapRef.current || !bounds) {
      return;
    }

    mapRef.current.invalidateSize();
    window.setTimeout(() => {
      if (!mapRef.current || !bounds) {
        return;
      }

      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      const zoom = mapRef.current.getZoom();
      if (zoom > MAX_AUTO_ZOOM) {
        mapRef.current.setZoom(MAX_AUTO_ZOOM);
      }

      if (markInitial) {
        initialFitDoneRef.current = true;
      }
    }, 1000);
  };

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const visibleProjects = projects;
    if (visibleProjects.length === 0) {
      return;
    }

    const map = mapRef.current;
    if (visibleProjects.length === 1) {
      const project = visibleProjects[0];
      if (prefersReducedMotion) {
        map.setView([project.latitude, project.longitude], DEFAULT_ZOOM, { animate: false });
      } else {
        map.flyTo([project.latitude, project.longitude], DEFAULT_ZOOM, { duration: 0.25 });
      }
      return;
    }

    const bounds = L.latLngBounds(visibleProjects.map((project) => [project.latitude, project.longitude]));
    if (prefersReducedMotion) {
      map.fitBounds(bounds, { padding: [40, 40], animate: false });
    } else {
      map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 0.25 });
    }

    const zoom = map.getZoom();
    if (zoom > MAX_AUTO_ZOOM) {
      map.setZoom(MAX_AUTO_ZOOM);
    }
  }, [projects, prefersReducedMotion]);

  useEffect(() => {
    if (!mapReady || !bounds || initialFitDoneRef.current) {
      return;
    }

    fitAllProjects(true);
  }, [bounds, mapReady]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setHasInteracted(window.sessionStorage.getItem('portfolioMapInteracted') === 'true');
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (isScrollZoomEnabled) {
      mapRef.current.scrollWheelZoom.enable();
    } else {
      mapRef.current.scrollWheelZoom.disable();
    }
  }, [isScrollZoomEnabled]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg portfolio-map">
      <div className="absolute left-3 top-3 z-[500] rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
        <div className="text-[11px] font-semibold text-gray-500 mb-2">Stages</div>
        <div className="space-y-1">
          {legendStages.map((stage) => {
            const theme = getStageTheme(stage);
            return (
              <div key={stage} className="flex items-center gap-2 text-gray-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: theme.dotColor }}
                />
                <span>{theme.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="absolute right-3 top-3 z-[500] inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-600 shadow-sm transition hover:text-[#03454D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#03454D]"
        onClick={() => fitAllProjects()}
        aria-label="Reset view"
      >
        <RefreshCcw className="h-4 w-4" />
      </button>
      <MapContainer
        className="h-full w-full"
        scrollWheelZoom={isScrollZoomEnabled}
        zoomControl={false}
        center={[39.5, -98.35]}
        zoom={DEFAULT_ZOOM}
        wheelPxPerZoomLevel={140}
        ref={mapRef}
        whenReady={() => {
          setMapReady(true);
          if (!initialFitDoneRef.current) {
            fitAllProjects(true);
          }

          // Fallback re-fit once tiles/layout settle
          window.setTimeout(() => {
            if (!mapRef.current || !bounds) {
              return;
            }
            fitAllProjects(initialFitDoneRef.current ? false : true);
          }, 1500);

          if (!isScrollZoomEnabled && mapRef.current) {
            mapRef.current.scrollWheelZoom.disable();
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <EnableScrollOnClick
          onEnable={() => {
            if (!isScrollZoomEnabled) {
              setIsScrollZoomEnabled(true);
            }
            if (!hasInteracted) {
              setHasInteracted(true);
              if (typeof window !== 'undefined') {
                window.sessionStorage.setItem('portfolioMapInteracted', 'true');
              }
            }
          }}
        />
        {projects.map((project) => {
          const displayPosition = displayPositions.get(project.id) ?? {
            latitude: project.latitude,
            longitude: project.longitude,
          };
          const isSelected = project.id === selectedProjectId;
          const isHovered = project.id === hoveredProjectId;
          const isActive = isSelected || isHovered;
          const theme = getStageTheme(project.stage);
          const color = theme.dotColor;
          const radius = isSelected ? 11 : isHovered ? 9 : 8;
          const weight = isSelected ? 4 : isHovered ? 3 : 2;
          const fillOpacity = isSelected ? 1 : isHovered ? 0.95 : 0.8;

          return (
            <CircleMarker
              key={project.id}
              center={[displayPosition.latitude, displayPosition.longitude]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity,
                weight,
                className: isHovered && !isSelected ? 'portfolio-map__marker-hover' : '',
              }}
              eventHandlers={{
                click: () => onSelectProject(project.id),
                mouseover: () => {
                  latestHoverRef.current = project.id;
                  onHoverSourceChange('map');
                  if (hoverTimeoutRef.current) {
                    window.clearTimeout(hoverTimeoutRef.current);
                  }
                  hoverTimeoutRef.current = window.setTimeout(() => {
                    onHoverProject(latestHoverRef.current);
                  }, 100);
                },
                mouseout: () => {
                  latestHoverRef.current = null;
                  onHoverSourceChange(null);
                  if (hoverTimeoutRef.current) {
                    window.clearTimeout(hoverTimeoutRef.current);
                  }
                  hoverTimeoutRef.current = window.setTimeout(() => {
                    onHoverProject(null);
                  }, 100);
                },
              }}
            />
          );
        })}
      </MapContainer>
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/85 px-4 py-2 text-xs font-medium text-gray-600 shadow-sm backdrop-blur">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px]">
                ⇵
              </span>
              Click map, then scroll to zoom
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
