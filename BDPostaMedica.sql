-- =======================================================
-- Base de Datos: posta_medica_valdiviezo
-- Motor: MySQL
-- =======================================================
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in reverse order of dependency if they exist
-- DROP TABLE IF EXISTS Evolucion_Clinica;
-- DROP TABLE IF EXISTS Historia_Clinica;
-- DROP TABLE IF EXISTS Cita;
-- DROP TABLE IF EXISTS Disponibilidad_Medico;
-- DROP TABLE IF EXISTS Medico;
-- DROP TABLE IF EXISTS Especialidad;
-- DROP TABLE IF EXISTS Administrador;
-- DROP TABLE IF EXISTS Paciente;
-- DROP TABLE IF EXISTS Ubigeo;
-- DROP TABLE IF EXISTS Estado_Paciente;
-- DROP TABLE IF EXISTS Estado_Cita;
-- DROP TABLE IF EXISTS CIE;

CREATE DATABASE IF NOT EXISTS posta_medica_valdiviezo;
USE posta_medica_valdiviezo;

-- =======================================================
-- TABLA: Estado Cita
-- =======================================================
CREATE TABLE Estado_Cita (
  id_estado_cita INT AUTO_INCREMENT PRIMARY KEY,
  nombre_estado VARCHAR(45) NOT NULL,
  descripcion VARCHAR(100)
);

-- =======================================================
-- TABLA: Estado Paciente
-- =======================================================
CREATE TABLE Estado_Paciente (
  id_estado_paciente INT AUTO_INCREMENT PRIMARY KEY,
  nombre_estado VARCHAR(45) NOT NULL,
  descripcion VARCHAR(100)
);

-- =======================================================
-- TABLA: Ubigeo
-- =======================================================
CREATE TABLE Ubigeo (
  idubigeo INT AUTO_INCREMENT PRIMARY KEY,
  departamento VARCHAR(45) NOT NULL,
  distrito VARCHAR(45) NOT NULL
);

-- =======================================================
-- TABLA: Paciente
-- =======================================================
CREATE TABLE Paciente (
  idPaciente INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(45) NOT NULL,
  apellidos VARCHAR(45) NOT NULL,
  dni CHAR(8) UNIQUE NOT NULL,
  clave VARCHAR(255) NOT NULL,
  fecha_nacimiento DATE,
  sexo ENUM('M','F') NOT NULL,
  telefono VARCHAR(20),
  id_estado_paciente INT,
  id_ubigeo INT,
  FOREIGN KEY (id_estado_paciente) REFERENCES Estado_Paciente(id_estado_paciente),
  FOREIGN KEY (id_ubigeo) REFERENCES Ubigeo(idubigeo)
);

-- =======================================================
-- TABLA: Administrador
-- =======================================================
CREATE TABLE Administrador (
  idAdministrador INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(45) NOT NULL,
  apellidos VARCHAR(45) NOT NULL,
  dni CHAR(8) UNIQUE NOT NULL,
  clave VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'ADMIN'
);

