package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.CIE;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CIERepository extends JpaRepository<CIE, Integer> {
}
