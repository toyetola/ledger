import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  balance: number;
  currency: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}


const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "USD" }
  },
  {
    timestamps: true
  }
);



UserSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});
  
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;