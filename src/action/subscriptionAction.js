import * as TYPE from '../reducers/subscriptionReducer'
import * as Service from '../services/subscription'

export const setPro = isPro => async dispatch => {
  dispatch({ type: TYPE.CHANGE_PRO, data: isPro })
}

export const retrieveProState = (user_id) => async dispatch => {
  const {subscribed} = await Service.retrieveProState(user_id)
  dispatch(setPro(subscribed))
}

export const subscribe = (user_id, name) => async dispatch => {
  await Service.subscribe(user_id, name)
  dispatch(setPro(true))
}