import {promisify} from 'util'

import express, { Request, Response, Application } from 'express'
import cors from 'cors'
import { createPool, Pool } from 'mysql'

import { API_PORT, CORS_ALLOWED_ORIGINS, dbs } from '../configs.json'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'


import logger from './utils/logger'

export type FortifiedRequest = Request & {
  metadata: {
    incomingQuery: Record<string,any>
  },
  start: Date
}

export const databases: Record<string,Pool> = {}

export const API : Application = express()
API.use(cors({
  origin: (CORS_ALLOWED_ORIGINS || ['*']).join(',')
}))
API.use(bodyParser.urlencoded({ extended: false }));
API.use(bodyParser.json());
API.use(cookieParser());



(async () => {
  await Promise.all(Object.entries(dbs).map(async ([key, dbConfig]) => {
    const database = createPool(dbConfig)
    database.query = promisify(database.query).bind(database) as any
    try {
      logger.info(`Checking database ${key}`)
      logger.info("checking db query",await database.query(`select now();`))
      databases[`${key}`] = database
    } catch ({message}) {
      logger.error(`DBERROR: ${message}`)
      process.exit(1)
    }
  }))
  API.listen(API_PORT, () => console.log(`API listening on http://localhost:${API_PORT}`))
})()

