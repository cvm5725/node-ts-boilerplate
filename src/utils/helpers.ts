import { Request } from 'express'
import { readFile } from 'fs/promises'
import { realpathSync } from 'fs'
import axios from 'axios';
import * as crypto from "crypto"
import moment from 'moment'

const DEFAULT_QUERY_LIMIT = 10
const MAX_QUERY_LIMIT = 100
const DEFAULT_OFFSET = 0


export const JWT_SECRET_STRING = "xoxo_dashboard"
export const MAX_AGE = 3 * 24 * 60 * 60;

export function sanitizeRequest(req: Request): Record<string,any> {
  const { query, params, body } = req
  let {limit, offset} = query as Record<string,any>
  const warnings:string[] = []
  if (!limit) {
    warnings.push(`No query limit provided. Returning ${DEFAULT_QUERY_LIMIT} entries`)
    limit = DEFAULT_QUERY_LIMIT
  }
  limit = Number(limit)
  if (limit <= 0) {
    warnings.push(`Query limit less than 0 provided. Returning ${DEFAULT_QUERY_LIMIT} entries`)
    limit = DEFAULT_QUERY_LIMIT
  }
  if (isNaN(limit)) {
    warnings.push(`Non-numeric limit provided. Returning ${DEFAULT_QUERY_LIMIT} entries`)
    limit = DEFAULT_QUERY_LIMIT
  }
  if (limit > MAX_QUERY_LIMIT) {
    warnings.push(`Limit can be a maximum of ${MAX_QUERY_LIMIT}. Got ${query.limit}. Returning ${MAX_QUERY_LIMIT} entries`)
    limit = MAX_QUERY_LIMIT
  }
  if (!offset) {
    warnings.push(`No offset provided. Using ${DEFAULT_OFFSET} as offset.`)
    offset = DEFAULT_OFFSET
  }
  offset = Number(offset)
  if (isNaN(offset)) {
    warnings.push(`Non-numeric offset provided. Returning ${DEFAULT_OFFSET} entries`)
    limit = DEFAULT_OFFSET
  }
  if (offset < 1) {
    warnings.push(`Offset < 1 provided. Using ${DEFAULT_OFFSET} as offset.`)
    offset = DEFAULT_OFFSET
  }
  (req as unknown as any).start = new Date()
  return {
    incomingData: {...body, ...params, ...query, limit, offset},
    warnings
  }
}

export const SERVICE_ROOT = realpathSync(__dirname + '../../../')

export async function loadQueryFile(path:string) {
  return (await readFile(path)).toString().replace('\\n', ' ')
}

export function encryptPassword(password : string){
  return crypto.createHash('sha256').update(password as string).digest('base64');
}

// to  call external api calls
export const makeApiCall = async (url : string,method : string,payload = {},headers = {} ) => {
  const  data = JSON.stringify({...payload});
  const config = {
    method: method,
    url: url,
    headers: { 
      'Content-Type': 'application/json'
    },
    data : data
  };
  return await axios(config)
}

// to check valid dates
export const isValidDate = (dateLabel : string, DATE_FORMAT : string = "YYYY-MM-DD") : boolean =>{
  return moment(dateLabel,DATE_FORMAT,true).isValid();
}
