import React, { Fragment, useEffect, useState, useContext } from "react";
import { CacheContext } from "./App";

//TODO: isolate component & container
export const CharactersList = () => {
  const DEFAULT_PEOPLE = [];
  const [results, setResults] = useState(DEFAULT_PEOPLE);
  const [results2, setResults2] = useState(DEFAULT_PEOPLE);

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("https://swapi.dev/api/people/")
      .then((r) => r.json())
      .then((data) => setResults(data.results));
  }, []);

  // this is just to validate http calls for cached objects are not executed
  // see "FETCH NEXT PAGE RESULTS" button below
  const fetchMore = () => {
    fetch(`https://swapi.dev/api/people?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        console.log("page", page, "results", data.results);
        setResults2(data.results);
        setPage(page + 1);
      });
  };

  return (
    <Fragment>
      <div className="grid">
        {results && results.map((e, idx) => <Person key={idx} data={e} />)}
      </div>
      <div>
        <button onClick={fetchMore}>FETCH NEXT PAGE RESULTS</button>
      </div>

      {/* When clicking this button for first time, it'll query api, page1. At this point, http calls for vechicles are not made since they're in cache*/}
      {/* When clicking this button 3 more times (page4), result "0" ("Qui-Gon Jinn") has vehicle id 38. This http is not made since it's in cache already.*/}
      {/* CSS for section below was NOT done */}
      {results2 &&
        results2.map((e, idx) => <Person key={`r2-${idx}`} data={e} />)}
    </Fragment>
  );
};

// TODO: move to separate file
// isolate component & container
const Person = ({ data }) => {
  const DEFAULT_VEHICLES = [];
  const [cache, addToCache] = useContext(CacheContext);
  const [vehicles, setVehicles] = useState(DEFAULT_VEHICLES);

  // TODO:  could be memoized
  const getVehicleID = (url) => parseInt(url.substr(-3).substr(0, 2));

  useEffect(() => {
    console.info({ cache });
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

  return (
    <div className="person">
      <div className="image" />
      <div>{data.name}</div>
      <div className="details">
        <div>
          <span>BIRTH YEAR</span>
          <br />
          <span className="data">{data.birth_year}</span>
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
};
