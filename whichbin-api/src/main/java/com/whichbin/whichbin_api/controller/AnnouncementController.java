package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.auth.Authenticated;
import com.whichbin.whichbin_api.model.Announcement;
import com.whichbin.whichbin_api.model.AnnouncementType;
import com.whichbin.whichbin_api.service.AnnouncementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.whichbin.whichbin_api.dto.PaginatedResponse;

@RestController
@RequestMapping("/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<Announcement>> getCurrentAnnouncements(
            @RequestParam(name = "type", required = false) AnnouncementType type,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "pageSize", defaultValue = "5") int pageSize
    ) {
        if (page < 1 || pageSize < 1 || pageSize > 100) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                announcementService.getCurrentAnnouncementsPaged(
                        type,
                        page,
                        pageSize
                )
        );
    }

    // Admin route - returns all announcements
    @Authenticated
    @GetMapping("/all")
    public ResponseEntity<PaginatedResponse<Announcement>> getAllAnnouncements(
            @RequestParam(name = "type", required = false) AnnouncementType type,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "pageSize", defaultValue = "5") int pageSize
    ) {
        if (page < 1 || pageSize < 1 || pageSize > 100) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                announcementService.getAllAnnouncementsPaged(
                        type,
                        page,
                        pageSize
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getAnnouncementById(@PathVariable Long id) {
        return announcementService.getAnnouncementById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Authenticated
    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(
            @Valid @RequestBody Announcement announcement) {

        Announcement createdAnnouncement =
                announcementService.createAnnouncement(announcement);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdAnnouncement);
    }

    @Authenticated
    @PutMapping("/{id}")
    public ResponseEntity<Announcement> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody Announcement announcement) {

        Announcement updatedAnnouncement =
                announcementService.updateAnnouncement(id, announcement);

        if (updatedAnnouncement == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedAnnouncement);
    }

    @Authenticated
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {

        boolean deleted = announcementService.deleteAnnouncement(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(
        IllegalArgumentException exception) {

    return ResponseEntity
            .badRequest()
            .body(exception.getMessage());
    }
}
