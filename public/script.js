document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    /**
     * Appends a message to the chat box.
     * @param {string} sender - The sender of the message ('user' or 'bot').
     * @param {string} text - The message content.
     * @param {boolean} isThinking - Whether this is a temporary "thinking" message.
     * @returns {HTMLElement} The created message element.
     */
    const appendMessage = (sender, text, isThinking = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);

        if (isThinking) {
            messageDiv.classList.add('thinking');
        }

        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        
        // Scroll to the bottom to see the new message
        chatBox.scrollTop = chatBox.scrollHeight;
        
        return messageDiv;
    };

    /**
     * Handles the chat form submission.
     * @param {Event} event - The form submission event.
     */
    const handleChatSubmit = async (event) => {
        event.preventDefault();

        const userMessage = userInput.value.trim();
        if (!userMessage) {
            return; // Don't send empty messages
        }

        // 1. Display the user's message immediately.
        appendMessage('user', userMessage);

        // 2. Clear the input field.
        userInput.value = '';

        // 3. Show a temporary "Thinking..." message.
        const thinkingMessage = appendMessage('bot', 'Thinking...', true);

        try {
            // 4. Send the user's message to the backend API.
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Construct the payload according to the API spec.
                body: JSON.stringify({
                    conversation: [{ role: 'user', text: userMessage }],
                }),
            });

            // The "thinking" state is over, whether it succeeded or failed.
            thinkingMessage.classList.remove('thinking');

            if (!response.ok) {
                // Handle non-successful HTTP statuses (e.g., 500, 404).
                thinkingMessage.textContent = 'Failed to get response from server.';
                console.error('Server Error:', response.status, response.statusText);
                return;
            }

            const data = await response.json();

            // 5. Replace the "Thinking..." message with the actual response or an error.
            if (data && data.result) {
                thinkingMessage.textContent = data.result;
            } else {
                thinkingMessage.textContent = 'Sorry, no response received.';
            }

        } catch (error) {
            // Handle network errors or issues with the fetch request itself.
            thinkingMessage.classList.remove('thinking');
            thinkingMessage.textContent = 'Failed to get response from server.';
            console.error('Fetch API Error:', error);
        } finally {
            // Ensure the final message is visible.
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    };

    chatForm.addEventListener('submit', handleChatSubmit);
});
