import axios from 'axios'
import { getAuth } from 'firebase/auth'

export async function authorizedRequest(config) {
  const user = getAuth().currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    }
  }
  return axios(config)
}
