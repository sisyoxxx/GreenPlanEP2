package com.greenplan.api.ai;

import com.greenplan.api.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final QwenChatService qwenChatService;

    public AiChatController(QwenChatService qwenChatService) {
        this.qwenChatService = qwenChatService;
    }

    @PostMapping("/chat")
    public ApiResponse<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        String content = qwenChatService.chat(request.messages());
        return ApiResponse.ok(new AiChatResponse(content));
    }
}

