let app: any = null;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = (await import('../apps/api/src/app.ts')).default;
  }
  app.handle(req, res);
}
