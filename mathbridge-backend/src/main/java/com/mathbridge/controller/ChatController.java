package com.mathbridge.controller;

import com.mathbridge.dto.ChatRequestDTO;
import com.mathbridge.dto.ChatResponseDTO;
import com.mathbridge.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatRequestDTO request) {
        try {
            ChatResponseDTO response = chatService.chat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ChatResponseDTO errorResponse = new ChatResponseDTO(
                "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
                request.getConversationId(),
                e.getMessage()
            );
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat service is running");
    }

    @PostMapping("/test")
    public ResponseEntity<String> test() {
        try {
            ChatRequestDTO testRequest = new ChatRequestDTO("Xin chào", null);
            ChatResponseDTO response = chatService.chat(testRequest);
            return ResponseEntity.ok("Test successful! Response: " + response.getResponse().substring(0, Math.min(100, response.getResponse().length())));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Test failed: " + e.getMessage());
        }
    }
}

