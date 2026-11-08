package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.Announcement;
import com.whichbin.whichbin_api.model.AnnouncementType;
import com.whichbin.whichbin_api.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.whichbin.whichbin_api.dto.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<Announcement> getCurrentAnnouncements() {
        return announcementRepository.findCurrentAnnouncements(LocalDateTime.now());
    }

    public PaginatedResponse<Announcement> getCurrentAnnouncementsPaged(
             AnnouncementType type,
             int page,
             int size
    ) {
        PageRequest pageable = PageRequest.of(page - 1, size);

         Page<Announcement> results;

          if (type == null) {
            results = announcementRepository.findCurrentAnnouncementsPaged(
                    LocalDateTime.now(),
                    pageable
            );
        } else {
            results = announcementRepository.findCurrentAnnouncementsByTypePaged(
                    LocalDateTime.now(),
                    type,
                    pageable
            );
        }

        return new PaginatedResponse<>(
                results.getNumber() + 1,
                results.getTotalPages(),
                results.getSize(),
                results.getTotalElements(),
                results.getContent()
        );
    }

    public List<Announcement> getCurrentAnnouncements(AnnouncementType type) {
        if (type == null) {
            return getCurrentAnnouncements();
        }

        return announcementRepository.findCurrentAnnouncementsByType(
                LocalDateTime.now(),
                type
        );
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public List<Announcement> getAllAnnouncements(AnnouncementType type) {
        return type == null
                ? getAllAnnouncements()
                : announcementRepository.findByTypeOrderByStartDateDesc(type);
    }

    public PaginatedResponse<Announcement> getAllAnnouncementsPaged(
            AnnouncementType type,
            int page,
            int pageSize
    ) {
        PageRequest pageable = PageRequest.of(
                page - 1,
                pageSize,
                Sort.by(
                        Sort.Order.desc("startDate"),
                        Sort.Order.desc("id")
                )
        );

        Page<Announcement> results;

        if (type == null) {
            results = announcementRepository.findAll(pageable);
        } else {
            results = announcementRepository.findByTypeOrderByStartDateDescIdDesc(
                    type,
                    pageable
            );
        }

        return new PaginatedResponse<>(
                results.getNumber() + 1,
                results.getTotalPages(),
                results.getSize(),
                results.getTotalElements(),
                results.getContent()
        );
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
        
        if (announcement.getEndDate() != null &&
                !announcement.getEndDate().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "End date and time must be in the future."
            );
        }
    }
}