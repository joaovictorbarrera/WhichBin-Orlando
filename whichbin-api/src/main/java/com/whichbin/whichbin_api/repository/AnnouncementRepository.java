package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
}