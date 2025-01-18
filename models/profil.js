const mongoose = require('mongoose');

const profilSchema = new mongoose.Schema({
    codeProfil: { 
        type: String, 
        unique: true, 
        required: true,
        trim: true
    },
    libelle: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String,
        trim: true
    },
    permissions: [{ 
        type: String,
        trim: true
    }],
}, { 
    timestamps: true
});

// Méthode pour générer un codeProfil unique
profilSchema.statics.generateUniqueCode = async function() {
    const count = await this.countDocuments();
    return `PROF${(count + 1).toString().padStart(3, '0')}`;
};

const Profil = mongoose.model('Profil', profilSchema);

module.exports = Profil;