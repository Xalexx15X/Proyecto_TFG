-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema ClubSync
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema ClubSync
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ClubSync` DEFAULT CHARACTER SET utf8 ;
-- -----------------------------------------------------
-- Schema cubsync
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema cubsync
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `cubsync` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `ClubSync` ;

-- -----------------------------------------------------
-- Table `ClubSync`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`usuario` (
  `idUsuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(70) NOT NULL,
  `email` VARCHAR(80) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `role` VARCHAR(80) NOT NULL,
  `monedero` DOUBLE NULL,
  `puntos_recompensa` INT NULL,
  PRIMARY KEY (`idUsuario`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`ciudad`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`ciudad` (
  `idRecompensa` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(80) NOT NULL,
  `provincia` VARCHAR(80) NOT NULL,
  `pais` VARCHAR(80) NOT NULL,
  `codigo_postal` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idRecompensa`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`discoteca`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`discoteca` (
  `idDiscoteca` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(60) NOT NULL,
  `direccion` VARCHAR(85) NOT NULL,
  `descripcion` VARCHAR(800) NOT NULL,
  `contacto` VARCHAR(45) NOT NULL,
  `capacidad_total` VARCHAR(45) NOT NULL,
  `imagen` LONGTEXT NOT NULL,
  `ciudad_idRecompensa` INT NOT NULL,
  PRIMARY KEY (`idDiscoteca`),
  INDEX `fk_discoteca_ciudad1_idx` (`ciudad_idRecompensa` ASC) VISIBLE,
  CONSTRAINT `fk_discoteca_ciudad1`
    FOREIGN KEY (`ciudad_idRecompensa`)
    REFERENCES `ClubSync`.`ciudad` (`idRecompensa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`dj`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`dj` (
  `idDj` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(80) NOT NULL,
  `nombre_real` VARCHAR(80) NULL,
  `biografia` LONGTEXT NOT NULL,
  `genero_musical` VARCHAR(80) NOT NULL,
  `contacto` VARCHAR(80) NOT NULL,
  `imagen` LONGTEXT NOT NULL,
  PRIMARY KEY (`idDj`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`Evento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`Evento` (
  `idEvento` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(80) NOT NULL,
  `fecha_hora` DATETIME NOT NULL,
  `descripcion` VARCHAR(800) NOT NULL,
  `precio_base_entrada` DOUBLE NOT NULL,
  `precio_base_reservado` DOUBLE NOT NULL,
  `capacidad` VARCHAR(45) NOT NULL,
  `tipo_evento` VARCHAR(45) NOT NULL,
  `estado` VARCHAR(80) NOT NULL,
  `discoteca_idDiscoteca` INT NOT NULL,
  `dj_idDj` INT NOT NULL,
  `usuario_idUsuario` INT NOT NULL,
  PRIMARY KEY (`idEvento`),
  INDEX `fk_Evento_discoteca1_idx` (`discoteca_idDiscoteca` ASC) VISIBLE,
  INDEX `fk_Evento_dj1_idx` (`dj_idDj` ASC) VISIBLE,
  INDEX `fk_Evento_usuario1_idx` (`usuario_idUsuario` ASC) VISIBLE,
  CONSTRAINT `fk_Evento_discoteca1`
    FOREIGN KEY (`discoteca_idDiscoteca`)
    REFERENCES `ClubSync`.`discoteca` (`idDiscoteca`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Evento_dj1`
    FOREIGN KEY (`dj_idDj`)
    REFERENCES `ClubSync`.`dj` (`idDj`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Evento_usuario1`
    FOREIGN KEY (`usuario_idUsuario`)
    REFERENCES `ClubSync`.`usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`tramoHorario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`tramoHorario` (
  `idTramoHorario` INT NOT NULL AUTO_INCREMENT,
  `hora_inicio` DATETIME NOT NULL,
  `hora_fin` DATETIME NOT NULL,
  `multiplicador_precio` VARCHAR(45) NOT NULL,
  `discoteca_idDiscoteca` INT NOT NULL,
  PRIMARY KEY (`idTramoHorario`),
  INDEX `fk_tramoHorario_discoteca1_idx` (`discoteca_idDiscoteca` ASC) VISIBLE,
  CONSTRAINT `fk_tramoHorario_discoteca1`
    FOREIGN KEY (`discoteca_idDiscoteca`)
    REFERENCES `ClubSync`.`discoteca` (`idDiscoteca`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`entrada`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`entrada` (
  `idEntrada` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(45) NOT NULL,
  `fecha_compra` DATETIME NOT NULL,
  `precio` VARCHAR(45) NOT NULL,
  `usuario_idUsuario` INT NOT NULL,
  `Evento_idEvento` INT NOT NULL,
  `tramoHorario_idTramoHorario` INT NOT NULL,
  PRIMARY KEY (`idEntrada`),
  INDEX `fk_entrada_usuario_idx` (`usuario_idUsuario` ASC) VISIBLE,
  INDEX `fk_entrada_Evento1_idx` (`Evento_idEvento` ASC) VISIBLE,
  INDEX `fk_entrada_tramoHorario1_idx` (`tramoHorario_idTramoHorario` ASC) VISIBLE,
  CONSTRAINT `fk_entrada_usuario`
    FOREIGN KEY (`usuario_idUsuario`)
    REFERENCES `ClubSync`.`usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_entrada_Evento1`
    FOREIGN KEY (`Evento_idEvento`)
    REFERENCES `ClubSync`.`Evento` (`idEvento`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_entrada_tramoHorario1`
    FOREIGN KEY (`tramoHorario_idTramoHorario`)
    REFERENCES `ClubSync`.`tramoHorario` (`idTramoHorario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`botella`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`botella` (
  `idBotella` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(80) NOT NULL,
  `tipo` VARCHAR(70) NOT NULL,
  `tamaño` VARCHAR(40) NOT NULL,
  `precio` DOUBLE NOT NULL,
  `disponibilidad` VARCHAR(80) NOT NULL,
  `imagen` LONGTEXT NOT NULL,
  `discoteca_idDiscoteca` INT NOT NULL,
  PRIMARY KEY (`idBotella`),
  INDEX `fk_botella_discoteca1_idx` (`discoteca_idDiscoteca` ASC) VISIBLE,
  CONSTRAINT `fk_botella_discoteca1`
    FOREIGN KEY (`discoteca_idDiscoteca`)
    REFERENCES `ClubSync`.`discoteca` (`idDiscoteca`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`reserva_botella`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`reserva_botella` (
  `idReserva_botella` INT NOT NULL AUTO_INCREMENT,
  `aforo` INT NOT NULL,
  `precio_total` DOUBLE NOT NULL,
  `tipo_reserrva` VARCHAR(80) NOT NULL,
  `entrada_idEntrada` INT NOT NULL,
  PRIMARY KEY (`idReserva_botella`),
  INDEX `fk_reserva_botella_entrada1_idx` (`entrada_idEntrada` ASC) VISIBLE,
  CONSTRAINT `fk_reserva_botella_entrada1`
    FOREIGN KEY (`entrada_idEntrada`)
    REFERENCES `ClubSync`.`entrada` (`idEntrada`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`recompensa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`recompensa` (
  `idRecompensa` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(80) NOT NULL,
  `puntos_necesarios` INT NOT NULL,
  `descripcion` VARCHAR(800) NOT NULL,
  `fecha_inicio` DATETIME NOT NULL,
  `fecha_fin` DATETIME NOT NULL,
  `botella_idBotella` INT NOT NULL,
  `reserva_botella_idReserva_botella` INT NOT NULL,
  `entrada_idEntrada` INT NOT NULL,
  `Evento_idEvento` INT NOT NULL,
  PRIMARY KEY (`idRecompensa`),
  INDEX `fk_recompensa_botella1_idx` (`botella_idBotella` ASC) VISIBLE,
  INDEX `fk_recompensa_reserva_botella1_idx` (`reserva_botella_idReserva_botella` ASC) VISIBLE,
  INDEX `fk_recompensa_entrada1_idx` (`entrada_idEntrada` ASC) VISIBLE,
  INDEX `fk_recompensa_Evento1_idx` (`Evento_idEvento` ASC) VISIBLE,
  CONSTRAINT `fk_recompensa_botella1`
    FOREIGN KEY (`botella_idBotella`)
    REFERENCES `ClubSync`.`botella` (`idBotella`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_recompensa_reserva_botella1`
    FOREIGN KEY (`reserva_botella_idReserva_botella`)
    REFERENCES `ClubSync`.`reserva_botella` (`idReserva_botella`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_recompensa_entrada1`
    FOREIGN KEY (`entrada_idEntrada`)
    REFERENCES `ClubSync`.`entrada` (`idEntrada`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_recompensa_Evento1`
    FOREIGN KEY (`Evento_idEvento`)
    REFERENCES `ClubSync`.`Evento` (`idEvento`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`detalle_reserva_botella`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`detalle_reserva_botella` (
  `reserva_botella_idReserva_botella` INT NOT NULL,
  `botella_idBotella` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unidad` DOUBLE NOT NULL,
  PRIMARY KEY (`reserva_botella_idReserva_botella`, `botella_idBotella`),
  INDEX `fk_reserva_botella_has_botella_botella1_idx` (`botella_idBotella` ASC) VISIBLE,
  INDEX `fk_reserva_botella_has_botella_reserva_botella1_idx` (`reserva_botella_idReserva_botella` ASC) VISIBLE,
  CONSTRAINT `fk_reserva_botella_has_botella_reserva_botella1`
    FOREIGN KEY (`reserva_botella_idReserva_botella`)
    REFERENCES `ClubSync`.`reserva_botella` (`idReserva_botella`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reserva_botella_has_botella_botella1`
    FOREIGN KEY (`botella_idBotella`)
    REFERENCES `ClubSync`.`botella` (`idBotella`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`recompensa_tiene_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`recompensa_tiene_usuario` (
  `recompensa_idRecompensa` INT NOT NULL,
  `usuario_idUsuario` INT NOT NULL,
  `fecha_canjeado` DATETIME NOT NULL,
  `puntos_utilizados` INT NOT NULL,
  PRIMARY KEY (`recompensa_idRecompensa`, `usuario_idUsuario`),
  INDEX `fk_recompensa_has_usuario_usuario1_idx` (`usuario_idUsuario` ASC) VISIBLE,
  INDEX `fk_recompensa_has_usuario_recompensa1_idx` (`recompensa_idRecompensa` ASC) VISIBLE,
  CONSTRAINT `fk_recompensa_has_usuario_recompensa1`
    FOREIGN KEY (`recompensa_idRecompensa`)
    REFERENCES `ClubSync`.`recompensa` (`idRecompensa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_recompensa_has_usuario_usuario1`
    FOREIGN KEY (`usuario_idUsuario`)
    REFERENCES `ClubSync`.`usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`usuario_tiene_discoteca`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`usuario_tiene_discoteca` (
  `usuario_idUsuario` INT NOT NULL,
  `discoteca_idDiscoteca` INT NOT NULL,
  PRIMARY KEY (`usuario_idUsuario`, `discoteca_idDiscoteca`),
  INDEX `fk_usuario_has_discoteca_discoteca1_idx` (`discoteca_idDiscoteca` ASC) VISIBLE,
  INDEX `fk_usuario_has_discoteca_usuario1_idx` (`usuario_idUsuario` ASC) VISIBLE,
  CONSTRAINT `fk_usuario_has_discoteca_usuario1`
    FOREIGN KEY (`usuario_idUsuario`)
    REFERENCES `ClubSync`.`usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_usuario_has_discoteca_discoteca1`
    FOREIGN KEY (`discoteca_idDiscoteca`)
    REFERENCES `ClubSync`.`discoteca` (`idDiscoteca`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`pedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`pedido` (
  `idPedido` INT NOT NULL AUTO_INCREMENT,
  `estado` VARCHAR(80) NOT NULL,
  `precio_total` DOUBLE NOT NULL,
  `fecha_hora` DATETIME NOT NULL,
  `usuario_idUsuario` INT NOT NULL,
  PRIMARY KEY (`idPedido`),
  INDEX `fk_pedido_usuario1_idx` (`usuario_idUsuario` ASC) VISIBLE,
  CONSTRAINT `fk_pedido_usuario1`
    FOREIGN KEY (`usuario_idUsuario`)
    REFERENCES `ClubSync`.`usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ClubSync`.`linea_pedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ClubSync`.`linea_pedido` (
  `idLinea_pedido` INT NOT NULL AUTO_INCREMENT,
  `cantidad` INT NOT NULL,
  `precio` DOUBLE NOT NULL,
  `linea_pedido` JSON NOT NULL,
  `pedido_idPedido` INT NOT NULL,
  PRIMARY KEY (`idLinea_pedido`),
  INDEX `fk_linea_pedido_pedido1_idx` (`pedido_idPedido` ASC) VISIBLE,
  CONSTRAINT `fk_linea_pedido_pedido1`
    FOREIGN KEY (`pedido_idPedido`)
    REFERENCES `ClubSync`.`pedido` (`idPedido`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `cubsync` ;

-- -----------------------------------------------------
-- Table `cubsync`.`ciudad`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`ciudad` (
  `id_ciudad` INT NOT NULL AUTO_INCREMENT,
  `codigo_postal` VARCHAR(45) NOT NULL,
  `nombre` VARCHAR(80) NOT NULL,
  `pais` VARCHAR(80) NOT NULL,
  `provincia` VARCHAR(80) NOT NULL,
  PRIMARY KEY (`id_ciudad`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`discoteca`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`discoteca` (
  `id_discoteca` INT NOT NULL AUTO_INCREMENT,
  `capacidad_total` VARCHAR(45) NOT NULL,
  `contacto` VARCHAR(45) NOT NULL,
  `descripcion` VARCHAR(800) NOT NULL,
  `direccion` VARCHAR(85) NOT NULL,
  `imagen` LONGTEXT NULL DEFAULT NULL,
  `nombre` VARCHAR(60) NOT NULL,
  `ciudad_id_ciudad` INT NOT NULL,
  PRIMARY KEY (`id_discoteca`),
  INDEX `FK58tplddo90ks2u615bvfkgr00` (`ciudad_id_ciudad` ASC) VISIBLE,
  CONSTRAINT `FK58tplddo90ks2u615bvfkgr00`
    FOREIGN KEY (`ciudad_id_ciudad`)
    REFERENCES `cubsync`.`ciudad` (`id_ciudad`))
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`botella`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`botella` (
  `id_botella` INT NOT NULL AUTO_INCREMENT,
  `disponibilidad` VARCHAR(80) NOT NULL,
  `imagen` TINYTEXT NOT NULL,
  `nombre` VARCHAR(80) NOT NULL,
  `precio` DOUBLE NOT NULL,
  `tamaño` VARCHAR(40) NOT NULL,
  `tipo` VARCHAR(70) NOT NULL,
  `discoteca_id_discoteca` INT NOT NULL,
  PRIMARY KEY (`id_botella`),
  INDEX `FKrkh8epra30449uxbh0b1qdsgq` (`discoteca_id_discoteca` ASC) VISIBLE,
  CONSTRAINT `FKrkh8epra30449uxbh0b1qdsgq`
    FOREIGN KEY (`discoteca_id_discoteca`)
    REFERENCES `cubsync`.`discoteca` (`id_discoteca`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(80) NOT NULL,
  `monedero` DOUBLE NULL DEFAULT NULL,
  `nombre` VARCHAR(70) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `puntos_recompensa` INT NULL DEFAULT NULL,
  `role` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id_usuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 14
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`dj`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`dj` (
  `id_dj` INT NOT NULL AUTO_INCREMENT,
  `biografia` TINYTEXT NOT NULL,
  `contacto` VARCHAR(80) NOT NULL,
  `genero_musical` VARCHAR(80) NOT NULL,
  `imagen` TINYTEXT NOT NULL,
  `nombre` VARCHAR(80) NOT NULL,
  `nombre_real` VARCHAR(80) NULL DEFAULT NULL,
  PRIMARY KEY (`id_dj`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`evento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`evento` (
  `id_evento` INT NOT NULL AUTO_INCREMENT,
  `capacidad` VARCHAR(45) NOT NULL,
  `descripcion` VARCHAR(800) NOT NULL,
  `estado` VARCHAR(80) NOT NULL,
  `fecha_hora` DATETIME(6) NOT NULL,
  `nombre` VARCHAR(80) NOT NULL,
  `precio_base_entrada` DOUBLE NOT NULL,
  `precio_base_reservado` DOUBLE NOT NULL,
  `tipo_evento` VARCHAR(45) NOT NULL,
  `discoteca_id_discoteca` INT NOT NULL,
  `dj_id_dj` INT NOT NULL,
  `usuario_id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_evento`),
  INDEX `FK9xy8hi8rhbkkvvbxmqr1sdq87` (`discoteca_id_discoteca` ASC) VISIBLE,
  INDEX `FKlgiylx2jxeekb9809obnkgt0k` (`dj_id_dj` ASC) VISIBLE,
  INDEX `FKo6p8eypuyvqi34as7fbd6knke` (`usuario_id_usuario` ASC) VISIBLE,
  CONSTRAINT `FK9xy8hi8rhbkkvvbxmqr1sdq87`
    FOREIGN KEY (`discoteca_id_discoteca`)
    REFERENCES `cubsync`.`discoteca` (`id_discoteca`),
  CONSTRAINT `FKlgiylx2jxeekb9809obnkgt0k`
    FOREIGN KEY (`dj_id_dj`)
    REFERENCES `cubsync`.`dj` (`id_dj`),
  CONSTRAINT `FKo6p8eypuyvqi34as7fbd6knke`
    FOREIGN KEY (`usuario_id_usuario`)
    REFERENCES `cubsync`.`usuario` (`id_usuario`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`tramo_horario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`tramo_horario` (
  `id_tramo_horario` INT NOT NULL AUTO_INCREMENT,
  `hora_fin` DATETIME(6) NOT NULL,
  `hora_inicio` DATETIME(6) NOT NULL,
  `multiplicador_precio` VARCHAR(45) NOT NULL,
  `discoteca_id_discoteca` INT NOT NULL,
  PRIMARY KEY (`id_tramo_horario`),
  INDEX `FKk6aaqxl5vim7nbdqwn8eyx7e4` (`discoteca_id_discoteca` ASC) VISIBLE,
  CONSTRAINT `FKk6aaqxl5vim7nbdqwn8eyx7e4`
    FOREIGN KEY (`discoteca_id_discoteca`)
    REFERENCES `cubsync`.`discoteca` (`id_discoteca`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`entrada`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`entrada` (
  `id_entrada` INT NOT NULL AUTO_INCREMENT,
  `fecha_compra` DATETIME(6) NOT NULL,
  `precio` VARCHAR(45) NOT NULL,
  `tipo` VARCHAR(45) NOT NULL,
  `evento_id_evento` INT NOT NULL,
  `tramo_horario_id_tramo_horario` INT NOT NULL,
  `usuario_id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_entrada`),
  INDEX `FK861tdv3drt2euijy9xoev745h` (`evento_id_evento` ASC) VISIBLE,
  INDEX `FKs5qavaqxdmnltsy0ph8m4eaxi` (`tramo_horario_id_tramo_horario` ASC) VISIBLE,
  INDEX `FK5mtc6yi6iidnvbpk4ocr8jwym` (`usuario_id_usuario` ASC) VISIBLE,
  CONSTRAINT `FK5mtc6yi6iidnvbpk4ocr8jwym`
    FOREIGN KEY (`usuario_id_usuario`)
    REFERENCES `cubsync`.`usuario` (`id_usuario`),
  CONSTRAINT `FK861tdv3drt2euijy9xoev745h`
    FOREIGN KEY (`evento_id_evento`)
    REFERENCES `cubsync`.`evento` (`id_evento`),
  CONSTRAINT `FKs5qavaqxdmnltsy0ph8m4eaxi`
    FOREIGN KEY (`tramo_horario_id_tramo_horario`)
    REFERENCES `cubsync`.`tramo_horario` (`id_tramo_horario`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`reserva_botella`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`reserva_botella` (
  `id_reserva_botella` INT NOT NULL AUTO_INCREMENT,
  `aforo` INT NOT NULL,
  `precio_total` DOUBLE NOT NULL,
  `tipo_reserrva` VARCHAR(80) NOT NULL,
  `entrada_id_entrada` INT NOT NULL,
  PRIMARY KEY (`id_reserva_botella`),
  INDEX `FKom3m3imlbd26xpp19csc73lnw` (`entrada_id_entrada` ASC) VISIBLE,
  CONSTRAINT `FKom3m3imlbd26xpp19csc73lnw`
    FOREIGN KEY (`entrada_id_entrada`)
    REFERENCES `cubsync`.`entrada` (`id_entrada`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`detalle_reserva_botella`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`detalle_reserva_botella` (
  `id_detalle_reserva_botella` INT NOT NULL AUTO_INCREMENT,
  `cantidad` INT NOT NULL,
  `precio_unidad` DOUBLE NOT NULL,
  `botella_id_botella` INT NOT NULL,
  `reserva_botella_id_reserva_botella` INT NOT NULL,
  PRIMARY KEY (`id_detalle_reserva_botella`),
  INDEX `FKjqf7i4nn21ucof9rp4ovsl9ik` (`botella_id_botella` ASC) VISIBLE,
  INDEX `FKl0b77mr8ablmr4o19y5qcrpwt` (`reserva_botella_id_reserva_botella` ASC) VISIBLE,
  CONSTRAINT `FKjqf7i4nn21ucof9rp4ovsl9ik`
    FOREIGN KEY (`botella_id_botella`)
    REFERENCES `cubsync`.`botella` (`id_botella`),
  CONSTRAINT `FKl0b77mr8ablmr4o19y5qcrpwt`
    FOREIGN KEY (`reserva_botella_id_reserva_botella`)
    REFERENCES `cubsync`.`reserva_botella` (`id_reserva_botella`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`pedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`pedido` (
  `id_pedido` INT NOT NULL AUTO_INCREMENT,
  `estado` VARCHAR(80) NOT NULL,
  `fecha_hora` DATETIME(6) NOT NULL,
  `precio_total` DOUBLE NOT NULL,
  `usuario_id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_pedido`),
  INDEX `FKnfas9a3svxv8lwmkk851a3uu8` (`usuario_id_usuario` ASC) VISIBLE,
  CONSTRAINT `FKnfas9a3svxv8lwmkk851a3uu8`
    FOREIGN KEY (`usuario_id_usuario`)
    REFERENCES `cubsync`.`usuario` (`id_usuario`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`linea_pedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`linea_pedido` (
  `id_linea_pedido` INT NOT NULL AUTO_INCREMENT,
  `cantidad` INT NOT NULL,
  `linea_pedido` JSON NULL DEFAULT NULL,
  `precio` DOUBLE NOT NULL,
  `pedido_id_pedido` INT NOT NULL,
  PRIMARY KEY (`id_linea_pedido`),
  INDEX `FKto692qfqfqa0g1s45lb0lbl4q` (`pedido_id_pedido` ASC) VISIBLE,
  CONSTRAINT `FKto692qfqfqa0g1s45lb0lbl4q`
    FOREIGN KEY (`pedido_id_pedido`)
    REFERENCES `cubsync`.`pedido` (`id_pedido`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`recompensa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`recompensa` (
  `id_recompensa` INT NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(800) NOT NULL,
  `fecha_fin` DATETIME(6) NOT NULL,
  `fecha_inicio` DATETIME(6) NOT NULL,
  `nombre` VARCHAR(80) NOT NULL,
  `puntos_necesarios` INT NOT NULL,
  `botella_id_botella` INT NOT NULL,
  `entrada_id_entrada` INT NOT NULL,
  `evento_id_evento` INT NOT NULL,
  `reserva_botella_id_reserva_botella` INT NOT NULL,
  PRIMARY KEY (`id_recompensa`),
  INDEX `FKrr16ux8xap26h6tj10n6iq61j` (`botella_id_botella` ASC) VISIBLE,
  INDEX `FK33d2rutff8hloxs1h9eb51gvj` (`entrada_id_entrada` ASC) VISIBLE,
  INDEX `FKjkbegyvu86rq1sw9vl9ru2vah` (`evento_id_evento` ASC) VISIBLE,
  INDEX `FKsruoiw0hc4o2duoebexqfx28e` (`reserva_botella_id_reserva_botella` ASC) VISIBLE,
  CONSTRAINT `FK33d2rutff8hloxs1h9eb51gvj`
    FOREIGN KEY (`entrada_id_entrada`)
    REFERENCES `cubsync`.`entrada` (`id_entrada`),
  CONSTRAINT `FKjkbegyvu86rq1sw9vl9ru2vah`
    FOREIGN KEY (`evento_id_evento`)
    REFERENCES `cubsync`.`evento` (`id_evento`),
  CONSTRAINT `FKrr16ux8xap26h6tj10n6iq61j`
    FOREIGN KEY (`botella_id_botella`)
    REFERENCES `cubsync`.`botella` (`id_botella`),
  CONSTRAINT `FKsruoiw0hc4o2duoebexqfx28e`
    FOREIGN KEY (`reserva_botella_id_reserva_botella`)
    REFERENCES `cubsync`.`reserva_botella` (`id_reserva_botella`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`recompensa_tiene_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`recompensa_tiene_usuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha_canjeado` DATETIME(6) NOT NULL,
  `puntos_utilizados` INT NOT NULL,
  `recompensa_id_recompensa` INT NOT NULL,
  `usuario_id_usuario` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK6ubxjul190coxnr97g3vx9a8o` (`recompensa_id_recompensa` ASC) VISIBLE,
  INDEX `FK4o9oti45ik8untxhv8vwxtccf` (`usuario_id_usuario` ASC) VISIBLE,
  CONSTRAINT `FK4o9oti45ik8untxhv8vwxtccf`
    FOREIGN KEY (`usuario_id_usuario`)
    REFERENCES `cubsync`.`usuario` (`id_usuario`),
  CONSTRAINT `FK6ubxjul190coxnr97g3vx9a8o`
    FOREIGN KEY (`recompensa_id_recompensa`)
    REFERENCES `cubsync`.`recompensa` (`id_recompensa`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cubsync`.`usuario_tiene_discoteca`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cubsync`.`usuario_tiene_discoteca` (
  `usuario_id_usuario` INT NOT NULL,
  `discoteca_id_discoteca` INT NOT NULL,
  INDEX `FKx3o5xuciroxt3r7x0m9q904n` (`discoteca_id_discoteca` ASC) VISIBLE,
  INDEX `FKrnrbg72tebm1w8x6m7djtn3d7` (`usuario_id_usuario` ASC) VISIBLE,
  CONSTRAINT `FKrnrbg72tebm1w8x6m7djtn3d7`
    FOREIGN KEY (`usuario_id_usuario`)
    REFERENCES `cubsync`.`usuario` (`id_usuario`),
  CONSTRAINT `FKx3o5xuciroxt3r7x0m9q904n`
    FOREIGN KEY (`discoteca_id_discoteca`)
    REFERENCES `cubsync`.`discoteca` (`id_discoteca`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
