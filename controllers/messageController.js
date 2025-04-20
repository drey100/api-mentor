const Message = require('../models/Message');

// Envoyer un message
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const message = new Message({
      senderId: req.user._id,
      receiverId,
      content,
    });
    await message.save();
    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    next(error);
  }
};

// Supprimer un message
exports.deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findOneAndDelete({
      _id: messageId,
      senderId: req.user._id,
    });
    if (!message) {
      return next(new Error('Message not found or you are not authorized to delete it'));
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Obtenir les messages d'un utilisateur
exports.getMessagesByUser = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .populate('senderId', 'firstName lastName')
      .populate('receiverId', 'firstName lastName')
      .sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// Obtenir les messages d'un mentor
exports.getMessagesByMentor = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .populate('senderId', 'firstName lastName')
      .populate('receiverId', 'firstName lastName')
      .sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};