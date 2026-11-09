package com.datafit.backend.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.NoSuchElementException;

// Convertit les exceptions courantes en codes HTTP propres pour toute l'API.
// S'applique à tous les @RestController du projet, actuels et futurs.
@RestControllerAdvice
public class ApiExceptionHandler {

@ExceptionHandler(NoSuchElementException.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
public String notFound(NoSuchElementException e) {
  return e.getMessage() != null ? e.getMessage() : "Ressource introuvable.";
}

// contrainte de la base non respectée (ex. deux nuits le même jour envoyées en même temps)
@ExceptionHandler(DataIntegrityViolationException.class)
@ResponseStatus(HttpStatus.CONFLICT)
public String contrainte(DataIntegrityViolationException e) {
  return "Cet enregistrement existe déjà.";
}

@ExceptionHandler(IllegalStateException.class)
@ResponseStatus(HttpStatus.CONFLICT)
public String conflit(IllegalStateException e) {
  return e.getMessage();
}
}
