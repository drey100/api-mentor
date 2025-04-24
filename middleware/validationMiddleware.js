

// Middleware de validation
const validateSignup = (req, res, next) => {
    const { email, password } = req.body;

    // Vérifier l'email (regex basique)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Email invalide" });
    }

    // Vérifier le mot de passe (ex: 8 caractères minimum)
    if (password.length < 8) {
        return res.status(400).json({ error: "Le mot de passe doit faire 8 caractères minimum" });
    }

    // Si tout est OK, passer à la suite
    next();
};

// Route d'inscription
app.post('/signup', validateSignup, (req, res) => {
    // Traitement de l'inscription...
    res.json({ success: true });
});

