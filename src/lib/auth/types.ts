export type User = {
  name: string
  npm: string
  miles: number
}

export type AuthState = {
  user: User | null
}
