import React, { useEffect, useRef, useState } from "react";
import MapView from "./MapView2"; // Your map component
import { Link } from "react-router-dom";
import pharmacyIcon from "../icons/pharmacy-pin.svg"; // Your pharmacy icon

const PharmaciesMap = ({ userLocation }) => {
  const mapViewRef = useRef(); // Create a reference for the map
  const [pharmacies, setPharmacies] = useState([]);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Your API key

  const backend = import.meta.env.DEV
    ? import.meta.env.VITE_BACKEND_DEV
    : import.meta.env.VITE_BACKEND_PROD;
    
    console.log("backend", backend);

  useEffect(() => {
    const fetchPharmacies = async () => {
      if (userLocation) {
        const { lat, lng } = userLocation;

        try {
          const response = await fetch(
            `${backend}/api/pharmacies?lat=${lat}&lng=${lng}`
          );

          const data = await response.json();

          if (response.ok) {
            const pharmaciesWithDistance = data.results.map((pharmacy) => ({
              ...pharmacy,
              distance: calculateDistance(
                lat,
                lng,
                pharmacy.geometry.location.lat,
                pharmacy.geometry.location.lng
              ), // Assuming the pharmacy object has a geometry property with location
            }));

            // Sort pharmacies by distance
            pharmaciesWithDistance.sort((a, b) => a.distance - b.distance);

            setPharmacies(pharmaciesWithDistance);
          } else {
            console.error("Error fetching pharmacies:", data);
          }
        } catch (error) {
          console.error("Fetch error:", error);
        }
      } else {
        console.warn("User location is not available.");
      }
    };

    fetchPharmacies();
  }, [userLocation]);

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Function to center the map on a selected pharmacy's location
  const handleCenterMap = (pharmacy) => {
    if (mapViewRef.current) {
      mapViewRef.current.centerMap(); // Pass the location to center the map
    }
  };

  return (
    <div className="bg-gray-800 p-4 min-h-screen flex flex-col items-center">
      <Link to="/medical-locations">
        <button className="bg-blue-500 hover:bg-blue-700 text-white py-4 px-2 rounded">
          Medical Locations
        </button>
      </Link>
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent drop-shadow-lg leading-normal">
        Nearby Pharmacies
      </h1>
      <MapView ref={mapViewRef} locations={pharmacies} icon={pharmacyIcon} /> {/* Pass the ref */}
      <button
        className="bg-gray-700 text-white w-auto p-2 rounded-lg mt-4"
        onClick={() => handleCenterMap(userLocation)} // Center on user location
      >
        Current location
      </button>
      {/* Render the list of pharmacies */}
      <ul className="mt-4 w-full max-w-lg bg-white rounded-lg shadow-lg p-4">
        {pharmacies.map((pharmacy) => (
          <li
            key={pharmacy.id}
            className="p-4 border-b border-gray-300 last:border-b-0 transition-all hover:bg-gray-100 rounded-lg mb-2 cursor-pointer"
            onClick={() => handleCenterMap(pharmacy)} // Center map on click
          >
            <h2 className="font-bold text-lg">{pharmacy.name}</h2>{" "}
            {/* Assuming pharmacy object has a name property */}
            <p className="text-gray-600 text-sm">
              Distance: {pharmacy.distance.toFixed(2)} km
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PharmaciesMap;
