import User, {IUser} from "../models/User";
import { Request, Response } from "express";
import { authMiddleware, generateToken, generateRefreshToken } from '../middlewares/AuthMiddleware'

class AuthController {
    static async register(req : Request, res: Response): Promise<any>  {
        try {
            const { name, email, password, role, currency } = req.body;
        
            const existingUser = await User.findOne({ email });
            if (existingUser) {
              return res.status(400).json({ message: "User already exists" });
            }
        
            const newUser: IUser = new User({
              name,
              email,
              password, // Password will be hashed in the pre-save hook
              role: role || "user",
              balance: 0,
              currency: currency || "USD",
            });
        
            await newUser.save();
        
            const accessToken = generateToken(newUser._id.toString());
            const refreshToken = generateRefreshToken(newUser._id.toString());
        
            res.status(201).json({
              message: "User registered successfully",
              user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                balance: newUser.balance,
                currency: newUser.currency,
                createdAt: newUser.createdAt,
              },
              tokens: { accessToken, refreshToken },
            });
          } catch (error) {
            res.status(500).json({ message: "Error registering user", error: error.message });
          }
    }

    static async login(req : Request, res: Response) : Promise<any>  {
        try {
            const { email, password } = req.body;
            const user : IUser | null = await User.findOne({ email });
        
            if (!user) {
              return res.status(401).json({ error: "Invalid credentials" });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
        
            res.json({ token: generateToken(user._id.toString()) });
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    }
}

export default AuthController;
