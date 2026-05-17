export type OAuthConfig = {
  apiPublicUrl: string;
  webPublicUrl: string;
  google: { clientId: string; clientSecret: string; redirectUri: string } | null;
  twitter: { clientId: string; clientSecret: string; redirectUri: string } | null;
};

function trimUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function loadOAuthConfig(): OAuthConfig {
  const apiPublicUrl = trimUrl(
    process.env.API_PUBLIC_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      `http://127.0.0.1:${process.env.PORT ?? 4000}`,
  );
  const webPublicUrl = trimUrl(
    process.env.WEB_PUBLIC_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  );

  const googleId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const twitterId = process.env.TWITTER_CLIENT_ID?.trim();
  const twitterSecret = process.env.TWITTER_CLIENT_SECRET?.trim();

  return {
    apiPublicUrl,
    webPublicUrl,
    google:
      googleId && googleSecret
        ? {
            clientId: googleId,
            clientSecret: googleSecret,
            redirectUri:
              process.env.GOOGLE_REDIRECT_URI?.trim() ??
              `${apiPublicUrl}/api/login/google/callback`,
          }
        : null,
    twitter:
      twitterId && twitterSecret
        ? {
            clientId: twitterId,
            clientSecret: twitterSecret,
            redirectUri:
              process.env.TWITTER_REDIRECT_URI?.trim() ??
              `${apiPublicUrl}/api/login/twitter/callback`,
          }
        : null,
  };
}
