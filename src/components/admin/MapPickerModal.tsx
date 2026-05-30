"use client";
import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

setOptions({
  key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  v: "weekly",
});

const DEFAULT_CENTER = { lat: 25.2048, lng: 55.2708 }; // Dubai

interface MapPickerModalProps {
  open: boolean;
  onClose: () => void;
  initialLat?: number | null;
  initialLng?: number | null;
  onConfirm: (lat: number, lng: number) => void;
}

export function MapPickerModal({
  open,
  onClose,
  initialLat,
  initialLng,
  onConfirm,
}: MapPickerModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const center =
      initialLat != null && initialLng != null
        ? { lat: initialLat, lng: initialLng }
        : DEFAULT_CENTER;

    setCoords(center);
    setMapLoading(true);

    let cancelled = false;

    async function initMap() {
      const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
      const { Marker } = await importLibrary("marker") as google.maps.MarkerLibrary;
      const { Geocoder } = await importLibrary("geocoding") as google.maps.GeocodingLibrary;

      if (cancelled || !mapRef.current) return;

      const map = new Map(mapRef.current, {
        center,
        zoom: initialLat != null ? 16 : 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControlOptions: { position: 7 /* RIGHT_CENTER */ },
      });

      const marker = new Marker({
        position: center,
        map,
        draggable: true,
        animation: 2 /* DROP */,
        title: "Drag to adjust",
      });

      const geocoder = new Geocoder();

      markerRef.current = marker;
      mapInstanceRef.current = map;
      geocoderRef.current = geocoder;

      function reverseGeocode(latLng: google.maps.LatLng) {
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            setAddress(results[0].formatted_address);
          } else {
            setAddress("");
          }
        });
      }

      function updatePin(latLng: google.maps.LatLng) {
        setCoords({ lat: latLng.lat(), lng: latLng.lng() });
        reverseGeocode(latLng);
      }

      reverseGeocode(new google.maps.LatLng(center.lat, center.lng));

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) updatePin(pos);
      });

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          marker.setPosition(e.latLng);
          updatePin(e.latLng);
        }
      });

      setMapLoading(false);
    }

    initMap();

    return () => {
      cancelled = true;
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
      geocoderRef.current = null;
    };
  }, [open]);

  function handleMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setCenter(latLng);
        mapInstanceRef.current.setZoom(16);
        markerRef.current.setPosition(latLng);
        setCoords({ lat: latLng.lat(), lng: latLng.lng() });
        geocoderRef.current?.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results?.[0]) setAddress(results[0].formatted_address);
        });
      }
    });
  }

  function handleConfirm() {
    if (coords) {
      onConfirm(coords.lat, coords.lng);
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Pick Location on Map" className="max-w-2xl">
      <p className="text-sm text-slate-500 mb-3">
        Click anywhere on the map or drag the pin to set the merchant's exact location.
      </p>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200">
        <div ref={mapRef} className="w-full h-[420px] bg-slate-100" />

        {mapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading map…
            </div>
          </div>
        )}

        {!mapLoading && (
          <button
            onClick={handleMyLocation}
            className="absolute bottom-4 right-4 bg-white shadow-md rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 border border-slate-200 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-500" />
            My location
          </button>
        )}
      </div>

      {/* Coords + address */}
      {coords && !mapLoading && (
        <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="font-mono text-sm font-semibold text-indigo-700">
              {coords.lat.toFixed(6)},&nbsp;{coords.lng.toFixed(6)}
            </span>
          </div>
          {address && (
            <p className="text-xs text-slate-500 pl-6 leading-snug">{address}</p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={!coords || mapLoading}>
          <MapPin className="w-4 h-4" />
          Confirm Location
        </Button>
      </div>
    </Modal>
  );
}
