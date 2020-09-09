import React, { Fragment, useEffect, useState, useContext } from "react";
import { CacheContext } from "./App";

export const CharactersList = () => {
  const DEFAULT_PEOPLE = [];
  const [results, setResults] = useState(DEFAULT_PEOPLE);

  useEffect(() => {
    fetch("https://swapi.dev/api/people/")
      .then((r) => r.json())
      .then((data) => setResults(data.results));
  }, []);

  return (
    <Fragment>
      <div className="grid">
        {results &&
          results.map((e, idx) => <div>{<Person key={idx} data={e} />}</div>)}
      </div>
    </Fragment>
  );
};

const Person = ({ data }) => {
  const DEFAULT_VEHICLES = [];
  const [cache, addToCache] = useContext(CacheContext);
  const [vehicles, setVehicles] = useState([DEFAULT_VEHICLES]);

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
        return idsToLookUpInCache.map((id) => cache[id]);
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
  }, []);

  return (
    <div className="person">
      IMAGE HERE
      <div>{data.name}</div>
      <div className="details">
        <div>
          BIRTH YEAR
          <br />
          {data.birth_year}
        </div>
        <div>
          VECHICLES
          <br />
          {vehicles &&
            vehicles.map((ve, idx) => <div key={idx}>{ve.name}</div>)}
          {vehicles.length === 0 && "No vehicles found!"}
        </div>
      </div>
    </div>
  );
};
