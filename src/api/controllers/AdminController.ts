import { Request, Response} from 'express'
import AdminService from '../services/AdminService';

class AdminController {


    static async getUsers (req: Request, res: Response) : Promise<any> {

        try {
            const { page = 1, limit = 10 } = req.query;
            const response = await AdminService.getUsers(page, limit);
            return res.status(200).json({message:"Succesfully retrived users", data: response })
          } catch (error) {
            return res.status(500).json({message:"Fetch users failed", error: error.message})
          }
    }

    static async getUser (req: Request, res: Response) : Promise<any> {

        try {
            const { userId } = req.params;
            const response = await AdminService.getUser(userId)
            if(response?.success){
                return res.status(200).json({"message":"successfully retrieved user", data:response})
            }else {
                return res.status(400).json({"message":"Failed to retrieve user", data:response})
            }
        } catch (error) {
            return res.status(500).json({"message":"Failed retrieved user", error:error.message})
        }
       
    }

    static async getTransactions (req: Request, res: Response) : Promise<any> {
        
        const {page = 1, limit = 10 } = req.query;
        try {
            const response =  await AdminService.getTransactions(page, limit);
        
            if(response?.success){
                return res.status(200).json({"message":"successfully fetched transactions", data:response})
            }else {
                return res.status(400).json({"message":"Failed to fetch transactions", data:response})
            }
        } catch (error) {
            return res.status(500).json({"message":"Failed to fetch transactions", error:error.message})
        }
    }

    static async getTransaction (req: Request, res: Response) : Promise<any> {
        const { transactionId } = req.params;

        try {
           const response = await AdminService.getTransaction(transactionId);
            if(response?.success){
                return res.status(200).json({"message":"successfully retrieved transaction", data:response})
            }else {
                return res.status(400).json({"message":"Failed to retrieve transaction", data:response})
            }
        } catch (error) {
            return { message: "Error retrieving transaction", error: error.message };
        }
    }

    static async accounts (req: Request, res: Response) : Promise<any> {
        const {page = 1, limit = 10 } = req.query;
        try {
            const response =  await AdminService.getAccounts(page, limit);
        
            if(response?.success){
                return res.status(200).json({"message":"successfully fetched accounts", data:response})
            }else {
                return res.status(400).json({"message":"Failed to fetch accounts", data:response})
            }
        } catch (error) {
            return res.status(500).json({"message":"Failed to fetch accounts", error:error.message})
        }
    }
}

export default AdminController;