const mongoose = require('mongoose');

const formateurSchema = new mongoose.Schema({
  code_formateur: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String },
  adresse: { type: String },
  domaine: { type: mongoose.Schema.Types.ObjectId, ref: 'Domaine', required: true },
  experience: { type: String },
  competences: [{ type: String }],
  cv: { type: String },
  photo: { type: String }
});

module.exports = mongoose.model('Formateur', formateurSchema);

