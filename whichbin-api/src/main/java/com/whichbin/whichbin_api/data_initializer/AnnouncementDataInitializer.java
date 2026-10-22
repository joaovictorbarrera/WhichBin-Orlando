
package com.whichbin.whichbin_api.data_initializer;

import com.whichbin.whichbin_api.model.Announcement;
import com.whichbin.whichbin_api.model.AnnouncementType;
import com.whichbin.whichbin_api.repository.AnnouncementRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("dev")
public class AnnouncementDataInitializer implements CommandLineRunner {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementDataInitializer(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @Override
    public void run(String... args) {
        LocalDateTime now = LocalDateTime.now();

        List<Announcement> announcements = List.of(
            new Announcement(
                "Recycling Guidelines Update",
                "Review the latest recycling guidelines before placing items in your recycling cart.",
                AnnouncementType.GENERAL,
                now.minusDays(2),
                now.plusDays(30),
                true
            ),
            new Announcement(
                "Upcoming Collection Schedule",
                "A new collection schedule announcement will be available soon.",
                AnnouncementType.SCHEDULE_CHANGE,
                now.plusDays(7),
                now.plusDays(21),
                true
            ),
            new Announcement(
                "Temporary Service Alert",
                "This is an inactive sample service alert for testing.",
                AnnouncementType.SERVICE_ALERT,
                now.minusDays(1),
                now.plusDays(7),
                false
            ),
            new Announcement(
                "Previous Recycling Notice",
                "This sample announcement has already expired.",
                AnnouncementType.RECYCLING_CHANGE,
                now.minusDays(30),
                now.minusDays(7),
                true
            ),
            new Announcement(
                "Community Recycling Reminder",
                "Remember to keep recyclable items loose and out of plastic bags.",
                AnnouncementType.GENERAL,
                now.minusDays(1),
                now.plusDays(14),
                true
            )
        );

        for (Announcement announcement : announcements) {
            if (!announcementRepository.existsByTitle(announcement.getTitle())) {
                announcementRepository.save(announcement);
            }
        }
    }
}
