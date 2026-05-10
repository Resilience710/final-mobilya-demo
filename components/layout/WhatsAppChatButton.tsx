const WHATSAPP_URL = 'https://wa.me/905445319012';

type WhatsAppChatButtonProps = {
  hasLiveChat?: boolean;
};

export default function WhatsAppChatButton({ hasLiveChat = false }: WhatsAppChatButtonProps) {
  const positionClassName = hasLiveChat
    ? 'bottom-4 right-[5.5rem] sm:bottom-5 sm:right-24'
    : 'bottom-4 right-4 sm:bottom-5 sm:right-5';

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile sohbet et"
      className={`fixed ${positionClassName} z-[2000000001] inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-[#25D366] text-white shadow-[0_18px_40px_-16px_rgba(37,211,102,0.7)] transition-all duration-300 hover:scale-105 hover:bg-[#1fba59] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-cream`}
    >
      <span aria-hidden="true" className="flex items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8 fill-current">
          <path d="M19.11 17.53c-.28-.14-1.64-.81-1.9-.9-.25-.09-.44-.14-.62.14-.18.28-.71.9-.87 1.08-.16.19-.32.21-.6.07-.28-.14-1.16-.43-2.21-1.37-.81-.72-1.36-1.62-1.52-1.89-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.49.14-.16.19-.28.28-.46.09-.18.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.22-.53-.45-.46-.62-.47h-.53c-.18 0-.49.07-.74.35-.25.28-.97.95-.97 2.32 0 1.36.99 2.68 1.13 2.86.14.19 1.95 2.98 4.72 4.18.66.28 1.18.45 1.58.57.66.21 1.26.18 1.74.11.53-.08 1.64-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.32Z" />
          <path d="M16.02 3.2c-7.08 0-12.83 5.72-12.83 12.77 0 2.25.6 4.45 1.73 6.39L3 29l6.84-1.78a12.9 12.9 0 0 0 6.18 1.57h.01c7.07 0 12.81-5.72 12.81-12.78 0-3.42-1.33-6.63-3.76-9.04A12.77 12.77 0 0 0 16.02 3.2Zm0 23.44h-.01a10.8 10.8 0 0 1-5.5-1.5l-.39-.23-4.06 1.06 1.08-3.96-.25-.41a10.6 10.6 0 0 1-1.63-5.62c0-5.91 4.83-10.72 10.77-10.72 2.88 0 5.59 1.12 7.61 3.13a10.63 10.63 0 0 1 3.17 7.58c0 5.91-4.83 10.72-10.79 10.72Z" />
        </svg>
      </span>
    </a>
  );
}
