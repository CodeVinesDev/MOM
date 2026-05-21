import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { sendPasswordReset, sendWelcomeEmail } from "../services/emailService";

const router = Router();

function createToken(user: {
  _id: any;
  email: string;
  name: string;
  role: string;
}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be configured");
  }
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
    secret,
    { expiresIn: "7d" },
  );
}

function safeUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email and password are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: "Email is already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
  });

  await sendWelcomeEmail(user.name, user.email).catch(() => undefined);

  res.status(201).json({ token: createToken(user), user: safeUser(user) });
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ token: createToken(user), user: safeUser(user) });
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res
      .status(200)
      .json({ message: "If that email exists, a reset link has been sent" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendPasswordReset(user.email, resetUrl).catch(() => undefined);

  res.json({ message: "If that email exists, a reset link has been sent" });
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
});

router.get(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user!.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(safeUser(user));
  },
);

router.patch(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const updates: any = {};
    const { name, email, password } = req.body;
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.user!.id, updates, {
      new: true,
    }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(safeUser(user));
  },
);

export default router;
