import React from 'react';
import { Provider, connect } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import AppBase from './src/AppBase';
import reducers from './src/reducers';

const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));
function App() {
  return (
    <Provider store={store}>
      <AppBase />
    </Provider>
  );
};

export default App;
