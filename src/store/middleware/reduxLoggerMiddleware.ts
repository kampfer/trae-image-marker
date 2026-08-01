import type { Middleware } from '@reduxjs/toolkit';

type ReduxAction = {
  type: string;
  [key: string]: unknown;
};

const isReduxAction = (action: unknown): action is ReduxAction => {
  return typeof action === 'object' && action !== null && 'type' in action;
};

const reduxLoggerMiddleware: Middleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV !== 'development') {
    return next(action);
  }

  const previousState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  if (previousState !== nextState && isReduxAction(action)) {
    console.groupCollapsed(`[Redux] ${action.type}`);
    console.log('Action:', action);
    console.log('Previous state:', previousState);
    console.log('Next state:', nextState);
    console.groupEnd();
  }

  return result;
};

export default reduxLoggerMiddleware;
