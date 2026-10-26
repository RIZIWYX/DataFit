package com.datafit.backend.connexion;

// Le mot de passe est bon, mais l'adresse e-mail n'a pas encore été confirmée
public class EmailNonVerifieException extends RuntimeException {

    public EmailNonVerifieException() {
        super("Confirmez d'abord votre adresse e-mail avec le lien reçu à l'inscription.");
    }
}
