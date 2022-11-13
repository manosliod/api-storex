const express = require('express')

const router = express.Router()

const storeController = require('../controllers/storeController')
const authController = require('../controllers/authController')

router.use(authController.protectWithJWT)

router
  .route('/')
  .get(authController.restrictTo('super-admin'), storeController.getAllStores)
  .post(authController.restrictTo('super-admin'), storeController.createStore)

router
  .route('/sub-stores')
  .get(authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'), storeController.getStoreSubStores)

router
  .route('/:id')
  .get(storeController.getStore)
  .patch(authController.restrictTo('super-admin', 'store-admin', 'admin'), storeController.updateStore)
  .delete(authController.restrictTo('super-admin'), storeController.deleteStore)

router
  .route('/:id/sub-stores')
  .post(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'),
    storeController.createStoreSubStores
  )
router
  .route('/:id/sub-stores/:subStoreId')
  .patch(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'),
    storeController.updateStoreSubStores
  )
  .delete(authController.restrictTo('super-admin', 'store-admin'), storeController.deleteStoreSubStores)

router
  .route('/:id/user/:userId')
  .get(authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'), storeController.getStoreUser)
  .patch(authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin'), storeController.updateStoreUser)

router
  .route('/:id/category/:categoryId')
  .get(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    storeController.getStoreCategory
  )
  .post(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    storeController.addStoreCategory
  )
  .patch(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    storeController.updateStoreCategory
  )
  .delete(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    storeController.deleteStoreCategory
  )

router
  .route('/:id/product/:productId')
  .get(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    storeController.getStoreProduct
  )
  .post(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    storeController.addStoreProduct
  )
  .patch(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    storeController.updateStoreProduct
  )
  .delete(
    authController.restrictTo('super-admin', 'store-admin', 'store-sub-admin', 'lead-tech', 'tech'),
    storeController.deleteStoreProduct
  )

module.exports = router
