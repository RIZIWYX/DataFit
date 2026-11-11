package com.datafit.backend.abonnement;

// Stripe n'est pas configuré (clés absentes) ou n'a pas répondu
public class PaiementIndisponibleException extends RuntimeException {

    public PaiementIndisponibleException(String message, Throwable cause) {
        super(message, cause);
    }
}
