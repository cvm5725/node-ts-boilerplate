import { API } from './api'
import userRouter from "./services/user/routes"
import checkRouter from "./services/check/routes"

API.use('/check', checkRouter)
API.use('/user', userRouter)
