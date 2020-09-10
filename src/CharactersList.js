import React, { Fragment, useEffect, useState } from "react";
import { Person } from "./Person";

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
