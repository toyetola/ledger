import User, {IUser} from "../models/User";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { generateToken, generateRefreshToken } from '../middlewares/AuthMiddleware'
import Account from "../models/Account";
import { registerSchema } from "../validations";

class AuthController {
    static async register(req : Request, res: Response): Promise<any>  {

        const validationRes = registerSchema.safeParse(req.body);
        
        if (!validationRes.success) {
            return res.status(400).json({message:"Validation error", data: validationRes.error.errors });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

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
        
            await newUser.save({ session });
        
            const accessToken = generateToken(newUser._id.toString   (), role);
            const refreshToken = generateRefreshToken(newUser._id.toString(), role);

            await Account.create(
                [{ userId: newUser._id, balance: 0, currency, type: "user" }],
                { session }
            );

            await session.commitTransaction();
            session.endSession();
        
            return res.status(201).json({
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
            await session.abortTransaction();
            session.endSession();
            console.error(`Error registering user: ${error}`)
            return res.status(500).json({ message: "Error registering user", error: error.message });
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
        
            return res.json({ token: generateToken(user._id.toString(), user.role) });
        } catch (error) {
            return res.status(500).json({ error: "Server error" });
        }
    }
}

export default AuthController;
