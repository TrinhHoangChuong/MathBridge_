package com.mathbridge.service;

import com.mathbridge.dto.ChatRequestDTO;
import com.mathbridge.dto.ChatResponseDTO;
import com.mathbridge.dto.GeminiRequestDTO;
import com.mathbridge.dto.GeminiResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.UUID;

@Service
public class ChatService {

    private static final String SYSTEM_PROMPT = """
        Bạn là trợ lý AI thông minh của MathBridge - một nền tảng học toán trực tuyến.
        
        NHIỆM VỤ CỦA BẠN:
        1. Trả lời các câu hỏi về MathBridge (khóa học, đăng ký, thanh toán, bài tập, điểm số, v.v.)
        2. Giải toán chi tiết với các bước giải, công thức, và ví dụ minh họa
        3. Trả lời các câu hỏi kiến thức chung (khoa học, văn hóa, lịch sử, v.v.)
        
        QUY TẮC:
        - Luôn trả lời bằng tiếng Việt
        - Đối với câu hỏi toán học: giải chi tiết từng bước, nêu công thức, và đưa ra ví dụ
        - Đối với câu hỏi về MathBridge: cung cấp thông tin chính xác và hữu ích
        - Đối với câu hỏi kiến thức chung: trả lời đầy đủ và chi tiết
        - Luôn thân thiện, nhiệt tình và chuyên nghiệp
        - Nếu không chắc chắn, hãy nói rõ và đề xuất cách tìm hiểu thêm
        
        Hãy bắt đầu trả lời câu hỏi của người dùng một cách chi tiết và hữu ích.
        """;

    @Value("${gemini.api.key:YOUR_GEMINI_API_KEY}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent}")
    private String geminiApiUrlTemplate;

    @Value("${gemini.api.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.temperature:0.7}")
    private Double geminiTemperature;

    @Value("${gemini.api.max-tokens:2048}")
    private Integer geminiMaxTokens;

    private final RestTemplate restTemplate;

