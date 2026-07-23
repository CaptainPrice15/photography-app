import { Router } from "express";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Message should be at least 10 characters."),
});

interface ContactState {
  status: "idle" | "success" | "error";
  message: string;
}

const router = Router();

router.post("/contact", async (req, res) => {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      message: parsed.error.issues[0].message,
    } as ContactState);
  }

  console.log("Contact submission:", parsed.data);

  res.json({
    status: "success",
    message: "Thanks! Your message has been received.",
  } as ContactState);
});

export { router as contactRouter };