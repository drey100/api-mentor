const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [1000, 'Le message ne peut excéder 1000 caractères']
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,  // Crée automatiquement createdAt et updatedAt
  toJSON: { virtuals: true },  // Inclut les virtuals dans les conversions JSON
  toObject: { virtuals: true }
});

// Index pour optimiser les requêtes fréquentes
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ createdAt: -1 });

// Middleware pour valider que l'expéditeur et le destinataire sont différents
messageSchema.pre('save', async function(next) {
  if (this.sender.equals(this.receiver)) {
    throw new Error('Un utilisateur ne peut pas s\'envoyer un message à lui-même');
  }
  
  // Vérifier que les utilisateurs existent
  const [senderExists, receiverExists] = await Promise.all([
    mongoose.model('User').exists({ _id: this.sender }),
    mongoose.model('User').exists({ _id: this.receiver })
  ]);
  
  if (!senderExists || !receiverExists) {
    throw new Error('Expéditeur ou destinataire introuvable');
  }
  
  next();
});

// Virtual pour le statut de message (récent/non lu)
messageSchema.virtual('status').get(function() {
  if (!this.read) return 'unread';
  return this.createdAt > new Date(Date.now() - 24*60*60*1000) ? 'recent' : 'old';
});

module.exports = mongoose.model('Message', messageSchema);