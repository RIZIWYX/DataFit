package com.datafit.backend.compte;

// Le mot de passe tapé pour confirmer une action sur le compte ne correspond pas
public class MotDePasseIncorrectException extends RuntimeException {

    public MotDePasseIncorrectException() {
        super("Mot de passe incorrect");
    }
}
