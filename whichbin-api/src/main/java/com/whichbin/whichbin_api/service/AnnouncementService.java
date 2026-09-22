package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.Announcement;
import com.whichbin.whichbin_api.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public Optional<Announcement> getAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }

    public Announcement createAnnouncement(Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    public Announcement updateAnnouncement(Long id, Announcement updatedAnnouncement) {

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
}