import { createContext, useContext as useReactContext } from 'react';

const context = createContext({});

export const { Provider, Consumer } = context;

export const useContext = () => {
  return useReactContext(context);
};
