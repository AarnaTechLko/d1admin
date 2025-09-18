"use client";

import { worldMill } from "@react-jvectormap/world";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
// import { IFocus } from "@react-jvectormap/core";

type JVectorElement = {
  html: (content: string) => void;
};
const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

interface CountryMapProps {
  mapColor?: string;
}

type Marker = {
  latLng: [number, number];
  name: string;
};

type CountryData = {
  country: string;
  shortname: string;
  lat: number | null;
  lng: number | null;
  coaches: number;
  players: number;
  customers: number;
};

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [countryInfo, setCountryInfo] = useState<Record<string, CountryData>>({});
  /* const [focus, setFocus] = useState<IFocus | undefined>(undefined); */

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const res = await fetch("/api/countries");
        const data: CountryData[] = await res.json();

        if (!Array.isArray(data)) return;

        const infoMap: Record<string, CountryData> = {};
        const markerList: Marker[] = [];
        console.log("data", data);
        data.forEach((c) => {
          if (!c.shortname) return;
          const shortname = c.shortname.toUpperCase();
          infoMap[shortname] = c;

          if (typeof c.lat === "number" && typeof c.lng === "number" && (c.coaches > 0 || c.players > 0)) {
            markerList.push({
              latLng: [Number(c.lat), Number(c.lng)],
              name: c.country,
            });
          }
        });

        setCountryInfo(infoMap);
        setMarkers(markerList);

        // ✅ Auto-center logic
        if (markerList.length > 0) {
          // const lats = markerList.map((m) => m.latLng[0]);
          // const lngs = markerList.map((m) => m.latLng[1]);

       
          /* setFocus({
            scale: 2,
            latLng: [(minLat + maxLat) / 2, (minLng + maxLng) / 2],
            x: 0, // default to 0
            y: 0, // default to 0
          });
 */

        }
      } catch (err) {
        console.error(err);
        setMarkers([]);
        setCountryInfo({});
      }
    };

    fetchCountryData();
  }, []);

  return (
    <div className="w-full h-[350px] mx-auto m-20">
      <VectorMap
        key={markers.length} // reinit on markers change
        map={worldMill}
        backgroundColor="transparent"
        markers={markers}
        markersSelectable={true}
        markerStyle={{
          initial: { fill: "#465FFF", stroke: "#fff" },
          hover: { fill: "#1E40FF", stroke: "#fff" },
          selected: { fill: "#FF0000", stroke: "#fff" },
        }}
        zoomOnScroll={false}
        zoomAnimate={true}
        regionStyle={{
          initial: {
            fill: mapColor || "#D0D5DD",
            fillOpacity: 1,
            stroke: "none",
          },
          hover: { fillOpacity: 0.7, cursor: "pointer", fill: "#465FFF", stroke: "none" },
          selected: { fill: "#465FFF" },
        }}
        series={{
          regions: [
            {
              values: Object.fromEntries(
                Object.entries(countryInfo).map(([shortname, c]) => [
                  shortname,
                  c.coaches + c.players > 0 ? 1 : 0,
                ])
              ),
              scale: [mapColor || "#D0D5DD", "#465FFF"],
              attribute: "fill",
            },
          ],
        }}
     /*   focusOn={focus||undefined} */
        onRegionTipShow={(_e, el, shortname) => {
          const country = countryInfo[shortname.toUpperCase()];
          if (country) {
            (el as unknown as JVectorElement).html(`
              <strong>${country.country}</strong><br/>
              Coaches: ${country.coaches}<br/>
              Players: ${country.players}
            `);
          }
        }}
        onMarkerTipShow={(_e, el, index: string) => {
          const markerIndex = parseInt(index, 10);
          const marker = markers[markerIndex];
          if (!marker) return;

          const country = Object.values(countryInfo).find((c) => c.country === marker.name);
          if (country) {
            (el as unknown as JVectorElement).html(
              `${country.country} ( Coaches:${country.coaches}, Players:${country.players})`
            );
          }
        }}
      />
    </div>
  );
};

export default CountryMap;
