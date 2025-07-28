import { add_company, add_driver, delete_company, delete_driver, get_companies, get_drivers, get_single_company, get_single_driver, update_company_detail, update_driver } from "../controllers/admin.controller.js"
import express from 'express'
import { authenticateToken, verifyPermission } from "../middlewares/authMiddleware.js"
const router = express.Router()

router.route(`/company`).post(authenticateToken,verifyPermission('ADMIN'),add_company).get(authenticateToken,get_companies)
router.route(`/companies/:companyId`).patch(update_company_detail).delete(delete_company).get(get_single_company)

/** for drivers operations */

router.route(`/driver`).post(add_driver).get(get_drivers)
router.route(`/drivers/:driverId`).patch(update_driver).delete(delete_driver).get(get_single_driver)

export default router