    public ChatService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ChatResponseDTO chat(ChatRequestDTO request) {
        try {
            System.out.println("========== CHAT SERVICE START ==========");
            System.out.println("ChatService: Received message: " + request.getMessage());
            System.out.println("ChatService: Conversation ID: " + request.getConversationId());
            
            String responseText = callGeminiAPI(request.getMessage());
            
            System.out.println("ChatService: Got response from Gemini, length: " + (responseText != null ? responseText.length() : 0));
            System.out.println("ChatService: Response preview: " + (responseText != null && responseText.length() > 100 ? responseText.substring(0, 100) + "..." : responseText));
            
            // Tạo hoặc sử dụng conversationId
            String conversationId = request.getConversationId() != null && !request.getConversationId().isEmpty()
                    ? request.getConversationId()
                    : UUID.randomUUID().toString();
            
            System.out.println("========== CHAT SERVICE SUCCESS ==========");
            return new ChatResponseDTO(responseText, conversationId, null);
        } catch (Exception e) {
            // Log error for debugging
            System.err.println("========== CHAT SERVICE ERROR ==========");
            System.err.println("ChatService error: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            System.err.println("Stack trace:");
            e.printStackTrace();
            System.err.println("=========================================");
            
            // Fallback nếu có lỗi
            String errorMessage = e.getMessage();
            String fallbackResponse;
            
            // Kiểm tra loại lỗi để trả về thông báo phù hợp
            if (errorMessage != null) {
                if (errorMessage.contains("bị vô hiệu hóa") || errorMessage.contains("leaked") || errorMessage.contains("bị từ chối")) {
                    fallbackResponse = "Xin lỗi, API key đã bị vô hiệu hóa do bị leak hoặc không có quyền truy cập.\n\n" +
                                      "Vui lòng:\n" +
                                      "1. Truy cập Google AI Studio (https://aistudio.google.com/)\n" +
                                      "2. Tạo API key mới\n" +
                                      "3. Cập nhật API key mới vào file application.properties\n" +
                                      "4. Restart backend server\n\n" +
                                      "Lưu ý: Không chia sẻ API key công khai để tránh bị leak.";
                } else if (errorMessage.contains("API key") || errorMessage.contains("API_KEY") || errorMessage.contains("chưa được cấu hình")) {
                    fallbackResponse = "Xin lỗi, hệ thống chưa được cấu hình API key cho Gemini AI.\n\n" +
                                      "Vui lòng:\n" +
                                      "1. Thêm Gemini API key vào file application.properties\n" +
                                      "2. Restart backend server\n\n" +
                                      "Bạn có thể liên hệ bộ phận kỹ thuật để được hỗ trợ.";
                } else if (errorMessage.contains("không tìm thấy") || errorMessage.contains("not found")) {
                    fallbackResponse = "Xin lỗi, model AI không tìm thấy.\n\n" +
                                      "Vui lòng kiểm tra:\n" +
                                      "1. Tên model trong application.properties có đúng không\n" +
                                      "2. Model có được hỗ trợ trong API version hiện tại không\n\n" +
                                      "Bạn có thể thử đổi sang model khác như 'gemini-pro' hoặc 'gemini-1.5-flash'.";
                } else if (errorMessage.contains("không hợp lệ")) {
                    fallbackResponse = "Xin lỗi, API key không hợp lệ.\n\n" +
                                      "Vui lòng:\n" +
                                      "1. Kiểm tra lại API key trong application.properties\n" +
                                      "2. Đảm bảo API key còn hiệu lực\n" +
                                      "3. Restart backend server sau khi sửa\n\n" +
                                      "Bạn có thể liên hệ bộ phận kỹ thuật để được hỗ trợ.";
                } else {
                    fallbackResponse = "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI.\n\n" +
                                      "Lỗi: " + errorMessage + "\n\n" +
                                      "Vui lòng thử lại sau hoặc liên hệ bộ phận kỹ thuật.";
                }
            } else {
                fallbackResponse = generateFallbackResponse(request.getMessage());
            }
            
            System.out.println("Using fallback response: " + fallbackResponse.substring(0, Math.min(100, fallbackResponse.length())));
            
            return new ChatResponseDTO(
                fallbackResponse,
                request.getConversationId() != null ? request.getConversationId() : UUID.randomUUID().toString(),
                errorMessage
            );
        }
    }
    
    private String callGeminiAPI(String userMessage) {
        try {
            // Check if API key is set
            System.out.println("Checking API key...");
            System.out.println("API key is null: " + (geminiApiKey == null));
            System.out.println("API key is empty: " + (geminiApiKey != null && geminiApiKey.isEmpty()));
            System.out.println("API key equals placeholder: " + (geminiApiKey != null && geminiApiKey.equals("YOUR_GEMINI_API_KEY")));
            System.out.println("API key length: " + (geminiApiKey != null ? geminiApiKey.length() : 0));
            System.out.println("API key preview: " + (geminiApiKey != null && geminiApiKey.length() > 10 ? geminiApiKey.substring(0, 10) + "..." : geminiApiKey));
            
            if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.equals("YOUR_GEMINI_API_KEY")) {
                throw new RuntimeException("Gemini API key chưa được cấu hình. Vui lòng thêm API key vào application.properties");
            }
            
            // Build the full prompt with system prompt
            String fullPrompt = SYSTEM_PROMPT + "\n\nNgười dùng hỏi: " + userMessage;
            
            // Create request DTO
            GeminiRequestDTO request = new GeminiRequestDTO();
            
            // Create content with parts
            GeminiRequestDTO.ContentDTO content = new GeminiRequestDTO.ContentDTO();
            GeminiRequestDTO.PartDTO part = new GeminiRequestDTO.PartDTO();
            part.setText(fullPrompt);
            content.setParts(Arrays.asList(part));
            request.setContents(Arrays.asList(content));
            
            // Set generation config
            GeminiRequestDTO.GenerationConfigDTO config = new GeminiRequestDTO.GenerationConfigDTO();
            config.setTemperature(geminiTemperature);
            config.setMaxOutputTokens(geminiMaxTokens);
            request.setGenerationConfig(config);
            
            // Build API URL
            String apiUrl = geminiApiUrlTemplate.replace("{model}", geminiModel);
            String fullUrl = apiUrl + "?key=" + geminiApiKey;
            
            System.out.println("Calling Gemini API:");
            System.out.println("  URL: " + apiUrl);
            System.out.println("  Model: " + geminiModel);
            System.out.println("  API Key: " + (geminiApiKey != null && !geminiApiKey.isEmpty() ? geminiApiKey.substring(0, Math.min(10, geminiApiKey.length())) + "..." : "NOT SET"));
            System.out.println("  User message: " + userMessage);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
            
            HttpEntity<GeminiRequestDTO> entity = new HttpEntity<>(request, headers);
            
            // Make API call
            ResponseEntity<GeminiResponseDTO> response = restTemplate.exchange(
                fullUrl,
                HttpMethod.POST,
                entity,
                GeminiResponseDTO.class
            );
            
            System.out.println("Gemini API Response Status: " + response.getStatusCode());
            System.out.println("Raw response body: " + (response.getBody() != null ? response.getBody().toString() : "null"));
            
            // Check for errors
            if (response.getBody() != null && response.getBody().getError() != null) {
                GeminiResponseDTO.ErrorDTO error = response.getBody().getError();
                throw new RuntimeException("Gemini API Error: " + error.getMessage() + " (Code: " + error.getCode() + ")");
            }
            
            // Extract response text
            if (response.getBody() != null && 
                response.getBody().getCandidates() != null && 
                !response.getBody().getCandidates().isEmpty()) {
                
                GeminiResponseDTO.CandidateDTO candidate = response.getBody().getCandidates().get(0);
                if (candidate.getContent() != null && 
                    candidate.getContent().getParts() != null && 
                    !candidate.getContent().getParts().isEmpty()) {
                    
                    String responseText = candidate.getContent().getParts().get(0).getText();
                    System.out.println("Extracted response text length: " + (responseText != null ? responseText.length() : 0));
                    return responseText;
                }
            }
            
            throw new RuntimeException("No response text found in Gemini API response");
            
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Handle HTTP errors (400, 401, 403, 404, etc.)
            System.err.println("HTTP Error calling Gemini API: " + e.getStatusCode() + " - " + e.getMessage());
            String responseBody = e.getResponseBodyAsString();
            System.err.println("Response body: " + responseBody);
            
            // Handle 403 - Forbidden (API key leaked/revoked)
            if (e.getStatusCode().value() == 403) {
                if (responseBody != null && responseBody.contains("leaked")) {
                    throw new RuntimeException("API key đã bị vô hiệu hóa do bị leak. Vui lòng tạo API key mới từ Google AI Studio và cập nhật vào application.properties");
                } else if (responseBody != null && responseBody.contains("PERMISSION_DENIED")) {
                    throw new RuntimeException("API key không có quyền truy cập. Vui lòng kiểm tra lại API key hoặc tạo API key mới từ Google AI Studio");
                } else {
                    throw new RuntimeException("API key bị từ chối truy cập (403 Forbidden). Vui lòng kiểm tra lại API key trong application.properties");
                }
            }
            
            // Try to parse error response
            if (responseBody != null && responseBody.contains("API_KEY_INVALID")) {
                throw new RuntimeException("Gemini API key không hợp lệ. Vui lòng kiểm tra lại API key trong application.properties");
            }
            
            // Handle 404 - Model not found
            if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("Model '" + geminiModel + "' không tìm thấy hoặc không được hỗ trợ. Vui lòng kiểm tra lại tên model trong application.properties");
            }
            
            throw new RuntimeException("Lỗi khi gọi Gemini API: " + e.getStatusCode() + " - " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get response from Gemini API: " + e.getMessage(), e);
        }
    }
    
