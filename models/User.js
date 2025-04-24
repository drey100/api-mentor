const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, 'Le prénom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut excéder 50 caractères']
  },
  lastName: { 
    type: String, 
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le nom ne peut excéder 50 caractères']
  },
  email: { 
    type: String, 
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email invalide'],
    match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false // Ne sera pas retourné dans les queries
  },
  role: { 
    type: String, 
    enum: {
      values: ['user', 'mentor'],
      message: 'Le rôle doit être soit "user" soit "mentor"'
    },
    default: 'user'
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true, // Ajoute created_at et updated_at automatiquement
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware de pré-sauvegarde pour le hashage du mot de passe
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Méthode pour vérifier si le mot de passe a été changé après émission du JWT
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);