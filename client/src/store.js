import {applyMiddleware} from 'redux';
import { legacy_createStore as createStore } from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialstate={};

const middleware=[thunk]

const store=createStore(rootReducer,initialstate,composeWithDevTools(applyMiddleware(...middleware)))

export default store;