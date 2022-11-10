const express = require('express')

const router = express.Router()

const categoryController = require('../controllers/categoryController')
const authController = require('../controllers/authController')

router.use(authController.protectWithJWT)

router
  .route('/')
  .get(
    authController.restrictTo('store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    categoryController.getAllCategories
  )
  .post(authController.restrictTo('store-admin', 'store-sub-admin', 'lead-tech'), categoryController.createCategory)

router
  .route('/:id')
  .get(authController.restrictTo('store-admin', 'store-sub-admin', 'lead-tech', 'tech'), categoryController.getCategory)
  .patch(authController.restrictTo('store-admin', 'store-sub-admin', 'lead-tech'), categoryController.updateCategory)
  .delete(authController.restrictTo('store-admin', 'store-sub-admin', 'lead-tech'), categoryController.deleteCategory)

module.exports = router
