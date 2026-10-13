package com.datafit.backend;

public class HeartRateResponse {
private int bpm;
private String status;
private String message;

public HeartRateResponse(int bpm, String status, String message) {
  this.bpm = bpm;
  this.status = status;
  this.message = message;
}

public int getBpm() {
  return bpm;
}

public String getStatus() {
  return status;
}

public String getMessage() {
  return message;
}
}
