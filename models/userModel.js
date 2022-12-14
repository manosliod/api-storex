const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please tell us your name!']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Please tell us your gender!']
    },
    birthday: {
      type: Date,
      required: [true, 'Please provide your birthday!']
    },
    address: {
      type: String,
      required: [true, 'Please provide an address!']
    },
    city: {
      type: String,
      required: [true, 'Please provide a city!']
    },
    country: {
      type: String,
      required: [true, 'Please provide a country!']
    },
    phone: {
      type: String,
      unique: true,
      required: [true, 'Please provide your phone number'],
      validate: [validator.isMobilePhone, 'Please provide a valid phone number']
    },
    username: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'Please provide your username']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
      type: String,
      enum: ['user', 'tech', 'salesman', 'accountant', 'lead-tech', 'store-sub-admin', 'store-admin', 'super-admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password
        },
        message: 'Passwords are not the same!'
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    store: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      default: null
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next()

  // Hash the password with cost of 12
  this.password = crypto
    .createHash('md5')
    .update(await bcrypt.hash(this.password, process.env.BCRYPT_SALT))
    .digest('hex')

  // Delete passwordConfirm field
  this.passwordConfirm = undefined
  next()
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next()

  this.passwordChangedAt = Date.now() - 1000
  next()
})

userSchema.pre(/^find/, async function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } })
  next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  const cryptPass = await bcrypt.hash(candidatePassword, process.env.BCRYPT_SALT)
  const hashedPassword = crypto.createHash('md5').update(cryptPass).digest('hex')

  return hashedPassword === userPassword
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

    return JWTTimestamp < changedTimestamp
  }

  // False means NOT changed
  return false
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  console.log({ resetToken }, this.passwordResetToken)

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
