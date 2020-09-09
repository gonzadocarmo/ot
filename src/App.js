import React, { createContext } from "react";
import "./App.css";
import { CharactersList } from "./CharactersList";

let myCache = {};
const addToCache = ({ id, value }) => (myCache[id] = value);

export const CacheContext = createContext([myCache, addToCache]);

export default function App() {
  return (
    <div className="App">
      <CacheContext.Provider value={[myCache, addToCache]}>
        <CharactersList />
      </CacheContext.Provider>
    </div>
  );
}
