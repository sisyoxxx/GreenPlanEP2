package com.greenplan.api.tutorial;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TutorialRepository extends JpaRepository<Tutorial, Long> {
    List<Tutorial> findByDisplayAreaAndPublishedTrueOrderByDisplayOrderAscIdAsc(String displayArea);
    Optional<Tutorial> findByIdAndPublishedTrue(Long id);

    List<Tutorial> findAllByOrderByDisplayAreaAscDisplayOrderAscIdAsc();

    Optional<Tutorial> findFirstByDisplayAreaAndDisplayOrderLessThanOrderByDisplayOrderDesc(String displayArea, Integer displayOrder);

    Optional<Tutorial> findFirstByDisplayAreaAndDisplayOrderGreaterThanOrderByDisplayOrderAsc(String displayArea, Integer displayOrder);
}
