<template>
  <v-footer
    class="d-flex align-center justify-center ga-2 flex-wrap flex-grow-1 py-3"
    color="surface-light"
  >
    <v-btn
      v-for="link in links"
      :key="link.name"
      :text="link.name"
      variant="text"
      rounded
      @click="handleLinkClick(link)"
    ></v-btn>

    <div
      class="flex-1-0-100 text-center mt-2 d-flex align-center justify-center"
    >
      <v-icon
        icon="mdi-copyright"
        size="x-small"
        class="mr-1"
        style="position: relative; top: -1px"
      ></v-icon>
      {{ new Date().getFullYear() }} — <strong>BodyBud</strong>
    </div>
  </v-footer>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const links = [
  { name: "Home", path: "/" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Terms of Service", path: "/terms-of-service" },
  { name: "Contact Us", email: "support@bodybud.app" },
  {
    name: "Download",
    link: "https://apps.apple.com/us/app/bodybud/id6742726101",
  },
  { name: "Follow Us", link: "https://www.instagram.com/bodybud.app/" },
];

const handleLinkClick = (link) => {
  if (link.path) {
    // For internal navigation
    router.push(link.path);
  } else if (link.email) {
    // For email links
    window.location.href = `mailto:${link.email}`;
  } else if (link.link) {
    // For external links
    window.open(link.link, "_blank");
  }
};
</script>
