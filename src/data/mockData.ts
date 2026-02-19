import type { AppData, Video } from "../types/video";

const youtubeIds: string[] = [
  "dGcsHMXbSOA",
  "bMknfKXIFA8",
  "Oe421EPjeBE",
  "0-S5a0eXPoc",
  "2ePf9rue1Ao",
  "TX9qSaGXFyg",
  "LXb3EKWsInQ",
  "fq4N0hgOWzU",
  "PkZNo7MFNFg",
  "jS4aFq5-91M",
  "UB1O30fR-EE",
  "QFaFIcGhPoM",
  "9He4UBLyk8Y",
  "8hly31xKli0",
  "TlB_eWDSMt4",
  "f02mOEt11OQ",
  "7CqJlxBYj-M",
  "kqtD5dpn9C8",
  "zOjov-2OZ0E",
  "rfscVS0vtbw",
  "sBws8MSXN7A",
  "XqZsoesa55w",
  "CevxZvSJLk8",
  "60ItHLz5WEA",
  "RgKAFK5djSk",
  "OPf0YbXqDm0",
  "ktvTqknDobU",
  "uelHwf8o7_U",
  "e-ORhEE9VVg",
  "VbfpW0pbvaU",
  "fRh_vgS2dFE",
  "hT_nvWreIhg",
  "3tmd-ClpJxA",
  "09R8_2nJtjg",
  "YqeW9_5kURI",
  "pRpeEdMmmQ0",
  "9bZkp7q19f0",
  "kJQP7kiw5Fk",
  "dQw4w9WgXcQ",
  "L_jWHffIx5E",
  "Zi_XLOBDo_Y",
  "04854XqcfCY",
  "3JZ_D3ELwOQ",
  "UceaB4D0jpo",
  "YQHsXMglC9A",
  "C0DPdy98e4c",
  "kXYiU_JCYtU",
  "eY52Zsg-KVI",
  "JGwWNGJdvx8",
  "fJ9rUzIMcZQ",
  "pXRviuL6vMY",
  "SlPhMPnQ58k",
  "3AtDnEC4zak",
  "Ukg_U3CnJWI",
  "lWA2pjMjpBs",
];

const createVideos = (
  categoryName: string,
  startIndex: number
): Video[] => {
  return youtubeIds.slice(startIndex, startIndex + 20).map((id, index) => {
    return {
      title: `${categoryName} Video ${index + 1}`,
      mediaUrl: `https://www.youtube.com/embed/${id}`,
      mediaType: "YOUTUBE", // ✅ Correct literal type
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      slug: id,
      duration: `${Math.floor(Math.random() * 15) + 5}:${Math.floor(
        Math.random() * 60
      )
        .toString()
        .padStart(2, "0")}`,
      views: `${Math.floor(Math.random() * 900 + 100)}K views`,
      uploadedAt: `${Math.floor(Math.random() * 10) + 1} days ago`,
      channelName: "TechWorld",
      channelAvatar: `https://i.pravatar.cc/150?img=${index + 1}`,
    };
  });
};

export const mockData: AppData = {
  categories: [
    {
      category: {
        slug: "web-development",
        name: "Web Development",
        iconUrl:
          "https://cdn-icons-png.flaticon.com/512/2721/2721297.png",
      },
      contents: createVideos("Web Development", 0),
    },
    {
      category: {
        slug: "ai-tools",
        name: "AI Tools",
        iconUrl:
          "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
      },
      contents: createVideos("AI Tools", 20),
    },
    {
      category: {
        slug: "mobile-development",
        name: "Mobile Development",
        iconUrl:
          "https://cdn-icons-png.flaticon.com/512/888/888879.png",
      },
      contents: createVideos("Mobile Development", 40),
    },
  ],
};
