const express = require('express');
const router = express.Router();
const Formation = require('../models/formation');
const Domaine = require('../models/domaine');
const Formateur = require('../models/formateur');
const Participant = require('../models/participant');
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

// Liste des formations
router.get('/', async (req, res) => {
  try {
    const [formations, domaines] = await Promise.all([
      Formation.find().populate('formateur').populate('domaine'),
      Domaine.find()
    ]);
    res.render('formations/list', { 
      formations, 
      domaines,
      title: 'Liste des Formations',
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des formations:', err);
    req.flash('error', 'Erreur lors de la récupération des formations.');
    res.redirect('/dashboard');
  }
});

// Formulaire d'ajout de formation
router.get('/add', async (req, res) => {
  try {
    const [domaines, formateurs] = await Promise.all([
      Domaine.find(),
      Formateur.find()
    ]);
    res.render('formations/form', { 
      formation: null, 
      domaines, 
      formateurs,
      title: 'Ajouter une formation',
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    console.error('Erreur lors du chargement du formulaire d\'ajout:', err);
    req.flash('error', 'Erreur lors du chargement du formulaire d\'ajout.');
    res.redirect('/formations');
  }
});

// Ajouter une formation
router.post('/add', async (req, res) => {
  try {
    const newFormation = new Formation(req.body);
    await newFormation.save();
    req.flash('success', 'Formation ajoutée avec succès.');
    res.redirect('/formations');
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la formation:', err);
    req.flash('error', 'Erreur lors de l\'ajout de la formation.');
    res.redirect('/formations/add');
  }
});

// Formulaire de modification de formation
router.get('/edit/:id', async (req, res) => {
  try {
    const [formation, domaines, formateurs] = await Promise.all([
      Formation.findById(req.params.id).populate('domaine').populate('formateur'),
      Domaine.find(),
      Formateur.find()
    ]);
    if (!formation) {
      req.flash('error', 'Formation non trouvée.');
      return res.redirect('/formations');
    }
    res.render('formations/form', { 
      formation, 
      domaines, 
      formateurs,
      title: 'Modifier une formation',
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    console.error('Erreur lors du chargement du formulaire de modification:', err);
    req.flash('error', 'Erreur lors du chargement du formulaire de modification.');
    res.redirect('/formations');
  }
});

// Modifier une formation
router.post('/edit/:id', async (req, res) => {
  try {
    const updatedFormation = await Formation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedFormation) {
      req.flash('error', 'Formation non trouvée.');
      return res.redirect('/formations');
    }
    req.flash('success', 'Formation modifiée avec succès.');
    res.redirect('/formations');
  } catch (err) {
    console.error('Erreur lors de la modification de la formation:', err);
    req.flash('error', 'Erreur lors de la modification de la formation.');
    res.redirect(`/formations/edit/${req.params.id}`);
  }
});

// Supprimer une formation
router.post('/delete/:id', async (req, res) => {
  try {
    const deletedFormation = await Formation.findByIdAndDelete(req.params.id);
    if (!deletedFormation) {
      req.flash('error', 'Formation non trouvée.');
      return res.redirect('/formations');
    }
    req.flash('success', 'Formation supprimée avec succès.');
    res.redirect('/formations');
  } catch (err) {
    console.error('Erreur lors de la suppression de la formation:', err);
    req.flash('error', 'Erreur lors de la suppression de la formation.');
    res.redirect('/formations');
  }
});

module.exports = router;

