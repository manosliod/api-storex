const User = require('../models/userModel')
const Store = require('../models/storeModel')
const Category = require('../models/categoryModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

exports.getMyId = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400))
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  // const filteredBody = filterObj(req.body, 'name', 'email')

  // 3) Update user document
  const doc = await User.findByIdAndUpdate(req.body.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    doc
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null
  })
})

async function recursive(subcategories, products, doc) {
  if (!doc) return [subcategories, products, doc]
  // const doc = await Category.findById(id, '_id subcategories products')
  if (doc.subcategories === undefined || doc.subcategories.length === 0) {
    subcategories.push(doc._id)
    if (doc.products && doc.products.length > 0) products.push(...doc.products)
    return [subcategories, products, doc]
  }
  // eslint-disable-next-line no-restricted-syntax,no-unreachable-loop
  for (const subcategory of doc.subcategories) {
    // eslint-disable-next-line no-await-in-loop
    let newDoc = await Category.find({ _id: subcategory._id }, '_id subcategories products')
    newDoc = newDoc[0]

    subcategories.push(newDoc._id)
    if (doc.products && doc.products.length > 0) products.push(...doc.products)
  }
  // eslint-disable-next-line no-restricted-syntax,no-unreachable-loop
  for (const subcategory of doc.subcategories) {
    // eslint-disable-next-line no-await-in-loop
    let newDoc = await Category.find({ _id: subcategory._id }, '_id subcategories products')
    newDoc = newDoc[0]
    // eslint-disable-next-line no-await-in-loop
    return [subcategories, products, await recursive(subcategories, products, newDoc)]
  }
}

exports.getUserCategories = async id => {
  // To allow for nested GET reviews on tour (hack)
  const doc1 = await Category.findOne({ user: id }, '_id subcategories products')
  const [subcategories] = await recursive([], [], doc1)
  if (doc1) subcategories.push(doc1._id)

  return subcategories
}

exports.getUserProducts = async id => {
  // To allow for nested GET reviews on tour (hack)
  const doc1 = await Category.findOne({ user: id }, '_id subcategories products')
  // eslint-disable-next-line no-unused-vars
  const [subcategories, products] = await recursive([], [], doc1)
  if (doc1) products.push(...doc1.products)

  return products
}

const fetchMe = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    let subStores = []
    let products = []
    let categories = []
    if (doc.role === 'tech') categories = await this.getUserCategories(doc._id)
    if (doc.role === 'tech') products = await this.getUserProducts(doc._id)
    if (doc.role === 'store-admin' || doc.role === 'store-sub-admin') {
      const store = await Store.findOne({ _id: doc.store })
      if (typeof store === 'object' && store !== null && !Array.isArray(store) && Object.keys(store.subStores).length) {
        // eslint-disable-next-line prefer-destructuring
        subStores = store.subStores
      }
    }

    res.status(200).json({
      status: 'success',
      doc: {
        ...doc._doc,
        categories,
        products,
        subStores
      }
    })
  })

exports.createUser = factory.createOne(User)
exports.getUser = factory.getOne(User)
exports.fetchMe = fetchMe(User)
exports.getAllUsers = factory.getAll(User)

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)

exports.addUserByStore = factory.createOneByStore(User)
exports.getUserByStore = factory.getOneByStore(User)

exports.getUsersByStore = factory.getAllByStore(User)
