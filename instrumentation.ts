export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const hasFilenCreds = Boolean(
      process.env.FILEN_EMAIL && process.env.FILEN_PASSWORD
    );
    const override =
      process.env.PHOTO_SOURCE ?? process.env.NEXT_PUBLIC_PHOTO_SOURCE;
    const useFilen =
      override === "filen" || (override === undefined && hasFilenCreds);

    if (useFilen) {
      const { warmFilenLogin } = await import("./lib/storage/filenSource");
      await warmFilenLogin();
    }
  }
}
