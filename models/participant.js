// routes
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    matricule: { type: String, required: true, unique: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    dateNaissance: { type: Date, required: true },
    profil: { type: mongoose.Schema.Types.ObjectId, ref: 'Profil', required: true }
});

module.exports = mongoose.model('Participant', participantSchema);