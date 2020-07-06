/*
 * Utility function to inject CSS for print style
 */
import { loadCSSFromString } from "@airtable/blocks/ui";
export const HIDE_CLASS = "printHide";

export default function printInvoice(invoice, onClose) {
  let invoicePrintStyle;
  if (invoice) {
    // Shows Invoice
    invoicePrintStyle = loadCSSFromString(`
    @media print {
        .list {
          display: none !important;
        }
        .invoice {
          display: block !important;
        }
    }
    `);
  }

  const printStyle = loadCSSFromString(`
    @media print {
      .${HIDE_CLASS} {
          display: none !important;
      }
      .list {
          margin-top: 0 !important;
      }
    }
    `);
  window.print();
  printStyle.remove();
  if (onClose) {
    onClose;
  }
  if (invoicePrintStyle) {
    invoicePrintStyle.remove();
  }
}
