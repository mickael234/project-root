const express = require('express');
const router = express.Router();
const Participant = require('../models/participant');
const Formateur = require('../models/formateur');
const Formation = require('../models/formation');
const Domaine = require('../models/domaine');

router.get('/', async (req, res) => {
    const searchTerm = req.query.term;
    if (!searchTerm || searchTerm.length < 2) {
        return res.json({ participants: [], formateurs: [], formations: [], domaines: [] });
    }

    try {
        const [participants, formateurs, formations, domaines] = await Promise.all([
            Participant.find({ 
                $or: [
                    { nom: new RegExp(searchTerm, 'i') },
                    { prenom: new RegExp(searchTerm, 'i') },
                    { matricule: new RegExp(searchTerm, 'i') }
                ]
            }).limit(5),
            Formateur.find({ 
                $or: [
                    { nom: new RegExp(searchTerm, 'i') },
                    { prenom: new RegExp(searchTerm, 'i') },
                    { code_formateur: new RegExp(searchTerm, 'i') },
                    { email: new RegExp(searchTerm, 'i') }
                ]
            }).limit(5),
            Formation.find({ 
                $or: [
                    { intitule: new RegExp(searchTerm, 'i') },
                    { description: new RegExp(searchTerm, 'i') }
                ]
            }).limit(5),
            Domaine.find({ 
                $or: [
                    { nom: new RegExp(searchTerm, 'i') },
                    { description: new RegExp(searchTerm, 'i') }
                ]
            }).limit(5)
        ]);

        res.json({ participants, formateurs, formations, domaines });
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        res.status(500).json({ error: 'Une erreur est survenue lors de la recherche' });
    }
});

module.exports = router;