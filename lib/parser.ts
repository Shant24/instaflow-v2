/**
 * Instagram data-export shapes.
 *
 * `followers_1.json` — top-level array; `string_list_data[0].value` holds
 *   the username, `title` is an empty string.
 *   ```
 *   [
 *     {
 *       "title": "",
 *       "media_list_data": [],
 *       "string_list_data": [
 *         {
 *           "href": "https://www.instagram.com/eduarda.leite_",
 *           "value": "eduarda.leite_",
 *           "timestamp": 1774969969
 *         }
 *       ]
 *     }
 *   ]
 *   ```
 *
 * `following.json` — `{ relationships_following: [...] }`; the username is
 *   on the entry's top-level `title` field and `string_list_data[0]` only
 *   carries `href` + `timestamp`.
 *   ```
 *   {
 *     "relationships_following": [
 *       {
 *         "title": "androhack_offical_",
 *         "string_list_data": [
 *           { 
 *             "href": "https://www.instagram.com/_u/androhack_offical_",
 *             "value": "androhack_offical_",
 *             "timestamp": 1776964913 }
 *         ]
 *       }
 *     ]
 *   }
 *   ```
 */

export type IgStringListItem = {
  href?: string;
  value?: string;
  timestamp?: number;
};

export type IgEntry = {
  title?: string;
  media_list_data?: unknown[];
  string_list_data?: IgStringListItem[];
};

export type IgFollowersExport = IgEntry[];

export type IgFollowingExport = {
  relationships_following?: IgEntry[];
};

export type IgExport = IgFollowersExport | IgFollowingExport;

/**
 * Accepts either export shape and returns a deduped, lowercased username
 * list. Resolution order per entry:
 *   1. `string_list_data[0].value` (followers export)
 *   2. `title`                     (following export)
 *   3. Last path segment of `href` (robust fallback, strips `/_u/`)
 */
export function extractUsernames(raw: unknown): string[] {
  const entries = toEntries(raw);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of entries) {
    const username = pickUsername(entry);
    if (!username) continue;

    const normalized = username.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function toEntries(raw: unknown): IgEntry[] {
  if (Array.isArray(raw)) {
    return raw as IgEntry[];
  }
  if (raw && typeof raw === "object") {
    const wrapper = raw as IgFollowingExport;
    if (Array.isArray(wrapper.relationships_following)) {
      return wrapper.relationships_following;
    }
  }
  return [];
}

function pickUsername(entry: IgEntry): string | null {
  const firstListItem = entry.string_list_data?.[0];
  if (firstListItem && typeof firstListItem.value === "string" && firstListItem.value.trim()) {
    return firstListItem.value;
  }

  if (typeof entry.title === "string" && entry.title.trim()) {
    return entry.title;
  }

  if (firstListItem && typeof firstListItem.href === "string") {
    return usernameFromHref(firstListItem.href);
  }

  return null;
}

/**
 * Extracts a username from an Instagram profile URL. Handles both the
 * direct `instagram.com/<user>` form and the redirect `/_u/<user>` form.
 */
function usernameFromHref(href: string): string | null {
  const match = href.match(/instagram\.com\/(?:_u\/)?([^/?#]+)/i);
  if (!match) return null;
  const candidate = decodeURIComponent(match[1]);
  return candidate || null;
}
