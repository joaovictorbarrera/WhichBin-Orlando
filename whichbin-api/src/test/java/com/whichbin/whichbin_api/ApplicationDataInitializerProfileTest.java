
package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.data_initializer.UserDataInitializer;
import com.whichbin.whichbin_api.repository.AnnouncementRepository;
import com.whichbin.whichbin_api.repository.ItemRepository;
import com.whichbin.whichbin_api.repository.ResourceRepository;
import com.whichbin.whichbin_api.repository.TriviaChallengeRepository;
import com.whichbin.whichbin_api.repository.TriviaQuestionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ApplicationDataInitializerProfileTest {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private TriviaChallengeRepository challengeRepository;

    @Autowired
    private TriviaQuestionRepository questionRepository;

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void shouldNotLoadDemoDataOutsideDevProfile() {
        assertTrue(itemRepository.findAll().isEmpty());
        assertTrue(resourceRepository.findAll().isEmpty());
        assertTrue(announcementRepository.findAll().isEmpty());
        assertTrue(challengeRepository.findAll().isEmpty());
        assertTrue(questionRepository.findAll().isEmpty());
    }

    @Test
    void shouldNotLoadUserDataInitializerOutsideDevProfile() {
        assertTrue(applicationContext
                .getBeansOfType(UserDataInitializer.class)
                .isEmpty());
    }
}
