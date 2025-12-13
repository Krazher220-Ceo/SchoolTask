import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    parliamentMember?: any
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      parliamentMember?: any
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    parliamentMember?: any
  }
}


