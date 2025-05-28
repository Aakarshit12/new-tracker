import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// Fix for Leaflet marker icons in Next.js
const deliveryIcon = new L.Icon({
  iconUrl: '/delivery-marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const destinationIcon = new L.Icon({
  iconUrl: '/destination-marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Default icons fallback
const defaultDeliveryIcon = new L.Icon.Default();
const defaultDestinationIcon = new L.Icon.Default();

// Center map on specific coordinates component
const CenterMap = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [map, position]);
  
  return null;
};

interface MapComponentProps {
  deliveryLocation?: [number, number];
  destinationLocation?: [number, number];
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  deliveryLocation,
  destinationLocation = [40.7128, -74.006], // Default to NYC
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(destinationLocation);
  
  // Update map center when delivery location changes
  useEffect(() => {
    if (deliveryLocation) {
      setMapCenter(deliveryLocation);
    } else {
      setMapCenter(destinationLocation);
    }
  }, [deliveryLocation, destinationLocation]);

  // Handle marker icon errors
  const handleDeliveryIconError = () => {
    return defaultDeliveryIcon;
  };

  const handleDestinationIconError = () => {
    return defaultDestinationIcon;
  };
  
  return (
    <MapContainer 
      center={mapCenter} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Destination Marker */}
      <Marker 
        position={destinationLocation}
        icon={destinationIcon}
        eventHandlers={{
          error: handleDestinationIconError
        }}
      >
        <Popup>
          <div>
            <h3 className="font-medium">Destination</h3>
            <p>Delivery destination</p>
          </div>
        </Popup>
      </Marker>
      
      {/* Delivery Partner Marker */}
      {deliveryLocation && (
        <Marker 
          position={deliveryLocation} 
          icon={deliveryIcon}
          eventHandlers={{
            error: handleDeliveryIconError
          }}
        >
          <Popup>
            <div>
              <h3 className="font-medium">Delivery Partner</h3>
              <p>Currently en route to your location</p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Center map on delivery partner location */}
      <CenterMap position={mapCenter} />
    </MapContainer>
  );
};

export default MapComponent;
