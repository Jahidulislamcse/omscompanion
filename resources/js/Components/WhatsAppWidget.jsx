import React from 'react';
import { usePage } from '@inertiajs/react';

export default function WhatsAppWidget() {
    const { whatsapp_number } = usePage().props;

    // Default fallback if no number set
    const rawNumber = whatsapp_number || '+8801700000000';
    // Clean string for wa.me link (keep only numbers)
    const cleanNumber = rawNumber.replace(/\D/g, '');

    const whatsappUrl = `https://wa.me/${cleanNumber}`;

    return (
        <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="whatsapp-float-btn"
            aria-label="Chat on WhatsApp"
            title="Chat with us on WhatsApp"
        >
            <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path 
                    fill="#ffffff" 
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
                />
                <path 
                    fill="#ffffff" 
                    d="M12 2a10 10 0 0 0-8.625 15.068L2 22l5.05-1.325A10 10 0 1 0 12 2zm0 18a7.95 7.95 0 0 1-4.058-1.11l-.291-.173-3.003.788.802-2.928-.189-.301A7.96 7.96 0 1 1 12 20z"
                />
            </svg>
            <span className="whatsapp-tooltip">Chat with us</span>
        </a>
    );
}
