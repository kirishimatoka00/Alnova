// ==========================================
// 獨立模組：Telegram Bot 雙向通訊 (純前端直連版)
// ==========================================

console.log("Telegram 獨立模組已載入");

let tgLastUpdateId = localStorage.getItem('nova_tg_last_update_id') || 0;

window.pushToTelegram = async function(text) {
    if (!appState || !appState.tgToken || !appState.tgChatId) return;
    const url = `https://api.telegram.org/bot${appState.tgToken}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: appState.tgChatId, text: text })
        });
    } catch(e) { console.warn('TG Push Error', e); }
};

window.pollTelegramLocal = async function() {
    if (!appState || !appState.tgToken || appState.isThinking) return;

    const url = `https://api.telegram.org/bot${appState.tgToken}/getUpdates?offset=${tgLastUpdateId}&timeout=5`;
    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                tgLastUpdateId = update.update_id + 1;
                localStorage.setItem('nova_tg_last_update_id', tgLastUpdateId);

                if (update.message && update.message.text) {
                    if (appState.tgChatId && String(update.message.chat.id) !== String(appState.tgChatId)) continue;
                    const inputEl = document.getElementById('user-input');
                    if (inputEl) {
                        inputEl.value = update.message.text;
                        if (typeof handleSendMessage === 'function') handleSendMessage();
                    }
                }
            }
        }
    } catch(e) {}
};

setInterval(window.pollTelegramLocal, 5000);