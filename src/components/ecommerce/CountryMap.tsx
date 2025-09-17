// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// const VectorMap = dynamic(
//   () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
//   { ssr: false }
// );

// interface CountryMapProps {
//   mapColor?: string;
// }

// type MarkerStyle = {
//   initial: {
//     fill: string;
//     r: number;
//   };
// };

// type Marker = {
//   latLng: [number, number];
//   name: string;
//   style?: {
//     fill: string;
//     borderWidth: number;
//     borderColor: string;
//   };
// };

// type CountryData = {
//   country: string;
//   code: string; // ISO Alpha-2 or Alpha-3 code
//   lat: number;
//   lng: number;
//   coaches: number;
//   players: number;
//   customers: number;
// };

// const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
//   const [markers, setMarkers] = useState<Marker[]>([]);
//   const [countryInfo, setCountryInfo] = useState<Record<string, CountryData>>({});
//   const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchCountryData = async () => {
//       try {
//         const res = await fetch("/api/countries"); 
//         const data: CountryData[] = await res.json();

//         // Store country info for tooltip
//         const infoMap: Record<string, CountryData> = {};
//         data.forEach((c) => {
//           infoMap[c.code] = c;
//         });
//         setCountryInfo(infoMap);

//         // Map API response to markers
//         const newMarkers: Marker[] = data.map((country) => ({
//           latLng: [country.lat, country.lng],
//           name: country.country,
//           style: {
//             fill: "#465FFF",
//             borderWidth: 1,
//             borderColor: "white",
//           },
//         }));
//         setMarkers(newMarkers);

//         // Pre-select first active country (with data > 0)
//         const firstActive = data.find((c) => c.coaches > 0 || c.players > 0);
//         if (firstActive) {
//           setSelectedRegions([firstActive.code]); // ✅ highlight by default
//         }
//       } catch (err) {
//         console.error("Failed to fetch country data:", err);
//       }
//     };

//     fetchCountryData();
//   }, []);

//   return (
//     <VectorMap
//       map={require("@react-jvectormap/world").worldMill}
//       backgroundColor="transparent"
//       markerStyle={{ initial: { fill: "#465FFF", r: 4 } } as MarkerStyle}
//       markers={markers}
//       zoomOnScroll={false}
//       zoomMax={12}
//       zoomMin={1}
//       zoomAnimate={true}
//       zoomStep={1.5}
//       regionStyle={{
//         initial: {
//           fill: mapColor || "#D0D5DD",
//           fillOpacity: 1,
//           fontFamily: "Outfit",
//           stroke: "none",
//           strokeWidth: 0,
//           strokeOpacity: 0,
//         },
//         hover: { fillOpacity: 0.7, cursor: "pointer", fill: "#465fff", stroke: "none" },
//         selected: { fill: "#465FFF" },
//       }}
//       series={{
//         regions: [
//           {
//             values: Object.fromEntries(
//               Object.entries(countryInfo).map(([code, c]) => [
//                 code,
//                 c.coaches > 0 || c.players > 0 ? 1 : 0, // numbers only
//               ])
//             ),
//             scale: [mapColor || "#D0D5DD", "#465FFF"], // 0=grey, 1=blue
//             attribute: "fill",
//           },
//         ],
//       }}
//       selectedRegions={selectedRegions}
//       regionLabelStyle={{
//         initial: { fill: "#35373e", fontWeight: 500, fontSize: "13px", stroke: "none" },
//       }}
//       // Show custom tooltip on hover
//       onRegionTipShow={(e: any, el: any, code: string) => {
//         const country = countryInfo[code];
//         if (country) {
//           el.html(
//             `${country.country} <br/>
//              Customers: ${country.customers} <br/>
//              Coaches: ${country.coaches} <br/>
//              Players: ${country.players}`
//           );
//         }
//       }}
//     />
//   );
// };

// export default CountryMap;



"use client";
import { worldMill } from "@react-jvectormap/world";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

interface CountryMapProps {
  mapColor?: string;
}

type MarkerStyle = {
  initial: {
    fill: string;
    r: number;
  };
};

type Marker = {
  latLng: [number, number];
  name: string;
  style?: {
    fill: string;
    borderWidth: number;
    borderColor: string;
  };
};

type CountryData = {
  country: string;
  code: string; // ISO Alpha-2 or Alpha-3 code
  lat: number;
  lng: number;
  coaches: number;
  players: number;
  customers: number;
};

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [countryInfo, setCountryInfo] = useState<Record<string, CountryData>>({});
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const res = await fetch("/api/countries");
        const data: CountryData[] = await res.json();

        // Store country info for tooltip
        const infoMap: Record<string, CountryData> = {};
        data.forEach((c) => {
          infoMap[c.code] = c;
        });
        setCountryInfo(infoMap);

        // Find first active country (with coaches or players)
        const firstActive = data.find((c) => c.coaches > 0 || c.players > 0);
        if (firstActive) {
          setSelectedRegions([firstActive.code]);

          // ✅ Only add blue marker for the active country
          setMarkers([
            {
              latLng: [firstActive.lat, firstActive.lng],
              name: `${firstActive.country} (Active)`,
              style: {
                fill: "blue",
                borderWidth: 2,
                borderColor: "white",
              },
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch country data:", err);
      }
    };

    fetchCountryData();
  }, []);

  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markerStyle={{ initial: { fill: "blue", r: 6 } } as MarkerStyle} // bigger, blue dot
      markers={markers}
      zoomOnScroll={false}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      regionStyle={{
        initial: {
          fill: mapColor || "#D0D5DD",
          fillOpacity: 1,
          fontFamily: "Outfit",
          stroke: "none",
          strokeWidth: 0,
          strokeOpacity: 0,
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: "#465fff",
          stroke: "none",
        },
        selected: { fill: "#465FFF" },
      }}
      series={{
        regions: [
          {
            values: Object.fromEntries(
              Object.entries(countryInfo).map(([code, c]) => [
                code,
                c.coaches > 0 || c.players > 0 ? 1 : 0,
              ])
            ),
            scale: [mapColor || "#D0D5DD", "#465FFF"], // 0 = grey, 1 = blue
            attribute: "fill",
          },
        ],
      }}

      selectedRegions={selectedRegions}
      regionLabelStyle={{
        initial: {
          fill: "#35373e",
          fontWeight: 500,
          fontSize: "13px",
          stroke: "none",
        },
      }}
      // Custom tooltip
  onRegionTipShow={(event: unknown, el: unknown, code: string) => {
  const country = countryInfo[code];
  if (country && el instanceof HTMLElement) {
    // Use native innerHTML
    el.innerHTML = `
      ${country.country} <br/>
      Customers: ${country.customers} <br/>
      Coaches: ${country.coaches} <br/>
      Players: ${country.players}
    `;
  }
}}



    />
  );
};

export default CountryMap;
