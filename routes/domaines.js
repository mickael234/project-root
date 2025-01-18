const express = require('express');
const router = express.Router();
const Domaine = require('../models/domaine');
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

// Liste des domaines
router.get('/', async (req, res) => {
    try {
        const domaines = await Domaine.find();
        res.render('domaines/list', { 
            domaines, 
            title: 'Liste des domaines',
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des domaines:', err);
        req.flash('error', 'Erreur lors de la récupération des domaines.');
        res.redirect('/dashboard');
    }
});

// Formulaire d'ajout de domaine
router.get('/add', (req, res) => {
    res.render('domaines/add', { 
        title: 'Ajouter un domaine',
        csrfToken: req.csrfToken()
    });
});

// Ajouter un domaine
router.post('/add', async (req, res) => {
    try {
        const newDomaine = new Domaine(req.body);
        await newDomaine.save();
        req.flash('success', 'Domaine ajouté avec succès.');
        res.redirect('/domaines');
    } catch (err) {
        console.error('Erreur lors de l\'ajout du domaine:', err);
        req.flash('error', 'Erreur lors de l\'ajout du domaine.');
        res.redirect('/domaines/add');
    }
});

// Formulaire de modification de domaine
router.get('/edit/:id', async (req, res) => {
    try {
        const domaine = await Domaine.findById(req.params.id);
        if (!domaine) {
            req.flash('error', 'Domaine non trouvé.');
            return res.redirect('/domaines');
        }
        res.render('domaines/edit', { 
            domaine, 
            title: 'Modifier un domaine',
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        console.error('Erreur lors de la récupération du domaine:', err);
        req.flash('error', 'Erreur lors de la récupération du domaine.');
        res.redirect('/domaines');
    }
});

// Modifier un domaine
router.post('/edit/:id', async (req, res) => {
    try {
        const updatedDomaine = await Domaine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedDomaine) {
            req.flash('error', 'Domaine non trouvé.');
            return res.redirect('/domaines');
        }
        req.flash('success', 'Domaine modifié avec succès.');
        res.redirect('/domaines');
    } catch (err) {
        console.error('Erreur lors de la modification du domaine:', err);
        req.flash('error', 'Erreur lors de la modification du domaine.');
        res.redirect(`/domaines/edit/${req.params.id}`);
    }
});

// Supprimer un domaine
router.post('/delete/:id', async (req, res) => {
    try {
        const deletedDomaine = await Domaine.findByIdAndDelete(req.params.id);
        if (!deletedDomaine) {
            req.flash('error', 'Domaine non trouvé.');
            return res.redirect('/domaines');
        }
        req.flash('success', 'Domaine supprimé avec succès.');
        res.redirect('/domaines');
    } catch (err) {
        console.error('Erreur lors de la suppression du domaine:', err);
        req.flash('error', 'Erreur lors de la suppression du domaine.');
        res.redirect('/domaines');
    }
});

module.exports = router;