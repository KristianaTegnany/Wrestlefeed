import Axios from 'axios'
import config from '../config'

export const retrieveProState = async (user_id) => {
  const res = await Axios.get(`${config.wrestler_api}/api/issubscribed?user_id=${user_id}`)
  return res.data
}

export const unsubscribe = async (user_id) => {
  const res = await Axios.get(`${config.wrestler_api}/api/cancelsubscription?user_id=${user_id}`)
  return res.data
}

export const subscribe = async (user_id, name) => {
  const res = await Axios.post(
    `${config.wrestler_api}/api/subscribe`,
    { user_id, name }
  )
}