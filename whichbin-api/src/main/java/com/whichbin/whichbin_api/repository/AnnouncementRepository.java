package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("""
            SELECT a
            FROM Announcement a
            WHERE a.active = true
              AND a.startDate <= :now
              AND (a.endDate IS NULL OR a.endDate >= :now)
            ORDER BY a.startDate DESC
            """)
    List<Announcement> findCurrentAnnouncements(@Param("now") LocalDateTime now);
}