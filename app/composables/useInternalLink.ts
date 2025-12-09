import type { Link } from "~/types/link";

export function useInternalLink() {
  function getHref(link: Link) {
    return link.email ? `mailto:${link.email}` : link.link;
  }

  function getTarget(link: Link) {
    return link.link ? "_blank" : undefined;
  }

  function getRel(link: Link) {
    return link.link ? "noopener noreferrer" : undefined;
  }

  return {
    getHref,
    getTarget,
    getRel,
  };
}
