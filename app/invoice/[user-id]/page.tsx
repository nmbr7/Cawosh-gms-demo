'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Import the invoice store
// import { useInvoiceStore } from '@/store/invoice';
import { useBillingStore } from '@/store/billing';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

// Theme/colors remain the same
const colors = {
  bg: 'bg-white',
  white: 'bg-white',
  textMain: 'text-black',
  textSubtle: 'text-gray-500',
  border: 'border-gray-200',
  accent: 'text-black',
  badgePaid: 'bg-green-50 text-green-700 border border-green-400',
  badgeOverdue: 'bg-rose-50 text-rose-600 border border-rose-400',
  badgeUnpaid: 'bg-yellow-50 text-yellow-700 border border-yellow-400',
  faded: 'text-gray-400',
  card: 'bg-white shadow-sm',
  divider: 'border-gray-200',
};

function getInvoiceNumberFromPath(pathname: string): string | null {
  const parts = pathname.replace(/^\/|\/$/g, '').split('/');
  if (parts.length === 2 && parts[0] === 'invoice') {
    return parts[1];
  }
  return null;
}

function InvoiceStatusBadge({ status }: { status: string }) {
  if (status.toUpperCase() === 'PAID')
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs uppercase ${colors.badgePaid} tracking-wide transition`}
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 20 20">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 10l3 3 7-7"
          />
        </svg>
        Paid
      </span>
    );
  if (status.toUpperCase() === 'OVERDUE')
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs uppercase ${colors.badgeOverdue} tracking-wide transition`}
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M7 7l6 6m0-6l-6 6"
          />
        </svg>
        Overdue
      </span>
    );
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs uppercase ${colors.badgeUnpaid} tracking-wide transition`}
    >
      <svg width="13" height="13" fill="none" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 6v4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="10" cy="13" r="1" fill="currentColor" />
      </svg>
      Unpaid
    </span>
  );
}

function InvoiceAttachment({
  attachment,
}: {
  attachment: { name: string; url: string };
}) {
  return (
    <a
      href={attachment.url}
      className="inline-flex items-center gap-1 text-black hover:underline text-xs mt-1"
      download
    >
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 3v9.586m0 0l3.293-3.293M10 12.586l-3.293-3.293"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="4" y="17" width="12" height="2" rx="1" fill="currentColor" />
      </svg>
      {attachment.name}
    </a>
  );
}

const DEMO_OTP = '123456';

function OtpForm({ onSuccess }: { onSuccess: () => void }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSent(false);
    const timeout = setTimeout(() => setSent(true), 700);
    return () => clearTimeout(timeout);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp === DEMO_OTP) {
      setError('');
      onSuccess();
    } else {
      setError('Invalid code. Please check your inbox and try again.');
    }
  }

  return (
    <div className="min-h-[100vh] flex items-center justify-center bg-gray-50 px-2">
      <div className="bg-white shadow-md rounded-xl px-6 py-7 w-full max-w-xs sm:max-w-sm flex flex-col gap-4 items-center border border-gray-100">
        <h2 className="text-xl font-semibold text-black">
          Verify Your Identity
        </h2>
        <p className="text-gray-500 text-sm mb-2">
          Please enter the 6-digit code we sent to your email or phone to view
          your invoice.
        </p>
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="w-full flex flex-col gap-2"
        >
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            aria-label="One-time code"
            onChange={(e) => {
              setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
              setError('');
            }}
            disabled={!sent}
            className="w-full rounded-lg border border-gray-200 px-3 py-3 text-lg  text-center tracking-[0.5em] outline-none focus:border-black bg-gray-50 text-black transition placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
            placeholder="••••••"
          />
          <button
            type="submit"
            disabled={!sent || otp.length !== 6}
            className="w-full bg-black text-white py-2.5 rounded-lg font-bold text-base shadow hover:bg-gray-900 focus:ring-2 focus:ring-black focus:outline-none transition disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {sent ? 'Verify' : 'Sending...'}
          </button>
          {error && (
            <div className="w-full text-xs text-center text-rose-600 mt-1">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function FeedbackSectionNPS({ garageName }: { garageName: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [nps, setNps] = useState<number | null>(null);
  const [timeliness, setTimeliness] = useState<number | null>(null);
  const [workQuality, setWorkQuality] = useState<number | null>(null);
  const [value, setValue] = useState<number | null>(null);
  const [detailAnswer, setDetailAnswer] = useState('');
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [shareConsent, setShareConsent] = useState(false);
  const [additional, setAdditional] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    // Simulate a save to backend API (fake with timeout)
    // Construct feedback object
    // const feedback = {
    //   nps,
    //   timeliness,
    //   workQuality,
    //   value,
    //   detailAnswer,
    //   recommend,
    //   shareConsent,
    //   additional,
    //   garageName,
    //   submittedAt: new Date().toISOString(),
    // };

    // // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 800));
    // You could show a toast or set a "success" message here if desired
    // For now we do nothing (just .setSubmitted)
  }

  function renderFollowUp() {
    if (nps === null) return null;
    if (nps <= 6) {
      return (
        <div className="mb-3">
          <div className="font-semibold text-sm text-rose-600 mb-1">
            Sorry we didn’t meet your expectations.
          </div>
          <label
            className="block text-xs mb-0.5 text-black"
            htmlFor="nps-detail"
          >
            What went wrong?
          </label>
          <textarea
            id="nps-detail"
            className="w-full border border-gray-200 rounded-lg resize-none p-2 text-sm bg-gray-100 text-black"
            rows={2}
            value={detailAnswer}
            onChange={(e) => setDetailAnswer(e.target.value)}
            placeholder="Tell us what happened..."
          />
        </div>
      );
    }
    if (nps <= 8) {
      return (
        <div className="mb-3">
          <div className="font-semibold text-sm text-gray-500 mb-1">
            Thanks for the feedback.
          </div>
          <label
            className="block text-xs mb-0.5 text-black"
            htmlFor="nps-detail"
          >
            What could we do better next time?
          </label>
          <textarea
            id="nps-detail"
            className="w-full border border-gray-200 rounded-lg resize-none p-2 text-sm bg-gray-100 text-black"
            rows={2}
            value={detailAnswer}
            onChange={(e) => setDetailAnswer(e.target.value)}
            placeholder="Let us know how to improve…"
          />
        </div>
      );
    }
    return (
      <div className="mb-3">
        <div className="font-semibold text-sm text-green-600 mb-1">
          Great to hear that.
        </div>
        <div className="block text-xs mb-1 text-black">
          Would you recommend us to friends?
        </div>
        <div className="flex gap-3 mb-2">
          <button
            type="button"
            className={`px-4 py-1 rounded-md border text-xs font-medium transition
                ${
                  recommend === true
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 text-black bg-white hover:bg-black hover:text-white'
                }
              `}
            aria-pressed={recommend === true}
            onClick={() => setRecommend(true)}
          >
            Yes
          </button>
          <button
            type="button"
            className={`px-4 py-1 rounded-md border text-xs font-medium transition
                ${
                  recommend === false
                    ? 'bg-gray-200 text-black border-gray-300'
                    : 'border-gray-200 text-black bg-white hover:bg-black hover:text-white'
                }
              `}
            aria-pressed={recommend === false}
            onClick={() => setRecommend(false)}
          >
            No
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <section className="bg-gray-100 rounded-xl shadow border border-gray-200 px-4 sm:px-6 py-6 w-full flex flex-col items-center justify-center text-black">
        <div className="text-green-600 font-bold text-lg text-center mb-2">
          Thank you for your feedback!
        </div>
        <div className="text-sm text-gray-500 text-center">
          We appreciate your time helping us improve.
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 rounded-xl shadow border border-gray-100 px-4 sm:px-6 py-6 w-full text-black">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="font-semibold text-base mb-1">
            Rate your visit to <span className="font-bold">{garageName}</span>
          </div>
          <div className="text-gray-500 text-xs">
            Your feedback takes less than 20 seconds and helps us improve.
          </div>
        </div>
        <div className="mb-2">
          <label className="block mb-1 font-medium text-black text-sm">
            How likely are you to recommend{' '}
            <span className="font-semibold">{garageName}</span> to a friend or
            colleague?
          </label>
          <div className="text-xs text-gray-500 mb-2">
            (0 = Not likely, 10 = Extremely likely)
          </div>
          <div className="flex flex-wrap justify-between gap-1">
            {[...Array(11)].map((_, i) => (
              <button
                key={i}
                type="button"
                className={`rounded-full text-xs w-7 h-7 flex items-center justify-center border transition
                ${
                  nps === i
                    ? 'bg-black text-white font-bold border-black'
                    : 'bg-white text-black border-gray-200 hover:bg-black hover:text-white'
                }
                `}
                aria-pressed={nps === i}
                onClick={() => setNps(i)}
                tabIndex={0}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        {nps !== null && (
          <div className="mb-4 mt-5">
            <div className="mb-2 font-medium text-black text-sm">
              Rate each of the following:
            </div>
            <div className="mb-2">
              <div className="mb-0.5 text-xs text-gray-500">Timeliness</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={`timeliness-${num}`}
                    type="button"
                    onClick={() => setTimeliness(num)}
                    aria-pressed={timeliness === num}
                    className={`rounded-full w-7 h-7 text-xs flex items-center justify-center border transition
                      ${
                        timeliness === num
                          ? 'bg-black text-white font-bold border-black'
                          : 'bg-white text-black border-gray-200 hover:bg-black hover:text-white'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <div className="mb-0.5 text-xs text-gray-500">Work quality</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={`work-${num}`}
                    type="button"
                    onClick={() => setWorkQuality(num)}
                    aria-pressed={workQuality === num}
                    className={`rounded-full w-7 h-7 text-xs flex items-center justify-center border transition
                      ${
                        workQuality === num
                          ? 'bg-black text-white font-bold border-black'
                          : 'bg-white text-black border-gray-200 hover:bg-black hover:text-white'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-0.5 text-xs text-gray-500">
                Value for money
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={`value-${num}`}
                    type="button"
                    onClick={() => setValue(num)}
                    aria-pressed={value === num}
                    className={`rounded-full w-7 h-7 text-xs flex items-center justify-center border transition
                      ${
                        value === num
                          ? 'bg-black text-white font-bold border-black'
                          : 'bg-white text-black border-gray-200 hover:bg-black hover:text-white'
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {nps !== null && renderFollowUp()}

        {nps !== null && (
          <div className="mb-4">
            <label className="block text-xs mb-1 font-medium text-black">
              Can we share your feedback (first name and initial only) on our
              app and website?
            </label>
            <label className="inline-flex items-center mt-1 text-xs text-gray-500">
              <input
                type="checkbox"
                className="accent-black mr-2"
                checked={shareConsent}
                onChange={(e) => setShareConsent(e.target.checked)}
              />
              Yes, I agree
            </label>
          </div>
        )}

        {nps !== null && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-black mb-1">
              Anything you’d like to add?
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-lg resize-none p-2 text-sm bg-gray-100 text-black"
              rows={2}
              placeholder="Type your answer…"
              value={additional}
              onChange={(e) => setAdditional(e.target.value)}
              maxLength={300}
            />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={
              nps === null ||
              timeliness === null ||
              workQuality === null ||
              value === null ||
              (nps <= 8 && detailAnswer.trim().length === 0)
            }
            className="bg-black text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition"
          >
            Submit
          </button>
        </div>
      </form>
    </section>
  );
}

function SectionDivider() {
  return <div className={`my-5 border-t ${colors.divider} w-full`} />;
}

// Helper: clone main invoice node and restyle for PDF output
function generateInvoiceHTMLForPDF() {
  // Either clone rendered DOM or build an HTML string with inlined styling for PDF snapshot
  // We'll clone the relevant section by ID (set below)
  const el = document.getElementById('invoice-for-pdf');
  if (!el) {
    alert('Invoice preview not found. Please try again.');
    return null;
  }
  // Deep clone to avoid layout glitches
  const clone = el.cloneNode(true) as HTMLElement;
  // Optional: remove Download button in clone just in case
  const downloadBtn = clone.querySelector('.invoice-download-btn');
  downloadBtn?.parentNode?.removeChild(downloadBtn);

  // Remove focus indicators, hover states, etc.
  clone.querySelectorAll('[data-remove-pdf]').forEach((el) => el.remove());

  // You might want to adjust the width for PDF accuracy
  clone.style.maxWidth = '800px';
  clone.style.width = '800px';
  clone.style.background = '#fff';
  clone.style.color = '#111';

  return clone;
}

function InvoiceDownloadButton({ invoice }: { invoice: any }) {
  async function handleDownload() {
    // Render the PDF off a DOM snapshot of the invoice
    // Locate the main invoice block
    const div = generateInvoiceHTMLForPDF();
    if (!div) return;

    // Temporarily add to body (hidden) to layout for html2canvas-pro
    div.style.position = 'fixed';
    div.style.left = '-9999px';
    document.body.appendChild(div);

    // Wait a little for DOM updates (fonts etc.)
    await new Promise((res) => setTimeout(res, 80));

    // Use html2canvas-pro to generate image from DOM
    const canvas = await html2canvas(div, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff', // Use a simple, standard hex color instead of oklch
      windowWidth: 900,
    });

    document.body.removeChild(div);

    const imgData = canvas.toDataURL('image/png');
    // Set up jsPDF with A4 page at 300dpi equivalent
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    // Calculate image dimensions to fit A4, maintaining aspect ratio
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Canvas width and height
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calculate scaled height for A4 width
    const ratio = Math.min(pdfWidth / imgWidth, 1);
    const renderWidth = imgWidth * ratio;
    const renderHeight = imgHeight * ratio;

    // Vertically center if needed
    const y = Math.max(32, (pdfHeight - renderHeight) / 2);

    pdf.addImage(imgData, 'PNG', 0, y, renderWidth, renderHeight);
    pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  }

  return (
    <button
      onClick={handleDownload}
      className="invoice-download-btn inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white shadow hover:bg-gray-900 font-bold text-xs tracking-wider transition border border-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
      title="Download invoice"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 20 20"
      >
        <path
          d="M10 3v9.586m0 0l3.293-3.293M10 12.586l-3.293-3.293"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="4" y="17" width="12" height="2" rx="1" fill="currentColor" />
      </svg>
      Download
    </button>
  );
}

export default function InvoicePage() {
  const pathname = usePathname();
  const invoiceNumber = getInvoiceNumberFromPath(pathname);

  // Access invoices from the store with Zustand.
  const { invoices } = useBillingStore();

  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(!!invoiceNumber);
  const [otpVerified, setOtpVerified] = useState(false);

  // Find invoice by invoiceNumber - fetch API option is commented below
  useEffect(() => {
    if (invoiceNumber && otpVerified) {
      setLoading(true);

      // === Call API to verify OTP and fetch invoice directly from backend ===
      // (Uncomment and adapt as needed)
      /*
      fetch(`/api/invoice-verify?invoiceNumber=${invoiceNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      })
        .then(res => res.json())
        .then(data => {
          setInvoice(data.invoice);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      */

      // Local fallback: use Zustand store (current approach)
      const inv = invoices.find(
        (inv: any) =>
          inv.invoiceNumber?.toLowerCase() === invoiceNumber.toLowerCase(),
      );
      setTimeout(() => {
        setInvoice(inv || null);
        setLoading(false);
      }, 300);
    }
  }, [invoiceNumber, otpVerified, invoices /*, otp */]);

  if (!invoiceNumber) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center px-2 bg-white">
        <div className="bg-gray-100 px-6 sm:px-8 py-10 rounded-2xl border border-gray-200 shadow w-full max-w-sm text-center">
          <div className="mb-4 font-bold text-2xl text-black">Invoice</div>
          <div className="text-gray-500 mb-2">No invoice selected.</div>
          <div className="text-xs text-gray-400">
            Go to{' '}
            <span className="font-mono text-black">
              /invoice/[invoiceNumber]
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!otpVerified) {
    return <OtpForm onSuccess={() => setOtpVerified(true)} />;
  }

  // No loader
  if (loading) {
    return null;
  }

  if (!invoice) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center px-2 bg-white">
        <div className="bg-gray-100 px-6 sm:px-8 py-10 rounded-2xl border border-gray-200 shadow w-full max-w-sm text-center">
          <div className="mb-4 font-bold text-2xl text-black">Invoice</div>
          <div className="text-gray-500 mb-2">
            No invoice found for number{' '}
            <span className="font-mono text-black">{invoiceNumber}</span>
          </div>
        </div>
      </div>
    );
  }

  // ---- MODERN WHITE INVOICE PAGE ----
  return (
    <div
      className={`min-h-screen ${colors.bg} py-8 sm:py-14 w-full flex flex-col items-center`}
    >
      <main className="w-full max-w-3xl md:max-w-5xl flex flex-col md:flex-row md:gap-8 items-start px-2 sm:px-6">
        {/* Invoice Left */}
        <section
          id="invoice-for-pdf"
          className={`relative ${colors.card} rounded-2xl border ${colors.border} p-6 sm:p-10 mb-7 flex-1 w-full max-w-3xl transition`}
        >
          {/* Download Button */}
          <div
            className="absolute top-5 right-6 print:hidden z-10"
            data-remove-pdf
          >
            <InvoiceDownloadButton invoice={invoice} />
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-end">
            <div className="w-full">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="font-bold text-2xl sm:text-3xl text-black tracking-tight flex items-center">
                  Invoice{' '}
                  <span className="ml-2 font-mono text-base sm:text-lg text-gray-500">
                    #{invoice.invoiceNumber}
                  </span>
                </span>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <div className="flex flex-wrap flex-col sm:flex-row gap-x-8 gap-y-1 text-gray-500">
                <span className="text-xs sm:text-sm whitespace-nowrap">
                  <span className="font-semibold text-black">Created:</span>{' '}
                  <span className="font-mono text-black">
                    {invoice.issuedDate
                      ? new Date(invoice.issuedDate).toLocaleDateString()
                      : ''}
                  </span>
                </span>
                <span className="text-xs sm:text-sm whitespace-nowrap">
                  <span className="font-semibold text-black">Due:</span>{' '}
                  <span className="font-mono text-gray-900">
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : ''}
                  </span>
                </span>
              </div>
            </div>
            <div className="pt-2 md:pt-0 flex flex-col gap-0.5 items-start md:items-end w-full md:w-fit text-sm text-black">
              <span className="font-bold">{invoice.garageName ?? ''}</span>
              {invoice.garageAddress && (
                <span className="text-gray-500">{invoice.garageAddress}</span>
              )}
              {invoice.garagePhone && (
                <span className="text-gray-500">{invoice.garagePhone}</span>
              )}
            </div>
          </div>

          <SectionDivider />

          {/* Details */}
          <div className="flex flex-col md:flex-row md:justify-between mb-8 mt-1 gap-y-3">
            <div>
              <div className="font-bold text-lg text-black mb-1">
                {invoice.customer?.name ?? ''}
              </div>
              <div className="text-gray-500 text-sm font-mono">
                {invoice.vehicle?.make && (
                  <span>
                    {invoice.vehicle.make} {invoice.vehicle.model}{' '}
                    <span className="inline-block px-2 ml-1 rounded bg-gray-100 text-black font-mono">
                      {invoice.vehicle.license}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 items-start md:items-end mt-2 md:mt-0 text-sm">
              <span>
                <span className="font-medium text-gray-600">Phone:</span>{' '}
                <span className="text-black font-mono">
                  {invoice.customer?.phone ?? ''}
                </span>
              </span>
              <span>
                <span className="font-medium text-gray-600">Email:</span>{' '}
                <span className="text-black font-mono">
                  {invoice.customer?.email ?? ''}
                </span>
              </span>
            </div>
          </div>

          <SectionDivider />

          {/* Items Table or Cards (responsive display) */}
          <div className="block sm:hidden">
            {(invoice.services ?? []).map((item: any, idx: number) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 my-2 p-4 text-sm bg-gray-50 text-black"
              >
                <div className="font-semibold text-black mb-2 tracking-tight">
                  {item.name ?? item.description}
                </div>
                <div className="flex flex-wrap justify-between gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Qty: </span>
                    <span className="font-mono font-semibold text-black">
                      {/* Assuming always 1 as per MB invoice shape */}1
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price: </span>
                    <span className="font-mono font-semibold text-black">
                      £{item.price?.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Line: </span>
                    <span className="font-mono font-semibold text-black">
                      £{item.price?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="w-full mb-4 border-collapse text-black hidden sm:table">
            <thead>
              <tr className="text-xs font-bold uppercase border-b border-gray-200 bg-white text-black">
                <th className="py-2 text-left font-bold">Description</th>
                <th className="w-12 py-2 text-center font-bold">Qty</th>
                <th className="w-20 py-2 text-right font-bold">Price</th>
                <th className="w-24 py-2 text-right font-bold">Line</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.services ?? []).map((item: any, idx: number) => (
                <tr
                  key={idx}
                  className="border-b last:border-b-0 border-gray-100 bg-white transition hover:bg-gray-50"
                >
                  <td className="py-2 pr-2 font-semibold text-black">
                    {item.name ?? item.description}
                  </td>
                  <td className="text-center font-mono text-xs text-black">
                    1
                  </td>
                  <td className="text-right font-mono text-black">
                    £{item.price?.toFixed(2)}
                  </td>
                  <td className="text-right font-mono text-base font-bold text-black">
                    £{item.price?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex flex-wrap gap-2 justify-end items-center text-xs mt-2 mb-6">
            <span className="bg-gray-100 rounded-full px-3 py-2 text-black shadow font-medium">
              <span className="text-gray-500">Subtotal</span>{' '}
              <span className="font-mono font-bold text-black">
                £
                {typeof invoice.subtotal === 'number'
                  ? invoice.subtotal.toFixed(2)
                  : '0.00'}
              </span>
            </span>
            <span className="bg-gray-100 rounded-full px-3 py-2 text-black shadow font-medium">
              <span className="text-gray-500">VAT</span>{' '}
              <span className="font-mono font-bold text-black">
                £
                {typeof invoice.vat === 'number'
                  ? invoice.vat.toFixed(2)
                  : '0.00'}
              </span>
            </span>
            <span className="ml-0 sm:ml-4 bg-black text-white px-5 py-2 rounded-full text-base font-mono font-bold shadow-sm tracking-widest">
              £
              {typeof invoice.totalAmount === 'number'
                ? invoice.totalAmount.toFixed(2)
                : '0.00'}
            </span>
          </div>

          <SectionDivider />

          {/* Payment status, notes & attachments */}
          <div className="flex flex-col md:flex-row md:justify-between gap-8 mt-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <InvoiceStatusBadge status={invoice.status} />
                {invoice.status?.toUpperCase() !== 'PAID' && (
                  <span className="text-xs text-black font-semibold opacity-80">
                    Pay on collection please.
                  </span>
                )}
              </div>
              {invoice.notes && (
                <div className="bg-gray-50 mt-2 p-4 rounded-lg border border-gray-200 text-black text-xs whitespace-pre-line tracking-wide">
                  {invoice.notes}
                </div>
              )}
            </div>
            <div>
              {invoice.attachments && invoice.attachments.length > 0 && (
                <div className="mt-2 md:mt-0">
                  <span className="text-xs font-bold text-black">
                    Attachments:
                  </span>
                  <div>
                    {invoice.attachments.map((att: any, idx: number) => (
                      <InvoiceAttachment key={idx} attachment={att} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* Feedback/Rating right section */}
        <aside className="w-full md:w-[370px] md:ml-6 flex-shrink-0 transition">
          <FeedbackSectionNPS garageName={invoice.garageName ?? ''} />
        </aside>
      </main>
    </div>
  );
}
