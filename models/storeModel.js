const mongoose = require('mongoose')

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your store name!']
    },
    officialName: {
      type: String,
      unique: true,
      required: [true, 'Please provide your official store name']
    },
    taxId: {
      type: String,
      unique: true,
      required: [true, 'Please provide your Tax ID Number']
    },
    storeLogo: String,
    storeType: {
      type: String,
      enum: ['individual', 'branch'],
      default: 'individual'
    },
    phone: {
      type: String,
      unique: true,
      required: [true, "Please provide your store's phone!"]
    },
    address: {
      type: String,
      required: [true, 'Please provide an address of your store!']
    },
    city: {
      type: String,
      required: [true, 'Please provide a city of your store!']
    },
    country: {
      type: String,
      required: [true, 'Please provide a country of your store!']
    },
    subStores: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Store'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

storeSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '_id'
  })

  next()
})

const Store = mongoose.model('Store', storeSchema)

module.exports = Store
