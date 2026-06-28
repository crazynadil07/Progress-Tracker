// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadAllData, saveData } from './storage';

const AppContext = createContext(null);

const initialState = {
  notes: [],
  ielts: [],
  books: [],
  sleep: [],
  workouts: [],
  events: [],
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_ALL':
      return { ...state, ...action.payload, loaded: true };

    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return { ...state, notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n) };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };

    case 'ADD_IELTS':
      return { ...state, ielts: [...state.ielts, action.payload] };
    case 'DELETE_IELTS':
      return { ...state, ielts: state.ielts.filter(s => s.id !== action.payload) };

    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    case 'UPDATE_BOOK':
      return { ...state, books: state.books.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BOOK':
      return { ...state, books: state.books.filter(b => b.id !== action.payload) };

    case 'ADD_SLEEP':
      return { ...state, sleep: [...state.sleep, action.payload] };
    case 'DELETE_SLEEP':
      return { ...state, sleep: state.sleep.filter(s => s.id !== action.payload) };

    case 'ADD_WORKOUT':
      return { ...state, workouts: [...state.workouts, action.payload] };
    case 'DELETE_WORKOUT':
      return { ...state, workouts: state.workouts.filter(w => w.id !== action.payload) };

    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.payload) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadAllData().then(data => dispatch({ type: 'LOAD_ALL', payload: data }));
  }, []);

  // Auto-save on state changes
  useEffect(() => {
    if (!state.loaded) return;
    saveData('NOTES', state.notes);
  }, [state.notes]);

  useEffect(() => {
    if (!state.loaded) return;
    saveData('IELTS', state.ielts);
  }, [state.ielts]);

  useEffect(() => {
    if (!state.loaded) return;
    saveData('BOOKS', state.books);
  }, [state.books]);

  useEffect(() => {
    if (!state.loaded) return;
    saveData('SLEEP', state.sleep);
  }, [state.sleep]);

  useEffect(() => {
    if (!state.loaded) return;
    saveData('WORKOUTS', state.workouts);
  }, [state.workouts]);

  useEffect(() => {
    if (!state.loaded) return;
    saveData('EVENTS', state.events);
  }, [state.events]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}