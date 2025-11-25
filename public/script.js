const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

let conversationHistory = [];

/**
 * Appends a message to the chat box.
 * @param {string} sender - Who sent the message ('user' or 'bot').
 * @param {string} message - The message content.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    return messageElement;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();

    if (!userMessage) {
        return;
    }

    // 1. Display user's message
    appendMessage('user', userMessage);
    userInput.value = '';

    // 2. Create and display a placeholder message
    const placeholder = appendMessage('bot', 'Gemini is thinking...');
    placeholder.classList.add('thinking');

    try {
        // 3. Send request to the backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                history: conversationHistory,
                message: userMessage,
            }),
        });

        const data = await response.json();

        // 4. Check for 'result' and update placeholder or show fallback
        if (data.result) {
            placeholder.textContent = data.result;
            // Update conversation history
            conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
            conversationHistory.push({ role: 'model', parts: [{ text: data.result }] });
        } else {
            placeholder.textContent = 'Sorry, no response received.';
        }
    } catch (error) {
        console.error('Error fetching chat response:', error);
        placeholder.textContent = 'Sorry, something went wrong.';
    } finally {
        placeholder.classList.remove('thinking');
    }
});