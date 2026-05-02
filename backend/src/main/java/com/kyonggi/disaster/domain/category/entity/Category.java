package com.kyonggi.disaster.domain.category.entity;

import jakarta.persistence.*;
import lombok.*;

/** 제보 카테고리 (침수/화재/교통/낙석 등) */
@Entity
@Table(name = "category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String name;        // 예: 침수, 화재, 교통, 낙석

    @Column(length = 10)
    private String icon;        // 이모지 또는 아이콘 코드

    @Column(length = 7)
    private String color;       // 지도 핀 색상 HEX (예: #FF5733)
}
