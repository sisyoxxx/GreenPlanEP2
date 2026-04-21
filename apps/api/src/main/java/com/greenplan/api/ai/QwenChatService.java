package com.greenplan.api.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class QwenChatService {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public QwenChatService(
            RestClient.Builder builder,
            @Value("${app.qwen.base-url:https://dashscope.aliyuncs.com/compatible-mode/v1}") String baseUrl,
            @Value("${app.qwen.model:qwen-turbo}") String model,
            @Value("${app.qwen.api-key:}") String apiKey
    ) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.model = model;
    }

    public String chat(List<AiChatMessage> messages) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("未配置通义千问 API Key，请设置环境变量 DASHSCOPE_API_KEY 或配置 app.qwen.api-key");
        }

        DashScopeChatRequest payload = new DashScopeChatRequest(model, messages);

        DashScopeChatResponse response = restClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .body(payload)
                .retrieve()
                .body(DashScopeChatResponse.class);

        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new IllegalArgumentException("AI 返回为空");
        }

        DashScopeChatResponse.Choice choice = response.choices().getFirst();
        if (choice == null || choice.message() == null || choice.message().content() == null) {
            throw new IllegalArgumentException("AI 返回解析失败");
        }
        return choice.message().content();
    }

    private record DashScopeChatRequest(String model, List<AiChatMessage> messages) {
    }

    private record DashScopeChatResponse(List<Choice> choices) {
        private record Choice(Message message) {
        }

        private record Message(String role, String content) {
        }
    }
}

