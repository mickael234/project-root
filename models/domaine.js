const mongoose = require('mongoose');

const domaineSchema = new mongoose.Schema({
    codeDomaine: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nom: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Method to generate a unique codeDomaine
domaineSchema.statics.generateUniqueCode = async function() {
    const count = await this.countDocuments();
    return `DOM${(count + 1).toString().padStart(3, '0')}`;
};

const Domaine = mongoose.model('Domaine', domaineSchema);

module.exports = Domaine;