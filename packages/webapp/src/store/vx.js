import { createStore } from "vuex";
import { v4 as uuid } from "uuid";
import parse from "url-parse";
import { API } from "../helpers/api";
import { initializeState } from "@bwi/shared/utils";
// eslint-disable-next-line no-unused-vars
import { stateTypes, amountPerFaculty } from "@bwi/shared/constants";
import { generateDays, generateEntries } from "../helpers";

// to fetch different stores
// eslint-disable-next-line no-unused-vars
const getStoreType = () => {
  const query = parse(window.location.href, true);
  if (!query.st || !stateTypes[query.st]) return null;
  return query.st;
};

export const storeObject = {
  state: initializeState({}),
  mutations: {
    setYear: (state, payload) => {
      let year = parseFloat(payload.year);
      if (!year) return null;
      state.currentYear = year;
    },
    setMonth: (state, payload) => {
      let month = parseFloat(payload.month);
      if (!month) return null;
      state.currentMonth = month;
    },
    setAvailableDays: (state, payload) => {
      const from = parseFloat(payload.from) || state.availableDayFrom;
      const to = parseFloat(payload.to) || state.availableDayTo;
      if (from < to && from > state.currentDay && to > state.currentDay) {
        state.availableDayFrom = from;
        state.availableDayTo = to;
      }
    },
    addEntry: (state, payload) => {
      const { entry } = payload;
      if (!entry.id) {
        entry.id = uuid();
        state.entries = [
          ...state.entries.filter((e) => entry.id !== e.id),
          entry,
        ];
      }
      state.entries.find((e) => e.id === entry.id).counter += 1;

      state.delayedEntriesTimes.push(entry.time);

      // Delay appearing of entry again, if there's multiple users can book it
      setTimeout(() => {
        state.delayedEntriesTimes = state.delayedEntriesTimes.filter(
          (i) => i.time === entry.time
        );
      }, state.delayTime);
    },
    addCleanEntry: (state, payload) => {
      const { entry } = payload;
      if (!entry.id) return null;
      state.entries = [
        ...state.entries.filter((e) => entry.id !== e.id),
        entry,
      ];
    },
    incrementEntry: (state, payload) => {
      const { entryId } = payload;
      state.entries.find((e) => e.id === entryId).counter += 1;
    },
    setInput: (state, payload) => {
      console.log(state.input);
      let { key, value } = payload;
      switch (key) {
        case "phone": {
          if (value.length < 4) {
            state.input[key] = "+380";
          }
          break;
        }
        case "fullName": {
          state.input[key] = value;
          break;
        }
        default:
          return null;
      }
    },
  },
  actions: {
    initEntry: async (ctx) => {
      let flag = false;
      if (flag) return null;
      const response = await API.get("/entry");
      const { data: entries } = response;
      console.log(entries);
      const filtered = [];
      for (let idx in entries) {
        // entries[idx].date = DateTime.fromISO(data.date).toFormat('DD-MM-YYYY');
        if (!entries[idx].time) continue;
        filtered.push(entries[idx]);
      }
      filtered.forEach((entry) => {
        ctx.commit("addCleanEntry", { entry });
      });
    },
    addEntry: async (ctx, payload) => {
      const entry = payload.entry;
      console.log(entry);
      // entry.name = payload.fullName;
      // entry.phone = payload.phone;
      await API.post("/entry", entry);
      ctx.commit("addEntry", { entry });
    },
  },
  getters: {
    getBookingMaxPerEntry: ({ bookingMaxPerEntry }) => bookingMaxPerEntry,
    getDays: (state) => {
      return generateDays({
        year: state.currentYear,
        month: state.currentMonth,
        constraintsDayFrom: state.availableDayFrom,
        constraintsDayTo: state.availableDayTo,
      });
    },
    getEntries: (state) => (date) =>
      generateEntries(
        state.entries,
        date,
        state.timeRange,
        state.bookingMaxPerEntry,
        state.delayedEntriesTimes
      ),
    getEntry: (state) => (id) => state.entries[id],
    getYear: ({ currentYear }) => currentYear,
    getMonth: ({ currentMonth }) => currentMonth,
    getAvailableDayFrom: ({ availableDayFrom }) => availableDayFrom,
    getAvailableDayTo: ({ availableDayTo }) => availableDayTo,
    getAcceptableYears: ({ acceptableYears }) => acceptableYears,
    getAcceptableMonths: ({ acceptableMonths }) => acceptableMonths,
    getDaysInCurrentMonth: ({ daysInCurrentMonth }) => daysInCurrentMonth,
    getInput:
      ({ input }) =>
      (key) =>
        input[key],
  },
  modules: {},
};

// store.dispatch('initEntry');

export default createStore(storeObject);