-- =======================================================
-- TABLA: Especialidad
-- =======================================================
CREATE TABLE Especialidad (
  id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
  nombre_especialidad VARCHAR(45) NOT NULL,
  descripcion VARCHAR(100),
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

-- =======================================================
-- TABLA: Medico
-- =======================================================
CREATE TABLE Medico (
  id_medico INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(45) NOT NULL,
  apellidos VARCHAR(45) NOT NULL,
  cmp VARCHAR(15) UNIQUE NOT NULL,
  dni CHAR(8) UNIQUE NOT NULL,
  clave VARCHAR(255) NOT NULL,
  id_especialidad INT,
  FOREIGN KEY (id_especialidad) REFERENCES Especialidad(id_especialidad)
);

-- =======================================================
-- TABLA: Disponibilidad_Medico
-- =======================================================
CREATE TABLE Disponibilidad_Medico (
  idDisponibilidad_Medico INT AUTO_INCREMENT PRIMARY KEY,
  id_medico INT,
  dia_semana VARCHAR(20),
  hora_inicio TIME,
  hora_fin TIME,
  FOREIGN KEY (id_medico) REFERENCES Medico(id_medico) ON DELETE CASCADE
);

-- =======================================================
-- TABLA: Cita
-- =======================================================
CREATE TABLE Cita (
  idCita INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT,
  id_medico INT,
  fecha_cita DATE,
  hora_cita TIME,
  motivo VARCHAR(255),
  estado_cita INT,
  FOREIGN KEY (estado_cita) REFERENCES Estado_Cita(id_estado_cita),
  FOREIGN KEY (id_paciente) REFERENCES Paciente(idPaciente) ON DELETE CASCADE,
  FOREIGN KEY (id_medico) REFERENCES Medico(id_medico)
);

-- =======================================================
-- TABLA: Historia_Clinica
-- =======================================================
CREATE TABLE Historia_Clinica (
  idhistoria_Clinica INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT,
  fecha_creacion DATE,
  observaciones VARCHAR(255),
  tipo_sangre VARCHAR(5),
  alergias VARCHAR(255),
  FOREIGN KEY (id_paciente) REFERENCES Paciente(idPaciente) ON DELETE CASCADE
);

-- =======================================================
-- TABLA: CIE (Catálogo de Enfermedades)
-- =======================================================
CREATE TABLE CIE (
  idCIE INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(10),
  descripcion VARCHAR(100)
);

-- =======================================================
-- TABLA: Evolucion_Clinica
-- =======================================================
CREATE TABLE Evolucion_Clinica (
  idEvolucion_Clinica INT AUTO_INCREMENT PRIMARY KEY,
  id_historia INT,
  id_medico INT,
  fecha_evolucion DATE,
  anotaciones VARCHAR(255),
  id_cie INT,
  FOREIGN KEY (id_historia) REFERENCES Historia_Clinica(idhistoria_Clinica) ON DELETE CASCADE,
  FOREIGN KEY (id_medico) REFERENCES Medico(id_medico),
  FOREIGN KEY (id_cie) REFERENCES CIE(idCIE)
);

-- =======================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =======================================================
DELIMITER //
DROP PROCEDURE IF EXISTS sp_eliminar_paciente //
CREATE PROCEDURE sp_eliminar_paciente(IN p_idPaciente INT)
BEGIN
    DELETE FROM Paciente WHERE idPaciente = p_idPaciente;
END //
DELIMITER ;

-- =======================================================
-- INSERTS DE DATOS
-- =======================================================

INSERT INTO Estado_Cita (nombre_estado, descripcion) VALUES
('Pendiente', 'Cita registrada'),
('Confirmada', 'Cita confirmada por el paciente'),
('Cancelada', 'Cita anulada por el médico o paciente'),
('Atendida', 'Cita ya atendida'),
('Reprogramada', 'Cita movida a otra fecha');

INSERT INTO Estado_Paciente (nombre_estado, descripcion) VALUES
('Activo', 'Paciente en control'),
('Inactivo', 'Paciente sin actividad'),
('En tratamiento', 'Paciente con citas activas'),
('Alta médica', 'Paciente dado de alta'),
('Fallecido', 'Paciente fallecido');

INSERT INTO Ubigeo (departamento, distrito) VALUES
('Lima', 'San Juan de Lurigancho'),
('Cusco', 'Cusco'),
('Arequipa', 'Cercado'),
('Piura', 'Castilla'),
('Puno', 'Juliaca');

INSERT INTO Especialidad (nombre_especialidad, descripcion, precio) VALUES
('Medicina General', 'Atención médica básica', 50.00),
('Pediatría', 'Atención infantil', 60.00),
('Cardiología', 'Especialidad del corazón', 80.00),
('Dermatología', 'Cuidado de la piel', 70.00),
('Ginecología', 'Salud femenina', 75.00);

INSERT INTO Medico (nombres, apellidos, cmp, dni, clave, id_especialidad) VALUES
('Jorge', 'Santos Ruiz', 'CMP12345', '10000001', '123456', 1),
('Carla', 'Paredes Luna', 'CMP23456', '10000002', '123456', 2),
('Eduardo', 'Ramirez Vega', 'CMP34567', '10000003', '123456', 3),
('Lucia', 'Flores Huaman', 'CMP45678', '10000004', '123456', 4),
('Miguel', 'Vasquez Solis', 'CMP56789', '10000005', '123456', 5),
('Roberto', 'Gomez Bolaños', 'CMP67890', '10000006', '123456', 1),
('Andrea', 'Legarreta Martinez', 'CMP78901', '10000007', '123456', 1),
('Sofia', 'Vergara', 'CMP89012', '10000008', '123456', 2),
('Eugenio', 'Derbez', 'CMP90123', '10000009', '123456', 2),
('Thalia', 'Sodi Miranda', 'CMP01234', '10000010', '123456', 3),
('Luis', 'Miguel Gallego', 'CMP11223', '10000011', '123456', 3),
('Shakira', 'Mebarak Ripoll', 'CMP22334', '10000012', '123456', 4),
('Juanes', 'Aristizabal', 'CMP33445', '10000013', '123456', 4),
('Salma', 'Hayek Pinault', 'CMP44556', '10000014', '123456', 5),
('Penelope', 'Cruz Sanchez', 'CMP55667', '10000015', '123456', 5);

INSERT INTO Paciente (nombres, apellidos, dni, clave, fecha_nacimiento, sexo, telefono, id_estado_paciente, id_ubigeo) VALUES
('Juan', 'Perez Gomez', '12345678', '123456', '1990-05-10', 'M', '999888777', 1, 1),
('Maria', 'Lopez Quispe', '23456789', '123456', '1985-02-14', 'F', '999111222', 3, 2),
('Carlos', 'Ruiz Diaz', '34567890', '123456', '1988-08-20', 'M', '999333444', 1, 3),
('Ana', 'Torres Paz', '45678901', '123456', '1995-11-30', 'F', '999555666', 2, 4),
('Luis', 'Gomez Soto', '56789012', '123456', '1982-03-25', 'M', '999777888', 1, 5),
('Pedro', 'Castillo', '60000001', '123456', '1980-01-01', 'M', '999111001', 1, 1),
('Dina', 'Boluarte', '60000002', '123456', '1982-02-02', 'F', '999111002', 1, 2),
('Martin', 'Vizcarra', '60000003', '123456', '1984-03-03', 'M', '999111003', 2, 3),
('Alan', 'Garcia', '60000004', '123456', '1950-04-04', 'M', '999111004', 3, 4),
('Alberto', 'Fujimori', '60000005', '123456', '1940-05-05', 'M', '999111005', 4, 5),
('Alejandro', 'Toledo', '60000006', '123456', '1945-06-06', 'M', '999111006', 1, 1),
('Ollanta', 'Humala', '60000007', '123456', '1960-07-07', 'M', '999111007', 1, 2),
('Nadine', 'Heredia', '60000008', '123456', '1975-08-08', 'F', '999111008', 1, 3),
('Keiko', 'Fujimori', '60000009', '123456', '1975-09-09', 'F', '999111009', 2, 4),
('Pedro Pablo', 'Kuczynski', '60000010', '123456', '1938-10-10', 'M', '999111010', 5, 5);

INSERT INTO Administrador (nombres, apellidos, dni, clave, rol) VALUES
('Admin', 'Principal', '87654321', '123456', 'ADMIN');

-- Citas (Mixed states)
INSERT INTO Cita (id_paciente, id_medico, fecha_cita, hora_cita, motivo, estado_cita) VALUES
(1, 1, '2023-07-01', '09:00', 'Chequeo general', 4), -- Atendida (50.00)
(2, 2, '2023-07-02', '10:00', 'Consulta pediátrica', 2),
(3, 3, '2023-07-03', '11:00', 'Dolor de pecho', 4), -- Atendida (80.00)
(4, 4, '2023-07-04', '12:00', 'Problemas de piel', 3), -- Cancelada
(5, 5, '2023-07-05', '13:00', 'Control ginecológico', 4), -- Atendida (75.00)
(1, 6, '2023-07-06', '09:00', 'Dolor cabeza', 1),
(2, 8, '2023-07-07', '10:00', 'Vacuna', 4), -- Atendida (60.00)
(3, 10, '2023-07-08', '11:00', 'Revision', 1),
(6, 1, '2023-08-05', '09:00', 'Consulta General', 4),
(7, 3, '2023-08-10', '10:00', 'Chequeo Corazon', 4),
(8, 2, '2023-08-15', '11:00', 'Pediatria Control', 4),
(9, 4, '2023-09-02', '09:00', 'Consulta Piel', 4),
(10, 5, '2023-09-05', '10:00', 'Ginecologia', 4),
(11, 1, '2023-09-20', '11:00', 'Dolor Espalda', 4),
(12, 3, '2023-10-01', '09:00', 'Presion Alta', 4),
(13, 12, '2023-10-15', '10:00', 'Consulta General', 4),
(6, 2, '2023-11-05', '15:00', 'Fiebre Ninos', 4),
(7, 1, '2023-11-10', '16:00', 'Gripe', 4),
(8, 5, '2023-12-01', '09:00', 'Control Anual', 4),
(9, 3, '2023-12-20', '10:00', 'Arritmia', 4),
(10, 4, '2023-12-24', '11:00', 'Alergia', 4);

-- Disponibilidad: ALL doctors Mon-Fri 08:00 - 20:00
-- Medicos 1 to 15
INSERT INTO Disponibilidad_Medico (id_medico, dia_semana, hora_inicio, hora_fin) VALUES
(1, 'Lunes', '08:00', '20:00'), (1, 'Martes', '08:00', '20:00'), (1, 'Miércoles', '08:00', '20:00'), (1, 'Jueves', '08:00', '20:00'), (1, 'Viernes', '08:00', '20:00'),
(2, 'Lunes', '08:00', '20:00'), (2, 'Martes', '08:00', '20:00'), (2, 'Miércoles', '08:00', '20:00'), (2, 'Jueves', '08:00', '20:00'), (2, 'Viernes', '08:00', '20:00'),
(3, 'Lunes', '08:00', '20:00'), (3, 'Martes', '08:00', '20:00'), (3, 'Miércoles', '08:00', '20:00'), (3, 'Jueves', '08:00', '20:00'), (3, 'Viernes', '08:00', '20:00'),
(4, 'Lunes', '08:00', '20:00'), (4, 'Martes', '08:00', '20:00'), (4, 'Miércoles', '08:00', '20:00'), (4, 'Jueves', '08:00', '20:00'), (4, 'Viernes', '08:00', '20:00'),
(5, 'Lunes', '08:00', '20:00'), (5, 'Martes', '08:00', '20:00'), (5, 'Miércoles', '08:00', '20:00'), (5, 'Jueves', '08:00', '20:00'), (5, 'Viernes', '08:00', '20:00'),
(6, 'Lunes', '08:00', '20:00'), (6, 'Martes', '08:00', '20:00'), (6, 'Miércoles', '08:00', '20:00'), (6, 'Jueves', '08:00', '20:00'), (6, 'Viernes', '08:00', '20:00'),
(7, 'Lunes', '08:00', '20:00'), (7, 'Martes', '08:00', '20:00'), (7, 'Miércoles', '08:00', '20:00'), (7, 'Jueves', '08:00', '20:00'), (7, 'Viernes', '08:00', '20:00'),
(8, 'Lunes', '08:00', '20:00'), (8, 'Martes', '08:00', '20:00'), (8, 'Miércoles', '08:00', '20:00'), (8, 'Jueves', '08:00', '20:00'), (8, 'Viernes', '08:00', '20:00'),
(9, 'Lunes', '08:00', '20:00'), (9, 'Martes', '08:00', '20:00'), (9, 'Miércoles', '08:00', '20:00'), (9, 'Jueves', '08:00', '20:00'), (9, 'Viernes', '08:00', '20:00'),
(10, 'Lunes', '08:00', '20:00'), (10, 'Martes', '08:00', '20:00'), (10, 'Miércoles', '08:00', '20:00'), (10, 'Jueves', '08:00', '20:00'), (10, 'Viernes', '08:00', '20:00'),
(11, 'Lunes', '08:00', '20:00'), (11, 'Martes', '08:00', '20:00'), (11, 'Miércoles', '08:00', '20:00'), (11, 'Jueves', '08:00', '20:00'), (11, 'Viernes', '08:00', '20:00'),
(12, 'Lunes', '08:00', '20:00'), (12, 'Martes', '08:00', '20:00'), (12, 'Miércoles', '08:00', '20:00'), (12, 'Jueves', '08:00', '20:00'), (12, 'Viernes', '08:00', '20:00'),
(13, 'Lunes', '08:00', '20:00'), (13, 'Martes', '08:00', '20:00'), (13, 'Miércoles', '08:00', '20:00'), (13, 'Jueves', '08:00', '20:00'), (13, 'Viernes', '08:00', '20:00'),
(14, 'Lunes', '08:00', '20:00'), (14, 'Martes', '08:00', '20:00'), (14, 'Miércoles', '08:00', '20:00'), (14, 'Jueves', '08:00', '20:00'), (14, 'Viernes', '08:00', '20:00'),
(15, 'Lunes', '08:00', '20:00'), (15, 'Martes', '08:00', '20:00'), (15, 'Miércoles', '08:00', '20:00'), (15, 'Jueves', '08:00', '20:00'), (15, 'Viernes', '08:00', '20:00');

INSERT INTO Historia_Clinica (id_paciente, fecha_creacion, observaciones, tipo_sangre, alergias) VALUES
(1, '2023-01-10', 'Sin observaciones', 'O+', 'Ninguna'),
(2, '2023-02-14', 'Control anual', 'A+', 'Penicilina'),
(3, '2023-03-05', 'Dolor de cabeza frecuente', 'B+', 'Ninguna'),
(4, '2023-04-12', 'Chequeo general', 'AB+', 'Polvo'),
(5, '2023-05-22', 'Consulta cardiológica', 'O-', 'Aspirina');

INSERT INTO CIE (codigo, descripcion) VALUES
('A00', 'Cólera'),
('B20', 'VIH/SIDA'),
('C34', 'Cáncer de pulmón'),
('E11', 'Diabetes tipo 2'),
('I10', 'Hipertensión esencial');

INSERT INTO Evolucion_Clinica (id_historia, id_medico, fecha_evolucion, anotaciones, id_cie) VALUES
(1, 1, '2023-06-10', 'Paciente estable', 5),
(1, 1, '2023-06-25', 'Control rutinario', 5),
(1, 6, '2023-07-15', 'Leve mejora', 5),
(2, 2, '2023-07-11', 'Mejoría observada', 4),
(2, 8, '2023-08-01', 'Sin cambios', 4),
(3, 3, '2023-08-15', 'Tratamiento continuo', 3),
(3, 10, '2023-09-05', 'Requiere examen adicional', 3),
(4, 4, '2023-09-10', 'Sin complicaciones', 2),
(4, 12, '2023-10-12', 'Alta probable', 2),
(5, 5, '2023-10-01', 'Requiere control', 1),
(5, 14, '2023-11-01', 'Estable', 1);

SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================
-- COMANDO PARA ELIMINAR TODA LA BASE DE DATOS
-- (Útil para reiniciar todo el entorno desde cero)
-- =======================================================
-- DROP DATABASE IF EXISTS posta_medica_valdiviezo;
