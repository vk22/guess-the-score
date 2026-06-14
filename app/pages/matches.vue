<script setup lang="ts">
useSeoMeta({ title: "Матчи — Guess the Score" });

const { loggedIn, user } = useUserSession();
type MatchTab = "past" | "future" | "live";

const selectedTab = ref<MatchTab>("future");
const from = new Date("2026-06-11T00:00:00.000Z");
const to = new Date("2026-07-20T23:59:59.999Z");

const {
  data: matches,
  status,
  error,
  refresh,
} = await useFetch("/api/matches", {
  query: {
    from: from.toISOString(),
    to: to.toISOString(),
  },
});

const predictions = reactive<
  Record<
    string,
    {
      homeScore: number | null;
      awayScore: number | null;
    }
  >
>({});
const savingId = ref<string | null>(null);
const message = ref("");

watchEffect(() => {
  for (const match of matches.value ?? []) {
    predictions[match.id] ??= {
      homeScore: match.prediction?.homeScore ?? null,
      awayScore: match.prediction?.awayScore ?? null,
    };
  }
});

const groupedMatches = computed(() => {
  const filteredMatches = filterMatches(matches.value ?? [], selectedTab.value);
  const groups = new Map<string, NonNullable<typeof matches.value>>();

  for (const match of filteredMatches) {
    const key = match.startsAt.slice(0, 10);
    const group = groups.get(key) ?? [];
    group.push(match);
    groups.set(key, group);
  }

  return Array.from(groups.entries());
});

const tabCounts = computed(() => {
  const allMatches = matches.value ?? [];

  return {
    past: filterMatches(allMatches, "past").length,
    future: filterMatches(allMatches, "future").length,
    live: filterMatches(allMatches, "live").length,
  };
});

function filterMatches(list: NonNullable<typeof matches.value>, tab: MatchTab) {
  return list.filter((match) => {
    if (tab === "live") {
      return match.status === "LIVE";
    }

    if (tab === "future") {
      return match.status === "SCHEDULED" || match.status === "POSTPONED";
    }

    return match.status === "FINISHED";
  });
}

function tabLabel(tab: MatchTab) {
  switch (tab) {
    case "future":
      return "Будущие";
    case "live":
      return "Live";
    case "past":
      return "Прошедшие";
  }
}

async function savePrediction(matchId: string) {
  const prediction = predictions[matchId];

  if (
    !prediction ||
    !Number.isInteger(prediction.homeScore) ||
    !Number.isInteger(prediction.awayScore)
  ) {
    message.value = "Укажите счет обеих команд";
    return;
  }

  savingId.value = matchId;
  message.value = "";

  try {
    await $fetch(`/api/matches/${matchId}/prediction`, {
      method: "PUT",
      body: prediction,
    });
    message.value = "Прогноз сохранен";
    await refresh();
  } catch {
    message.value = "Не удалось сохранить прогноз";
  } finally {
    savingId.value = null;
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Chisinau",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Chisinau",
  }).format(new Date(date));
}

function pointsLabel(points: number) {
  if (points === 1) {
    return "1 очко";
  }

  if (points >= 2 && points <= 4) {
    return `${points} очка`;
  }

  return `${points} очков`;
}

