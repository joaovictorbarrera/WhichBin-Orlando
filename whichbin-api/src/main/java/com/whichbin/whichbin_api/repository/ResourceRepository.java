package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
}