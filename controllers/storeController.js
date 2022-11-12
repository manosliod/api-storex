const mongoose = require('mongoose')
const User = require('../models/userModel')
const Store = require('../models/storeModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')

const getStoreCategory = Model =>
  catchAsync(async (req, res, next) => {
    if (!req.params.categoryId || !req.params.id) {
      return next(new AppError('Category ID or Store ID missing', 404))
    }
    const query = Model.findById({ _id: req.params.categoryId, store: req.params.id })
      .lean()
      .populate('user', 'fullName username')
      .populate('subcategories')
      .populate('products')

    const doc = await query

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      doc
    })
  })

const addStoreCategory = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create({ ...req.body, store: req.params.id })

    if (req.params.categoryId) {
      await Model.findById(req.params.categoryId, (err, category) => {
        category.subcategories.push(doc._id)
        category.save()
      })
    }

    res.status(200).json({
      status: 'success',
      doc
    })
  })

const updateStoreCategory = Model =>
  catchAsync(async (req, res, next) => {
    if (!req.params.categoryId || !req.params.id) {
      return next(new AppError('Store ID or User ID missing', 404))
    }
    const query = Model.findOneAndUpdate({ _id: req.params.categoryId, store: req.params.id }, req.body, {
      new: true,
      runValidators: true
    })
      .populate('user', 'fullName username')
      .populate('subcategories')
      .populate('products')
    const doc = await query

    res.status(200).json({
      status: 'success',
      doc
    })
  })

const daleteStoreCategory = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.categoryId, store: req.params.id })
    await Model.findOneAndUpdate(
      { subcategories: mongoose.Types.ObjectId(req.params.categoryId) },
      { $pull: { subcategories: req.params.categoryId } }
    )

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null
    })
  })

const getStoreProduct = Model =>
  catchAsync(async (req, res, next) => {
    if (!req.params.productId || !req.params.id) {
      return next(new AppError('Product ID or Store ID missing', 404))
    }
    const query = Model.findById({ _id: req.params.productId, store: req.params.id })
      .lean()
      .populate('user', 'fullName username')
      .populate('subcategories')
      .populate('products')

    const doc = await query

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      doc
    })
  })

const addStoreProduct = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create({ ...req.body, store: req.params.id })

    if (req.params.productId) {
      await Model.findById(req.params.productId, (err, category) => {
        category.subcategories.push(doc._id)
        category.save()
      })
    }

    res.status(200).json({
      status: 'success',
      doc
    })
  })

const updateStoreProduct = Model =>
  catchAsync(async (req, res, next) => {
    if (!req.params.productId || !req.params.id) {
      return next(new AppError('Store ID or User ID missing', 404))
    }
    const query = Model.findOneAndUpdate({ _id: req.params.productId, store: req.params.id }, req.body, {
      new: true,
      runValidators: true
    })
      .populate('user', 'fullName username')
      .populate('subcategories')
      .populate('products')
    const doc = await query

    res.status(200).json({
      status: 'success',
      doc
    })
  })

const daleteStoreProduct = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.productId, store: req.params.id })
    await Category.findOneAndUpdate(
      { products: mongoose.Types.ObjectId(req.params.productId) },
      { $pull: { products: req.params.productId } }
    )

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null
    })
  })

exports.getAllStores = factory.getAll(Store)
exports.getStore = factory.getOne(Store)
exports.updateStore = factory.updateOne(Store)
exports.createStore = factory.createOne(Store)
exports.deleteStore = factory.deleteOne(Store)

exports.getStoreCategory = getStoreCategory(Category)
exports.addStoreCategory = addStoreCategory(Category)
exports.updateStoreCategory = updateStoreCategory(Category)
exports.deleteStoreCategory = daleteStoreCategory(Category)

exports.getStoreProduct = getStoreProduct(Product)
exports.addStoreProduct = addStoreProduct(Product)
exports.updateStoreProduct = updateStoreProduct(Product)
exports.deleteStoreProduct = daleteStoreProduct(Product)

exports.getStoreUser = factory.getOneUserFromStore(User)
exports.updateStoreUser = factory.updateOneUserFromStore(User)
