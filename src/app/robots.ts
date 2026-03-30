import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/api/",
        "/docs/",
        "/builder/",
      ],
    },
    // Replace with your actual domain when deploying
    sitemap: "https://mdocs.example.com/sitemap.xml",
  };
}
