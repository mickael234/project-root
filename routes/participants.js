const express = require('express');
const router = express.Router();
const Participant = require('../models/participant');
const Profil = require('../models/profil');
const csrf = require('csurf');

// Configuration de la protection CSRF
const csrfProtection = csrf({ cookie: true });

// Middleware d'authentification
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  req.flash('error', 'Veuillez vous connecter pour accéder à cette page.');
  res.redirect('/auth/login');
};

// Appliquer l'authentification et la protection CSRF à toutes les routes
router.use(isAuthenticated, csrfProtection);

// Liste des participants
router.get('/', async (req, res) => {
  try {
    const [participants, profils] = await Promise.all([
      Participant.find().populate('profil'),
      Profil.find()
    ]);
    res.render('participants/list', { 
      participants, 
      profils,
      title: 'Liste des Participants',
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des participants:', err);
    req.flash('error', 'Erreur lors de la récupération des participants.');
    res.redirect('/dashboard');
  }
});

// Formulaire d'ajout de participant
router.get('/add', async (req, res) => {
    try {
        const profils = await Profil.find();
        res.render('participants/form', { participant: null, profils, title: 'Ajouter un Participant' });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Erreur lors du chargement du formulaire d\'ajout.');
        res.redirect('/participants');
    }
});

// Ajouter un participant
router.post('/add', async (req, res) => {
    try {
        const { matricule, nom, prenom, dateNaissance, profil } = req.body;
        const newParticipant = new Participant({
            matricule,
            nom,
            prenom,
            dateNaissance: new Date(dateNaissance),
            profil
        });
        await newParticipant.save();
        req.flash('success', 'Participant ajouté avec succès.');
        res.redirect('/participants');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Erreur lors de l\'ajout du participant.');
        res.redirect('/participants/add');
    }
});


// Formulaire de modification d'un participant
router.get('/edit/:id', async (req, res) => {
    try {
        const participant = await Participant.findById(req.params.id);
        const profils = await Profil.find();
        if (!participant) {
            req.flash('error', 'Participant non trouvé.');
            return res.redirect('/participants');
        }
        res.render('participants/form', { participant, profils, title: 'Modifier un Participant' });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Erreur lors du chargement du formulaire de modification.');
        res.redirect('/participants');
    }
});

// Modifier un participant
router.post('/edit/:id', async (req, res) => {
    try {
        const { matricule, nom, prenom, dateNaissance, profil } = req.body;
        const updatedParticipant = await Participant.findByIdAndUpdate(req.params.id, {
            matricule,
            nom,
            prenom,
            dateNaissance: new Date(dateNaissance),
            profil
        }, { new: true, runValidators: true });

        if (!updatedParticipant) {
            req.flash('error', 'Participant non trouvé.');
            return res.redirect('/participants');
        }

        req.flash('success', 'Participant modifié avec succès.');
        res.redirect('/participants');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Erreur lors de la modification du participant.');
        res.redirect(`/participants/edit/${req.params.id}`);
    }
});


module.exports = router;