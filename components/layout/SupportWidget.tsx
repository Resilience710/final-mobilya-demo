import TawkToWidget from '@/components/layout/TawkToWidget';
import WhatsAppChatButton from '@/components/layout/WhatsAppChatButton';

const tawkToPropertyId = process.env.NEXT_PUBLIC_TAWK_TO_PROPERTY_ID?.trim();
const tawkToWidgetId = process.env.NEXT_PUBLIC_TAWK_TO_WIDGET_ID?.trim();

export default function SupportWidget() {
  if (tawkToPropertyId && tawkToWidgetId) {
    return (
      <>
        <TawkToWidget propertyId={tawkToPropertyId} widgetId={tawkToWidgetId} />
        <WhatsAppChatButton hasLiveChat />
      </>
    );
  }

  return <WhatsAppChatButton />;
}
