package com.kyonggi.disaster.domain.member.controller;

import com.kyonggi.disaster.common.response.ApiResponse;
import com.kyonggi.disaster.domain.member.dto.LoginRequest;
import com.kyonggi.disaster.domain.member.dto.MemberResponse;
import com.kyonggi.disaster.domain.member.dto.SignUpRequest;
import com.kyonggi.disaster.domain.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /** POST /api/members/signup */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<MemberResponse>> signUp(@Valid @RequestBody SignUpRequest request) {
        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", memberService.signUp(request)));
    }

    /** POST /api/members/login */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<MemberResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("로그인 성공", memberService.login(request)));
    }
}
