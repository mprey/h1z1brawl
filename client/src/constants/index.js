export const AUTH_USER_LOAD_REQUEST     = Symbol('AUTH_USER_LOAD_REQUEST')
export const AUTH_USER_LOAD_SUCCESS     = Symbol('AUTH_USER_LOAD_SUCCESS')
export const AUTH_USER_LOAD_FAILURE     = Symbol('AUTH_USER_LOAD_FAILURE')
export const AUTH_USER_LOGOUT           = Symbol('AUTH_USER_LOGOUT')
export const AUTH_USER_RELOAD           = Symbol('AUTH_USER_RELOAD')

export * from './coinflip'
export * from './user'
export * from './jackpot'
export * from './history'
export * from './admin'
export * from './bot'

export const ranks = {
  NORMAL: 0,
  MOD: 1,
  ADMIN: 2,
  DEVELOPER: 3,
  0: 'normal',
  1: 'mod',
  2: 'admin',
  3: 'developer'
}
