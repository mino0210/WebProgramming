package com.kyonggi.disaster.member;

import com.kyonggi.disaster.common.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder  passwordEncoder;

    @Transactional
    public MemberResponse signUp(SignUpRequest request) {
        if (memberRepository.existsByLoginId(request.getLoginId()))
            throw CustomException.conflict("이미 사용 중인 아이디입니다.");
        if (memberRepository.existsByNickname(request.getNickname()))
            throw CustomException.conflict("이미 사용 중인 닉네임입니다.");

        Member member = Member.builder()
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .gender(request.getGender())
                .build();

        return new MemberResponse(memberRepository.save(member));
    }

    public MemberResponse login(LoginRequest request) {
        Member member = memberRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> CustomException.badRequest("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword()))
            throw CustomException.badRequest("아이디 또는 비밀번호가 올바르지 않습니다.");

        return new MemberResponse(member);
    }
}
