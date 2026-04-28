package com.scorelytics.controller;

import com.scorelytics.entity.StudyResource;
import com.scorelytics.repository.StudyResourceRepository;
import com.scorelytics.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class StudyResourceController {

    private final StudyResourceRepository studyResourceRepository;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<StudyResource>> getAllResources(@RequestParam(required = false) StudyResource.Category category) {
        List<StudyResource> resources = studyResourceRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(resource -> category == null || resource.getCategory() == category)
                .toList();
        return ResponseEntity.ok(resources);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createResource(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam StudyResource.Category category,
            @RequestParam StudyResource.ResourceType type,
            @RequestParam(required = false) String noteContent,
            @RequestPart(required = false) MultipartFile file
    ) {
        String validationError = validatePayload(title, type, noteContent, file, false);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        String createdAt = Instant.now().toString();
        String fileId = null;
        String fileName = null;

        if (type == StudyResource.ResourceType.PDF && file != null && !file.isEmpty()) {
            fileId = fileStorageService.uploadPdf(file);
            fileName = file.getOriginalFilename();
        }

        StudyResource resource = StudyResource.builder()
                .title(title.trim())
                .description(StringUtils.hasText(description) ? description.trim() : null)
                .category(category)
                .type(type)
                .noteContent(type == StudyResource.ResourceType.NOTE ? noteContent.trim() : null)
                .fileId(fileId)
                .fileName(fileName)
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(studyResourceRepository.save(resource));
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateResource(
            @PathVariable String id,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam StudyResource.Category category,
            @RequestParam StudyResource.ResourceType type,
            @RequestParam(required = false) String noteContent,
            @RequestPart(required = false) MultipartFile file
    ) {
        Optional<StudyResource> resourceOpt = studyResourceRepository.findById(id);
        if (resourceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Resource not found"));
        }

        StudyResource resource = resourceOpt.get();
        String validationError = validatePayload(title, type, noteContent, file, resource.getFileId() != null);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }

        if (resource.getFileId() != null && (type == StudyResource.ResourceType.NOTE || (file != null && !file.isEmpty()))) {
            fileStorageService.deleteFile(resource.getFileId());
            resource.setFileId(null);
            resource.setFileName(null);
        }

        if (type == StudyResource.ResourceType.PDF && file != null && !file.isEmpty()) {
            resource.setFileId(fileStorageService.uploadPdf(file));
            resource.setFileName(file.getOriginalFilename());
            resource.setNoteContent(null);
        } else if (type == StudyResource.ResourceType.NOTE) {
            resource.setNoteContent(noteContent.trim());
            resource.setFileId(null);
            resource.setFileName(null);
        }

        resource.setTitle(title.trim());
        resource.setDescription(StringUtils.hasText(description) ? description.trim() : null);
        resource.setCategory(category);
        resource.setType(type);
        resource.setUpdatedAt(Instant.now().toString());

        return ResponseEntity.ok(studyResourceRepository.save(resource));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteResource(@PathVariable String id) {
        Optional<StudyResource> resourceOpt = studyResourceRepository.findById(id);
        if (resourceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Resource not found"));
        }

        StudyResource resource = resourceOpt.get();
        if (resource.getFileId() != null) {
            fileStorageService.deleteFile(resource.getFileId());
        }
        studyResourceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/file/{fileId}")
    public ResponseEntity<InputStreamResource> getResourceFile(
            @PathVariable String fileId,
            @RequestParam(defaultValue = "false") boolean download
    ) {
        InputStreamResource resource = fileStorageService.downloadFile(fileId);
        String filename = "study-resource.pdf";
        HttpHeaders headers = new HttpHeaders();
        ContentDisposition disposition = download
                ? ContentDisposition.attachment().filename(filename).build()
                : ContentDisposition.inline().filename(filename).build();

        headers.setContentDisposition(disposition);
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    private String validatePayload(
            String title,
            StudyResource.ResourceType type,
            String noteContent,
            MultipartFile file,
            boolean hasExistingPdf
    ) {
        if (!StringUtils.hasText(title)) {
            return "title is required";
        }

        if (type == StudyResource.ResourceType.NOTE && !StringUtils.hasText(noteContent)) {
            return "noteContent is required for notes";
        }

        if (type == StudyResource.ResourceType.PDF && (file == null || file.isEmpty()) && !hasExistingPdf) {
            return "PDF file is required";
        }

        return null;
    }
}
