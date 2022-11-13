const mongoose = require('mongoose')
const Store = require('../models/storeModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const factory = require('./handlerFactory')
const catchAsync = require('../utils/catchAsync')
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')

const getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let doc
    let filter = {}
    if (req.query.category) {
      const category = await Category.findOne({ _id: req.query.category })
      doc = await Model.find({ _id: { $in: category.products } })
    } else if (req.query.store) {
      filter = { store: req.query.store }
      doc = await Model.find(filter)
      if (req.query.inBranches && req.query.inBranches === 'true') {
        const store = await Store.findOne({ _id: req.query.store })
        const products = []
        // eslint-disable-next-line no-restricted-syntax
        for (const subStore of store.subStores) {
          // eslint-disable-next-line no-await-in-loop
          const prodDoc = await Model.find({ store: subStore }).populate('store', 'name address city')
          if (prodDoc) products.push(...prodDoc)
        }
        Array.prototype.push.apply(doc, products)
      }
    }
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc
    })
  })

const createOne = Model =>
  catchAsync(async (req, res, next) => {
    let newBody = req.body
    let categoryId
    if (req.body.category) {
      categoryId = req.body.category
      newBody = req.body
      delete newBody.category
    }
    const doc = await Model.create(newBody)
    console.log(newBody, 'newBody')
    await Model.findOneAndUpdate({ _id: doc._id }, { barcode: doc.serialNumber })

    if (categoryId)
      await Category.findById(categoryId, (err, category) => {
        category.products.push(doc._id)
        category.save()
      })

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    })
  })

const deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    await Category.findOneAndUpdate(
      { products: mongoose.Types.ObjectId(req.params.id) },
      { $pull: { products: req.params.id } }
    )
    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null
    })
  })

exports.getAllProducts = getAll(Product)
exports.getProduct = factory.getOne(Product)
exports.updateProduct = factory.updateOne(Product)
exports.createProduct = createOne(Product)
exports.deleteProduct = deleteOne(Product)
