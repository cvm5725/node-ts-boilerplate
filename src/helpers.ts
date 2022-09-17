import { Request } from 'express'
import { readFile } from 'fs/promises'
import { realpathSync } from 'fs'
import axios from 'axios';
import * as crypto from "crypto"
import * as  jwt from 'jsonwebtoken'
import moment from 'moment'

const DEFAULT_QUERY_LIMIT = 10
const MAX_QUERY_LIMIT = 100
const DEFAULT_OFFSET = 0
const MAX_USER_SIGNUP_FNAME = 10
const MAX_USER_SIGNUP_MNAME = 10
const MAX_USER_SIGNUP_LNAME = 10
const MAX_USER_SIGNUP_EMAIL = 150
const MAX_USER_SIGNUP_NAME = 100

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

export function  validateSignupData  (req : Request) {
  const { query, params, body } = req
  const {first_name,middle_name = "",last_name,email, password} = query as Record<string,any>
  const passwordRegex : RegExp = new RegExp("^(?!.* )(?=.*[0-9])(?=.{8,})");
  const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if(!first_name){
    return {error : true ,  msg : "First Name is required"}
  }
  if(!last_name){
    return {error : true ,  msg : "Last Name is required"}
  }
  if(typeof first_name === "string" && first_name.length > MAX_USER_SIGNUP_FNAME){
    return {error : true ,  msg : `First Name length should be ${MAX_USER_SIGNUP_FNAME} characters`}
  }
  if(typeof middle_name === "string" && middle_name.length > MAX_USER_SIGNUP_LNAME){
    return {error : true ,  msg : `Middle Name length should be ${MAX_USER_SIGNUP_MNAME} characters`}
  }
  if(typeof last_name === "string" && last_name.length > MAX_USER_SIGNUP_LNAME){
    return {error : true ,  msg : `Last Name length should be ${MAX_USER_SIGNUP_LNAME} characters`}
  }
  if(!email){
    return {error : true ,  msg : "Email ID is required"}
  }
  if(typeof email === "string" && email.length > MAX_USER_SIGNUP_EMAIL){
    return {error : true ,  msg : `Email length should be ${MAX_USER_SIGNUP_EMAIL} characters`}
  }
  if(mailFormat.test(email as string) == false){
    return {error : true ,  msg : "Please enter a valid email"}
  }
  if(!password){
    return {error : true ,  msg : "Password is required"}
  }
  if(passwordRegex.test(password as string) == false){
    return {error : true ,  msg : "Password must contain atleast 8 characters and 1 numeric"}
  }
  return{
    error : false,
    msg : ""
  }
}

export const createToken = (id : string, email : any) => {
  return jwt.sign({ id, email }, JWT_SECRET_STRING, {
    expiresIn: MAX_AGE
  });
};

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

export const isValidDate = (dateLabel : string, DATE_FORMAT : string = "YYYY-MM-DD") : boolean =>{
  return moment(dateLabel,DATE_FORMAT,true).isValid();
}
