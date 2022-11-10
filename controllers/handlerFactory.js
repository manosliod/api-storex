const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null
    })
  })

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      doc
    })
  })

exports.updateOneUserFromStore = Model =>
  catchAsync(async (req, res, next) => {
    if (!req.params.userId || !req.params.id) {
      return next(new AppError('Store ID or User ID missing', 404))
    }
    const query = Model.findOneAndUpdate({ _id: req.params.userId, store: req.params.id }, req.body, {
      new: true,
      runValidators: true
    })
    const doc = await query

    res.status(200).json({
      status: 'success',
      doc
    })
  })

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    })
  })

exports.createOneByStore = Model =>
  catchAsync(async (req, res, next) => {
    if (!req.params.storeId) {
      return next(new AppError('Store ID missing!', 404))
    }
    const doc = await Model.create({
      ...req.body,
      store: req.params.storeId
    })

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    })
  })

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      doc
    })
  })

exports.getOneUserFromStore = Model =>
  catchAsync(async (req, res, next) => {
    if (!req.params.userId || !req.params.id) {
      return next(new AppError('Store ID or User ID missing', 404))
    }
    const query = Model.findById({ _id: req.params.userId, store: req.params.id })
    const doc = await query

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      doc
    })
  })

exports.getOneByStore = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {}

    if (!req.params.storeId || !req.params.id) {
      return next(new AppError('Store ID or User ID missing', 404))
    }
    filter = { _id: req.params.id, store: req.params.storeId }

    const query = Model.find(filter)
    const doc = await query

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      doc: doc[0]
    })
  })

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate()
    // const doc = await features.query.explain();
    const doc = await features.query

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc
    })
  })

exports.getAllByStore = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {}
    if (req.params.storeId) filter = { store: req.params.storeId }

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate()
    // const doc = await features.query.explain();
    const doc = await features.query

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc
    })
  })
