const express = require('express');
const router = express.Router();
const Utilisateur = require('../models/utilisateur');
const bcrypt = require('bcryptjs');

router.get('/register', (req, res) => {
    res.render('auth/register', { 
        title: 'Inscription',
        messages: req.flash()
    });
});

router.post('/register', async (req, res) => {
    const { login, password, confirm_password, nom, prenom, email } = req.body;
    try {
        if (password !== confirm_password) {
            req.flash('error', 'Les mots de passe ne correspondent pas');
            return res.redirect('/auth/register');
        }

        const existingUser = await Utilisateur.findOne({ $or: [{ login }, { email }] });
        if (existingUser) {
            req.flash('error', 'Le login ou l\'email existe déjà');
            return res.redirect('/auth/register');
        }

        const utilisateur = new Utilisateur({
            login,
            password,
            nom,
            prenom,
            email
        });
        await utilisateur.save();
        console.log('Nouvel utilisateur enregistré:', utilisateur);
        req.flash('success', 'Inscription réussie. Vous pouvez maintenant vous connecter.');
        return res.redirect('/auth/login');
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        if (error.code === 11000) {
            req.flash('error', 'Une erreur est survenue. Veuillez réessayer.');
        } else if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            req.flash('error', validationErrors.join(', '));
        } else {
            req.flash('error', 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
        }
        return res.redirect('/auth/register');
    }
});

router.get('/login', (req, res) => {
    res.render('auth/login', { 
        title: 'Connexion',
        messages: req.flash()
    });
});

router.post('/login', async (req, res) => {
    const { login, password } = req.body;
    try {
        const user = await Utilisateur.findOne({ login });
        if (!user) {
            req.flash('error', 'Identifiant ou mot de passe incorrect');
            return res.redirect('/auth/login');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Identifiant ou mot de passe incorrect');
            return res.redirect('/auth/login');
        }

        req.session.userId = user._id;
        req.session.userLogin = user.login;
        console.log('Utilisateur connecté:', user);
        req.flash('success', 'Connexion réussie');
        return res.redirect('/dashboard');
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        req.flash('error', 'Une erreur est survenue lors de la connexion');
        return res.redirect('/auth/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;

