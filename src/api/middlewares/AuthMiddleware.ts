import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import  { config } from '../../config/index';

  
const generateToken = (userId: string, role: string): string => {
    
    return jwt.sign({ userId, role }, config.jwtSecret as string, {
       expiresIn: config.accessTokenValidity ?? "15m"
    });
}

const generateRefreshToken = (userId : String, role: string) => {
    return jwt.sign({ userId }, config.jwtRefreshSecret as string, { expiresIn: config.refreshTokenValidity as string | number }); 
}

interface AuthRequest extends Request {
    user?: any;
}
  
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {

    const token = req.header("Authorization")?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Access denied" });
    }
  
    try {
      const decoded = jwt.verify(token, config.jwtSecret as string);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid token" });
    }
};
  
export { authMiddleware, generateToken, generateRefreshToken };