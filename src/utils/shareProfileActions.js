import { toast } from "react-hot-toast";

function safeOpen(url) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
}

export async function copyTextToClipboard(text, successMessage = "Copied!") {
    if (!text) return false;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            toast.success(successMessage);
            return true;
        }

        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        toast.success(successMessage);
        return true;
    } catch (error) {
        console.error(error);
        toast.error("Failed to copy. Please try again.");
        return false;
    }
}

export function openFacebookShare(url) {
    if (!url) return;
    safeOpen(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
}

export async function openInstagramShare(url) {
    if (!url) return;
    await copyTextToClipboard(url, "Profile link copied for Instagram sharing.");
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

export function downloadQrImage(dataUrl, filename = "konarcard-qrcode.png") {
    if (!dataUrl) {
        toast.error("QR code is not available yet.");
        return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function showWalletComingSoon(walletName = "Wallet") {
    toast(`${walletName} is coming soon.`);
}