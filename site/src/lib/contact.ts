export type Channel = "whatsapp" | "email" | "instagram";

export interface ContactDetails {
  whatsapp?: string;
  email?: string;
  instagram?: string;
}

export const channelLabels: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  instagram: "Instagram",
};

/**
 * The link for one way to reach Amy, or undefined while that detail is missing,
 * so callers render a placeholder instead of a dead or invented link.
 */
export function contactHref(
  channel: Channel,
  details: ContactDetails,
  message?: string,
): string | undefined {
  switch (channel) {
    case "whatsapp": {
      if (!details.whatsapp) return undefined;
      const number = details.whatsapp.replace(/\D/g, "");
      const text = message ? `?text=${encodeURIComponent(message)}` : "";
      return `https://wa.me/${number}${text}`;
    }
    case "email": {
      if (!details.email) return undefined;
      const subject = message ? `?subject=${encodeURIComponent(message)}` : "";
      return `mailto:${details.email}${subject}`;
    }
    case "instagram": {
      if (!details.instagram) return undefined;
      return `https://www.instagram.com/${details.instagram.replace(/^@/, "")}/`;
    }
  }
}
