const Session = require('../models/Session');

// Réserver une session
exports.bookSession = async (req, res, next) => {
  try {
    const { mentorId, date } = req.body;
    const session = new Session({
      userId: req.user._id,
      mentorId,
      date,
      status: 'pending',
    });
    await session.save();
    res.status(201).json({ message: 'Session booked successfully', data: session });
  } catch (error) {
    next(error);
  }
};

// Confirmer une session
exports.confirmSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findOneAndUpdate(
      { _id: sessionId, mentorId: req.user._id },
      { status: 'confirmed' },
      { new: true }
    );
    if (!session) {
      return next(new Error('Session not found or you are not authorized to confirm it'));
    }
    res.json({ message: 'Session confirmed successfully', data: session });
  } catch (error) {
    next(error);
  }
};

// Annuler une session
exports.cancelSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findOneAndDelete({
      _id: sessionId,
      $or: [{ userId: req.user._id }, { mentorId: req.user._id }],
    });
    if (!session) {
      return next(new Error('Session not found or you are not authorized to cancel it'));
    }
    res.json({ message: 'Session canceled successfully' });
  } catch (error) {
    next(error);
  }
};

// Obtenir les sessions d'un utilisateur
exports.getSessionsByUser = async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .populate('mentorId', 'firstName lastName specialty')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// Obtenir les sessions d'un mentor
exports.getSessionsByMentor = async (req, res, next) => {
  try {
    const sessions = await Session.find({ mentorId: req.user._id })
      .populate('userId', 'firstName lastName')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};