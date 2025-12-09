<script setup lang="ts">
import type { Link } from "~/types/link";

const links: Link[] = [
  { name: "Home", path: "/" },
  { name: "Coaching", path: "/login" },
  {
    name: "Download",
    link: "https://apps.apple.com/us/app/bodybud/id6742726101",
  },
];

const { getHref, getTarget, getRel } = useInternalLink();
</script>

<template>
  <v-app-bar app color="black" dark>
    <v-toolbar-title>BodyBud</v-toolbar-title>
    <v-spacer />
    <v-btn
      v-for="link in links"
      :key="link.name"
      :text="link.name"
      variant="text"
      :to="link.path"
      :href="getHref(link)"
      :target="getTarget(link)"
      :rel="getRel(link)"
      :active="false"
    />
  </v-app-bar>
</template>
