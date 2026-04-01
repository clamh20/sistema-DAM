package com.dinero.control.config;

import javax.swing.*;
import java.io.*;
import java.util.Properties;

public class ConfigManager {

    private static final String CONFIG_FILE = "config.properties";

    public static void checkAndPromptConfig() {
        Properties props = new Properties();
        File configFile = new File(CONFIG_FILE);
        boolean isConfigValid = false;

        System.out.println(">>> Buscando archivo de configuración en: " + configFile.getAbsolutePath());

        // 1. Intentar cargar configuración existente
        if (configFile.exists()) {
            try (InputStream input = new FileInputStream(configFile)) {
                props.load(input);
                if (testConnection(props.getProperty("DB_URL"), props.getProperty("DB_USER"), props.getProperty("DB_PASS"))) {
                    isConfigValid = true;
                    System.out.println("✅ Configuración cargada y VALIDADA.");
                } else {
                    System.err.println("⚠️ La configuración guardada NO funciona.");
                }
            } catch (IOException ex) {
                System.err.println("!!! Fallo al leer configuración: " + ex.getMessage());
            }
        }

        // 2. Si no es válida o no existe, intentar una CONFIGURACIÓN POR DEFECTO SILENCIOSA
        if (!isConfigValid) {
            String defaultHost = "localhost:3306";
            String defaultUser = "root";
            String defaultPass = "12345"; // Contraseña común por defecto
            String defaultUrl = "jdbc:mysql://" + defaultHost + "/control_dinero?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
            
            System.out.println(">>> Intentando conexión por defecto (root / 12345)...");
            if (testConnection(defaultUrl, defaultUser, defaultPass)) {
                props.setProperty("DB_URL", defaultUrl);
                props.setProperty("DB_USER", defaultUser);
                props.setProperty("DB_PASS", defaultPass);
                
                try (OutputStream output = new FileOutputStream(configFile)) {
                    props.store(output, "DAM Financial System Default Configuration");
                    System.out.println("✅ Conexión por defecto EXITOSA y guardada.");
                    isConfigValid = true;
                } catch (IOException ignored) {}
            }
        }

        // 3. Solo si todo falla, pedir datos al usuario con ventanas emergentes
        while (!isConfigValid) {
            System.out.println("!!! No se pudo conectar automáticamente. Pidiendo datos...");
            
            String host = JOptionPane.showInputDialog(null, 
                "SISTEMA DAM: CONFIGURACION DE BASE DE DATOS\n\n" +
                "No pudimos conectar automáticamente con MySQL.\n" +
                "Por favor, ingresa los datos de acceso de tu servidor local.\n\n" +
                "Host y Puerto (Ej: localhost:3306):", 
                "Configuración Requerida", JOptionPane.QUESTION_MESSAGE);
            
            if (host == null || host.trim().isEmpty()) {
                System.out.println("!!! Cancelado por el usuario. Saliendo...");
                System.exit(0);
            }

            String user = JOptionPane.showInputDialog(null, "Usuario de MySQL:", "Configuración", JOptionPane.QUESTION_MESSAGE);
            if (user == null) System.exit(0);

            String pass = JOptionPane.showInputDialog(null, "Contraseña de MySQL:", "Configuración", JOptionPane.QUESTION_MESSAGE);
            if (pass == null) System.exit(0);

            String url = "jdbc:mysql://" + host + "/control_dinero?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
            
            if (testConnection(url, user, pass)) {
                props.setProperty("DB_URL", url);
                props.setProperty("DB_USER", user);
                props.setProperty("DB_PASS", pass);

                try (OutputStream output = new FileOutputStream(configFile)) {
                    props.store(output, "DAM Financial System Configuration");
                    System.out.println("✅ Configuración manual VALIDADA y guardada.");
                    isConfigValid = true;
                } catch (IOException io) {
                    System.err.println("!!! Error guardando archivo: " + io.getMessage());
                }
            } else {
                JOptionPane.showMessageDialog(null, 
                    "❌ ERROR DE CONEXIÓN A MYSQL ❌\n\n" +
                    "No se pudo conectar a: " + host + "\n" +
                    "Verifica que el usuario y la contraseña sean correctos.", 
                    "Fallo de Conexión", JOptionPane.ERROR_MESSAGE);
            }
        }

        // 4. Inyectar propiedades finales
        System.setProperty("DB_URL", props.getProperty("DB_URL"));
        System.setProperty("DB_USER", props.getProperty("DB_USER", "root"));
        System.setProperty("DB_PASS", props.getProperty("DB_PASS", ""));
        System.out.println(">>> Preparado para iniciar Spring Boot.");
    }

    private static boolean testConnection(String url, String user, String pass) {
        try {
            // Cargar el driver explícitamente para mayor seguridad en entornos portátiles
            Class.forName("com.mysql.cj.jdbc.Driver");
            java.sql.Connection conn = java.sql.DriverManager.getConnection(url, user, pass);
            if (conn != null) {
                conn.close();
                return true;
            }
        } catch (Exception e) {
            System.err.println("!!! Error de prueba de conexión: " + e.getMessage());
        }
        return false;
    }
}
