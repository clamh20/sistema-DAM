package com.dinero.control;

import com.dinero.control.config.ConfigManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import javax.swing.JOptionPane;

import java.awt.*;
import java.net.ServerSocket;
import java.net.URI;

@SpringBootApplication
public class ControlDineroApplication {
	
	public static void main(String[] args) {
		System.out.println("=========================================================");
		System.out.println("===        SISTEMA DAM: INICIANDO SERVICIOS           ===");
		System.out.println("=========================================================");
		
		int port = 8080;
		boolean portFound = false;

		while (!portFound && port < 8100) {
			try (ServerSocket serverSocket = new ServerSocket(port)) {
				portFound = true;
			} catch (Exception e) {
				System.out.println(">>> Puerto " + port + " ocupado, probando el siguiente...");
				port++;
			}
		}

		if (!portFound) {
			System.err.println("❌ ERROR: No se encontró ningún puerto libre disponible.");
			JOptionPane.showMessageDialog(null, "No se pudo encontrar un puerto libre para iniciar el sistema.", "Error", JOptionPane.ERROR_MESSAGE);
			System.exit(1);
		}

		try {
			System.out.println(">>> Utilizando puerto: " + port);
			System.setProperty("server.port", String.valueOf(port));

			System.out.println(">>> Comprobando configuración de base de datos...");
			ConfigManager.checkAndPromptConfig();
			
			System.out.println(">>> Ejecutando servidor Spring Boot en puerto " + port + "... (Esto puede tardar unos segundos)");
			new SpringApplicationBuilder(ControlDineroApplication.class)
					.headless(false)
					.run(args);
			
			System.out.println("\n✅ SISTEMA INICIADO CON ÉXITO");
			System.out.println("🌍 Accede en: http://localhost:" + port);
			System.out.println("=========================================================");
			System.out.println("!!! NO CIERRES ESTA VENTANA MIENTRAS USES EL PROGRAMA !!!");
			System.out.println("=========================================================");
			
		} catch (Exception e) {
			System.err.println("\n🚫 ERROR CRÍTICO AL INICIAR:");
			e.printStackTrace();
			JOptionPane.showMessageDialog(null, 
				"Error crítico al iniciar el sistema:\n" + e.getMessage() +
				"\n\nRevisa la consola para más detalles.", 
				"Error Fatal", JOptionPane.ERROR_MESSAGE);
			pauseOnExit();
		}
	}

	private static void pauseOnExit() {
		// En modo invisible, ya no necesitamos la pausa por teclado
		System.exit(1);
	}

	@Value("${server.port:8080}")
	private String serverPort;

	@Bean
	public CommandLineRunner autoOpenBrowser() {
		return args -> {
			openDesktopBrowser("http://localhost:" + serverPort);
		};
	}

	public static void openDesktopBrowser(String url) {
		try {
			if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
				Desktop.getDesktop().browse(new URI(url));
			} else {
				// Fallback for Windows
				new ProcessBuilder("cmd", "/c", "start", "", url).start();
			}
		} catch (Exception e) {
			System.err.println("No se pudo abrir el navegador automáticamente: " + e.getMessage());
		}
	}
}
