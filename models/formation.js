const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
    codeFormation: { type: String, required: true, unique: true },
    intitule: { type: String, required: true },
    domaine: { type: mongoose.Schema.Types.ObjectId, ref: 'Domaine', required: true },
    nombreJours: { type: Number, required: true },
    annee: { type: Number, required: true },
    mois: { type: Number, required: true },
    formateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Formateur', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }]
});

module.exports = mongoose.model('Formation', formationSchema);



formationSchema.pre('save', async function(next) {
    if (this.participants.length < 4) {
        throw new Error('Une formation doit avoir au moins 4 participants.');
    }
    next();
});

module.exports = mongoose.model('Formation', formationSchema);