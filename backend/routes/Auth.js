import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User_Model.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Capacity check first — cheapest rejection
    if (process.env.USER_LIMIT_ENABLED === "true") {
      const userCount = await User.countDocuments();
      if (userCount >= parseInt(process.env.USER_LIMIT)) {
        return res.status(403).json({
          message: "Atrio is currently at capacity. Check back soon."
        });
      }
    }

    // 2. Then check duplicate
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Create user
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req , res)=>{
    try {
        const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
        if(!user){
            return res.status(400).json({message:"Invalid credentials"});
            
        }  
      const isMatch = await bcrypt.compare(password, user.password);
      
      if(!isMatch){
        return res.status(400).json({message:"Invalid credentials"});
      } 
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.status(200).json({ token, username: user.username });
    } 
    
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({message:"Internal server error"});
    }

      });
     
    

  

      export default router;