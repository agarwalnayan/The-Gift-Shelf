import crypto from 'crypto';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/generateToken.js';
import { sendEmail } from '../services/emailService.js';
import { env } from '../config/env.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user._id, user.role);
  setTokenCookie(res, token);

  res
    .status(201)
    .json(new ApiResponse(201, { user: user.toSafeObject(), token }, 'Account created successfully'));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  const token = generateToken(user._id, user.role);
  setTokenCookie(res, token);

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject(), token }, 'Logged in successfully'));
});

export const logoutUser = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, 'Current user fetched'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await User.findOne({ email });

  // Always respond with the same generic message whether or not the email
  // exists, so this endpoint can't be used to enumerate registered accounts.
  const genericResponse = () =>
    res
      .status(200)
      .json(new ApiResponse(200, null, 'If an account with that email exists, a reset link has been sent.'));

  if (!user) {
    return genericResponse();
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl.replace(/\/$/, '')}/reset-password/${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your password — The Gift Shelf',
    html: `
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. This link expires in 1 hour:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  genericResponse();
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, 'This reset link is invalid or has expired');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const authToken = generateToken(user._id, user.role);
  setTokenCookie(res, authToken);

  res
    .status(200)
    .json(new ApiResponse(200, { user: user.toSafeObject(), token: authToken }, 'Password reset successfully'));
});