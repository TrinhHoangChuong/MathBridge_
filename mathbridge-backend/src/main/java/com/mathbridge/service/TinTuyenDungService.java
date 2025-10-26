package com.mathbridge.service;

import com.mathbridge.dto.JobDTO;
import com.mathbridge.entity.TinTuyenDung;
import com.mathbridge.repository.TinTuyenDungRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TinTuyenDungService {

    private final TinTuyenDungRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    public TinTuyenDungService(TinTuyenDungRepository repo) {
        this.repo = repo;
    }

    public List<JobDTO> listAll() {
        List<TinTuyenDung> list = repo.findAll();
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    public Optional<JobDTO> findBySlug(String slug) {
        // The DB doesn't store a slug column. Generate slug from title and match in
        // memory.
        List<TinTuyenDung> list = repo.findAll();
        return list.stream().filter(e -> {
            String title = e.getTieuDe() == null ? "" : e.getTieuDe();
            String generated = slugify(title);
            return generated.equals(slug);
        }).findFirst().map(this::toDto);
    }

    private String slugify(String input) {
        if (input == null)
            return "";
        String s = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
        return s;
    }

    private JobDTO toDto(TinTuyenDung e) {
        JobDTO dto = new JobDTO();
        dto.setId(e.getId());
        dto.setTieuDe(e.getTieuDe());
        dto.setViTri(e.getViTri());
        dto.setMoTaNgan(e.getMoTaNgan());
        dto.setMoTa(e.getMoTa());
        dto.setCapBac(e.getCapBac());
        dto.setHinhThucLamViec(e.getHinhThucLamViec());
        dto.setMucLuongTu(e.getMucLuongTu());
        dto.setMucLuongDen(e.getMucLuongDen());

        dto.setYeuCau(parseStringArray(e.getYeuCau()));
        // benefits: there's no explicit benefits column in your table screenshot;
        // return empty
        dto.setBenefits(new java.util.ArrayList<>());

        return dto;
    }

    private List<String> parseStringArray(String raw) {
        if (raw == null)
            return new ArrayList<>();
        try {
            if (raw.trim().startsWith("[")) {
                return mapper.readValue(raw, new TypeReference<List<String>>() {
                });
            }
        } catch (Exception ignored) {
        }
        // fallback: split by newlines
        String[] parts = raw.split("\r?\n");
        List<String> out = new ArrayList<>();
        for (String p : parts)
            if (p != null && !p.trim().isEmpty())
                out.add(p.trim());
        return out;
    }
}
