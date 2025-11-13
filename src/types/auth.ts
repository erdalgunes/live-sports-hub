import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser extends User {}

export interface AuthSession extends Session {}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<{ error?: string }>
  resetPassword: (email: string) => Promise<{ error?: string }>
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthError {
  message: string
  code?: string
}