import 'package:flutter/material.dart';

class PetPassportModel {
  final String microchipNumber;
  final bool hasRabiesVaccine;
  final DateTime? lastVaccineDate;
  final String vetClinicName;
  final String specialDiet;

  PetPassportModel({
    required this.microchipNumber,
    required this.hasRabiesVaccine,
    this.lastVaccineDate,
    this.vetClinicName = 'Arya Veteriner Kliniği',
    this.specialDiet = 'Günde 2 öğün kuru mama',
  });
}

class JourneyLogEntry {
  final String time;
  final String title;
  final String description;
  final IconData icon;
  final bool isCompleted;

  JourneyLogEntry({
    required this.time,
    required this.title,
    required this.description,
    required this.icon,
    this.isCompleted = true,
  });
}
