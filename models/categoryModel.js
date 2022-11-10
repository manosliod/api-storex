const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your category name!']
  },
  subcategories: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Category'
  },
  products: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Product'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store'
  }
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
