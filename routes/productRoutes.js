const express = require('express')

const router = express.Router()

const productController = require('../controllers/productController')
const authController = require('../controllers/authController')

router.use(authController.protectWithJWT)

router
  .route('/')
  .get(
    authController.restrictTo('store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    productController.getAllProducts
  )
  .post(
    authController.restrictTo('store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    productController.createProduct
  )

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.restrictTo('store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    productController.updateProduct
  )
  .delete(
    authController.restrictTo('store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    productController.deleteProduct
  )

module.exports = router
