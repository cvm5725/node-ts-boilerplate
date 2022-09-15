import { API } from './api'
import userRouter from "./user/routes"

API.use('/user', userRouter)
