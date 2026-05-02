package com.kyonggi.disaster.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP WebSocket 설정
 *
 * 채널 구조:
 *   /ws            - 클라이언트 연결 엔드포인트 (SockJS 폴백 포함)
 *   /topic/pins    - 새 제보 핀 전체 브로드캐스트
 *   /topic/sympathy - 공감 수 실시간 반영
 *   /topic/alert   - 경보 임계치(4개) 초과 알림
 *   /app/report    - 클라이언트 → 서버 제보 전송
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
