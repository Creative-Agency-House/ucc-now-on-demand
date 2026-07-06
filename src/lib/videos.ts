import featurePower from "@/assets/feature-power-time.jpg";
import featurePraise from "@/assets/feature-million-praise.jpg";
import featureYouth from "@/assets/feature-youth.jpg";

export type Video = {
  id: string;
  title: string;
  speaker: string;
  img: string;
  duration: string;
  description: string;
  category: string;
  tab: "Apostle Emr" | "Series" | "Watch Now";
  videoUrl: string;
};

export const VIDEOS: Video[] = [
  { id: "power-time", title: "It's Power Time", speaker: "Apostle Dr. Emmanuel Osei-Acheampong", img: featurePower, duration: "42:18", category: "Inspirational", tab: "Apostle Emr", description: "A powerful sermon on walking in divine authority and stepping into your season of breakthrough.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: "million-praise", title: "A Million Praise", speaker: "UCC Worship", img: featurePraise, duration: "1:12:04", category: "Workshops", tab: "Series", description: "An evening of worship gathering thousands of voices lifted in praise.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: "jesus-ministry", title: "The Jesus Ministry", speaker: "Apostle Dr. Emmanuel Osei-Acheampong", img: featureYouth, duration: "55:32", category: "The Apostle's Doctrine 101", tab: "Series", description: "Understanding the ministry of Jesus and how it applies to believers today.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { id: "your-time", title: "It's Your Time", speaker: "Apostle Dr. Emmanuel Osei-Acheampong", img: featurePower, duration: "38:47", category: "Inspirational", tab: "Apostle Emr", description: "God has appointed this season for your elevation. Receive the word.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
  { id: "praise-night", title: "Praise Night Live", speaker: "UCC Worship", img: featurePraise, duration: "1:48:11", category: "Podcast", tab: "Watch Now", description: "Live recording of a Friday praise night service.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
  { id: "youth-rising", title: "Youth Rising", speaker: "UCC Youth", img: featureYouth, duration: "29:05", category: "Inspirational", tab: "Watch Now", description: "A message to the next generation of believers.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
];

export const CATEGORIES = [
  "Podcast",
  "Inspirational",
  "Workshops",
  "The Apostle's Doctrine 101",
  "About UCC Now",
] as const;

export function getVideo(id: string) {
  return VIDEOS.find((v) => v.id === id);
}

export function videosByCategory(category: string) {
  return VIDEOS.filter((v) => v.category === category);
}

export function videosByTab(tab: string) {
  return VIDEOS.filter((v) => v.tab === tab);
}