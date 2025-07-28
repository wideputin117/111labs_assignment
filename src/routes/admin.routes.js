import { add_company, add_driver, delete_company, delete_driver, get_companies, get_drivers, get_single_company, get_single_driver, update_company_detail, update_driver } from "../controllers/admin.controller.js"
import express from 'express'
import { authenticateToken, verifyPermission } from "../middlewares/authMiddleware.js"
const router = express.Router()

router.route(`/company`).post(authenticateToken,verifyPermission('ADMIN'),add_company).get(authenticateToken,get_companies)
router.route(`/companies/:companyId`).patch(authenticateToken, verifyPermission('ADMIN'),update_company_detail).delete(authenticateToken, verifyPermission('ADMIN'),delete_company).get(get_single_company)

/** for drivers operations */

router.route(`/driver`).post(authenticateToken, verifyPermission('ADMIN'),add_driver).get(get_drivers)
router.route(`/drivers/:driverId`).patch(authenticateToken, verifyPermission('ADMIN'),update_driver).delete(authenticateToken,verifyPermission('ADMIN'),delete_driver).get(get_single_driver)

export default router