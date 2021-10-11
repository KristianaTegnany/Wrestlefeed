import { combineReducers } from 'redux';
import swipeReducer from './swipeReducer';
import tabReducer from './tabReducer';
import userReducer from './userReducer';
import adsReducer from './adsReducer';

export default combineReducers({
  setting: userReducer,
  tab: tabReducer,
  swipe: swipeReducer,
  ads: adsReducer
});
