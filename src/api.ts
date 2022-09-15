import {promisify} from 'util'

import express, { Request, Response } from 'express'
import cors from 'cors'
import { createPool, Pool } from 'mysql'

import { API_PORT, CORS_ALLOWED_ORIGINS, dbs } from '../configs.json'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

export type FortifiedRequest = Request & {
  metadata: {
    incomingQuery: Record<string,any>
  },
  start: Date
}

export const databases: Record<string,Pool> = {}

export const API = express()
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
      console.log(`Checking database ${key}`)
      console.log(await database.query(`select now();`))
      databases[`${key}`] = database
    } catch ({message}) {
      console.log(`DBERROR: ${message}`)
      process.exit(1)
    }
  }))
  API.listen(API_PORT, () => console.log(`API listening on http://localhost:${API_PORT}`))
})()

