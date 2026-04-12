package com.scorelytics;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ScorelyticsApplication {

    public static void main(String[] args) {
        loadDotenvForLocalDev();
        SpringApplication.run(ScorelyticsApplication.class, args);
    }

    private static void loadDotenvForLocalDev() {
        // Allow running the Java backend with values from `java-backend/.env`
        // without requiring users to set PowerShell environment variables.
        try {
            String dir = System.getProperty("user.dir");
            Dotenv dotenv = Dotenv.configure()
                    .directory(dir)
                    .filename(".env")
                    .ignoreIfMissing()
                    .load();

            String mongoUri = dotenv.get("MONGODB_URI");
            setIfMissing("MONGODB_URI", mongoUri);
            setIfMissing("JWT_SECRET", dotenv.get("JWT_SECRET"));
            setIfMissing("JWT_EXPIRATION", dotenv.get("JWT_EXPIRATION"));
            setIfMissing("SERVER_PORT", dotenv.get("SERVER_PORT"));
            setIfMissing("LOG_LEVEL", dotenv.get("LOG_LEVEL"));

            if (mongoUri != null && !mongoUri.isBlank()) {
                System.out.println("[dotenv] dir=" + dir);
                System.out.println("[dotenv] Loaded MONGODB_URI=" + maskMongoUri(mongoUri));
            }
        } catch (Exception ignored) {
            // If dotenv can't be loaded, fall back to environment variables / defaults.
        }
    }

    private static void setIfMissing(String key, String value) {
        if (value == null || value.isBlank()) return;
        if (System.getenv(key) != null && !System.getenv(key).isBlank()) return;
        if (System.getProperty(key) != null && !System.getProperty(key).isBlank()) return;
        System.setProperty(key, value);
    }

    private static String maskMongoUri(String uri) {
        // mongodb+srv://user:pass@host/db?... -> mongodb+srv://user:***@host/db?...
        try {
            int schemeIdx = uri.indexOf("://");
            if (schemeIdx < 0) return uri;
            int atIdx = uri.indexOf('@', schemeIdx + 3);
            if (atIdx < 0) return uri;
            String creds = uri.substring(schemeIdx + 3, atIdx);
            int colonIdx = creds.indexOf(':');
            if (colonIdx < 0) return uri;
            String user = creds.substring(0, colonIdx);
            return uri.substring(0, schemeIdx + 3) + user + ":***" + uri.substring(atIdx);
        } catch (Exception e) {
            return uri;
        }
    }
}
