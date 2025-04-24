const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Un avis doit être associé à un utilisateur'] 
  },
  mentor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // Note: Référence à User plutôt qu'à Mentor pour cohérence
    required: [true, 'Un avis doit être associé à un mentor'] 
  },
  rating: { 
    type: Number, 
    min: [1, 'La note minimale est 1'],
    max: [5, 'La note maximale est 5'],
    required: [true, 'Une note est obligatoire'],
    validate: {
      validator: Number.isInteger,
      message: 'La note doit être un entier'
    }
  },
  comment: { 
    type: String,
    trim: true,
    maxlength: [500, 'Le commentaire ne peut excéder 500 caractères'],
    required: function() {
      return this.rating < 3;  // Obligatoire pour les notes basses
    }
  }
}, {
  timestamps: true,  // createdAt et updatedAt automatiques
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les requêtes fréquentes
reviewSchema.index({ mentor: 1, createdAt: -1 });
reviewSchema.index({ user: 1, mentor: 1 }, { unique: true });

// Middleware de validation
reviewSchema.pre('save', async function(next) {
  // Empêcher un utilisateur de s'auto-évaluer
  if (this.user.equals(this.mentor)) {
    throw new Error('Un utilisateur ne peut pas s\'évaluer lui-même');
  }

  // Vérifier que le mentor existe et est bien un mentor
  const mentor = await mongoose.model('User').findOne({
    _id: this.mentor,
    role: 'mentor'
  });
  
  if (!mentor) {
    throw new Error('Le mentor spécifié n\'existe pas ou n\'a pas le bon rôle');
  }

  next();
});

// Virtual pour le format d'affichage
reviewSchema.virtual('formattedRating').get(function() {
  return `${this.rating}/5`;
});

// Méthode statique pour calculer la moyenne d'un mentor
reviewSchema.statics.calculateAverage = async function(mentorId) {
  const stats = await this.aggregate([
    { $match: { mentor: mentorId } },
    { $group: { 
      _id: '$mentor', 
      averageRating: { $avg: '$rating' },
      numberOfReviews: { $sum: 1 }
    }}
  ]);

  await mongoose.model('User').findByIdAndUpdate(mentorId, {
    ratingAverage: stats[0]?.averageRating.toFixed(1) || 0,
    ratingQuantity: stats[0]?.numberOfReviews || 0
  });
};

// Mettre à jour les stats après chaque sauvegarde
reviewSchema.post('save', function() {
  this.constructor.calculateAverage(this.mentor);
});

// Mettre à jour les stats après suppression
reviewSchema.post('remove', function() {
  this.constructor.calculateAverage(this.mentor);
});

module.exports = mongoose.model('Review', reviewSchema);