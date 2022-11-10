const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.use(authController.protect)
router.route('/users').get(userController.getAllUsers)

module.exports = router
