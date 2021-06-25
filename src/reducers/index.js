import { combineReducers } from 'redux';
import swipeReducer from './swipeReducer';
import tabReducer from './tabReducer';
import userReducer from './userReducer';
import subscriptionReducer from './subscriptionReducer';

export default combineReducers({
  setting: userReducer,
  tab: tabReducer,
  swipe: swipeReducer,
  subs: subscriptionReducer
});
