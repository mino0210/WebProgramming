package com.kyonggi.disaster.domain.member.dto;

import com.kyonggi.disaster.domain.member.entity.Member;
import lombok.Getter;

/** 회원 응답 DTO (비밀번호 제외) */
@Getter
public class MemberResponse {

    private final Long id;
    private final String nickname;
    private final Member.Gender gender;

    public MemberResponse(Member member) {
        this.id = member.getId();
        this.nickname = member.getNickname();
        this.gender = member.getGender();
    }
}
