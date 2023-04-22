const { v4: uuidv4 } = require('uuid');
import logger from "./logger";
import {Request, Response, NextFunction, Errback} from 'express'


//MIDDLEWARE FUNCTION FOR Error TIME LOGS
module.exports.errorTimeLog = (error : Errback,req : Request,res : Response,next : NextFunction) => {
	if (error instanceof Error) {
		logger.error('APP error',error)
		logger.error('body',req.body,'path',req.path,'req headers',req.headers,'res headers',res.getHeaders())
		logger.error("Error Info",{status:'FAIL',event:'middleware_error_catch',data:{body:req.body,path:req.path,headers:req.headers,res_headers:res.getHeaders()}})
		return res.status(400).send({success:0,error:'auth.something_wrong'})
	}
	return next() 
}


// MIDDLEWARE FUNCTION TO SET REQUEST TIME LOG
// implememt middleware to set request header data
// middleware for getting domain and redirecting for multi party app
module.exports.requestTimeLog = (req : Request,res : Response,next : NextFunction) => {
  try{
    // const [subdomain, domain, domainExt] = req.hostname.split(".");
    // console.log("subdomain",subdomain,"common.getIpAddress()",common.getIpAddress())
    logger.info("req.headers.origin ",req.headers.origin )
    return next();
  }catch (error) {
    logger.error("error",error)
  }
  return next()
}




//MIDDLEWARE FUNCTION FOR EXECUTION TIME LOGS
module.exports.executionTimeLog =  (req : Request,res : Response,next : NextFunction) => {
	const tracer_id : any = uuidv4();
  res.header('Tracer-Id', tracer_id)
  logger.info('execution start for request start for method',req.headers['x-forwarded-for'] ,`Tracer-Id ${tracer_id}`, req.method,' url',req.originalUrl,'headers',req.headers,'query',req.query)

	const start_time = Date.now()

	res.on("error", () => {
		const execution_time = Date.now()-start_time
		if(execution_time > 10000){
			logger.error("Error Info",{status:'FAIL',execution_time,url:req.originalUrl,body:req.body})
		}
		logger.info('request error end time for method', req.method,' url',req.originalUrl,'execution time',execution_time+'ms')
	})

	res.on("finish", function() {
		const execution_time = Date.now()-start_time
		
		if (res.statusCode < 400) {
			logger.info('request success end time for method', req.method,' url',req.originalUrl,'statusCode',res.statusCode,'execution time',execution_time+'ms')
		}else{
			logger.error('request fail end time for method', req.method,' url',req.originalUrl,'statusCode',res.statusCode,'execution time',execution_time+'ms')
			/*if(res.statusCode != 401) //ignoring 401 as these requests are all because of no a_t token
				common.postToSlack({status:'FAIL',event:'auth_request_error',execution_time,url:req.originalUrl,body:req.body,token_info:{uid:token_info.uid,cid:token_info.cid},statusCode:res.statusCode})*/
		}

		if(execution_time > 10000){
			// common.postToSlack({status:res.statusCode < 400 ? 'SUCCESS':'FAIL',execution_time,url:req.originalUrl,body:req.body,token_info:{uid:token_info.uid,cid:token_info.cid},tracer_id:rTracer.id(),environment})
		}
	})

	return next()

}