const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const factory = require('./handlerFactory')
const catchAsync = require('../utils/catchAsync')
const APIFeatures = require('../utils/apiFeatures')

const getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let doc
    let filter = {}
    if (req.query.category) {
      const category = await Category.findOne({ _id: req.query.category })
      doc = await Model.find({ _id: { $in: category.products } })
    } else if (req.query.store) {
      filter = { store: req.params.store }
      const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate()
      doc = await features.query
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
    console.log(req.body)
    let newBody
    let categoryId
    if (req.body.category) {
      categoryId = req.body.category
      newBody = req.body
      delete newBody.category
    }
    const doc = await Model.create(newBody)
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

exports.getAllProducts = getAll(Product)
exports.getProduct = factory.getOne(Product)
exports.updateProduct = factory.updateOne(Product)
exports.createProduct = createOne(Product)
exports.deleteProduct = factory.deleteOne(Product)
