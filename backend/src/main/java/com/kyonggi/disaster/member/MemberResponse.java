package com.kyonggi.disaster.member;

import lombok.Getter;

@Getter
public class MemberResponse {

    private final Long          id;
    private final String        nickname;
    private final Member.Gender gender;

    public MemberResponse(Member member) {
        this.id       = member.getId();
        this.nickname = member.getNickname();
        this.gender   = member.getGender();
    }
}
