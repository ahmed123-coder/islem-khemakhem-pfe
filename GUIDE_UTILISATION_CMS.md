# 🎨 Guide d'utilisation du CMS

## Comment modifier le contenu de votre site

### 1️⃣ Accéder au panneau d'administration

1. Ouvrez votre navigateur et allez sur : `http://localhost:3000/login`
2. Connectez-vous avec les identifiants admin :
   - **Email** : `admin@consultpro.com`
   - **Mot de passe** : `admin123`
3. Une fois connecté, allez sur : `http://localhost:3000/admin/content`

### 2️⃣ Modifier le contenu

Le panneau d'administration vous permet de modifier 3 sections :

#### 📋 **Navbar (Menu de navigation)**
- **Logo** : Le nom de votre entreprise affiché en haut
- **Liens** : Les liens du menu (Accueil, Services, Blog, Contact)

**Exemple :**
```
Logo: DSL Conseil
Liens:
  - Accueil → /
  - Services → /services
  - Blog → /blog
  - Contact → /contact
```

#### 🦸 **Hero (Section principale)**
- **Titre** : Le grand titre de votre page d'accueil
- **Sous-titre** : La description sous le titre
- **Texte du bouton** : Le texte du bouton d'action
- **Lien du bouton** : Où le bouton redirige

**Exemple :**
```
Titre: Transformez votre entreprise avec l'excellence
Sous-titre: Conseil en management, RH, qualité et performance...
Texte du bouton: Prendre rendez-vous
Lien du bouton: /prendre-rdv
```

#### 👣 **Footer (Pied de page)**
- **Nom de l'entreprise** : Votre nom d'entreprise
- **Slogan** : Description courte de votre activité
- **Email** : Votre email de contact
- **Téléphone** : Votre numéro de téléphone
- **Adresse** : Votre adresse
- **LinkedIn** : Lien vers votre page LinkedIn
- **Twitter** : Lien vers votre compte Twitter

**Exemple :**
```
Entreprise: DSL Conseil
Slogan: Cabinet de conseil en management...
Email: contact@dsl-conseil.com
Téléphone: +33 1 23 45 67 89
Adresse: Paris, France
LinkedIn: https://linkedin.com/company/dsl-conseil
Twitter: https://twitter.com/dslconseil
```

### 3️⃣ Sauvegarder les modifications

1. Après avoir modifié le contenu, cliquez sur **"Save Changes"**
2. Un message de confirmation apparaîtra : "Content updated successfully!"
3. Les modifications sont **immédiatement visibles** sur votre site

### 4️⃣ Voir les modifications

1. Ouvrez un nouvel onglet et allez sur : `http://localhost:3000`
2. Rafraîchissez la page (F5)
3. Vous verrez vos modifications appliquées !

## 🔄 Workflow complet

```
1. Login → /login
2. Admin Panel → /admin/content
3. Modifier le contenu (Navbar, Hero, ou Footer)
4. Cliquer sur "Save Changes"
5. Aller sur la page d'accueil → /
6. Rafraîchir la page
7. ✅ Modifications visibles !
```

## 💡 Conseils

- **Navbar** : Gardez 4-5 liens maximum pour une navigation claire
- **Hero** : Utilisez un titre accrocheur et un sous-titre descriptif
- **Footer** : Assurez-vous que toutes les informations de contact sont à jour
- **Sauvegarde** : Cliquez toujours sur "Save Changes" après modification

## 🔐 Sécurité

- Seuls les **administrateurs** peuvent modifier le contenu
- Les visiteurs peuvent **uniquement voir** le contenu
- Vos modifications sont **sauvegardées en base de données**
- Aucun risque de perte de données

## ❓ Problèmes courants

**Les modifications ne s'affichent pas ?**
- Rafraîchissez la page (Ctrl+F5 ou Cmd+Shift+R)
- Vérifiez que vous avez cliqué sur "Save Changes"
- Vérifiez que vous êtes connecté en tant qu'admin

**Message "Unauthorized" ?**
- Reconnectez-vous avec les identifiants admin
- Vérifiez que vous utilisez le bon compte (admin@consultpro.com)

**Le contenu ne se charge pas ?**
- Vérifiez que le serveur est démarré (`npm run dev`)
- Vérifiez que la base de données est connectée

## 📞 Support

Pour toute question, consultez la documentation technique dans :
- `CMS_DOCUMENTATION.md`
- `CMS_QUICK_REFERENCE.md`
