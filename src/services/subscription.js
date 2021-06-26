import Axios from 'axios'

export const retrieveProState = async (user_id) => {
  const res = await Axios.get(`https://devapp.wwfoldschool.com/wrestler/api/issubscribed?user_id=${user_id}`)
  return res.data
}

export const unsubscribe = async (user_id) => {
  const res = await Axios.get(`https://devapp.wwfoldschool.com/wrestler/api/cancelsubscription?user_id=${user_id}`)
  return res.data
}

export const subscribe = async (user_id, name) => {
  const res = await Axios.post(
    'https://devapp.wwfoldschool.com/wrestler/api/subscribe',
    { user_id, name }
  )
}