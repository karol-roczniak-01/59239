import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './Button';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function PaymentForm({ clientSecret, onSuccess, onError, disabled }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Card Details
        </label>
        <div className="border border-border rounded-md p-3 bg-background">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: 'hsl(var(--foreground))',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  '::placeholder': {
                    color: 'hsl(var(--muted-foreground))',
                  },
                  iconColor: 'hsl(var(--foreground))',
                },
                invalid: {
                  color: 'hsl(var(--destructive))',
                  iconColor: 'hsl(var(--destructive))',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={!stripe || isProcessing || disabled}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Pay $10.00'}
        </Button>
      </div>
    </form>
  );
}