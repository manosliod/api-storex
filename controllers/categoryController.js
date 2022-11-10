const Category = require('../models/categoryModel')
const factory = require('./handlerFactory')

exports.getAllCategories = factory.getAll(Category)
exports.getCategory = factory.getOne(Category)
exports.updateCategory = factory.updateOne(Category)
exports.createCategory = factory.createOne(Category)
exports.deleteCategory = factory.deleteOne(Category)
