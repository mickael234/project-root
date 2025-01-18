const express = require('express');
const router = express.Router();
const Participant = require('../models/participant');
const Formateur = require('../models/formateur');
const Formation = require('../models/formation');
const Domaine = require('../models/domaine');

router.get('/', async (req, res) => {
    try {
        const [totalParticipants, totalFormateurs, totalFormations, totalDomaines, formations] = await Promise.all([
            Participant.countDocuments(),
            Formateur.countDocuments(),
            Formation.countDocuments(),
            Domaine.countDocuments(),
            Formation.find().populate('domaine').populate('formateur').limit(5).sort({ createdAt: -1 })
        ]);

        res.render('dashboard', {
            title: 'Tableau de bord',
            totalParticipants,
            totalFormateurs,
            totalFormations,
            totalDomaines,
            formations
        });
    } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error);
        req.flash('error', 'Une erreur est survenue lors du chargement du tableau de bord.');
        res.redirect('/');
    }
});

module.exports = router;

