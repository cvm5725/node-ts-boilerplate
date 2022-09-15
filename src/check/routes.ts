import express, { Request, Response} from 'express';

const checkRouter = express.Router()
export default checkRouter

checkRouter.get('/', async (req: Request, res: Response) => {
    return res.status(200).json({error : false , data : { msg : "I am alive"}})
})
