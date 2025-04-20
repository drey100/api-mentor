const Review = require('../models/Review');

// Ajouter un avis
exports.addReview = async (req, res) => {
  try {
    const { mentorId, rating, comment } = req.body;
    const review = new Review({
      userId: req.user._id,
      mentorId,
      rating,
      comment,
    });
    await review.save();
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Modifier un avis
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { rating, comment },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un avis
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir les avis d'un mentor
exports.getReviewsByMentor = async (req, res) => {
  try {
    const reviews = await Review.find({ mentorId: req.params.mentorId }).populate('userId', 'firstName lastName');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};