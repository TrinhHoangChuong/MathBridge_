// ========== CHATBOT CONFIGURATION ==========
const CHATBOT_CONFIG = {
    apiUrl: 'http://localhost:8080/api/public/chat/message',
    conversationId: null,
    isOpen: false
};

// ========== INITIALIZE CHATBOT ==========
document.addEventListener('DOMContentLoaded', () => {
    initChatbot();
});

function initChatbot() {
    // Create chatbot HTML
    const chatbotHTML = `
        <div class="chatbot-container">
            <button class="chatbot-button" id="chatbotToggle" aria-label="Mở chatbot tư vấn">
                <svg class="chatbot-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <!-- Robot thông minh với gradient -->
                    <!-- Đầu robot -->
                    <rect x="25" y="20" width="50" height="50" rx="8" fill="#fff" opacity="0.9"/>
                    <!-- Mắt trái (sáng) -->
                    <circle cx="40" cy="40" r="6" fill="#3b82f6"/>
                    <circle cx="40" cy="40" r="3" fill="#fff"/>
                    <!-- Mắt phải (sáng) -->
                    <circle cx="60" cy="40" r="6" fill="#8b5cf6"/>
                    <circle cx="60" cy="40" r="3" fill="#fff"/>
                    <!-- Antenna -->
                    <circle cx="50" cy="15" r="4" fill="#ec4899"/>
                    <line x1="50" y1="15" x2="50" y2="20" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                    <!-- Miệng (mỉm cười) -->
                    <path d="M 40 55 Q 50 60 60 55" stroke="#3b82f6" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <!-- Cổ -->
                    <rect x="40" y="70" width="20" height="8" rx="4" fill="#fff" opacity="0.9"/>
                    <!-- Thân (hình vuông với góc bo) -->
                    <rect x="20" y="78" width="60" height="15" rx="6" fill="#fff" opacity="0.9"/>
                    <!-- Nút điều khiển -->
                    <circle cx="35" cy="85" r="2" fill="#8b5cf6"/>
                    <circle cx="50" cy="85" r="2" fill="#ec4899"/>
                    <circle cx="65" cy="85" r="2" fill="#3b82f6"/>
                </svg>
            </button>
            
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div class="chatbot-header-title">
                        <div class="chatbot-header-avatar">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <rect x="25" y="20" width="50" height="50" rx="8" fill="#fff" opacity="0.9"/>
                                <circle cx="40" cy="40" r="6" fill="#3b82f6"/>
                                <circle cx="40" cy="40" r="3" fill="#fff"/>
                                <circle cx="60" cy="40" r="6" fill="#8b5cf6"/>
                                <circle cx="60" cy="40" r="3" fill="#fff"/>
                                <circle cx="50" cy="15" r="4" fill="#ec4899"/>
                                <line x1="50" y1="15" x2="50" y2="20" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                                <path d="M 40 55 Q 50 60 60 55" stroke="#3b82f6" stroke-width="3" fill="none" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <div class="chatbot-header-text">
                            <h3>Trợ lý MathBridge</h3>
                            <p>Hỏi tôi bất cứ điều gì!</p>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbotClose" aria-label="Đóng chatbot">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="chatbot-message bot">
                        <div class="chatbot-message-avatar">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <rect x="25" y="20" width="50" height="50" rx="8" fill="#fff" opacity="0.9"/>
                                <circle cx="40" cy="40" r="6" fill="#3b82f6"/>
                                <circle cx="40" cy="40" r="3" fill="#fff"/>
                                <circle cx="60" cy="40" r="6" fill="#8b5cf6"/>
                                <circle cx="60" cy="40" r="3" fill="#fff"/>
                            </svg>
                        </div>
                        <div class="chatbot-message-content">
                            Xin chào! 👋 Tôi là trợ lý AI của MathBridge. Tôi có thể giúp bạn về:<br>
                            • Thông tin khóa học toán<br>
                            • Giải bài toán chi tiết<br>
                            • Câu hỏi về đăng ký và thanh toán<br>
                            • Và nhiều điều khác!<br><br>
                            Bạn cần hỗ trợ gì hôm nay?
                        </div>
                    </div>
                </div>
                
                <div class="chatbot-input-container">
                    <input 
                        type="text" 
                        class="chatbot-input" 
                        id="chatbotInput" 
                        placeholder="Nhập câu hỏi của bạn..."
                        aria-label="Nhập câu hỏi"
                    />
                    <button class="chatbot-send" id="chatbotSend" aria-label="Gửi tin nhắn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Inject vào body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    
    // Setup event listeners
    setupChatbotEvents();
}

function setupChatbotEvents() {
    const toggleBtn = document.getElementById('chatbotToggle');
    const closeBtn = document.getElementById('chatbotClose');
    const window = document.getElementById('chatbotWindow');
    const input = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');
    const messages = document.getElementById('chatbotMessages');
    
    // Toggle window
    toggleBtn.addEventListener('click', () => {
        CHATBOT_CONFIG.isOpen = !CHATBOT_CONFIG.isOpen;
        window.classList.toggle('active', CHATBOT_CONFIG.isOpen);
        if (CHATBOT_CONFIG.isOpen) {
            input.focus();
        }
    });
    
    // Close window
    closeBtn.addEventListener('click', () => {
        CHATBOT_CONFIG.isOpen = false;
        window.classList.remove('active');
    });
    
    // Send message
    const sendMessage = () => {
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        input.value = '';
        sendBtn.disabled = true;
        
        // Show typing indicator
        const typingId = showTyping();
        
        // Send to API
        fetch(CHATBOT_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversationId: CHATBOT_CONFIG.conversationId
            })
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            removeTyping(typingId);
            
            // Update conversation ID
            if (data.conversationId) {
                CHATBOT_CONFIG.conversationId = data.conversationId;
            }
            
            // Add bot response
            addMessage(data.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.', 'bot');
            sendBtn.disabled = false;
            input.focus();
        })
        .catch(error => {
            console.error('Chatbot error:', error);
            removeTyping(typingId);
            addMessage('Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.', 'bot');
            sendBtn.disabled = false;
            input.focus();
        });
    };
    
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

function addMessage(text, type) {
    const messages = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'chatbot-message-avatar';
    
    if (type === 'bot') {
        avatar.innerHTML = `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="25" y="20" width="50" height="50" rx="8" fill="#fff" opacity="0.9"/>
                <circle cx="40" cy="40" r="6" fill="#3b82f6"/>
                <circle cx="40" cy="40" r="3" fill="#fff"/>
                <circle cx="60" cy="40" r="6" fill="#8b5cf6"/>
                <circle cx="60" cy="40" r="3" fill="#fff"/>
            </svg>
        `;
    } else {
        avatar.textContent = 'Bạn';
    }
    
    const content = document.createElement('div');
    content.className = 'chatbot-message-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    
    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
    const messages = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot';
    typingDiv.id = 'chatbotTyping';
    
    const avatar = document.createElement('div');
    avatar.className = 'chatbot-message-avatar';
    avatar.innerHTML = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="20" width="50" height="50" rx="8" fill="#fff" opacity="0.9"/>
            <circle cx="40" cy="40" r="6" fill="#3b82f6"/>
            <circle cx="60" cy="40" r="6" fill="#8b5cf6"/>
        </svg>
    `;
    
    const typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.innerHTML = `
        <div class="chatbot-typing-dot"></div>
        <div class="chatbot-typing-dot"></div>
        <div class="chatbot-typing-dot"></div>
    `;
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typing);
    messages.appendChild(typingDiv);
    
    messages.scrollTop = messages.scrollHeight;
    
    return 'chatbotTyping';
}

function removeTyping(typingId) {
    const typing = document.getElementById(typingId);
    if (typing) {
        typing.remove();
    }
}

