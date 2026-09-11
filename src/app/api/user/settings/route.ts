import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isValidTimeZone } from "@/lib/dates";
import { parseJson, unauthorized } from "@/lib/server/api";
import { getSettings, getCurrentUserId } from "@/lib/server/user";
import { DAILY_GOAL_MAX, DAILY_GOAL_MIN } from "@/lib/constants";

const settingsSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    dailyGoal: z.number().int().min(DAILY_GOAL_MIN).max(DAILY_GOAL_MAX),
    reminderEnabled: z.boolean(),
    reminderTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
    theme: z.enum(["light", "dark", "system"]),
    timezone: z.string().refine(isValidTimeZone, "Invalid time zone"),
    rankingOptIn: z.boolean(),
  })
  .partial();

function serialize(settings: Awaited<ReturnType<typeof getSettings>>, name: string | null) {
  return {
    name,
    dailyGoal: settings.dailyGoal,
    reminderEnabled: settings.reminderEnabled,
    reminderTime: settings.reminderTime,
    theme: settings.theme,
    timezone: settings.timezone,
    rankingOptIn: settings.rankingOptIn,
  };
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const [settings, user] = await Promise.all([
    getSettings(userId),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } }),
  ]);
  return NextResponse.json(serialize(settings, user.name));
}

export async function PUT(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const parsed = await parseJson(request, settingsSchema);
  if ("response" in parsed) return parsed.response;
  const { name, ...settingsData } = parsed.data;

  const [settings, user] = await prisma.$transaction([
    prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...settingsData },
      update: settingsData,
    }),
    prisma.user.update({ where: { id: userId }, data: name ? { name } : {}, select: { name: true } }),
  ]);
  return NextResponse.json(serialize(settings, user.name));
}
