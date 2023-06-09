const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true },
  password: { type: String, select: false },
  catchPhrase: { type: String },
  maxHealth: { type: Number, default: 1000 },
  currentHealth: { type: Number, default: 1000 },
  experience: { type: Number, default: 0 },
  attack: { type: Number, default: 5 },
  level: { type: Number, default: 0 },
}, { timestamps: true });

// Must use function expressions here! ES6 => functions do not bind this!
userSchema.pre('save', function (next) {
  // ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (_, hash) => {
      user.password = hash;
      next();
    });
  });
});

// Need to use function to enable this.password to work.
userSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

const userModel = model('User', userSchema);
module.exports = userModel;