function scoreLabel(score: number | null) {
  return score === null ? "—" : String(score);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function projectedPoints(
  prediction: { homeScore: number; awayScore: number },
  result: { homeScore: number | null; awayScore: number | null },
) {
  if (result.homeScore === null || result.awayScore === null) {
    return 0;
  }

  if (
    prediction.homeScore === result.homeScore
    && prediction.awayScore === result.awayScore
  ) {
    return 3;
  }

  const predictedOutcome = Math.sign(prediction.homeScore - prediction.awayScore);
  const actualOutcome = Math.sign(result.homeScore - result.awayScore);

  return predictedOutcome === actualOutcome ? 1 : 0;
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-14">
    <p class="text-sm font-semibold uppercase tracking-widest text-emerald-400">
      Календарь
    </p>
    <h1 class="mt-3 text-4xl font-black">Матчи ЧМ-2026</h1>
    <p class="mt-3 text-slate-400">
      Время показано по Кишиневу. Прогноз можно изменить до начала матча.
      Сохраненные прогнозы видны всем участникам.
    </p>

    <div
      class="mt-8 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1"
    >
      <button
        v-for="tab in ['future', 'live', 'past'] as const"
        :key="tab"
        type="button"
        class="rounded-xl px-5 py-2 text-sm font-semibold transition"
        :class="
          selectedTab === tab
            ? 'bg-emerald-400 text-slate-950'
            : 'text-slate-300 hover:bg-white/5'
        "
        @click="selectedTab = tab"
      >
        {{ tabLabel(tab) }}
        <span class="ml-1 text-xs opacity-70">
          {{ tabCounts[tab] }}
        </span>
      </button>
    </div>

    <p
      v-if="message"
      class="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
    >
      {{ message }}
    </p>

    <div v-if="status === 'pending'" class="mt-10 text-slate-400">
      Загружаем календарь...
    </div>

    <div
      v-else-if="error"
      class="mt-10 rounded-2xl border border-red-400/30 bg-red-400/10 p-8 text-red-200"
    >
      Не удалось загрузить матчи.
    </div>

    <div
      v-else-if="!groupedMatches.length"
      class="mt-10 rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400"
    >
      <span v-if="selectedTab === 'past'"
        >В прошедших матчах пока ничего нет.</span
      >
      <span v-else-if="selectedTab === 'future'"
        >В будущих матчах пока ничего нет.</span
      >
      <span v-else>Сейчас нет live-матчей.</span>
    </div>

    <div v-else class="mt-10 space-y-10">
      <section v-for="[date, dateMatches] in groupedMatches" :key="date">
        <h2 class="mb-4 text-xl font-bold capitalize">
          {{ formatDate(date) }}
        </h2>

        <div class="space-y-3">
          <article
            v-for="match in dateMatches"
            :key="match.id"
            class="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div class="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div class="w-40 shrink-0">
                <p
                  class="text-xs font-semibold uppercase tracking-wider text-emerald-400"
                >
                  {{ match.competition.name }}
                </p>
                <p class="mt-1 text-sm text-slate-400">
                  {{ formatTime(match.startsAt) }}
                </p>
              </div>

              <div
                class="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-4"
              >
                <div
                  class="flex items-center justify-end gap-3 text-right font-semibold"
                >
                  <span>{{ match.homeTeam.name }}</span>
                  <img
                    v-if="match.homeTeam.logoUrl"
                    :src="match.homeTeam.logoUrl"
                    :alt="match.homeTeam.name"
                    class="h-8 w-8 object-contain"
                  />
                </div>
                <span class="text-slate-500">—</span>
                <div class="flex items-center gap-3 font-semibold">
                  <img
                    v-if="match.awayTeam.logoUrl"
                    :src="match.awayTeam.logoUrl"
                    :alt="match.awayTeam.name"
                    class="h-8 w-8 object-contain"
                  />
                  <span>{{ match.awayTeam.name }}</span>
                </div>
              </div>

              <form
                v-if="loggedIn && match.status === 'SCHEDULED'"
                class="flex shrink-0 items-center gap-2"
                @submit.prevent="savePrediction(match.id)"
              >
                <input
                  v-model.number="predictions[match.id]!.homeScore"
                  type="number"
                  min="0"
                  max="99"
                  aria-label="Голы хозяев"
                  class="h-10 w-14 rounded-lg border border-white/15 bg-slate-900 text-center outline-none focus:border-emerald-400"
                />
                <span>:</span>
                <input
                  v-model.number="predictions[match.id]!.awayScore"
                  type="number"
                  min="0"
                  max="99"
                  aria-label="Голы гостей"
                  class="h-10 w-14 rounded-lg border border-white/15 bg-slate-900 text-center outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  :disabled="savingId === match.id"
                  class="ml-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-60"
                >
                  {{ match.prediction ? "Изменить" : "Сохранить" }}
                </button>
              </form>

              <NuxtLink
                v-else-if="!loggedIn && match.status === 'SCHEDULED'"
                to="/login?redirect=/matches"
                class="shrink-0 text-sm font-semibold text-emerald-400"
              >
                Войти для прогноза
              </NuxtLink>

              <div
                v-else-if="match.status === 'LIVE'"
                class="w-full shrink-0 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-4 lg:w-72"
              >
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold uppercase tracking-wider text-amber-200">
                    Live
                  </span>
                  <strong class="text-xl">
                    {{ scoreLabel(match.homeScore) }} : {{ scoreLabel(match.awayScore) }}
                  </strong>
                </div>

                <p
                  v-if="match.homeScore === null || match.awayScore === null"
                  class="mt-2 text-xs text-amber-100/80"
                >
                  Счёт live от провайдера не поступает
                </p>

                <div
                  v-if="loggedIn && match.prediction"
                  class="mt-3 flex items-center justify-between gap-4 border-t border-amber-200/20 pt-3"
                >
                  <div>
                    <p class="text-sm text-slate-300">Ваш прогноз</p>
                    <strong class="text-lg">
                      {{ match.prediction.homeScore }} : {{ match.prediction.awayScore }}
                    </strong>
                  </div>
                  <span
                    class="rounded-full px-3 py-1 text-sm font-bold"
                    :class="{
                      'bg-emerald-400/15 text-emerald-300': projectedPoints(
                        { homeScore: match.prediction.homeScore, awayScore: match.prediction.awayScore },
                        { homeScore: match.homeScore, awayScore: match.awayScore },
                      ) === 3,
                      'bg-amber-300/15 text-amber-200': projectedPoints(
                        { homeScore: match.prediction.homeScore, awayScore: match.prediction.awayScore },
                        { homeScore: match.homeScore, awayScore: match.awayScore },
                      ) === 1,
                      'bg-slate-700 text-slate-300': projectedPoints(
                        { homeScore: match.prediction.homeScore, awayScore: match.prediction.awayScore },
                        { homeScore: match.homeScore, awayScore: match.awayScore },
                      ) === 0,
                    }"
                  >
                    +{{ pointsLabel(projectedPoints(
                      { homeScore: match.prediction.homeScore, awayScore: match.prediction.awayScore },
                      { homeScore: match.homeScore, awayScore: match.awayScore },
                    )) }}
                  </span>
                </div>

                <p
                  v-else-if="loggedIn"
                  class="mt-3 border-t border-amber-200/20 pt-3 text-sm text-slate-300"
                >
                  Прогноз не сделан
                </p>
              </div>

              <div
                v-else-if="match.status === 'FINISHED'"
                class="w-full shrink-0 rounded-xl border border-white/10 bg-slate-950/30 px-4 py-4 lg:w-80"
              >
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Результат
                  </span>
                  <strong class="text-xl">
                    {{ scoreLabel(match.homeScore) }} : {{ scoreLabel(match.awayScore) }}
                  </strong>
                </div>

                <div
                  v-if="loggedIn && match.prediction"
                  class="mt-3 flex items-center justify-between gap-4 border-t border-white/10 pt-3"
                >
                  <div>
                    <p class="text-sm text-slate-400">Ваш прогноз</p>
                    <strong class="text-lg">
                      {{ match.prediction.homeScore }} : {{ match.prediction.awayScore }}
                    </strong>
                  </div>
                  <span
                    class="rounded-full px-3 py-1 text-sm font-bold"
                    :class="{
                      'bg-emerald-400/15 text-emerald-300': match.prediction.points === 3,
                      'bg-amber-300/15 text-amber-200': match.prediction.points === 1,
                      'bg-slate-700 text-slate-300': match.prediction.points === 0,
                    }"
                  >
                    +{{ pointsLabel(match.prediction.points) }}
                  </span>
                </div>

                <form
                  v-else-if="loggedIn && user?.isAdmin"
                  class="mt-3 border-t border-white/10 pt-3"
                  @submit.prevent="savePrediction(match.id)"
                >
                  <p class="text-sm text-slate-400">
                    Добавить прогноз задним числом
                  </p>
                  <div class="mt-3 flex items-center gap-2">
                    <input
                      v-model.number="predictions[match.id]!.homeScore"
                      type="number"
                      min="0"
                      max="99"
                      class="w-20 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-center text-lg outline-none focus:border-emerald-400"
                      placeholder="0"
                    />
                    <span class="text-lg text-slate-400">:</span>
                    <input
                      v-model.number="predictions[match.id]!.awayScore"
                      type="number"
                      min="0"
                      max="99"
                      class="w-20 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-center text-lg outline-none focus:border-emerald-400"
                      placeholder="0"
                    />
                    <button
                      type="submit"
                      :disabled="savingId === match.id"
                      class="ml-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-60"
                    >
                      Добавить
                    </button>
                  </div>
                </form>

                <p
                  v-else-if="loggedIn"
                  class="mt-3 border-t border-white/10 pt-3 text-sm text-slate-500"
                >
                  Прогноз не сделан
                </p>
              </div>
              <p v-else class="shrink-0 text-sm text-slate-400">
                {{ match.status }}
              </p>
            </div>

            <div
              v-if="match.publicPredictions.length"
              class="mt-5 border-t border-white/10 pt-5"
            >
              <h3 class="text-sm font-semibold text-slate-300">
                Прогнозы участников
              </h3>
              <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div
                  v-for="participant in match.publicPredictions"
                  :key="participant.userId"
                  class="flex items-center justify-between gap-3 rounded-xl border px-3 py-3"
                  :class="
                    participant.userId === user?.id
                      ? 'border-emerald-400/30 bg-emerald-400/10'
                      : 'border-white/10 bg-slate-950/40'
                  "
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <img
                      v-if="participant.avatarUrl"
                      :src="participant.avatarUrl"
                      :alt="participant.displayName"
                      class="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                    <span
                      v-else
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold"
                    >
                      {{ initials(participant.displayName) }}
                    </span>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold">
                        {{ participant.displayName }}
                      </p>
                      <!-- <p
                        v-if="participant.userId === user?.id"
                        class="text-xs text-emerald-400"
                      >
                        Вы
                      </p> -->
                    </div>
                  </div>

                  <div class="shrink-0 text-right">
                    <strong>
                      {{ participant.homeScore }} : {{ participant.awayScore }}
                    </strong>
                    <p
                      v-if="participant.status === 'SCORED'"
                      class="text-xs font-semibold"
                      :class="{
                        'text-emerald-300': participant.points === 3,
                        'text-amber-200': participant.points === 1,
                        'text-slate-500': participant.points === 0,
                      }"
                    >
                      +{{ pointsLabel(participant.points) }}
                    </p>
                    <p
                      v-else-if="match.status === 'LIVE'"
                      class="text-xs font-semibold text-amber-200"
                    >
                     +{{ pointsLabel(projectedPoints(
                        {
                          homeScore: participant.homeScore,
                          awayScore: participant.awayScore,
                        },
                        {
                          homeScore: match.homeScore,
                          awayScore: match.awayScore,
                        },
                      )) }}
                    </p>
                    <p v-else class="text-xs text-slate-500">
                      Ожидает результата
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p
              v-else-if="match.status === 'FINISHED'"
              class="mt-5 border-t border-white/10 pt-4 text-sm text-slate-500"
            >
              На этот матч прогнозов не было.
            </p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>
