import React, { useEffect, useRef, useState } from "react";
import MapView from "./MapView2"; //  map component
import { Link } from "react-router-dom";
import hospitalIcon from "../icons/hospital.svg"; //  hospital icon
import calculateDistance from "./calculateDistance";
import handleCenterMap from "./CenterMap";

const HospitalsMap = ({ userLocation }) => {
  const mapViewRef = useRef(); // Create a reference for the map
  const [hospitals, setHospitals] = useState([]);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; //  API key

  const backend = import.meta.env.DEV
    ? import.meta.env.VITE_BACKEND_DEV
    : import.meta.env.VITE_BACKEND_PROD;



  useEffect(() => {
    const fetchHospitals = async () => {
      if (userLocation) {
        const { lat, lng } = userLocation;

        try {
          const response = await fetch(
            `${backend}/api/hospitals?lat=${lat}&lng=${lng}` // Update API endpoint for hospitals
          );

          const data = await response.json();

          if (response.ok) {
            const hospitalsWithDistance = data.results.map((hospital) => ({
              ...hospital,
              distance: calculateDistance(
                lat,
                lng,
                hospital.geometry.location.lat, // Assuming this is how the hospital location is structured
                hospital.geometry.location.lng
              ), // Assuming the hospital object has a geometry property with location
            }));

            // Sort hospitals by distance
            hospitalsWithDistance.sort((a, b) => a.distance - b.distance);

            setHospitals(hospitalsWithDistance);
          } else {
            console.error("Error fetching hospitals:", data);
          }
        } catch (error) {
          console.error("Fetch error:", error);
        }
      } else {
        console.warn("User location is not available.");
      }
    };

    fetchHospitals();
  }, [userLocation]);

  

  return (
    <div className="bg-gray-800 p-4 min-h-screen flex flex-col items-center">
      <Link to="/medical-locations">
        <button className="bg-blue-500 hover:bg-blue-700 text-white py-4 px-2 rounded">
          Medical Locations
        </button>
      </Link>
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent drop-shadow-lg leading-normal">
        Nearby Hospitals
      </h1>
      <MapView ref={mapViewRef} locations={hospitals} icon={hospitalIcon}/> {/* Pass the ref */}
      <button
        className="bg-gray-700 text-white w-auto p-2 rounded-lg mt-4"

        onClick={()=>{
          handleCenterMap(mapViewRef)}} // Add onClick handler

      >
        Zoom in
      </button>
      {/* Render the list of hospitals */}
      <ul className="mt-4 w-full max-w-lg bg-white rounded-lg shadow-lg p-4">
        {hospitals.map((hospital) => (
          <li
            key={hospital.id} // Assuming hospital object has an id property
            className="p-4 border-b border-gray-300 last:border-b-0 transition-all hover:bg-gray-100 rounded-lg mb-2"
          >
            <h2 className="font-bold text-lg">{hospital.name}</h2>{" "}
            {/* Assuming hospital object has a name property */}
            <p className="text-gray-600 text-sm">
              Distance: {hospital.distance.toFixed(2)} km
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HospitalsMap;
