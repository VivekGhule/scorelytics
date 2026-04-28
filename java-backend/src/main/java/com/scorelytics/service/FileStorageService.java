package com.scorelytics.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.Objects;

@Service
public class FileStorageService {

    public static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;

    private final GridFsTemplate gridFsTemplate;

    public FileStorageService(GridFsTemplate gridFsTemplate) {
        this.gridFsTemplate = gridFsTemplate;
    }

    public String uploadPdf(MultipartFile file) {
        validatePdf(file);

        String cleanedFileName = sanitizeFileName(file.getOriginalFilename());
        Document metadata = new Document();
        metadata.put("contentType", MediaType.APPLICATION_PDF_VALUE);
        metadata.put("originalFileName", cleanedFileName);
        metadata.put("uploadedAt", Instant.now().toString());

        try {
          ObjectId objectId = gridFsTemplate.store(
                  file.getInputStream(),
                  cleanedFileName,
                  MediaType.APPLICATION_PDF_VALUE,
                  metadata
          );
          return objectId.toHexString();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store PDF file", ex);
        }
    }

    public InputStreamResource downloadFile(String fileId) {
        GridFsResource resource = getGridFsResource(fileId);
        try {
            return new InputStreamResource(resource.getInputStream());
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read stored PDF file", ex);
        }
    }

    public void deleteFile(String fileId) {
        if (!StringUtils.hasText(fileId)) {
            return;
        }
        ObjectId objectId = parseObjectId(fileId);
        gridFsTemplate.delete(Query.query(Criteria.where("_id").is(objectId)));
    }

    private GridFsResource getGridFsResource(String fileId) {
        ObjectId objectId = parseObjectId(fileId);
        GridFSFile gridFsFile = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(objectId)));
        if (gridFsFile == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF file not found");
        }

        GridFsResource resource = gridFsTemplate.getResource(gridFsFile);
        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF file not found");
        }
        return resource;
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "PDF file size must be 10MB or less");
        }

        String originalFileName = sanitizeFileName(file.getOriginalFilename());
        String contentType = file.getContentType();
        boolean pdfMimeType = MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(Objects.toString(contentType, ""));
        boolean pdfExtension = originalFileName.toLowerCase().endsWith(".pdf");
        if (!pdfMimeType && !pdfExtension) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }
    }

    private ObjectId parseObjectId(String fileId) {
        try {
            return new ObjectId(fileId);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid fileId", ex);
        }
    }

    private String sanitizeFileName(String originalFileName) {
        String cleaned = StringUtils.cleanPath(Objects.toString(originalFileName, "resource.pdf"));
        return StringUtils.hasText(cleaned) ? cleaned : "resource.pdf";
    }
}
