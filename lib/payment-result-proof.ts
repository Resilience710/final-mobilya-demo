import crypto from 'crypto';

type PaymentResultStatus = 'success';

function getSecret(): string {
  const secret =
    process.env.PAYMENT_RESULT_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    '';

  if (!secret) {
    throw new Error('PAYMENT_RESULT_SECRET or SUPABASE_SERVICE_ROLE_KEY is required.');
  }

  return secret;
}

export function createPaymentResultProof(input: {
  orderId: string;
  status: PaymentResultStatus;
  provider: string;
}): string {
  const payload = `${input.orderId}:${input.status}:${input.provider}`;
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function verifyPaymentResultProof(input: {
  orderId: string;
  status: PaymentResultStatus;
  provider: string;
  proof: string;
}): boolean {
  const expected = createPaymentResultProof({
    orderId: input.orderId,
    status: input.status,
    provider: input.provider,
  });

  const received = input.proof.trim().toLowerCase();
  const normalizedExpected = expected.toLowerCase();

  if (received.length !== normalizedExpected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(normalizedExpected, 'utf8'),
    Buffer.from(received, 'utf8')
  );
}
