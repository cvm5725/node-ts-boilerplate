const requestLogger = require("correlation-logger"); 

import { API } from './api';
const middleware = require('./utils/middleware');

import userRouter from "./services/user/routes"
import checkRouter from "./services/check/routes"

// middleware utils import
requestLogger(API)
API.use(middleware.errorTimeLog);
API.use(middleware.requestTimeLog);
API.use(middleware.executionTimeLog);


API.use('/check', checkRouter)
API.use('/user', userRouter)
