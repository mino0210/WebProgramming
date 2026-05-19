package com.kyonggi.disaster.member;

import com.kyonggi.disaster.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<MemberResponse>> signUp(
            @Valid @RequestBody SignUpRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("회원가입이 완료되었습니다.", memberService.signUp(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<MemberResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("로그인 성공", memberService.login(request)));
    }
}
