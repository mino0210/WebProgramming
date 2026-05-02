package com.kyonggi.disaster.domain.member.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** 회원 테이블 (id/password/nickname/gender) */
@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String loginId;          // 로그인 ID

    @Column(nullable = false)
    private String password;         // BCrypt 암호화

    @Column(nullable = false, unique = true, length = 30)
    private String nickname;         // 지도 표시용

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum Gender { MALE, FEMALE, OTHER }
}
