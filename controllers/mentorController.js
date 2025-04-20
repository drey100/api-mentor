const Mentor = require('../models/Mentor');
const User = require('../models/User');

// Créer un profil mentor
exports.createMentorProfile = async (req, res, next) => {
  try {
    const { specialty, bio, photo } = req.body;

    // Vérifier si l'utilisateur est déjà un mentor
    const existingMentor = await Mentor.findOne({ userId: req.user._id });
    if (existingMentor) {
      return next(new Error('You already have a mentor profile'));
    }

    // Créer un nouveau profil mentor
    const mentor = new Mentor({
      userId: req.user._id,
      specialty,
      bio,
      photo,
    });
    await mentor.save();

    // Mettre à jour le rôle de l'utilisateur dans la collection User
    await User.findByIdAndUpdate(req.user._id, { role: 'mentor' });

    res.status(201).json({ message: 'Mentor profile created successfully', data: mentor });
  } catch (error) {
    next(error);
  }
};

// Obtenir tous les mentors
exports.getMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find()
      .populate('userId', 'firstName lastName email')
      .select('-__v');
    res.json(mentors);
  } catch (error) {
    next(error);
  }
};

// Obtenir un mentor par ID
exports.getMentorById = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .select('-__v');
    if (!mentor) {
      return next(new Error('Mentor not found'));
    }
    res.json(mentor);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un profil mentor
exports.updateMentorProfile = async (req, res, next) => {
  try {
    const { specialty, bio, photo } = req.body;

    // Vérifier si le mentor existe
    const mentor = await Mentor.findOneAndUpdate(
      { userId: req.user._id },
      { specialty, bio, photo },
      { new: true }
    );
    if (!mentor) {
      return next(new Error('Mentor profile not found or you are not authorized to update it'));
    }

    res.json({ message: 'Mentor profile updated successfully', data: mentor });
  } catch (error) {
    next(error);
  }
};

// Supprimer un profil mentor
exports.deleteMentorProfile = async (req, res, next) => {
  try {
    // Supprimer le profil mentor
    const mentor = await Mentor.findOneAndDelete({ userId: req.user._id });
    if (!mentor) {
      return next(new Error('Mentor profile not found or you are not authorized to delete it'));
    }

    // Réinitialiser le rôle de l'utilisateur dans la collection User
    await User.findByIdAndUpdate(req.user._id, { role: 'user' });

    res.json({ message: 'Mentor profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};