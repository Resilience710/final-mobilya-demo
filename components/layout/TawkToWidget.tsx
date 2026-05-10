import Script from 'next/script';

type TawkToWidgetProps = {
  propertyId: string;
  widgetId: string;
};

export default function TawkToWidget({ propertyId, widgetId }: TawkToWidgetProps) {
  return (
    <>
      <Script id="tawk-to-api" strategy="afterInteractive">
        {`
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();
        `}
      </Script>
      <Script
        id="tawk-to-loader"
        src={`https://embed.tawk.to/${propertyId}/${widgetId}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    </>
  );
}
