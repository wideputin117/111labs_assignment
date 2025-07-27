import { add_company } from "../controllers/admin.controller.js"
import express from 'express'
const router = express.Router()

router.route(`/company`).post(add_company)

export default router