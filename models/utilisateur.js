const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
    code_utilisateur: {
        type: String,
        unique: true,
        required: true,
        default: function() {
            return `USER${(Math.floor(Math.random() * 10000)).toString().padStart(4, '0')}`;
        }
    },
    login: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    nom: String,
    prenom: String,
    email: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });

utilisateurSchema.pre('save', async function(next) {
    if (this.isNew) {
        if (!this.code_utilisateur) {
            let isUnique = false;
            while (!isUnique) {
                this.code_utilisateur = `USER${(Math.floor(Math.random() * 10000)).toString().padStart(4, '0')}`;
                const existingUser = await this.constructor.findOne({ code_utilisateur: this.code_utilisateur });
                if (!existingUser) {
                    isUnique = true;
                }
            }
        }
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }
    next();
});

utilisateurSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;

