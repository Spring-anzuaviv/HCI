export type CompletionTiming = {
  finishAt: Date | null;
  timeLeft: number | null;
  completionDue: boolean;
};

export function calculateCompletionTiming(
  processingMinutes: number,
  actualStartedAt: Date | null | undefined,
  now = new Date(),
): CompletionTiming {
  if (
    !actualStartedAt ||
    Number.isNaN(actualStartedAt.getTime()) ||
    !Number.isFinite(processingMinutes) ||
    processingMinutes <= 0
  ) {
    return { finishAt: null, timeLeft: null, completionDue: false };
  }

  const finishAt = new Date(
    actualStartedAt.getTime() + processingMinutes * 60_000,
  );
  const remainingMilliseconds = finishAt.getTime() - now.getTime();

  return {
    finishAt,
    timeLeft: Math.max(0, Math.ceil(remainingMilliseconds / 60_000)),
    completionDue: remainingMilliseconds <= 0,
  };
}

export function expectedOrderStatusForRunningStage(stage: string) {
  return (
    {
      SORTING: "RECEIVED",
      WASH: "WASHING",
      TRANSFER: "WAITING",
      DRY: "DRYING",
      PACKING: "FOLDING_PACKING",
    } as Record<string, string>
  )[stage] ?? null;
}

export function nextOrderStatusAfterStage(
  stage: string,
  serviceType: string,
) {
  if (stage === "PACKING") return "READY";
  if (stage === "SORTING" || stage === "TRANSFER") return "WAITING";
  if (stage === "WASH" && serviceType === "WASH_DRY") return "WAITING";
  if (stage === "WASH" || stage === "DRY") return "FOLDING_PACKING";
  return null;
}

export function canReleaseMachine(status: string) {
  return !["BROKEN", "INACTIVE"].includes(status);
}
