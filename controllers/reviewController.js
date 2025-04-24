const Review = require('../models/Review');
const User = require('../models/User');

// Nouvelle méthode pour récupérer un avis spécifique
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'firstName lastName avatar')
      .populate('mentor', 'firstName lastName specialty');

    if (!review) {
      return res.status(404).json({
        error: 'Avis non trouvé',
        details: `L'ID ${req.params.id} ne correspond à aucun avis`
      });
    }

    res.json({
      id: review._id,
      user: {
        id: review.user._id,
        firstName: review.user.firstName,
        lastName: review.user.lastName,
        avatar: review.user.avatar
      },
      mentor: {
        id: review.mentor._id,
        firstName: review.mentor.firstName,
        lastName: review.mentor.lastName,
        specialty: review.mentor.specialty
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
};

// Méthode existante améliorée
exports.addReview = async (req, res) => {
  try {
    // Empêcher les mentors de s'auto-évaluer
    if (req.user.role === 'mentor') {
      return res.status(403).json({
        error: 'Action non autorisée',
        details: 'Les mentors ne peuvent pas poster des avis'
      });
    }

    // Vérifier que le mentor existe
    const mentor = await User.findOne({ 
      _id: req.body.mentorId, 
      role: 'mentor' 
    });
    
    if (!mentor) {
      return res.status(404).json({
        error: 'Mentor introuvable',
        details: `L'ID ${req.body.mentorId} ne correspond à aucun mentor`
      });
    }

    // Vérifier que l'utilisateur n'a pas déjà posté un avis pour ce mentor
    const existingReview = await Review.findOne({
      user: req.user.id,
      mentor: req.body.mentorId
    });

    if (existingReview) {
      return res.status(409).json({
        error: 'Avis déjà existant',
        details: 'Vous avez déjà posté un avis pour ce mentor'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      mentor: req.body.mentorId,
      rating: req.body.rating,
      comment: req.body.comment || null
    });

    // Calculer la nouvelle note moyenne du mentor
    await this.calculateMentorRating(req.body.mentorId);

    res.status(201).json({
      id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    });

  } catch (error) {
    res.status(400).json({
      error: 'Erreur de validation',
      details: error.message
    });
  }
};

// Méthode helper pour calculer la note moyenne
exports.calculateMentorRating = async (mentorId) => {
  const result = await Review.aggregate([
    { $match: { mentor: mentorId } },
    { $group: { _id: null, average: { $avg: "$rating" } } }
  ]);

  const average = result[0]?.average || 0;
  await User.findByIdAndUpdate(mentorId, { rating: average.toFixed(1) });
};

// Ajouter cette méthode à la fin du fichier existant :

// Obtenir les statistiques d'un mentor
exports.getMentorStats = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.mentorId);
    
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor non trouvé' });
    }

    res.json({
      mentorId: mentor._id,
      averageRating: mentor.ratingAverage,
      totalReviews: mentor.ratingQuantity,
      mentorName: `${mentor.firstName} ${mentor.lastName}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMentorReviews = async (req, res) => {
  const reviews = await Review.find({ mentor: req.params.mentorId })
    .populate('user', 'firstName lastName avatar')
    .sort('-createdAt');

  res.json(reviews);
};

// Méthodes existantes à conserver...
exports.updateReview = async (req, res) => { /* ... */ };
exports.deleteReview = async (req, res) => { /* ... */ };
exports.getReviewsByMentor = async (req, res) => { /* ... */ };