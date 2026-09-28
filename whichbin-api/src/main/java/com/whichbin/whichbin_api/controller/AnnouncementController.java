package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.auth.Authenticated;
import com.whichbin.whichbin_api.model.Announcement;
import com.whichbin.whichbin_api.service.AnnouncementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    // GETs filtered announcements
    // TODO rename this to getFiltered announcements
    // Add new authenticated route for getting all announcements (used by admin panel)
    @GetMapping
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
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
            @RequestBody Announcement announcement) {

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
            @RequestBody Announcement announcement) {

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
