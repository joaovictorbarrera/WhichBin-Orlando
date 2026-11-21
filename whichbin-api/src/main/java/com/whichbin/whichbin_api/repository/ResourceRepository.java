
package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Optional<Resource> findByTitle(String title);

    Page<ResourceListProjection> findAllProjectedBy(Pageable pageable);
}
