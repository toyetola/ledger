import { Request, Response } from 'express';
import UserService from '../services/UserService';

declare module "express-serve-static-core" {
    interface Request {
        user?: string; 
    }
}


class UserController {

    

    public async depositFund(req: Request, res: Response) : Promise<any>  {
        try {
            const { accountId, amount, currency } = req.body;
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
            const { accountId } = req.body;
            const response = await UserService.getBalance(accountId);
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
        
        } catch (error) {
        
        }
    }

    public async getProfile(req: Request, res: Response) : Promise<any> {

        const userId = req.user;
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
