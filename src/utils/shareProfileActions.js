/**
 * Utility functions for sharing a profile.
 * Toast notifications are handled by the caller — pass a toast object
 * (from useKonarToast) as the first argument where needed.
 */

function safeOpen(url) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
}

export async function copyTextToClipboard(text, toast, successMessage = "Copied!") {
    if (!text) return false;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
        }
        toast?.success(successMessage);
        return true;
    } catch (error) {
        console.error(error);
        toast?.error("Couldn't copy — please try selecting and copying manually.");
        return false;
    }
}

export function openFacebookShare(url) {
    if (!url) return;
    safeOpen(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
}

export async function openInstagramShare(url, toast) {
    if (!url) return;
    await copyTextToClipboard(url, toast, "Link copied — paste it into Instagram.");
    safeOpen("https://www.instagram.com/");
}

export function openMessengerShare(url) {
    if (!url) return;
    safeOpen(
        `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
            url
        )}&app_id=1217981644879628&redirect_uri=${encodeURIComponent(url)}`
    );
}

export function openWhatsAppShare(url) {
    if (!url) return;
    safeOpen(`https://wa.me/?text=${encodeURIComponent(url)}`);
}

export function openTextShare(url) {
    if (!url) return;
    window.location.href = `sms:?&body=${encodeURIComponent(url)}`;
}

export function downloadQrImage(dataUrl, toast, filename = "konarcard-qrcode.png") {
    if (!dataUrl) {
        toast?.error("QR code isn't ready yet — please wait a moment.");
        return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function showWalletComingSoon(walletName = "Wallet", toast) {
    toast?.info(`${walletName} is coming soon — stay tuned.`);
}
