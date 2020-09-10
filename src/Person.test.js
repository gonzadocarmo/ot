import React from "react";
import {
  screen,
  render,
  waitForElementToBeRemoved
} from "@testing-library/react";
import { PersonComponent, Person } from "./Person";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { CacheContext } from "./App";

describe("PersonComponent", () => {
  beforeEach(() => {
    render(<PersonComponent name="some name" birth_year={"feb rr"} />);
  });
  it("should display person name", () => {
    screen.getByText("some name");
  });
  it("should display person birthday", () => {
    screen.getByText("feb rr");
  });
  it('should display "No vehicles found!', () => {
    screen.getByText("No vehicles found!");
  });
  it("should display vehicles' list when present", () => {
    render(
      <PersonComponent
        name="some name"
        birth_year={"feb rr"}
        vehicles={[{ name: "one 1" }, { name: "three 3" }, { name: "five 5" }]}
      />
    );
    screen.getByText("one 1");
    screen.getByText("three 3");
    screen.getByText("five 5");
  });
});

describe("Person", () => {
  const fakeDataVehicleOne = { id: 10, name: "vehicle number one" };
  const fakeDataVehicleTwo = { id: 20, name: "vehicle number two" };
  const server = setupServer(
    rest.get("http://localhost:7777/api/vehicles/10/", (req, res, ctx) => {
      return res(ctx.json(fakeDataVehicleOne));
    }),
    rest.get("http://localhost:7777/api/vehicles/20/", (req, res, ctx) => {
      return res(ctx.json(fakeDataVehicleTwo));
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });
  afterAll(() => server.close());

  describe("when no vehicles", () => {
    const data = {
      name: "some name",
      birth_year: "feb rr"
    };
    it("should not make any http call", () => {
      const initialValue = { 99: {} };
      const addToCacheFn = jest.fn();
      render(
        <CacheContext.Provider value={[initialValue, addToCacheFn]}>
          <Person data={data} />
        </CacheContext.Provider>
      );
      expect(initialValue).toEqual({ 99: {} });
      expect(addToCacheFn).not.toHaveBeenCalled();
    });
  });

  describe("when vehicles", () => {
    const addToCacheFn = jest.fn();
    const data = {
      name: "some name",
      birth_year: "feb rr",
      vehicles: [
        "http://localhost:7777/api/vehicles/10/",
        "http://localhost:7777/api/vehicles/20/"
      ]
    };

    describe("when empty cache", () => {
      beforeEach(async () => {
        const initialValue = { 99: {} };

        render(
          <CacheContext.Provider value={[initialValue, addToCacheFn]}>
            <Person data={data} />
          </CacheContext.Provider>
        );

        await waitForElementToBeRemoved(() =>
          screen.getByText("No vehicles found!")
        );
      });
      it("should call add to cache with response from 2 http calls", () => {
        expect(addToCacheFn).toHaveBeenCalledTimes(2);
        expect(addToCacheFn).toHaveBeenCalledWith({
          id: 10,
          value: fakeDataVehicleOne
        });
        expect(addToCacheFn).toHaveBeenCalledWith({
          id: 20,
          value: fakeDataVehicleTwo
        });
      });
      it("should display all vehicle names", () => {
        screen.getByText("vehicle number one");
        screen.getByText("vehicle number two");
      });
    });

    describe("when not empty cache", () => {
      beforeEach(async () => {
        const initialValue = { 10: { id: 10, name: "vehicle number one" } };

        render(
          <CacheContext.Provider value={[initialValue, addToCacheFn]}>
            <Person data={data} />
          </CacheContext.Provider>
        );

        await waitForElementToBeRemoved(() =>
          screen.getByText("No vehicles found!")
        );
      });
      it("should call add to cache ONCE with response from 1 http call", () => {
        expect(addToCacheFn).toHaveBeenCalledTimes(1);
        expect(addToCacheFn).toHaveBeenCalledWith({
          id: 20,
          value: fakeDataVehicleTwo
        });
      });
      it("should display ALL vehicle names", () => {
        screen.getByText("vehicle number one");
        screen.getByText("vehicle number two");
      });
    });
  });
});
