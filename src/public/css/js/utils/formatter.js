const Formatter = {
    parseContent(text) {
        if (!text) return '';
        // Blue Link Formatter (https://...)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" class="discord-link">${url}</a>`;
        });
    }
};
