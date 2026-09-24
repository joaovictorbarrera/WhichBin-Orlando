package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.Announcement;
import com.whichbin.whichbin_api.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findCurrentAnnouncements(LocalDateTime.now());
    }

    public Optional<Announcement> getAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }

    public Announcement createAnnouncement(Announcement announcement) {
        validateAnnouncement(announcement);
        return announcementRepository.save(announcement);
    }

    public Announcement updateAnnouncement(Long id, Announcement updatedAnnouncement) {

        validateAnnouncement(updatedAnnouncement);

        return announcementRepository.findById(id)
                .map(existingAnnouncement -> {
                    existingAnnouncement.setTitle(updatedAnnouncement.getTitle());
                    existingAnnouncement.setMessage(updatedAnnouncement.getMessage());
                    existingAnnouncement.setType(updatedAnnouncement.getType());
                    existingAnnouncement.setStartDate(updatedAnnouncement.getStartDate());
                    existingAnnouncement.setEndDate(updatedAnnouncement.getEndDate());
                    existingAnnouncement.setActive(updatedAnnouncement.isActive());

                    return announcementRepository.save(existingAnnouncement);
                })
                .orElse(null);
    }

    public boolean deleteAnnouncement(Long id) {

        if (!announcementRepository.existsById(id)) {
            return false;
        }

        announcementRepository.deleteById(id);
        return true;
    }

    private void validateAnnouncement(Announcement announcement) {

        if (announcement.getTitle() == null ||
                announcement.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title is required.");
        }

        if (announcement.getMessage() == null ||
                announcement.getMessage().isBlank()) {
            throw new IllegalArgumentException("Message is required.");
        }

        if (announcement.getType() == null) {
            throw new IllegalArgumentException("Announcement type is required.");
        }

        if (announcement.getStartDate() == null) {
            throw new IllegalArgumentException("Start date and time are required.");
        }

        if (announcement.getEndDate() != null &&
                announcement.getEndDate().isBefore(announcement.getStartDate())) {
            throw new IllegalArgumentException(
                    "End date and time cannot be before the start date and time."
            );
        }
    }
}