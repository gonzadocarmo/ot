import React, { useEffect, useState, useContext } from "react";
import { CacheContext } from "./App";

export const PersonComponent = ({ name, birth_year, vehicles = [] }) => (
  <div className="person">
    <div className="image" />
    <div>{name}</div>
    <div className="details">
      <div>
        <span>BIRTH YEAR</span>
        <br />
        <span className="data">{birth_year}</span>
      </div>
      <div>
        <span>VECHICLES</span>
        <br />
        <span className="data">
          {vehicles &&
            vehicles.map((ve, idx) => <div key={idx}>{ve.name}</div>)}

          {vehicles.length === 0 && "No vehicles found!"}
        </span>
      </div>
    </div>
  </div>
);

export const Person = ({ data }) => {
  const DEFAULT_VEHICLES = [];
  const [cache, addToCache] = useContext(CacheContext);
  const [vehicles, setVehicles] = useState(DEFAULT_VEHICLES);

  const getVehicleID = (url) => parseInt(url.substr(-3).substr(0, 2));

  useEffect(() => {
    const getData = async () => {
      if (!data.vehicles || data.vehicles.length === 0) return;

      let urlsToFetch = [];
      let idsToLookUpInCache = [];

      const urls = data.vehicles && data.vehicles;
      // http://swapi.dev/api/vehicles/14/

      urls.map((url) => {
        const vechicledID = getVehicleID(url);
        const isVehicleInCache = typeof cache[vechicledID] !== "undefined";

        if (isVehicleInCache) {
          idsToLookUpInCache.push(vechicledID);
        } else {
          urlsToFetch.push(url);
        }
      });

      if (urlsToFetch.length === 0) {
        // all in cache
        setVehicles(idsToLookUpInCache.map((id) => cache[id]));
      } else {
        // some in cache & some not
        const promises = urlsToFetch.map((url) =>
          fetch(url)
            .then((r) => r.json())
            .then((data) => {
              const vehicledID = getVehicleID(url);
              addToCache({ id: vehicledID, value: data });
              return data;
            })
        );

        const allVehiclesFromHTTPCalls = await Promise.all(promises).then(
          (responses) => responses
        );

        let valuesToReturn = allVehiclesFromHTTPCalls;
        idsToLookUpInCache.map((id) => valuesToReturn.push(cache[id]));
        setVehicles(valuesToReturn);
      }
    };

    getData();
  }, [data.vehicles]);

  const { birth_year, name } = data;

  return (
    <PersonComponent birth_year={birth_year} name={name} vehicles={vehicles} />
  );
};