    private String generateFallbackResponse(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.contains("xin chào") || lowerMessage.contains("hello") || lowerMessage.contains("chào")) {
            return "Xin chào! Tôi là trợ lý AI của MathBridge. Tôi có thể giúp bạn về:\n" +
                   "- Thông tin về các khóa học toán\n" +
                   "- Giải các bài toán\n" +
                   "- Câu hỏi về đăng ký và thanh toán\n" +
                   "- Và nhiều điều khác nữa!\n\n" +
                   "Bạn cần hỗ trợ gì hôm nay?";
        }
        
        if (lowerMessage.contains("toán") || lowerMessage.contains("math") || lowerMessage.contains("tính")) {
            return "Tôi có thể giúp bạn giải toán! Hãy gửi câu hỏi toán học cụ thể, tôi sẽ giải chi tiết từng bước cho bạn.";
        }
        
        if (lowerMessage.contains("khóa học") || lowerMessage.contains("course") || lowerMessage.contains("đăng ký")) {
            return "MathBridge cung cấp nhiều khóa học toán từ cơ bản đến nâng cao. Bạn có thể:\n" +
                   "- Xem danh sách khóa học trên trang chủ\n" +
                   "- Đăng ký khóa học phù hợp\n" +
                   "- Thanh toán qua Momo\n\n" +
                   "Bạn muốn tìm hiểu về khóa học nào?";
        }
        
        return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ của MathBridge.\n\n" +
               "Bạn cũng có thể:\n" +
               "- Xem thông tin trên website\n" +
               "- Liên hệ qua email hoặc hotline\n" +
               "- Để lại tin nhắn trong form liên hệ";
    }
}

