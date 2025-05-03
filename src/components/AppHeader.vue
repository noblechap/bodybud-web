<template>
  <v-app-bar app color="black" dark>
    <v-toolbar-title>BodyBud</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn
      v-for="link in links"
      :key="link.name"
      :text="link.name"
      variant="text"
      @click="handleLinkClick(link)"
    ></v-btn>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const links = [
  { name: "Home", path: "/" },
  { name: "Coaching", path: "/coaching" },
  {
    name: "Download",
    link: "https://apps.apple.com/us/app/bodybud/id6742726101",
  },
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
