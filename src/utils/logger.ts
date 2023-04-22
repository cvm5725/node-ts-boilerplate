const { logger } = require("correlation-logger/logger");  
 
export default class Logger {

  public static info(message : string,...arges : any){
    logger.info(message,...arges);
    console.log(message,...arges)
  }

  public static warn(message : string,...arges : any){
    logger.warn(message,...arges);
    console.log(message,...arges)
  }

  public static error(message : string,...arges : any){
    logger.error(message,...arges);
    console.log(message,...arges)
  }

}
