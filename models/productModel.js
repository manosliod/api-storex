const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your product name!']
  },
  serialNumber: {
    type: Number,
    unique: true,
    required: [true, 'Please provide a serial number']
  },
  barcode: {
    type: Number,
    unique: true,
    default: this.serialNumber
  },
  productType: {
    type: String,
    enum: ['demo', 'commercial'],
    default: 'commercial'
  },
  price: {
    type: Number,
    required: [true, 'You must provide price of product']
  },
  quantity: {
    type: Number,
    required: [true, 'You must provide quantity of product']
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store'
  }
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
