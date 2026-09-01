'use client';

import { useEffect, useRef } from 'react';
import type { SafeTouchpoint } from '@/lib/schemas/backend.schema';
import { X } from 'lucide-react';

interface LeadDetailsDrawerProps {
  touchpoint: SafeTouchpoint;
  allItemsOnPage: SafeTouchpoint[];
  onClose: () => void;
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="details-field">
      <span className="details-field-label">{label}</span>
      <span className="details-field-value">{value}</span>
    </div>
  );
}

function MonoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="details-field">
      <span className="details-field-label">{label}</span>
      <span className="details-field-value mono">{value}</span>
    </div>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function LeadDetailsDrawer({
  touchpoint,
  allItemsOnPage,
  onClose,
}: LeadDetailsDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    closeRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Related touchpoints on the current page for the same lead
  const relatedOnPage = allItemsOnPage.filter(
    (i) => i.userId === touchpoint.userId && i._id !== touchpoint._id
  );

  const isAttributed = !!(touchpoint.utm_source || touchpoint.utm_campaign);
  const isReturning = relatedOnPage.length > 0;

  return (
    <tr className="details-row">
      <td colSpan={9}>
        <div
          ref={drawerRef}
          role="region"
          aria-label={`Details for ${touchpoint.name ?? 'lead'}`}
        >
          <div className="details-content">
            {/* Left column */}
            <div>
              {/* Lead info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 className="details-section-title">Contact Information</h3>
                  <button
                    ref={closeRef}
                    className="btn-expand"
                    onClick={onClose}
                    aria-label="Close details"
                  >
                    <X size={13} /> Close
                  </button>
                </div>
                <div className="details-grid">
                  <Field label="Name" value={touchpoint.name} />
                  <Field label="Email" value={touchpoint.email} />
                  <Field label="Phone" value={touchpoint.phone} />
                  <Field label="Country Code" value={touchpoint.countryCode} />
                  <Field label="Profession" value={touchpoint.profession} />
                  <Field label="Status" value={touchpoint.status} />
                </div>
              </div>

              {/* Business info */}
              <div>
                <h3 className="details-section-title">Business Information</h3>
                <div className="details-grid">
                  <Field label="Monthly Ad Spend" value={touchpoint.monthlyAdSpend} />
                  <Field label="Products Sold" value={touchpoint.productsSold} />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Touchpoint info */}
              <div style={{ marginBottom: 20 }}>
                <h3 className="details-section-title">This Touchpoint</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {isAttributed && (
                    <span className="badge badge-attributed">UTM Attributed</span>
                  )}
                  {!isAttributed && (
                    <span className="badge badge-direct">Direct / Organic</span>
                  )}
                  {isReturning && (
                    <span className="badge badge-returning">Returning Lead</span>
                  )}
                </div>
                <div className="details-grid">
                  <Field label="Route" value={touchpoint.route} />
                  <Field label="Platform" value={touchpoint.platform} />
                  <Field label="UTM Source" value={touchpoint.utm_source} />
                  <Field label="UTM Medium" value={touchpoint.utm_medium} />
                  <Field label="UTM Campaign" value={touchpoint.utm_campaign} />
                  <Field label="UTM Content" value={touchpoint.utm_content} />
                  <Field label="UTM Term" value={touchpoint.utm_term} />
                  <Field label="Keyword" value={touchpoint.keyword} />
                  <Field label="Device" value={touchpoint.device} />
                  <Field label="Network" value={touchpoint.network} />
                  <Field label="Match Type" value={touchpoint.matchtype} />
                  <MonoField label="Campaign ID" value={touchpoint.campaignid} />
                  <MonoField label="Ad Group ID" value={touchpoint.adgroupid} />
                  <MonoField label="GCLID" value={touchpoint.gclid} />
                  <MonoField label="FBCLID" value={touchpoint.fbclid} />
                  <Field label="Touchpoint Time" value={formatDate(touchpoint.createdAt)} />
                </div>
              </div>

              {/* Related touchpoints on page */}
              {relatedOnPage.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 className="details-section-title" style={{ margin: 0 }}>
                      Related Touchpoints
                    </h3>
                    <span className="related-touchpoints-label">
                      On Current Page Only — Not Complete History
                    </span>
                  </div>
                  <div className="touchpoint-timeline">
                    {relatedOnPage.map((tp) => (
                      <div key={tp._id} className="touchpoint-item">
                        <div className="touchpoint-item-date">
                          {formatDate(tp.createdAt)}
                        </div>
                        <div className="touchpoint-item-tags">
                          {tp.utm_source && (
                            <span className="badge badge-attributed">{tp.utm_source}</span>
                          )}
                          {tp.utm_campaign && (
                            <span className="badge badge-direct">{tp.utm_campaign}</span>
                          )}
                          {tp.route && (
                            <span className="badge badge-direct">{tp.route}</span>
                          )}
                          {!tp.utm_source && !tp.utm_campaign && (
                            <span className="badge badge-direct">Direct / Organic</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
