import express from 'express'
import { forgotPassword, login, resetPassword, signup_controller, verifyOTP } from '../controllers/authController.js'
 const router = express.Router()

router.route(`/signup`).post(signup_controller)
router.route(`/login`).post(login)
router.route(`/verify-otp`).post(verifyOTP)
router.route(`/forgot-password`).post(forgotPassword)
router.route(`/reset-password`).post(resetPassword)

export default router;