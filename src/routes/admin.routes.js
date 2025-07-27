import { add_company, delete_company, get_companies, get_single_company, update_company_detail } from "../controllers/admin.controller.js"
import express from 'express'
import { authenticateToken, verifyPermission } from "../middlewares/authMiddleware.js"
const router = express.Router()

router.route(`/company`).post(authenticateToken,verifyPermission('ADMIN'),add_company).get(get_companies)
router.route(`/companies/:companyId`).patch(update_company_detail).delete(delete_company).get(get_single_company)
export default router