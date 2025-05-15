// routes/index.ts
import express, {Request, Response} from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.render('intergratedBot');
});

export default router;
