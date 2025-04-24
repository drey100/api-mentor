const Message = require('../models/Message');
const User = require('../models/User');

// Nouvelle méthode pour récupérer un message spécifique
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'firstName lastName avatar')
      .populate('receiver', 'firstName lastName avatar');

    if (!message) {
      return res.status(404).json({ 
        error: 'Message non trouvé',
        details: `L'ID ${req.params.id} ne correspond à aucun message`
      });
    }

    // Vérifier que l'utilisateur a le droit d'accéder à ce message
    if (message.sender._id.toString() !== req.user.id && 
        message.receiver._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        details: 'Vous ne pouvez pas accéder à ce message'
      });
    }

    res.json({
      id: message._id,
      sender: {
        id: message.sender._id,
        firstName: message.sender.firstName,
        lastName: message.sender.lastName,
        avatar: message.sender.avatar
      },
      receiver: {
        id: message.receiver._id,
        firstName: message.receiver.firstName,
        lastName: message.receiver.lastName,
        avatar: message.receiver.avatar
      },
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
};

// Méthode existante améliorée
exports.sendMessage = async (req, res) => {
  try {
    // Vérifier que le destinataire existe
    const receiver = await User.findById(req.body.receiverId);
    if (!receiver) {
      return res.status(404).json({
        error: 'Destinataire introuvable',
        details: `L'ID ${req.body.receiverId} ne correspond à aucun utilisateur`
      });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: req.body.receiverId,
      content: req.body.content
    });

    // Populate pour avoir les détails du destinataire
    await message.populate('receiver', 'firstName lastName avatar');

    res.status(201).json({
      id: message._id,
      sender: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      },
      receiver: {
        id: message.receiver._id,
        firstName: message.receiver.firstName,
        lastName: message.receiver.lastName,
        avatar: message.receiver.avatar
      },
      content: message.content,
      createdAt: message.createdAt
    });

  } catch (error) {
    res.status(400).json({
      error: 'Erreur de validation',
      details: error.message
    });
  }
};

// Marquer un message comme lu
exports.markAsRead = async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  res.json(message);
};

// Récupérer les messages non lus
exports.getUnreadMessages = async (req, res) => {
  const messages = await Message.find({
    receiver: req.user.id,
    read: false
  }).sort('-createdAt');
  res.json(messages);
};

// Ajouter ces nouvelles méthodes à la fin du fichier existant :

// Marquer un message comme lu
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    ).populate('sender receiver', 'firstName lastName avatar');

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les messages non lus
exports.getUnreadMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.user.id,
      read: false
    })
    .populate('sender', 'firstName lastName avatar')
    .sort('-createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  ).populate('sender receiver');

  // Décrémenter le compteur
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { unreadMessagesCount: -1 }
  });

  res.json(message);
};

exports.getUnreadCount = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ count: user.unreadMessagesCount });
};

// Méthodes existantes à conserver...
exports.deleteMessage = async (req, res) => { /* ... */ };
exports.getMessagesByUser = async (req, res) => { /* ... */ };
exports.getMessagesByMentor = async (req, res) => { /* ... */ };