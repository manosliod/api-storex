const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/signup', authController.protect, authController.signup)
router.post('/login', authController.protect, authController.login)
router.get('/logout', authController.protectWithJWT, authController.logout)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
router.post('/add', userController.createUser)

router.use(authController.protectWithJWT)

router.patch('/updateMyPassword', authController.updatePassword)
router.route('/me').get(userController.getMyId, userController.fetchMe).patch(userController.updateMe)

router
  .route('/')
  .get(authController.restrictTo('super-admin'), userController.getAllUsers)
  .post(authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'), userController.createUser)

router
  .route('/:id')
  .get(authController.restrictTo('super-admin'), userController.getUser)
  .patch(authController.restrictTo('super-admin'), userController.updateUser)
  .delete(authController.restrictTo('super-admin'), userController.deleteUser)

router.route('/:id/categories').get(authController.restrictTo('store-admin'), userController.getUserCategories)
// .patch(authController.restrictTo('super-admin'), userController.updateUser)
// .delete(authController.restrictTo('super-admin'), userController.deleteUser)

router
  .route('/store/:storeId')
  .get(authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'), userController.getUsersByStore)
  .post(authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'), userController.addUserByStore)

router
  .route('/:id/store/:storeId')
  .get(authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'), userController.getUserByStore)
  .patch(authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'), userController.updateUser)
  .delete(authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'), userController.deleteUser)

module.exports = router
