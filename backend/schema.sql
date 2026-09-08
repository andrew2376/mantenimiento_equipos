-- Script de creación de base de datos y tablas para el Sistema de Mantenimiento de Equipos

CREATE DATABASE IF NOT EXISTS mantenimiento_equipos;
USE mantenimiento_equipos;

-- Tabla de Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_inventario VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) DEFAULT NULL,
  numero_serie VARCHAR(50) DEFAULT NULL,
  ubicacion VARCHAR(100) NOT NULL,
  estado INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Mantenimientos
CREATE TABLE IF NOT EXISTS mantenimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipo_id INT NOT NULL,
  solicitante VARCHAR(100) NOT NULL,
  tecnico_asignado VARCHAR(100) DEFAULT NULL,
  tipo ENUM('PREVENTIVO', 'CORRECTIVO') NOT NULL DEFAULT 'CORRECTIVO',
  descripcion_falla TEXT NOT NULL,
  diagnostico TEXT DEFAULT NULL,
  actividades_realizadas TEXT DEFAULT NULL,
  repuestos_utilizados TEXT DEFAULT NULL,
  estado ENUM('PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_finalizacion TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mantenimiento_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

