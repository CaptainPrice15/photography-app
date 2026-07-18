export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const hasPcloudCreds = Boolean(
      process.env.PCLOUD_EMAIL && process.env.PCLOUD_PASSWORD
    );
    const override =
      process.env.PHOTO_SOURCE ?? process.env.NEXT_PUBLIC_PHOTO_SOURCE;
    const usePcloud =
      override === "pcloud" || (override === undefined && hasPcloudCreds);

    if (usePcloud) {
      const { warmPcloudLogin } = await import("./lib/storage/pcloudSource");
      await warmPcloudLogin();
    }
  }
}
