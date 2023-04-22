import express, { Request, Response, Router} from 'express';

const checkRouter : Router = express.Router()
export default checkRouter

checkRouter.get('/', async (req: Request, res: Response) => {
    return res.status(200).json({error : false , data : { msg : "I am alive"}})
})
