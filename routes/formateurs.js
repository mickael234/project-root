const express = require('express');
const router = express.Router();
const Formateur = require('../models/formateur');
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

// Liste des formateurs
router.get('/', async (req, res) => {
    try {
        const [formateurs, domaines] = await Promise.all([
            Formateur.find().populate('domaine'),
            Domaine.find()
        ]);
        res.render('formateurs/list', { 
            formateurs, 
            domaines,
            title: 'Liste des formateurs',
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des formateurs:', err);
        req.flash('error', 'Erreur lors de la récupération des formateurs.');
        res.redirect('/dashboard');
    }
});

// Formulaire d'ajout de formateur
router.get('/add', async (req, res) => {
    try {
        const domaines = await Domaine.find();
        res.render('formateurs/form', { 
            formateur: null,
            domaines,
            title: 'Ajouter un formateur',
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        console.error('Erreur lors du chargement du formulaire d\'ajout:', err);
        req.flash('error', 'Erreur lors du chargement du formulaire d\'ajout.');
        res.redirect('/formateurs');
    }
});

// Ajouter un formateur
router.post('/add', async (req, res) => {
    try {
        const newFormateur = new Formateur(req.body);
        if (req.body.competences) {
            newFormateur.competences = req.body.competences.split(',').map(comp => comp.trim());
        }
        await newFormateur.save();
        req.flash('success', 'Formateur ajouté avec succès.');
        res.redirect('/formateurs');
    } catch (err) {
        console.error('Erreur lors de l\'ajout du formateur:', err);
        req.flash('error', 'Erreur lors de l\'ajout du formateur.');
        res.redirect('/formateurs/add');
    }
});

// Formulaire de modification de formateur
router.get('/edit/:id', async (req, res) => {
    try {
        const [formateur, domaines] = await Promise.all([
            Formateur.findById(req.params.id).populate('domaine'),
            Domaine.find()
        ]);
        if (!formateur) {
            req.flash('error', 'Formateur non trouvé.');
            return res.redirect('/formateurs');
        }
        res.render('formateurs/form', { 
            formateur, 
            domaines,
            title: 'Modifier un formateur',
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        console.error('Erreur lors de la récupération du formateur:', err);
        req.flash('error', 'Erreur lors de la récupération du formateur.');
        res.redirect('/formateurs');
    }
});

// Modifier un formateur
router.post('/edit/:id', async (req, res) => {
    try {
        if (req.body.competences) {
            req.body.competences = req.body.competences.split(',').map(comp => comp.trim());
        }
        const updatedFormateur = await Formateur.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedFormateur) {
            req.flash('error', 'Formateur non trouvé.');
            return res.redirect('/formateurs');
        }
        req.flash('success', 'Formateur modifié avec succès.');
        res.redirect('/formateurs');
    } catch (err) {
        console.error('Erreur lors de la modification du formateur:', err);
        req.flash('error', 'Erreur lors de la modification du formateur.');
        res.redirect(`/formateurs/edit/${req.params.id}`);
    }
});

// Supprimer un formateur
router.post('/delete/:id', async (req, res) => {
    try {
        const deletedFormateur = await Formateur.findByIdAndDelete(req.params.id);
        if (!deletedFormateur) {
            req.flash('error', 'Formateur non trouvé.');
            return res.redirect('/formateurs');
        }
        req.flash('success', 'Formateur supprimé avec succès.');
        res.redirect('/formateurs');
    } catch (err) {
        console.error('Erreur lors de la suppression du formateur:', err);
        req.flash('error', 'Erreur lors de la suppression du formateur.');
        res.redirect('/formateurs');
    }
});

module.exports = router;

