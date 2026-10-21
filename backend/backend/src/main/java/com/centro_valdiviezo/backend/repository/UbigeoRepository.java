package com.centro_valdiviezo.backend.repository;

import com.centro_valdiviezo.backend.model.Ubigeo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UbigeoRepository extends JpaRepository<Ubigeo, Integer> {
}
