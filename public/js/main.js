// Assurez-vous que le DOM est entièrement chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document chargé et prêt.');

    // Navigation active
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Animation de chargement pour les boutons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const originalText = button.textContent;
            button.textContent = 'Chargement...';
            button.disabled = true;
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        });
    });

    // Gestion de la soumission des formulaires
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Empêche l'envoi par défaut pour la personnalisation

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            console.log('Formulaire soumis : ', data);
            // Simule une requête (à remplacer par un fetch ou axios pour une API réelle)
            setTimeout(() => {
                alert('Formulaire soumis avec succès !');
                form.reset();
            }, 1000);
        });
    });

    // Alertes interactives
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        const closeBtn = alert.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                alert.style.display = 'none';
            });
        }
    });

    // Animation des cartes de tableau de bord
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.addEventListener('mouseover', () => {
            card.classList.add('hover');
        });
        card.addEventListener('mouseout', () => {
            card.classList.remove('hover');
        });
    });
});
