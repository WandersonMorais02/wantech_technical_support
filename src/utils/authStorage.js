import Cookies from 'js-cookie'

const TOKEN_KEY = 'wantech_token'
const USER_KEY = 'wantech_user'

export const authStorage = {
  getToken() {
    return Cookies.get(TOKEN_KEY)
  },

  setToken(token) {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7,
      secure: true,
      sameSite: 'Strict',
    })
  },

  removeToken() {
    Cookies.remove(TOKEN_KEY)
  },

  getUser() {
    const user = Cookies.get(USER_KEY)

    return user ? JSON.parse(user) : null
  },

  setUser(user) {
    Cookies.set(USER_KEY, JSON.stringify(user), {
      expires: 7,
      secure: true,
      sameSite: 'Strict',
    })
  },

  removeUser() {
    Cookies.remove(USER_KEY)
  },

  clear() {
    this.removeToken()
    this.removeUser()
  },
}
