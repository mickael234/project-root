const express = require('express');
const router = express.Router();
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

// Liste des profils
router.get('/', async (req, res) => {
  try {
    const profils = await Profil.find();
    res.render('profils/list', { 
      profils, 
      title: 'Liste des Profils',
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des profils:', err);
    req.flash('error', 'Erreur lors de la récupération des profils.');
    res.redirect('/dashboard');
  }
});

// Formulaire d'ajout de profil
router.get('/add', (req, res) => {
  res.render('profils/form', { 
    profil: null, 
    title: 'Ajouter un Profil',
    csrfToken: req.csrfToken()
  });
});

// Ajouter un profil
router.post('/add', async (req, res) => {
  try {
    const { codeProfil, libelle, description, permissions } = req.body;
    const newProfil = new Profil({
      codeProfil,
      libelle,
      description,
      permissions: permissions.split(',').map(p => p.trim())
    });
    await newProfil.save();
    req.flash('success', 'Profil ajouté avec succès.');
    res.redirect('/profils');
  } catch (err) {
    console.error('Erreur lors de l\'ajout du profil:', err);
    req.flash('error', 'Erreur lors de l\'ajout du profil.');
    res.redirect('/profils/add');
  }
});

// Formulaire de modification de profil
router.get('/edit/:id', async (req, res) => {
  try {
    const profil = await Profil.findById(req.params.id);
    if (!profil) {
      req.flash('error', 'Profil non trouvé.');
      return res.redirect('/profils');
    }
    res.render('profils/form', { 
      profil, 
      title: 'Modifier un Profil',
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    req.flash('error', 'Erreur lors de la récupération du profil.');
    res.redirect('/profils');
  }
});

// Modifier un profil
router.post('/edit/:id', async (req, res) => {
  try {
    const { codeProfil, libelle, description, permissions } = req.body;
    const updatedProfil = await Profil.findByIdAndUpdate(req.params.id, {
      codeProfil,
      libelle,
      description,
      permissions: permissions.split(',').map(p => p.trim())
    }, { new: true, runValidators: true });
    if (!updatedProfil) {
      req.flash('error', 'Profil non trouvé.');
      return res.redirect('/profils');
    }
    req.flash('success', 'Profil modifié avec succès.');
    res.redirect('/profils');
  } catch (err) {
    console.error('Erreur lors de la modification du profil:', err);
    req.flash('error', 'Erreur lors de la modification du profil.');
    res.redirect(`/profils/edit/${req.params.id}`);
  }
});

// Supprimer un profil
router.post('/delete/:id', async (req, res) => {
  try {
    const deletedProfil = await Profil.findByIdAndDelete(req.params.id);
    if (!deletedProfil) {
      req.flash('error', 'Profil non trouvé.');
      return res.redirect('/profils');
    }
    req.flash('success', 'Profil supprimé avec succès.');
    res.redirect('/profils');
  } catch (err) {
    console.error('Erreur lors de la suppression du profil:', err);
    req.flash('error', 'Erreur lors de la suppression du profil.');
    res.redirect('/profils');
  }
});

module.exports = router;

