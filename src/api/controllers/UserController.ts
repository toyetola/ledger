import { Request, Response } from 'express';
import UserService from '../services/UserService';
import { transactionSchema } from '../validations/index';

declare module "express-serve-static-core" {
    interface Request {
        user?: RequesUser; 
    }
}

interface RequesUser {
    iat : number,
    exp: number,
    userId : string
}


class UserController {

    public async healthCheck(req: Request, res: Response): Promise<any> {
        return res.status(200).json({status:"OK"})
    }

    public async depositFund(req: Request, res: Response) : Promise<any>  {
        try {
            const { accountId, amount, currency } = req.body;

            const validationRes = transactionSchema.safeParse(req.body);

            if (!validationRes.success) {
                return res.status(400).json({ message:"Validation error", data: validationRes.error.errors });
            }

            const response = await UserService.depositFund(accountId, amount, currency);
            if(response.success){
                res.status(200).json({message:response?.message, data:response})
            }else{
                res.status(400).json({message:response?.message, data: response})
            }
        } catch (error) {
            res.status(500).json({message:"Deposit failed", error: error.message})
        }
    }

   
    public async withdrawFund(req: Request, res: Response) : Promise<any> {
        const validationRes = transactionSchema.safeParse(req.body);

        if (!validationRes.success) {
            return res.status(400).json({ message:"Validation error", data: validationRes.error.errors });
        }

        try {
            const { accountId, amount, currency } = req.body;
            const response = await UserService.withdrawFund(accountId, amount, currency);
            if(response.success){
                res.status(200).json({message:response?.message, success: response?.success ,data:response})
            }else{
                res.status(400).json({message:response?.message, success: response?.success, data: response})
            }
        } catch (error) {
            res.status(500).json({message:"Withdrawal failed", error: error.message})
        }
    }

    public async getBalance(req: Request, res: Response) : Promise<any> {
        try {
            const userId = req.user?.userId;
            const response = await UserService.getBalance(userId);
            if(response?.success){
                res.status(200).json({message:response?.message, success: response?.success ,data:response})
            }else{
                res.status(400).json({message:response?.message, success: response?.success, data: response})
            }
        } catch (error) {
            res.status(500).json({message:"Could not fetch balance", error: error.message})
        }
    }

    public async doTransfer(req: Request, res: Response) : Promise<any> {
        try {
            const { fromAccountId, toAccountId, amount } = req.body;
        
            if (!fromAccountId || !toAccountId || !amount) {
              return res.status(400).json({ message: "Missing required fields" });
            }
        
            const result = await UserService.doTransfer(fromAccountId, toAccountId, amount);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    public async getProfile(req: Request, res: Response) : Promise<any> {

        const userId = req.user?.userId;
        try {
            const response = await UserService.getProfile(userId);
            if(response?.success){
                res.status(200).json({message:response?.message, success: response?.success ,data:response})
            }else{
                res.status(400).json({message:response?.message, success: response?.success ,data:response})
            }
        } catch (error) {
            res.status(500).json({message:"Profile could not be fetched", error: error.message})
        }
    }

}

export default new UserController();
