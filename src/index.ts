import { API } from './api'
import userRouter from "./user/routes"
import checkRouter from "./check/routes"

API.use('/check', checkRouter)
API.use('/user', userRouter)
