export type UserLoginRequest = {
    email: string,
    password: string
}

export type UserRegisterRequest = {
    name: string
    email: string
    password: string
    image?: string
    phone: string
}